"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Modal } from "@/components/modal";
import { ApplicationForm } from "@/components/application-form";
import { ApplicationDetailModal } from "@/components/application-detail-modal";
import { moveApplicationStage, deleteApplication } from "@/app/(app)/applications/actions";
import type { Application, Document, PipelineStage, PipelineWithStages, StageHistoryEntry } from "@/lib/types";
import { OUTCOME_COLORS, OUTCOME_LABELS } from "@/lib/types";

export function BoardClient({
  initialApplications,
  pipelines,
  documents,
  documentsByApplication,
  historyByApplication,
}: {
  initialApplications: Application[];
  pipelines: PipelineWithStages[];
  documents: Document[];
  documentsByApplication: Record<string, string[]>;
  historyByApplication: Record<string, StageHistoryEntry[]>;
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [pipelineId, setPipelineId] = useState(pipelines[0]?.id ?? "");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [search, setSearch] = useState("");
  const [, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const selectedPipeline = pipelines.find((p) => p.id === pipelineId);
  const boardApps = useMemo(
    () => applications.filter((a) => {
      if (a.pipelineId !== pipelineId) return false;
      if (search && !a.company.toLowerCase().includes(search.toLowerCase()) && !a.position.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }),
    [applications, pipelineId, search],
  );

  const activeApp = applications.find((a) => a.id === activeId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const applicationId = String(active.id);
    const targetStageId = String(over.id);

    const current = applications.find((a) => a.id === applicationId);
    if (!current || current.currentStageId === targetStageId) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, currentStageId: targetStageId } : a)),
    );

    startTransition(() => {
      moveApplicationStage(applicationId, targetStageId).catch(() => {
        router.refresh();
      });
    });
  }

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
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setDetailApp(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
            Kanban
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Seret kartu lamaran untuk memindahkan tahapan seleksi.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          Tambah Lamaran
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {pipelines.map((p) => (
          <button
            key={p.id}
            onClick={() => setPipelineId(p.id)}
            className="rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all"
            style={{
              backgroundColor: p.id === pipelineId ? "var(--color-accent)" : "var(--color-surface)",
              color: p.id === pipelineId ? "var(--color-surface)" : "var(--color-text-muted)",
              border: p.id === pipelineId ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
            }}
          >
            {p.name}
          </button>
        ))}
        {pipelines.length === 0 && (
          <p className="text-sm" style={{ color: "var(--color-text-placeholder)" }}>
            Belum ada alur tahapan. Buat alur tahapan terlebih dahulu di halaman Alur Tahapan.
          </p>
        )}
      </div>

      <div className="mb-6 max-w-xs">
        <input
          type="text"
          placeholder="Cari posisi atau perusahaan..."
          className="input w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {selectedPipeline ? (
        <>
          <div className="hidden lg:block">
            {isMounted && (
              <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {selectedPipeline.stages.map((stage) => (
                  <Column
                    key={stage.id}
                    id={stage.id}
                    title={stage.name}
                    color={stage.color}
                    count={boardApps.filter((a) => a.currentStageId === stage.id).length}
                  >
                    {boardApps
                      .filter((a) => a.currentStageId === stage.id)
                      .map((app) => (
                        <Card
                          key={app.id}
                          app={app}
                          docCount={documentsByApplication[app.id]?.length ?? 0}
                          onClick={() => setDetailApp(app)}
                        />
                      ))}
                  </Column>
                ))}
              </div>
              <DragOverlay>
                {activeApp ? (
                  <Card app={activeApp} docCount={documentsByApplication[activeApp.id]?.length ?? 0} onClick={() => {}} overlay />
                ) : null}
              </DragOverlay>
            </DndContext>
            )}
          </div>

          {/* Mobile fallback: simple stacked list with stage select */}
          <div className="space-y-3 lg:hidden">
            {boardApps.map((app) => (
              <div key={app.id} className="card p-4 cursor-pointer" onClick={() => setDetailApp(app)}>
                <p className="font-medium" style={{ color: "var(--color-text)" }}>{app.position}</p>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{app.company}</p>
                <div className="mt-3 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={app.currentStageId ?? ""}
                    onChange={(e) => {
                      const stageId = e.target.value;
                      setApplications((prev) =>
                        prev.map((a) => (a.id === app.id ? { ...a, currentStageId: stageId } : a)),
                      );
                      startTransition(() => {
                        moveApplicationStage(app.id, stageId).catch(() => router.refresh());
                      });
                    }}
                    className="input"
                  >
                    {selectedPipeline.stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${OUTCOME_COLORS[app.outcome]}`}>
                    {OUTCOME_LABELS[app.outcome]}
                  </span>
                </div>
              </div>
            ))}
            {boardApps.length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-text-placeholder)" }}>
                Belum ada lamaran pada alur tahapan ini.
              </p>
            )}
          </div>
        </>
      ) : null}

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
        stages={selectedPipeline?.stages ?? []}
        documents={detailApp ? documents.filter((d) => documentsByApplication[detailApp.id]?.includes(d.id)) : []}
        history={detailApp ? historyByApplication[detailApp.id] ?? [] : []}
        onEdit={() => detailApp && openEdit(detailApp)}
        onDelete={() => detailApp && handleDelete(detailApp.id)}
      />
    </div>
  );
}

function Column({
  id,
  title,
  color,
  count,
  children,
}: {
  id: string;
  title: string;
  color: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex w-68 shrink-0 flex-col rounded-xl p-3 transition-all"
      style={{
        border: isOver ? "1px solid var(--color-accent)" : "1px solid var(--color-border)",
        backgroundColor: isOver ? "var(--color-accent-subtle)" : "var(--color-bg)",
      }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{title}</h3>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          {count}
        </span>
      </div>
      <div className="flex min-h-[120px] flex-col gap-2">{children}</div>
    </div>
  );
}

function Card({
  app,
  docCount,
  onClick,
  overlay,
}: {
  app: Application;
  docCount: number;
  onClick: () => void;
  overlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: app.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        boxShadow: overlay ? "var(--shadow-lg)" : "var(--shadow-sm)",
      }}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`cursor-grab select-none rounded-lg p-3 transition-all active:cursor-grabbing ${
        isDragging && !overlay ? "opacity-30" : ""
      } ${overlay ? "rotate-1" : ""}`}
    >
      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>{app.position}</p>
      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{app.company}</p>
      
      {app.interviewDate && (
        <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {new Date(app.interviewDate).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${OUTCOME_COLORS[app.outcome]}`}>
          {OUTCOME_LABELS[app.outcome]}
        </span>
        {docCount > 0 && (
          <span className="text-[11px]" style={{ color: "var(--color-text-placeholder)" }}>
            {docCount} dok
          </span>
        )}
      </div>
    </div>
  );
}
