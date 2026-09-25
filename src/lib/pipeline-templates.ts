export type StageTemplate = {
  name: string;
  type: "normal" | "offer" | "hired" | "rejected";
  isInterviewStage?: boolean;
  color: string;
};

export type PipelineTemplate = {
  track: string;
  name: string;
  description: string;
  stages: StageTemplate[];
};

// Default system pipeline templates seeded for every new user, matching the
// three scenarios described in the PRD (Corporate, Government/CPNS, Academy).
export const DEFAULT_PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    track: "corporate",
    name: "Corporate Track",
    description: "Alur lamaran standar untuk perusahaan swasta / startup.",
    stages: [
      { name: "Applied", type: "normal", color: "#64748b" },
      { name: "HR Interview", type: "normal", isInterviewStage: true, color: "#3b82f6" },
      { name: "Technical Interview", type: "normal", isInterviewStage: true, color: "#8b5cf6" },
      { name: "Offering", type: "offer", color: "#f59e0b" },
      { name: "Hired", type: "hired", color: "#22c55e" },
      { name: "Rejected", type: "rejected", color: "#ef4444" },
    ],
  },
  {
    track: "government",
    name: "Government Track (CPNS)",
    description: "Alur seleksi instansi pemerintah / CPNS.",
    stages: [
      { name: "Pendaftaran Administrasi", type: "normal", color: "#64748b" },
      { name: "Seleksi Kompetensi Dasar (SKD)", type: "normal", isInterviewStage: true, color: "#3b82f6" },
      { name: "Seleksi Kompetensi Bidang (SKB)", type: "normal", isInterviewStage: true, color: "#8b5cf6" },
      { name: "Pemberkasan", type: "offer", color: "#f59e0b" },
      { name: "Lulus", type: "hired", color: "#22c55e" },
      { name: "Tidak Lulus", type: "rejected", color: "#ef4444" },
    ],
  },
  {
    track: "academy",
    name: "Academy Track",
    description: "Alur seleksi program akademi / bootcamp intensif.",
    stages: [
      { name: "Profile Screening", type: "normal", color: "#64748b" },
      { name: "Portfolio Review", type: "normal", color: "#0ea5e9" },
      { name: "Logic Test", type: "normal", isInterviewStage: true, color: "#8b5cf6" },
      { name: "Final Interview", type: "normal", isInterviewStage: true, color: "#f59e0b" },
      { name: "Diterima", type: "hired", color: "#22c55e" },
      { name: "Ditolak", type: "rejected", color: "#ef4444" },
    ],
  },
];
