"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { createApplication, updateApplication } from "@/app/(app)/applications/actions";
import type { Application, Document, PipelineWithStages } from "@/lib/types";
import { DOCUMENT_TYPE_LABELS } from "@/lib/types";

type FormState = { error?: string; success?: boolean };
const initialState: FormState = {};

export function ApplicationForm({
  pipelines,
  documents,
  initial,
  initialDocumentIds,
  onSuccess,
  onCancel,
}: {
  pipelines: PipelineWithStages[];
  documents: Document[];
  initial?: Application | null;
  initialDocumentIds?: string[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const action = initial ? updateApplication : createApplication;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [pipelineId, setPipelineId] = useState(initial?.pipelineId ?? pipelines[0]?.id ?? "");
  const [selectedDocs, setSelectedDocs] = useState<string[]>(initialDocumentIds ?? []);
  const [salary, setSalary] = useState(initial?.salaryExpectation ?? "");
  const [interviewDate, setInterviewDate] = useState<Date | null>(
    (initial as any)?.interviewDate ? new Date((initial as any).interviewDate) : null
  );

  const selectedPipeline = useMemo(
    () => pipelines.find((p) => p.id === pipelineId),
    [pipelines, pipelineId],
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  function toggleDoc(id: string) {
    setSelectedDocs((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  const appliedDateValue = initial?.appliedDate
    ? new Date(initial.appliedDate).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Perusahaan / Instansi">
          <input
            name="company"
            defaultValue={initial?.company}
            required
            className="input"
            placeholder="cth. Edrus Group"
          />
        </Field>
        <Field label="Posisi">
          <input
            name="position"
            defaultValue={initial?.position}
            required
            className="input"
            placeholder="cth. Web Developer"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tautan Lowongan">
          <input
            name="jobUrl"
            defaultValue={initial?.jobUrl ?? ""}
            className="input"
            placeholder="https://..."
          />
        </Field>
        <Field label="Lokasi">
          <input name="location" defaultValue={initial?.location ?? ""} className="input" placeholder="cth. Jakarta / Remote" />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Ekspektasi Gaji">
          <input
            name="salaryExpectation"
            value={salary}
            onChange={(e) => {
              const num = e.target.value.replace(/\D/g, "");
              setSalary(num ? "Rp " + new Intl.NumberFormat("id-ID").format(Number(num)) : "");
            }}
            className="input"
            placeholder="cth. Rp 8.000.000"
          />
        </Field>
        <Field label="Tanggal Melamar">
          <input type="date" name="appliedDate" defaultValue={appliedDateValue} className="input" />
        </Field>
      </div>

      {initial ? (
        <div className="grid grid-cols-1 gap-4">
          <Field label="Jadwal Tes / Wawancara (Opsional)">
            <DatePicker
              selected={interviewDate}
              onChange={(date) => setInterviewDate(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="d MMMM yyyy, HH:mm"
              className="input w-full"
              placeholderText="Pilih tanggal & waktu"
              isClearable
              wrapperClassName="w-full"
            />
            <input 
              type="hidden" 
              name="interviewDate" 
              value={interviewDate ? interviewDate.toISOString() : ""} 
            />
          </Field>
        </div>
      ) : null}

      {pipelines.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-200">
          <p className="text-sm font-medium">Pipeline Kosong</p>
          <p className="mt-1 text-xs">Anda belum memiliki pipeline. Silakan buat pipeline terlebih dahulu di menu Pipeline agar bisa menambah lamaran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Pipeline">
            <select
              name="pipelineId"
              value={pipelineId}
              onChange={(e) => setPipelineId(e.target.value)}
              className="input"
              required
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tahapan Saat Ini">
            <select
              name="stageId"
              defaultValue={initial?.currentStageId ?? undefined}
              className="input"
              required
            >
              {selectedPipeline?.stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      <Field label="Catatan">
        <textarea
          name="notes"
          defaultValue={initial?.notes ?? ""}
          rows={3}
          className="input resize-none"
          placeholder="Catatan khusus tentang lamaran ini..."
        />
      </Field>

      <div>
        <p className="mb-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          Dokumen Terlampir
        </p>
        {documents.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-placeholder)" }}>
            Belum ada dokumen. Tambahkan dokumen di halaman Dokumen terlebih dahulu.
          </p>
        ) : (
          <div
            className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto rounded-xl p-3 sm:grid-cols-2"
            style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            {documents.map((doc) => (
              <label
                key={doc.id}
                className="flex items-center gap-2 text-sm cursor-pointer rounded-lg px-2 py-1.5 transition-colors"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <input
                  type="checkbox"
                  name="documentIds"
                  value={doc.id}
                  checked={selectedDocs.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: "var(--color-accent)" }}
                />
                <span className="truncate">
                  {doc.name}{" "}
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    ({DOCUMENT_TYPE_LABELS[doc.type]})
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {state.error ? <p className="text-sm text-rose-500">{state.error}</p> : null}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Batal
        </button>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Tambah Lamaran"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
