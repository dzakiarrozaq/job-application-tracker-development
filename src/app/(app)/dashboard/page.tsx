import { requireUserId } from "@/lib/auth-helpers";
import { getAnalytics } from "@/lib/analytics";
import { OutcomePieChart, PipelineBarChart } from "./charts";
import { StreakCard, DashboardStatCards, TopPicksCard } from "./widgets";
import { PieChart, BarChart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const analytics = await getAnalytics(userId);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-300">
          Ringkasan Performa
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Pantau terus progres pencarian kerjamu dan tingkatkan konversi wawancara.
        </p>
      </div>

      {/* Stats grid (now handles modal for Rejection) */}
      <DashboardStatCards analytics={analytics} />

      {/* 🔥 Streak + Trend — compact, full width */}
      <div className="mb-5">
        <StreakCard streak={analytics.streak} monthlyTrend={analytics.monthlyTrend} />
      </div>

      {/* 🏆 Top Picks */}
      <div className="mb-5">
        <TopPicksCard picks={analytics.topPicks} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-6 md:p-8 animate-fade-in delay-300">
          <div className="flex items-center gap-2.5 mb-6 text-purple-500">
            <PieChart className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Status Lamaran
            </h3>
          </div>
          <OutcomePieChart data={analytics.outcomeCounts} />
        </div>
        <div className="card p-6 md:p-8 animate-fade-in delay-400">
          <div className="flex items-center gap-2.5 mb-6 text-emerald-500">
            <BarChart className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Lamaran per Alur Tahapan
            </h3>
          </div>
          <PipelineBarChart data={analytics.pipelineBreakdown} />
        </div>
      </div>
    </div>
  );
}
