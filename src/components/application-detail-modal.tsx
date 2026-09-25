"use client";

import { Modal } from "@/components/modal";
import { DOCUMENT_TYPE_LABELS, OUTCOME_COLORS, OUTCOME_LABELS } from "@/lib/types";
import type { Application, Document, PipelineStage, StageHistoryEntry } from "@/lib/types";

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
  if (!application) return null;

  const currentStage = stages.find((s) => s.id === application.currentStageId);
  const stageName = (id: string) => stages.find((s) => s.id === id)?.name ?? "—";

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

        <details className="group">
          <summary className="mb-2 text-xs font-semibold uppercase tracking-wide cursor-pointer list-none flex items-center gap-1 select-none" style={{ color: "var(--color-text-muted)" }}>
            Riwayat Tahapan <span className="text-[10px] transition-transform group-open:rotate-180">▼</span>
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
