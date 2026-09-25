import { db } from "@/db";
import { applications, applicationStageHistory, pipelineStages, pipelines } from "@/db/schema";
import { eq } from "drizzle-orm";

export type AnalyticsData = {
  total: number;
  outcomeCounts: Record<"active" | "offer" | "hired" | "rejected", number>;
  avgDaysToInterview: number | null;
  conversionRate: number;
  pipelineBreakdown: { name: string; total: number }[];
  monthlyTrend: { month: string; total: number }[];
};

export async function getAnalytics(userId: string): Promise<AnalyticsData> {
  const apps = await db.select().from(applications).where(eq(applications.userId, userId));
  const total = apps.length;

  const outcomeCounts = { active: 0, offer: 0, hired: 0, rejected: 0 };
  for (const app of apps) {
    outcomeCounts[app.outcome] += 1;
  }

  const appIds = apps.map((a) => a.id);
  const allPipelines = await db.select().from(pipelines).where(eq(pipelines.userId, userId));
  const allStages = await db.select().from(pipelineStages);
  const interviewStageIds = new Set(allStages.filter((s) => s.isInterviewStage).map((s) => s.id));

  let history: (typeof applicationStageHistory.$inferSelect)[] = [];
  if (appIds.length) {
    history = await db.select().from(applicationStageHistory);
    history = history.filter((h) => appIds.includes(h.applicationId));
  }

  const firstInterviewByApp = new Map<string, Date>();
  for (const h of history) {
    if (!interviewStageIds.has(h.stageId)) continue;
    const existing = firstInterviewByApp.get(h.applicationId);
    if (!existing || h.enteredAt < existing) {
      firstInterviewByApp.set(h.applicationId, h.enteredAt);
    }
  }

  const daysList: number[] = [];
  for (const app of apps) {
    const interviewDate = firstInterviewByApp.get(app.id);
    if (interviewDate) {
      const diffMs = interviewDate.getTime() - new Date(app.appliedDate).getTime();
      const days = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      daysList.push(days);
    }
  }

  const avgDaysToInterview = daysList.length
    ? Math.round((daysList.reduce((a, b) => a + b, 0) / daysList.length) * 10) / 10
    : null;

  let currentInterviewCount = 0;
  for (const app of apps) {
    if ((app.currentStageId && interviewStageIds.has(app.currentStageId)) || app.outcome === "offer" || app.outcome === "hired") {
      currentInterviewCount++;
    }
  }

  const conversionRate = total > 0 ? Math.round((currentInterviewCount / total) * 1000) / 10 : 0;

  const pipelineBreakdown = allPipelines.map((p) => ({
    name: p.name,
    total: apps.filter((a) => a.pipelineId === p.id).length,
  }));

  const monthlyMap = new Map<string, number>();
  for (const app of apps) {
    const d = new Date(app.appliedDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + 1);
  }
  const monthlyTrend = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, total]) => ({ month, total }));

  return {
    total,
    outcomeCounts,
    avgDaysToInterview,
    conversionRate,
    pipelineBreakdown,
    monthlyTrend,
  };
}
