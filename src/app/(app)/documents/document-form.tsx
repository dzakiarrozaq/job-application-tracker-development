"use client";

import { useActionState } from "react";
import { saveDocument, type DocumentFormState } from "./actions";
import type { Document } from "@/lib/types";
import { DOCUMENT_TYPE_LABELS } from "@/lib/types";

const initialState: DocumentFormState = {};

export function DocumentForm({
  initial,
  onSuccess,
  onCancel,
}: {
  initial?: Document | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveDocument, initialState);

  if (state.success) onSuccess();

  return (
    <form action={formAction} className="space-y-4">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Nama Dokumen
        </span>
        <input name="name" defaultValue={initial?.name} required className="input" placeholder="cth. CV Fullstack v2" />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Jenis Dokumen
        </span>
        <select name="type" defaultValue={initial?.type ?? "cv"} className="input">
          {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Tautan / URL
        </span>
        <input
          name="url"
          type="url"
          defaultValue={initial?.url}
          required
          className="input"
          placeholder="https://drive.google.com/..."
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Catatan (opsional)
        </span>
        <textarea name="notes" defaultValue={initial?.notes ?? ""} rows={2} className="input resize-none" />
      </label>

      {state.error ? <p className="text-sm text-rose-500">{state.error}</p> : null}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Batal
        </button>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Dokumen"}
        </button>
      </div>
    </form>
  );
}
