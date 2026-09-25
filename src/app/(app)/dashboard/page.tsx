import { requireUserId } from "@/lib/auth-helpers";
import { getAnalytics } from "@/lib/analytics";
import { OutcomePieChart, PipelineBarChart, TrendLineChart } from "./charts";
import { Briefcase, Clock, CheckCircle2, XCircle, TrendingUp, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const analytics = await getAnalytics(userId);

  const stats = [
    {
      label: "Total Lamaran",
      value: analytics.total,
      hint: "Seluruh lamaran yang dilacak",
      icon: Briefcase,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Lamaran Aktif",
      value: analytics.outcomeCounts.active,
      hint: "Masih berjalan / menunggu",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Diterima / Penawaran",
      value: analytics.outcomeCounts.hired + analytics.outcomeCounts.offer,
      hint: "Berhasil sampai tahap akhir",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Ditolak",
      value: analytics.outcomeCounts.rejected,
      hint: "Tidak lolos seleksi",
      icon: XCircle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
    {
      label: "Tingkat Konversi",
      value: `${analytics.conversionRate}%`,
      hint: "Mencapai tahap wawancara",
      icon: TrendingUp,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      label: "Rata-rata ke Interview",
      value:
        analytics.avgDaysToInterview !== null
          ? `${analytics.avgDaysToInterview} hari`
          : "—",
      hint: "Waktu tunggu hingga wawancara",
      icon: CalendarDays,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

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

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card p-5 animate-fade-in delay-${i + 1} transition-all hover:-translate-y-1 hover:shadow-lg`}
              style={{ border: "1px solid var(--color-border-subtle)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                    {stat.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold" style={{ color: "var(--color-text)" }}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="mt-3 text-xs" style={{ color: "var(--color-text-placeholder)" }}>
                {stat.hint}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card p-5 lg:col-span-2 animate-fade-in delay-200">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Tren Lamaran per Bulan
          </h3>
          <TrendLineChart data={analytics.monthlyTrend} />
        </div>
        <div className="card p-5 animate-fade-in delay-300">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Status Lamaran
          </h3>
          <OutcomePieChart data={analytics.outcomeCounts} />
        </div>
        <div className="card p-5 animate-fade-in delay-400">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Lamaran per Pipeline
          </h3>
          <PipelineBarChart data={analytics.pipelineBreakdown} />
        </div>
      </div>
    </div>
  );
}
