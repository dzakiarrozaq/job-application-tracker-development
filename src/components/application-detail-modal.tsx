"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/modal";
import { DOCUMENT_TYPE_LABELS, OUTCOME_COLORS, OUTCOME_LABELS } from "@/lib/types";
import type { Application, Document, PipelineStage, StageHistoryEntry } from "@/lib/types";
import { ensurePrepChecklist, togglePrepItem } from "@/app/(app)/applications/prep-actions";
import { getInterviewQuestions, computeScore, GRADE_COLORS } from "@/lib/score";

type PrepItem = { id: string; text: string; completed: boolean; sortOrder: number };

export function ApplicationDetailModal({
  open,
  onClose,
  application,
  stages,
  documents,
  history,
  onEdit,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  application: Application | null;
  stages: PipelineStage[];
  documents: Document[];
  history: StageHistoryEntry[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [prepItems, setPrepItems] = useState<PrepItem[]>([]);
  const hasInterview = !!(application as any)?.interviewDate;

  useEffect(() => {
    if (hasInterview && application) {
      ensurePrepChecklist(application.id).then((items) => {
        setPrepItems(items.map((i) => ({ id: i.id, text: i.text, completed: i.completed, sortOrder: i.sortOrder })));
      });
    } else {
      setPrepItems([]);
    }
  }, [hasInterview, application]);

  if (!application) return null;

  const currentStage = stages.find((s) => s.id === application.currentStageId);
  const stageName = (id: string) => stages.find((s) => s.id === id)?.name ?? "—";
  const completedCount = prepItems.filter((i) => i.completed).length;

  const pipelineStagesList = stages
    .filter((s) => s.pipelineId === application.pipelineId)
    .sort((a, b) => a.order - b.order);
  const stageOrder = currentStage ? pipelineStagesList.findIndex((s) => s.id === currentStage.id) : 0;

  const appScore = computeScore({
    outcome: application.outcome,
    appliedDate: new Date(application.appliedDate),
    updatedAt: new Date(application.updatedAt),
    hasInterviewDate: !!(application as any).interviewDate,
    stageOrder: Math.max(0, stageOrder),
    totalStages: pipelineStagesList.length,
    docCount: documents.length,
    historyCount: history.length,
  });

  async function handleToggle(itemId: string, current: boolean) {
    setPrepItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, completed: !current } : i)));
    await togglePrepItem(itemId, !current);
  }

  const getGCalLink = (app: Application) => {
    const interviewDate = (app as any).interviewDate;
    if (!interviewDate) return "#";
    const start = new Date(interviewDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
    const format = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tes+Wawancara+-+${encodeURIComponent(app.company)}&details=${encodeURIComponent(app.position)}&dates=${format(start)}/${format(end)}`;
  };

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title={`${application.position} · ${application.company}`} 
      wide
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onDelete} className="btn-danger">
            Hapus
          </button>
          <button onClick={onEdit} className="btn-primary">
            Edit Lamaran
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${OUTCOME_COLORS[application.outcome]}`}>
            {OUTCOME_LABELS[application.outcome]}
          </span>
          {currentStage ? (
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: currentStage.color }}
            >
              {currentStage.name}
            </span>
          ) : null}
        </div>

        {application.outcome === "active" && (
          <div className="rounded-xl p-4 border animate-fade-in" style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-border-subtle)" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 block">Analisis Peluang</span>
                <div className="text-2xl font-black" style={{ color: "var(--color-text)" }}>
                  {appScore.score}<span className="text-sm font-medium text-gray-400">/100</span>
                </div>
              </div>
              <span className={`flex items-center justify-center w-12 h-12 rounded-xl text-xl font-black border ${GRADE_COLORS[appScore.grade].bg} ${GRADE_COLORS[appScore.grade].text} ${GRADE_COLORS[appScore.grade].border}`}>
                {appScore.grade}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4 dark:bg-gray-700">
              <div 
                className="h-1.5 rounded-full transition-all duration-700" 
                style={{ 
                  width: `${appScore.score}%`,
                  background:
                    appScore.grade === "S" ? "linear-gradient(90deg, #8b5cf6, #6d28d9)" :
                    appScore.grade === "A" ? "linear-gradient(90deg, #10b981, #059669)" :
                    appScore.grade === "B" ? "linear-gradient(90deg, #3b82f6, #2563eb)" :
                    appScore.grade === "C" ? "linear-gradient(90deg, #f59e0b, #d97706)" :
                    "linear-gradient(90deg, #f43f5e, #e11d48)",
                }} 
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Faktor Penilaian:</p>
              {appScore.signals.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 ${s.positive ? "text-emerald-500" : "text-rose-500"}`}>
                    {s.positive ? "✓" : "!"}
                  </span>
                  <span style={{ color: "var(--color-text-secondary)" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Lokasi" value={application.location || "—"} />
          <Info label="Ekspektasi Gaji" value={application.salaryExpectation || "—"} />
          <Info
            label="Tanggal Melamar"
            value={new Date(application.appliedDate).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          {(application as any).interviewDate ? (
            <div className="flex flex-col">
              <Info
                label="Jadwal Tes"
                value={new Date((application as any).interviewDate).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
              <a
                href={getGCalLink(application)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#4285F4] px-4 py-2 mt-3 text-xs font-medium text-white transition-colors hover:bg-[#3367D6] self-start"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
                </svg>
                Tambah ke Google Calendar
              </a>
            </div>
          ) : (
            <Info label="Jadwal Tes" value="—" />
          )}
          <Info
            label="Tautan Lowongan"
            value={
              application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2 transition-colors"
                  style={{ color: "var(--color-text)" }}
                >
                  Buka tautan ↗
                </a>
              ) : (
                "—"
              )
            }
          />
        </div>

        {/* 📝 Interview Prep Checklist */}
        {hasInterview && prepItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                Persiapan Wawancara
              </p>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: completedCount === prepItems.length ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.12)",
                  color: completedCount === prepItems.length ? "#22c55e" : "#6366f1",
                }}
              >
                {completedCount}/{prepItems.length} selesai
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / prepItems.length) * 100}%`,
                  backgroundColor: completedCount === prepItems.length ? "#22c55e" : "#6366f1",
                }}
              />
            </div>
            <div
              className="space-y-1 rounded-xl p-3"
              style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border-subtle)" }}
            >
              {prepItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[var(--color-surface-hover)]"
                  style={{ color: item.completed ? "var(--color-text-muted)" : "var(--color-text)" }}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggle(item.id, item.completed)}
                    className="h-4 w-4 rounded shrink-0"
                    style={{ accentColor: "#22c55e" }}
                  />
                  <span className={item.completed ? "line-through" : ""}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {application.notes ? (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
              Catatan
            </p>
            <p
              className="whitespace-pre-wrap rounded-xl p-3 text-sm"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-secondary)",
                border: "1px solid var(--color-border-subtle)",
              }}
            >
              {application.notes}
            </p>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Dokumen Terlampir
          </p>
          {documents.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-placeholder)" }}>
              Belum ada dokumen dilampirkan.
            </p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors"
                  style={{
                    border: "1px solid var(--color-border-subtle)",
                    backgroundColor: "var(--color-bg)",
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: "var(--color-text)" }}>{doc.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </p>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 transition-colors text-sm"
                    style={{ color: "var(--color-text)" }}
                  >
                    Lihat ↗
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Interview Prep Questions */}
        {application.outcome === "active" && (
          <details className="group mt-6">
            <summary
              className="text-xs font-bold uppercase tracking-wider cursor-pointer list-none flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 select-none"
              style={{ 
                backgroundColor: "var(--color-bg-elevated)", 
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <span>Pertanyaan Persiapan</span>
              <span className="text-[10px] transition-transform group-open:rotate-180" style={{ color: "var(--color-text-muted)" }}>▼</span>
            </summary>
            <div className="mt-3 space-y-4 px-2">
              {getInterviewQuestions(application.position, application.company).map((section) => (
                <div key={section.category}>
                  <p
                    className="mb-2 text-xs font-semibold"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {section.category}
                  </p>
                  <ul className="space-y-1.5">
                    {section.questions.map((q, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
                        style={{
                          backgroundColor: "var(--color-bg-elevated)",
                          color: "var(--color-text-secondary)",
                          border: "1px solid var(--color-border-subtle)",
                        }}
                      >
                        <span className="mt-0.5 text-[10px] font-bold shrink-0" style={{ color: "var(--color-text-muted)" }}>
                          Q{i + 1}
                        </span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        )}

        <details className="group mt-3">
          <summary
            className="text-xs font-bold uppercase tracking-wider cursor-pointer list-none flex items-center justify-between rounded-xl px-4 py-3 transition-all hover:-translate-y-0.5 select-none"
            style={{ 
              backgroundColor: "var(--color-bg-elevated)", 
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <span>Riwayat Tahapan</span>
            <span className="text-[10px] transition-transform group-open:rotate-180" style={{ color: "var(--color-text-muted)" }}>▼</span>
          </summary>
          <ol
            className="space-y-2 pl-4 mt-2"
            style={{ borderLeft: "2px solid var(--color-border-subtle)" }}
          >
            {history.map((h) => (
              <li key={h.id} className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                <span className="font-medium" style={{ color: "var(--color-text)" }}>
                  {stageName(h.stageId)}
                </span>{" "}
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  ·{" "}
                  {new Date(h.enteredAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <p className="mt-0.5 text-sm" style={{ color: "var(--color-text)" }}>{value}</p>
    </div>
  );
}

