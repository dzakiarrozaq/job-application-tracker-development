"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { DocumentForm } from "./document-form";
import { deleteDocument } from "./actions";
import type { Document } from "@/lib/types";
import { DOCUMENT_TYPE_LABELS } from "@/lib/types";

export function DocumentsClient({
  documents,
  usageCount,
}: {
  documents: Document[];
  usageCount: Record<string, number>;
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(doc: Document) {
    setEditing(doc);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus dokumen ini? Tautan ke lamaran juga akan terhapus.")) return;
    await deleteDocument(id);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
            Dokumen
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Kelola versi CV, portofolio, dan dokumen lain agar tidak salah kirim.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          Tambah Dokumen
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc, i) => (
          <div key={doc.id} className={`card p-5 animate-fade-in delay-${(i % 6) + 1}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium" style={{ color: "var(--color-text)" }}>
                  {doc.name}
                </h3>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px]"
                  style={{
                    backgroundColor: "var(--color-accent-subtle)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {DOCUMENT_TYPE_LABELS[doc.type]}
                </span>
              </div>
            </div>
            {doc.notes ? (
              <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {doc.notes}
              </p>
            ) : null}
            <a
              href={doc.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm underline underline-offset-2 transition-colors"
              style={{ color: "var(--color-text)" }}
            >
              Buka dokumen
            </a>
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-placeholder)" }}>
              Digunakan pada {usageCount[doc.id] ?? 0} lamaran
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => openEdit(doc)} className="btn-secondary !px-3 !py-1.5 text-xs">
                Edit
              </button>
              <button onClick={() => handleDelete(doc.id)} className="btn-danger !px-3 !py-1.5 text-xs">
                Hapus
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-placeholder)" }}>
            Belum ada dokumen. Tambahkan CV atau portofolio pertamamu.
          </p>
        ) : null}
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "Edit Dokumen" : "Tambah Dokumen"}>
        <DocumentForm
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
