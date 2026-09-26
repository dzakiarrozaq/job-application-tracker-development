"use client";

import { useState } from "react";
import Link from "next/link";
import { Flame, AlertTriangle, ShieldX, Briefcase, Clock, CheckCircle2, XCircle, TrendingUp, CalendarDays, Trophy, ArrowRight } from "lucide-react";
import type { StreakData, FollowUpReminder, RejectionInsight, AnalyticsData, TopPick } from "@/lib/analytics";
import { GRADE_COLORS } from "@/lib/score";
import { Modal } from "@/components/modal";

import { TrendLineChart } from "./charts";

export function DashboardStatCards({
  analytics,
}: {
  analytics: {
    total: number;
    outcomeCounts: { active: number; hired: number; offer: number; rejected: number };
    conversionRate: number;
    avgDaysToInterview: number | null;
    rejectionInsights: RejectionInsight[];
  };
}) {
  const [showRejection, setShowRejection] = useState(false);

  const stats = [
    {
      label: "Total Lamaran",
      value: analytics.total,
      hint: "Seluruh lamaran yang dilacak",
      icon: Briefcase,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      href: "/applications",
    },
    {
      label: "Lamaran Aktif",
      value: analytics.outcomeCounts.active,
      hint: "Masih berjalan / menunggu",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      href: "/applications?outcome=active",
    },
    {
      label: "Diterima / Penawaran",
      value: analytics.outcomeCounts.hired + analytics.outcomeCounts.offer,
      hint: "Berhasil sampai tahap akhir",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      href: "/applications?outcome=hired",
    },
    {
      label: "Ditolak",
      value: analytics.outcomeCounts.rejected,
      hint: "Tidak lolos seleksi",
      icon: XCircle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      onClick: () => setShowRejection(true),
    },
    {
      label: "Tingkat Konversi",
      value: `${analytics.conversionRate}%`,
      hint: "Mencapai tahap wawancara",
      icon: TrendingUp,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      href: null,
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
      href: null,
    },
  ];

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const CardContent = (
            <>
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
            </>
          );

          const className = `card p-5 animate-fade-in delay-${i + 1} transition-all ${
            (stat.href || stat.onClick) ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg" : ""
          }`;
          const style = { border: "1px solid var(--color-border-subtle)" };

          if (stat.onClick) {
            return (
              <div key={stat.label} onClick={stat.onClick} className={className} style={style}>
                {CardContent}
              </div>
            );
          }

          if (stat.href) {
            return (
              <Link key={stat.label} href={stat.href} className={className} style={style}>
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={stat.label} className={className} style={style}>
              {CardContent}
            </div>
          );
        })}
      </div>

      <Modal open={showRejection} onClose={() => setShowRejection(false)} title="Analisis Penolakan">
        <RejectionAnalysisCard insights={analytics.rejectionInsights} />
      </Modal>
    </>
  );
}

// ── 🔥 Streak & Trend Card ──────────────────────────────────────────────────
export function StreakCard({ streak, monthlyTrend }: { streak: StreakData; monthlyTrend: AnalyticsData["monthlyTrend"] }) {
  const maxCount = Math.max(...streak.contributionGrid.map((d) => d.count), 1);
  const currentMonthTotal = monthlyTrend.length > 0 ? monthlyTrend[monthlyTrend.length - 1].total : 0;

  function getCellColor(count: number): string {
    if (count === 0) return "var(--color-bg-elevated)";
    const intensity = count / maxCount;
    if (intensity <= 0.25) return "#4ade80";
    if (intensity <= 0.5) return "#22c55e";
    if (intensity <= 0.75) return "#16a34a";
    return "#15803d";
  }

  // Arrange grid: 7 rows (Sun-Sat) x columns (weeks)
  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  // Pad the first week to start on Sunday
  const firstDayOfWeek = new Date(streak.contributionGrid[0]?.date ?? new Date()).getDay();
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: "", count: -1 }); // placeholder
  }

  for (const day of streak.contributionGrid) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  // Pad the last week to end on Saturday
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: "", count: -1 });
    }
    weeks.push(currentWeek);
  }

  const dayLabels = ["Min", "", "Sel", "", "Kam", "", "Sab"];

  return (
    <div className="card p-6 md:p-8 animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
      {/* Left side: Streak */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <div className="flex items-center gap-2.5 mb-2 text-orange-500">
          <Flame className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Streak Lamaran
          </h3>
        </div>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-[3.5rem] leading-none font-black tracking-tight" style={{ color: "var(--color-text)" }}>
            {streak.currentStreak}
          </span>
          <span className="text-base font-semibold" style={{ color: "var(--color-text-muted)" }}>hari berturut-turut</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 mb-8 px-6 py-4 rounded-2xl" style={{ backgroundColor: "var(--color-surface-hover)", border: "1px solid var(--color-border-subtle)" }}>
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Terpanjang</span>
            <span className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              {streak.longestStreak} <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>hari</span>
            </span>
          </div>
          <div className="w-px h-10" style={{ backgroundColor: "var(--color-border-subtle)" }} />
          <div className="flex flex-col flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Hari Aktif</span>
            <span className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
              {streak.totalActiveDays} <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>hari</span>
            </span>
          </div>
        </div>

        {/* Contribution Grid */}
        <div className="flex flex-col">
          <div className="flex gap-2">
            <div className="flex flex-col gap-[4px]">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-[14px] flex items-center justify-end pr-1 w-7">
                  <span className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-[4px] overflow-x-auto pb-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[4px]">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="w-[14px] h-[14px] rounded-[3px] transition-colors"
                      style={{
                        backgroundColor: day.count === -1 ? getCellColor(0) : getCellColor(day.count),
                        opacity: day.count === -1 ? 0.3 : 1,
                      }}
                      title={
                        day.count >= 0
                          ? `${day.date}: ${day.count} lamaran`
                          : undefined
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-4 text-[11px] font-medium" style={{ color: "var(--color-text-muted)" }}>
            <span>Sedikit</span>
            <div className="flex gap-[4px]">
              {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                <div
                  key={i}
                  className="w-[14px] h-[14px] rounded-[3px]"
                  style={{
                    backgroundColor: intensity === 0 ? "var(--color-bg-elevated)" : getCellColor(Math.ceil(intensity * maxCount)),
                  }}
                />
              ))}
            </div>
            <span>Banyak</span>
          </div>
        </div>
      </div>

      {/* Vertical Divider (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-1 h-full items-center justify-center">
        <div className="w-px h-[200px]" style={{ background: "linear-gradient(to bottom, transparent, var(--color-border), transparent)" }} />
      </div>

      {/* Right side: Trend */}
      <div className="lg:col-span-6 h-full flex flex-col justify-center">
        <div className="flex items-center gap-2.5 mb-2 text-blue-500">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">
            Tren Lamaran per Bulan
          </h3>
        </div>
        <div className="flex items-baseline gap-2 mb-8">
          <span className="text-[3.5rem] leading-none font-black tracking-tight" style={{ color: "var(--color-text)" }}>
            {currentMonthTotal}
          </span>
          <span className="text-base font-semibold" style={{ color: "var(--color-text-muted)" }}>lamaran bulan ini</span>
        </div>
        <div className="w-full">
          <TrendLineChart data={monthlyTrend} />
        </div>
      </div>
    </div>
  );
}

// ── ⏰ Follow-Up Reminders ────────────────────────────────────────────────
export function FollowUpCard({ reminders }: { reminders: FollowUpReminder[] }) {
  if (reminders.length === 0) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10">
            <AlertTriangle className="w-5 h-5 text-emerald-500" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Pengingat Follow-Up
          </h3>
        </div>
        <div className="grid place-items-center py-6">
          <p className="text-sm" style={{ color: "var(--color-text-placeholder)" }}>
            🎉 Semua lamaran aktif Anda sudah di-follow up! Tidak ada yang tertinggal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Pengingat Follow-Up
          </h3>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b" }}
        >
          {reminders.length} lamaran
        </span>
      </div>

      <div className="space-y-2 max-h-[220px] overflow-y-auto">
        {reminders.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors"
            style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border-subtle)" }}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--color-text)" }}>
                {r.company}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                {r.position} · {r.currentStageName}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: r.daysSinceUpdate >= 14 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)",
                color: r.daysSinceUpdate >= 14 ? "#ef4444" : "#f59e0b",
              }}
            >
              {r.daysSinceUpdate} hari lalu
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 📊 Rejection Analysis ────────────────────────────────────────────────
export function RejectionAnalysisCard({ insights }: { insights: RejectionInsight[] }) {
  if (insights.length === 0) {
    return (
      <div className="card p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-rose-500/10">
            <ShieldX className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Analisis Penolakan
          </h3>
        </div>
        <div className="grid place-items-center py-6">
          <p className="text-sm" style={{ color: "var(--color-text-placeholder)" }}>
            🎊 Belum ada penolakan! Semoga terus seperti ini.
          </p>
        </div>
      </div>
    );
  }

  const totalRejected = insights.reduce((sum, i) => sum + i.count, 0);
  const topStage = insights[0];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10">
            <ShieldX className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Statistik Penolakan
          </h3>
        </div>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Total: {totalRejected} ditolak
        </span>
      </div>

      {/* Insight highlight */}
      {topStage && (
        <div
          className="mb-4 rounded-xl px-4 py-3"
          style={{ backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            💡 <strong>{topStage.percent}%</strong> penolakan terjadi di tahap <strong>"{topStage.stageName}"</strong>.
            {topStage.percent >= 50
              ? " Pertimbangkan untuk memperkuat persiapan di tahap ini!"
              : " Penolakan Anda cukup merata, tidak terpusat di satu titik."}
          </p>
        </div>
      )}

      {/* Bars */}
      <div className="space-y-2.5">
        {insights.map((insight) => (
          <div key={insight.stageName}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
                {insight.stageName}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {insight.count}× ({insight.percent}%)
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${insight.percent}%`,
                  backgroundColor: insight.percent >= 50 ? "#ef4444" : insight.percent >= 30 ? "#f59e0b" : "#3b82f6",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopPicksCard({ picks }: { picks: TopPick[] }) {
  const [selectedPick, setSelectedPick] = useState<TopPick | null>(null);

  if (picks.length === 0) {
    return (
      <div className="card p-6 md:p-8 animate-fade-in">
        <div className="flex items-center gap-2.5 mb-4 text-amber-500">
          <Trophy className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Peluang Terbaik</h3>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Belum ada lamaran aktif untuk dianalisis.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card p-6 md:p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5 text-amber-500">
            <Trophy className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Peluang Terbaik</h3>
          </div>
          <Link
            href="/applications?outcome=active"
            className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            Lihat semua <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {picks.map((pick, i) => {
            const colors = GRADE_COLORS[pick.grade];
            return (
              <button
                key={pick.id}
                onClick={() => setSelectedPick(pick)}
                className="w-full text-left group flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                {/* Rank */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black"
                  style={{
                    background: i === 0
                      ? "linear-gradient(135deg, #f59e0b, #d97706)"
                      : i === 1
                      ? "linear-gradient(135deg, #94a3b8, #64748b)"
                      : "linear-gradient(135deg, #b45309, #92400e)",
                    color: "white",
                  }}
                >
                  #{i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
                    {pick.company}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                    {pick.position} · {pick.currentStageName}
                  </p>
                  {/* Score bar */}
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-border-subtle)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pick.score}%`,
                        background:
                          pick.grade === "S" ? "linear-gradient(90deg, #8b5cf6, #6d28d9)" :
                          pick.grade === "A" ? "linear-gradient(90deg, #10b981, #059669)" :
                          pick.grade === "B" ? "linear-gradient(90deg, #3b82f6, #2563eb)" :
                          pick.grade === "C" ? "linear-gradient(90deg, #f59e0b, #d97706)" :
                          "linear-gradient(90deg, #f43f5e, #e11d48)",
                      }}
                    />
                  </div>
                </div>

                {/* Grade badge */}
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-base font-black ${colors.bg} ${colors.text} ${colors.border}`}>
                  {pick.grade}
                </div>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-center text-[11px]" style={{ color: "var(--color-text-placeholder)" }}>
          Skor dihitung berdasarkan progres tahapan, kelengkapan dokumen, dan aktivitas perusahaan.
        </p>
      </div>

      <Modal open={!!selectedPick} onClose={() => setSelectedPick(null)} title="Analisis Peluang">
        {selectedPick && (
          <div className="p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>{selectedPick.company}</h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>{selectedPick.position}</p>
              </div>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 text-2xl font-black ${GRADE_COLORS[selectedPick.grade].bg} ${GRADE_COLORS[selectedPick.grade].text} ${GRADE_COLORS[selectedPick.grade].border}`}>
                {selectedPick.grade}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 dark:bg-gray-700">
              <div 
                className="h-2 rounded-full transition-all duration-700" 
                style={{ 
                  width: `${selectedPick.score}%`,
                  background:
                    selectedPick.grade === "S" ? "linear-gradient(90deg, #8b5cf6, #6d28d9)" :
                    selectedPick.grade === "A" ? "linear-gradient(90deg, #10b981, #059669)" :
                    selectedPick.grade === "B" ? "linear-gradient(90deg, #3b82f6, #2563eb)" :
                    selectedPick.grade === "C" ? "linear-gradient(90deg, #f59e0b, #d97706)" :
                    "linear-gradient(90deg, #f43f5e, #e11d48)",
                }} 
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Faktor Penilaian ({selectedPick.score}/100)</p>
              <div className="space-y-2">
                {selectedPick.signals.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border-subtle)" }}>
                    <span className={`shrink-0 text-base ${s.positive ? "text-emerald-500" : "text-amber-500"}`}>
                      {s.positive ? "✓" : "!"}
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 flex justify-end" style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
              <Link 
                href={`/applications?highlight=${selectedPick.id}`} 
                className="btn-primary"
                onClick={() => setSelectedPick(null)}
              >
                Lihat Detail Lamaran Lengkap
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
