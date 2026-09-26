import { db } from "@/db";
import { applications, applicationStageHistory, pipelineStages, pipelines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { computeScore } from "@/lib/score";

export type FollowUpReminder = {
  id: string;
  company: string;
  position: string;
  daysSinceUpdate: number;
  currentStageName: string;
};

export type RejectionInsight = {
  stageName: string;
  count: number;
  percent: number;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  /** last 91 days (13 weeks) activity grid: { date: "YYYY-MM-DD", count: number }[] */
  contributionGrid: { date: string; count: number }[];
};

export type TopPick = {
  id: string;
  company: string;
  position: string;
  score: number;
  grade: "S" | "A" | "B" | "C" | "D";
  currentStageName: string;
  signals: { label: string; positive: boolean }[];
};

export type AnalyticsData = {
  total: number;
  outcomeCounts: Record<"active" | "offer" | "hired" | "rejected", number>;
  avgDaysToInterview: number | null;
  conversionRate: number;
  pipelineBreakdown: { name: string; total: number }[];
  monthlyTrend: { month: string; total: number }[];
  streak: StreakData;
  followUpReminders: FollowUpReminder[];
  rejectionInsights: RejectionInsight[];
  topPicks: TopPick[];
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

  // ── 🔥 Streak Harian ──
  const streak = calculateStreak(apps);

  // ── ⏰ Follow-Up Reminders ──
  const stageMap = new Map(allStages.map((s) => [s.id, s.name]));
  const now = new Date();
  const followUpReminders: FollowUpReminder[] = [];
  for (const app of apps) {
    if (app.outcome !== "active") continue;
    const daysSinceUpdate = Math.floor(
      (now.getTime() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysSinceUpdate >= 7) {
      followUpReminders.push({
        id: app.id,
        company: app.company,
        position: app.position,
        daysSinceUpdate,
        currentStageName: app.currentStageId ? stageMap.get(app.currentStageId) ?? "—" : "—",
      });
    }
  }
  followUpReminders.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);

  // ── 📊 Analisis Penolakan ──
  const rejectedApps = apps.filter((a) => a.outcome === "rejected");
  const rejectionByStage = new Map<string, number>();
  
  // Group history by app id and sort ascending
  const historyByApp = new Map<string, typeof history>();
  for (const h of history) {
    if (!historyByApp.has(h.applicationId)) historyByApp.set(h.applicationId, []);
    historyByApp.get(h.applicationId)!.push(h);
  }
  
  for (const app of rejectedApps) {
    const appHistory = historyByApp.get(app.id) || [];
    const sortedHistory = [...appHistory].sort((a, b) => a.enteredAt.getTime() - b.enteredAt.getTime());
    
    let rejectedAtStageId = app.currentStageId;
    for (let i = sortedHistory.length - 1; i >= 0; i--) {
      const st = allStages.find((s) => s.id === sortedHistory[i].stageId);
      if (st && st.type !== "rejected") {
        rejectedAtStageId = st.id;
        break;
      }
    }
    
    const stageName = rejectedAtStageId ? stageMap.get(rejectedAtStageId) ?? "Tidak Diketahui" : "Tidak Diketahui";
    rejectionByStage.set(stageName, (rejectionByStage.get(stageName) ?? 0) + 1);
  }
  const rejectionInsights: RejectionInsight[] = Array.from(rejectionByStage.entries())
    .map(([stageName, count]) => ({
      stageName,
      count,
      percent: rejectedApps.length > 0 ? Math.round((count / rejectedApps.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ── 🏆 Top Picks (active apps scored) ──
  const historyCountByApp = new Map<string, number>();
  for (const h of history) {
    historyCountByApp.set(h.applicationId, (historyCountByApp.get(h.applicationId) ?? 0) + 1);
  }

  const topPicks: TopPick[] = apps
    .filter((a) => a.outcome === "active")
    .map((a) => {
      const stage = allStages.find((s) => s.id === a.currentStageId);
      const pipelineStagesList = allStages
        .filter((s) => s.pipelineId === a.pipelineId)
        .sort((a, b) => a.order - b.order);
      const stageOrder = stage ? pipelineStagesList.findIndex((s) => s.id === stage.id) : 0;

      const { score, grade, signals } = computeScore({
        outcome: a.outcome,
        appliedDate: a.appliedDate,
        updatedAt: a.updatedAt,
        hasInterviewDate: !!(a as any).interviewDate,
        stageOrder: Math.max(0, stageOrder),
        totalStages: pipelineStagesList.length,
        docCount: 0, // not fetched here for perf; defaults to 0
        historyCount: historyCountByApp.get(a.id) ?? 0,
      });

      return {
        id: a.id,
        company: a.company,
        position: a.position,
        score,
        grade,
        currentStageName: stage?.name ?? "—",
        signals,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    total,
    outcomeCounts,
    avgDaysToInterview,
    conversionRate,
    pipelineBreakdown,
    monthlyTrend,
    streak,
    followUpReminders,
    rejectionInsights,
    topPicks,
  };
}

// ── Streak Calculator ──
function calculateStreak(
  apps: { appliedDate: Date; createdAt: Date }[],
): StreakData {
  const toDateStr = (d: Date) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  };

  // Count applications per day
  const dayCounts = new Map<string, number>();
  for (const app of apps) {
    const key = toDateStr(new Date(app.appliedDate));
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }

  // Generate contribution grid (last 168 days = 24 weeks)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const contributionGrid: { date: string; count: number }[] = [];
  for (let i = 168; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toDateStr(d);
    contributionGrid.push({ date: key, count: dayCounts.get(key) ?? 0 });
  }

  // Calculate current streak (consecutive days ending today or yesterday)
  let currentStreak = 0;
  for (let i = contributionGrid.length - 1; i >= 0; i--) {
    if (contributionGrid[i].count > 0) {
      currentStreak++;
    } else if (i === contributionGrid.length - 1) {
      // today might have 0 if user hasn't applied yet, check yesterday
      continue;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const day of contributionGrid) {
    if (day.count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const totalActiveDays = contributionGrid.filter((d) => d.count > 0).length;

  return { currentStreak, longestStreak, totalActiveDays, contributionGrid };
}

/** Lightweight query just for the notification badge count */
export async function getFollowUpCount(userId: string): Promise<number> {
  const apps = await db
    .select({ updatedAt: applications.updatedAt, outcome: applications.outcome })
    .from(applications)
    .where(eq(applications.userId, userId));

  const now = new Date();
  let count = 0;
  for (const app of apps) {
    if (app.outcome !== "active") continue;
    const daysSince = Math.floor((now.getTime() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 7) count++;
  }
  return count;
}
