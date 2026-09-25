"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { ApplicationForm } from "@/components/application-form";
import { ApplicationDetailModal } from "@/components/application-detail-modal";
import { deleteApplication } from "./actions";
import type { Application, Document, PipelineWithStages, StageHistoryEntry } from "@/lib/types";
import { OUTCOME_COLORS, OUTCOME_LABELS } from "@/lib/types";

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
  const [search, setSearch] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
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

      <div className="mb-4 flex flex-wrap gap-3">
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
        <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)} className="input max-w-xs">
          <option value="all">Semua Status</option>
          {Object.entries(OUTCOME_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div
        className="overflow-hidden rounded-xl animate-fade-in"
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
                    colSpan={8}
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
