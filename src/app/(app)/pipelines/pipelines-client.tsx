"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { PipelineForm } from "./pipeline-form";
import { deletePipeline } from "./actions";
import type { PipelineWithStages } from "@/lib/types";

export function PipelinesClient({ pipelines }: { pipelines: PipelineWithStages[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PipelineWithStages | null>(null);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(p: PipelineWithStages) {
    setEditing(p);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus alur tahapan ini beserta seluruh itemnya?")) return;
    const res = await deletePipeline(id);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
            Alur Tahapan
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Sesuaikan alur tahapan seleksi untuk tiap jenis lamaran.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          Buat Alur Tahapan
        </button>
      </div>

      {error ? (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm"
          style={{
            border: "1px solid #fca5a5",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
          }}
        >
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pipelines.map((pipeline, i) => (
          <div key={pipeline.id} className={`card p-5 animate-fade-in delay-${(i % 6) + 1}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium" style={{ color: "var(--color-text)" }}>
                  {pipeline.name}
                </h3>
                {pipeline.description ? (
                  <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {pipeline.description}
                  </p>
                ) : null}
              </div>
              {pipeline.isSystem && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-[11px]"
                  style={{
                    backgroundColor: "var(--color-accent-subtle)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Template
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {pipeline.stages.map((stage) => (
                <span
                  key={stage.id}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-white"
                  style={{ backgroundColor: stage.color }}
                >
                  {stage.name}
                </span>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => openEdit(pipeline)} className="btn-secondary !px-3 !py-1.5 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(pipeline.id)} className="btn-danger !px-3 !py-1.5 text-xs">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Alur Tahapan" : "Buat Alur Tahapan Baru"}
        wide
      >
        <PipelineForm
          initial={editing}
          onSuccess={() => {
            setFormOpen(false);
            router.refresh();
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
