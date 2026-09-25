import type {
  applications,
  documents,
  pipelines,
  pipelineStages,
  applicationStageHistory,
} from "@/db/schema";

export type Application = typeof applications.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Pipeline = typeof pipelines.$inferSelect;
export type PipelineStage = typeof pipelineStages.$inferSelect;
export type StageHistoryEntry = typeof applicationStageHistory.$inferSelect;

export type PipelineWithStages = Pipeline & { stages: PipelineStage[] };

export const DOCUMENT_TYPE_LABELS: Record<Document["type"], string> = {
  cv: "CV",
  portfolio: "Portofolio",
  cover_letter: "Surat Lamaran",
  certificate: "Sertifikat",
  other: "Lainnya",
};

export const OUTCOME_LABELS: Record<Application["outcome"], string> = {
  active: "Aktif",
  offer: "Penawaran",
  hired: "Diterima",
  rejected: "Ditolak",
};

export const OUTCOME_COLORS: Record<Application["outcome"], string> = {
  active: "bg-blue-100 text-blue-700",
  offer: "bg-amber-100 text-amber-700",
  hired: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};
