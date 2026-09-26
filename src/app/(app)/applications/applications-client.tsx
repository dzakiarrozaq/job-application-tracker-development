"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/modal";
import { ApplicationForm } from "@/components/application-form";
import { ApplicationDetailModal } from "@/components/application-detail-modal";
import { deleteApplication } from "./actions";
import type { Application, Document, PipelineWithStages, StageHistoryEntry } from "@/lib/types";
import { OUTCOME_COLORS, OUTCOME_LABELS } from "@/lib/types";
import { RejectionAnalysisCard } from "../dashboard/widgets";
import { computeScore, GRADE_COLORS } from "@/lib/score";

export function ApplicationsClient({
  applications,
  pipelines,
  documents,
  documentsByApplication,
  historyByApplication,
}: {
  applications: Application[];
  pipelines: PipelineWithStages[];
  documents: Document[];
  documentsByApplication: Record<string, string[]>;
  historyByApplication: Record<string, StageHistoryEntry[]>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState(searchParams.get("outcome") || "all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);

  const allStages = useMemo(() => pipelines.flatMap((p) => p.stages), [pipelines]);

  const filtered = applications.filter((app) => {
    const matchesSearch =
      !search ||
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.position.toLowerCase().includes(search.toLowerCase());
    const matchesPipeline = pipelineFilter === "all" || app.pipelineId === pipelineFilter;
    const matchesOutcome = outcomeFilter === "all" || app.outcome === outcomeFilter;
    return matchesSearch && matchesPipeline && matchesOutcome;
  });

  // ── 📊 Analisis Penolakan ──
  const rejectedApps = applications.filter((a) => a.outcome === "rejected");
  const rejectionByStage = new Map<string, number>();
  for (const app of rejectedApps) {
    const history = historyByApplication[app.id] || [];
    const sortedHistory = [...history].sort((a, b) => new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime());
    
    let rejectedAtStageId = app.currentStageId;
    for (let i = sortedHistory.length - 1; i >= 0; i--) {
      const st = allStages.find((s) => s.id === sortedHistory[i].stageId);
      if (st && st.type !== "rejected") {
        rejectedAtStageId = st.id;
        break;
      }
    }
    
    const stName = rejectedAtStageId ? allStages.find((s) => s.id === rejectedAtStageId)?.name ?? "Tidak Diketahui" : "Tidak Diketahui";
    rejectionByStage.set(stName, (rejectionByStage.get(stName) ?? 0) + 1);
  }
  const rejectionInsights = Array.from(rejectionByStage.entries())
    .map(([stageName, count]) => ({
      stageName,
      count,
      percent: rejectedApps.length > 0 ? Math.round((count / rejectedApps.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ── 🏆 Score per active app ──
  const appScores = useMemo(() => {
    const map = new Map<string, { score: number; grade: "S" | "A" | "B" | "C" | "D" }>();
    for (const app of applications) {
      if (app.outcome !== "active") continue;
      const stage = allStages.find((s) => s.id === app.currentStageId);
      const pipelineStagesList = allStages
        .filter((s) => s.pipelineId === app.pipelineId)
        .sort((a, b) => a.order - b.order);
      const stageOrder = stage ? pipelineStagesList.findIndex((s) => s.id === stage.id) : 0;
      const { score, grade } = computeScore({
        outcome: app.outcome,
        appliedDate: new Date(app.appliedDate),
        updatedAt: new Date(app.updatedAt),
        hasInterviewDate: !!(app as any).interviewDate,
        stageOrder: Math.max(0, stageOrder),
        totalStages: pipelineStagesList.length,
        docCount: documentsByApplication[app.id]?.length ?? 0,
        historyCount: historyByApplication[app.id]?.length ?? 0,
      });
      map.set(app.id, { score, grade });
    }
    return map;
  }, [applications, allStages, documentsByApplication, historyByApplication]);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(app: Application) {
    setEditing(app);
    setDetailApp(null);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus lamaran ini?")) return;
    await deleteApplication(id);
    setDetailApp(null);
    router.refresh();
  }

  const stageName = (id: string | null) => allStages.find((s) => s.id === id)?.name ?? "—";
  const pipelineName = (id: string) => pipelines.find((p) => p.id === id)?.name ?? "—";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
            Lamaran
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Kelola semua lamaran pekerjaan, CPNS, dan akademi kamu.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          Tambah Lamaran
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari perusahaan atau posisi..."
            className="input max-w-xs"
          />
          <select value={pipelineFilter} onChange={(e) => setPipelineFilter(e.target.value)} className="input max-w-xs">
            <option value="all">Semua Pipeline</option>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tabs for Outcome Filter */}
        <div className="flex overflow-x-auto rounded-xl p-1" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
          <button
            onClick={() => setOutcomeFilter("all")}
            className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: outcomeFilter === "all" ? "var(--color-surface)" : "transparent",
              color: outcomeFilter === "all" ? "var(--color-text)" : "var(--color-text-muted)",
              boxShadow: outcomeFilter === "all" ? "var(--shadow-sm)" : "none",
            }}
          >
            Semua
          </button>
          {Object.entries(OUTCOME_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setOutcomeFilter(key)}
              className="whitespace-nowrap px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: outcomeFilter === key ? "var(--color-surface)" : "transparent",
                color: outcomeFilter === key ? "var(--color-text)" : "var(--color-text-muted)",
                boxShadow: outcomeFilter === key ? "var(--shadow-sm)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {outcomeFilter === "rejected" && (
        <div className="mb-6 max-w-2xl">
          <RejectionAnalysisCard insights={rejectionInsights} />
        </div>
      )}

      {/* Mobile card view */}
      <div className="block sm:hidden space-y-3 animate-fade-in">
        {filtered.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center text-sm"
            style={{ color: "var(--color-text-placeholder)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            Belum ada lamaran. Klik &ldquo;Tambah Lamaran&rdquo; untuk mulai melacak.
          </div>
        ) : (
          filtered.map((app) => {
            const scoreData = appScores.get(app.id);
            return (
              <div
                key={app.id}
                className="rounded-xl p-4 cursor-pointer transition-colors"
                style={{
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  boxShadow: "var(--shadow-sm)",
                }}
                onClick={() => setDetailApp(app)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--color-text)" }}>{app.company}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{app.position}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {scoreData && (() => {
                      const colors = GRADE_COLORS[scoreData.grade];
                      return (
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {scoreData.grade}
                        </span>
                      );
                    })()}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${OUTCOME_COLORS[app.outcome]}`}>
                      {OUTCOME_LABELS[app.outcome]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-bg-elevated)", color: "var(--color-text-muted)" }}>
                      {stageName(app.currentStageId)}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-placeholder)" }}>
                      {new Date(app.appliedDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(app)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors"
                      style={{ color: "var(--color-text-muted)", backgroundColor: "var(--color-bg-elevated)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg text-red-500 transition-colors"
                      style={{ backgroundColor: "rgba(239,68,68,0.08)" }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop table view */}
      <div
        className="hidden sm:block overflow-hidden rounded-xl animate-fade-in"
        style={{
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead
              style={{
                borderBottom: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg)",
              }}
            >
              <tr className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                <th className="px-4 py-3 font-medium">Perusahaan</th>
                <th className="px-4 py-3 font-medium">Posisi</th>
                <th className="px-4 py-3 font-medium">Pipeline</th>
                <th className="px-4 py-3 font-medium">Tahapan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Skor</th>
                <th className="px-4 py-3 font-medium">Dokumen</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr
                  key={app.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                  onClick={() => setDetailApp(app)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--color-text)" }}>
                    {app.company}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {app.position}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {pipelineName(app.pipelineId)}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {stageName(app.currentStageId)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${OUTCOME_COLORS[app.outcome]}`}>
                      {OUTCOME_LABELS[app.outcome]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {appScores.has(app.id) ? (() => {
                      const { grade } = appScores.get(app.id)!;
                      const colors = GRADE_COLORS[grade];
                      return (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black border ${colors.bg} ${colors.text} ${colors.border}`}>
                          {grade}
                        </span>
                      );
                    })() : <span style={{ color: "var(--color-text-placeholder)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {documentsByApplication[app.id]?.length ?? 0}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-secondary)" }}>
                    {new Date(app.appliedDate).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openEdit(app)}
                      className="mr-2 rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
                      style={{ color: "var(--color-text)" }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-red-500 transition-colors"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--color-text-placeholder)" }}
                  >
                    Belum ada lamaran. Klik &ldquo;Tambah Lamaran&rdquo; untuk mulai melacak.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Lamaran" : "Tambah Lamaran"} wide>
        <ApplicationForm
          pipelines={pipelines}
          documents={documents}
          initial={editing}
          initialDocumentIds={editing ? documentsByApplication[editing.id] ?? [] : []}
          onSuccess={() => {
            setFormOpen(false);
            router.refresh();
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ApplicationDetailModal
        open={!!detailApp}
        onClose={() => setDetailApp(null)}
        application={detailApp}
        stages={allStages}
        documents={
          detailApp ? documents.filter((d) => documentsByApplication[detailApp.id]?.includes(d.id)) : []
        }
        history={detailApp ? historyByApplication[detailApp.id] ?? [] : []}
        onEdit={() => detailApp && openEdit(detailApp)}
        onDelete={() => detailApp && handleDelete(detailApp.id)}
      />
    </div>
  );
}
