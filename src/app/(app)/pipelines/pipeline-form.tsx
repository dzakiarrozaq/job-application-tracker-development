"use client";

import { useActionState, useState, useEffect } from "react";
import { savePipeline, type PipelineFormState } from "./actions";
import type { PipelineWithStages } from "@/lib/types";

type StageDraft = {
  id?: string;
  name: string;
  type: "normal" | "offer" | "hired" | "rejected";
  isInterviewStage: boolean;
  color: string;
};

const STAGE_TYPE_LABELS: Record<StageDraft["type"], string> = {
  normal: "Normal",
  offer: "Penawaran",
  hired: "Diterima",
  rejected: "Ditolak",
};

const COLOR_PRESETS = ["#64748b", "#3b82f6", "#8b5cf6", "#0ea5e9", "#f59e0b", "#22c55e", "#ef4444", "#ec4899"];

const initialState: PipelineFormState = {};

export function PipelineForm({
  initial,
  onSuccess,
  onCancel,
}: {
  initial?: PipelineWithStages | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(savePipeline, initialState);
  const [stages, setStages] = useState<StageDraft[]>(
    initial?.stages.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      isInterviewStage: s.isInterviewStage,
      color: s.color,
    })) ?? [
      { name: "Applied", type: "normal", isInterviewStage: false, color: COLOR_PRESETS[0] },
      { name: "Interview", type: "normal", isInterviewStage: true, color: COLOR_PRESETS[1] },
      { name: "Rejected", type: "rejected", isInterviewStage: false, color: COLOR_PRESETS[6] },
    ],
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  function addStage() {
    setStages((prev) => [
      ...prev,
      { name: "", type: "normal", isInterviewStage: false, color: COLOR_PRESETS[prev.length % COLOR_PRESETS.length] },
    ]);
  }

  function updateStage(index: number, patch: Partial<StageDraft>) {
    setStages((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function removeStage(index: number) {
    setStages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-5">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="stagesJson" value={JSON.stringify(stages)} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Nama Alur Tahapan
        </span>
        <input name="name" defaultValue={initial?.name} required className="input" placeholder="cth. Lamaran BUMN" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Deskripsi (opsional)
        </span>
        <input
          name="description"
          defaultValue={initial?.description ?? ""}
          className="input"
          placeholder="Ceritakan singkat alur seleksi ini"
        />
      </label>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
            Tahapan Seleksi
          </span>
          <button
            type="button"
            onClick={addStage}
            className="text-sm font-semibold transition-colors"
            style={{ color: "var(--color-text)" }}
          >
            + Tambah Tahapan
          </button>
        </div>

        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => {
                setDraggedIndex(index);
                // Required for Firefox
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", index.toString());
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIndex === null || draggedIndex === index) return;
                setStages((prev) => {
                  const next = [...prev];
                  const item = next.splice(draggedIndex, 1)[0];
                  next.splice(index, 0, item);
                  return next;
                });
                setDraggedIndex(null);
              }}
              onDragEnd={() => setDraggedIndex(null)}
              className={`rounded-xl p-3 transition-transform ${draggedIndex === index ? "opacity-50 scale-[0.98]" : ""}`}
              style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="cursor-grab active:cursor-grabbing mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
                <input
                  value={stage.name}
                  onChange={(e) => updateStage(index, { name: e.target.value })}
                  placeholder={`Tahapan ${index + 1}`}
                  className="input flex-1 !py-1.5"
                />
                <select
                  value={stage.type}
                  onChange={(e) => updateStage(index, { type: e.target.value as StageDraft["type"] })}
                  className="input w-36 !py-1.5"
                >
                  {Object.entries(STAGE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => updateStage(index, { color: c })}
                      className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor: stage.color === c ? "var(--color-text)" : "transparent",
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    disabled={stages.length <= 1}
                    className="rounded-lg px-2 py-1 text-rose-500 transition-colors disabled:opacity-30 hover:bg-rose-500/10"
                  >
                    ✕ Hapus
                  </button>
                </div>
              </div>
              <label className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
                <input
                  type="checkbox"
                  checked={stage.isInterviewStage}
                  onChange={(e) => updateStage(index, { isInterviewStage: e.target.checked })}
                  className="h-3.5 w-3.5 rounded"
                  style={{ accentColor: "var(--color-accent)" }}
                />
                Tandai sebagai tahapan wawancara (dipakai untuk perhitungan analytics)
              </label>
            </div>
          ))}
        </div>
      </div>

      {state.error ? <p className="text-sm text-rose-500">{state.error}</p> : null}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Batal
        </button>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Buat Alur Tahapan"}
        </button>
      </div>
    </form>
  );
}
