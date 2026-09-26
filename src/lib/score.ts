/**
 * Application Score Engine
 * Scores each application 0–100 based on real signals.
 * No external API needed — uses only data already in the system.
 */

export type AppScoreInput = {
  outcome: "active" | "offer" | "hired" | "rejected";
  appliedDate: Date;
  updatedAt: Date;
  hasInterviewDate: boolean;
  stageOrder: number;       // current stage order (higher = further in pipeline)
  totalStages: number;      // total stages in pipeline
  docCount: number;         // number of attached documents
  historyCount: number;     // number of stage transitions (activity signal)
};

export type AppScore = {
  score: number;     // 0–100
  grade: "S" | "A" | "B" | "C" | "D";
  signals: { label: string; positive: boolean }[];
};

export function computeScore(input: AppScoreInput): AppScore {
  const signals: { label: string; positive: boolean }[] = [];
  let score = 0;

  // ── 1. Pipeline Progress (0–35pts) ──
  // The further along, the more promising
  const progress = input.totalStages > 1
    ? input.stageOrder / (input.totalStages - 1)
    : 0;
  const progressPts = Math.round(progress * 35);
  score += progressPts;
  if (progress > 0.5) {
    signals.push({ label: "Sudah melewati setengah tahapan", positive: true });
  } else if (progress === 0) {
    signals.push({ label: "Baru di tahap awal", positive: false });
  }

  // ── 2. Interview Scheduled (20pts) ──
  if (input.hasInterviewDate) {
    score += 20;
    signals.push({ label: "Jadwal tes/wawancara sudah ada", positive: true });
  }

  // ── 3. Document Completeness (0–15pts) ──
  const docPts = Math.min(input.docCount * 5, 15);
  score += docPts;
  if (input.docCount >= 3) {
    signals.push({ label: "Dokumen lengkap", positive: true });
  } else if (input.docCount === 0) {
    signals.push({ label: "Belum ada dokumen terlampir", positive: false });
  }

  // ── 4. Recency / Freshness (0–15pts) ──
  const now = Date.now();
  const daysSinceUpdate = (now - input.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate < 3) {
    score += 15;
    signals.push({ label: "Baru diperbarui", positive: true });
  } else if (daysSinceUpdate < 7) {
    score += 10;
  } else if (daysSinceUpdate < 14) {
    score += 5;
  } else {
    signals.push({ label: "Tidak ada update >2 minggu", positive: false });
  }

  // ── 5. Company Activity Signal (0–15pts) ──
  // More stage transitions = company is actively engaging
  if (input.historyCount >= 4) {
    score += 15;
    signals.push({ label: "Perusahaan aktif merespons", positive: true });
  } else if (input.historyCount >= 2) {
    score += 8;
  } else {
    score += 2;
  }

  // Clamp 0–100
  score = Math.min(100, Math.max(0, score));

  // Grade
  const grade =
    score >= 85 ? "S" :
    score >= 70 ? "A" :
    score >= 50 ? "B" :
    score >= 30 ? "C" : "D";

  return { score, grade, signals };
}

/** Grade badge colors (Tailwind) */
export const GRADE_COLORS: Record<AppScore["grade"], { bg: string; text: string; border: string }> = {
  S: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-400/30" },
  A: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-400/30" },
  B: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-400/30" },
  C: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-400/30" },
  D: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-400/30" },
};

/** Interview prep questions based on keywords in position/company */
export function getInterviewQuestions(position: string, company: string): { category: string; questions: string[] }[] {
  const pos = position.toLowerCase();
  const isEngineer = /engineer|developer|dev|programmer|backend|frontend|fullstack|software/.test(pos);
  const isDesigner = /design|ui|ux|graphic|visual/.test(pos);
  const isManager = /manager|lead|head|direktur|supervisor|chief/.test(pos);
  const isMarketing = /marketing|growth|brand|content|seo|social media/.test(pos);
  const isData = /data|analyst|scientist|ml|ai|machine learning/.test(pos);
  const isFinance = /finance|akuntansi|accounting|keuangan|audit|tax/.test(pos);
  const isHR = /hr|human resource|rekrutmen|recruitment|talent/.test(pos);

  const base = [
    {
      category: "🧠 Tentang Diri",
      questions: [
        "Ceritakan tentang diri Anda dan perjalanan karir Anda sejauh ini.",
        `Mengapa Anda tertarik bergabung dengan ${company}?`,
        `Mengapa Anda melamar untuk posisi ${position}?`,
        "Apa kekuatan terbesar Anda yang relevan dengan posisi ini?",
        "Apa kelemahan Anda dan bagaimana Anda mengatasinya?",
      ],
    },
    {
      category: "🎯 Situasional",
      questions: [
        "Ceritakan tentang tantangan terbesar yang pernah Anda hadapi di tempat kerja dan cara Anda mengatasinya.",
        "Bagaimana Anda menangani situasi ketika Anda tidak setuju dengan keputusan atasan?",
        "Berikan contoh saat Anda harus bekerja di bawah tekanan dengan deadline ketat.",
        "Ceritakan pengalaman Anda bekerja dalam tim yang memiliki konflik internal.",
      ],
    },
    {
      category: "🔮 Forward-looking",
      questions: [
        "Di mana Anda melihat diri Anda 3–5 tahun ke depan?",
        `Apa yang Anda harapkan dari lingkungan kerja di ${company}?`,
        "Apa target pertama yang ingin Anda capai dalam 90 hari pertama bekerja?",
      ],
    },
  ];

  const technicalSection = isEngineer ? [{
    category: "💻 Teknikal (Engineering)",
    questions: [
      "Ceritakan tentang sistem atau fitur terbesar yang pernah Anda bangun dari nol.",
      "Bagaimana Anda mendekati code review dan apa yang Anda cari?",
      "Bagaimana Anda menangani technical debt di project Anda?",
      "Jelaskan perbedaan antara REST API dan GraphQL, kapan Anda memilih masing-masing?",
      "Bagaimana cara Anda memastikan kualitas kode dalam tim?",
      "Teknologi atau framework apa yang ingin Anda pelajari dan mengapa?",
    ],
  }] : [];

  const designSection = isDesigner ? [{
    category: "🎨 Teknikal (Design)",
    questions: [
      "Ceritakan proses desain Anda dari brief hingga deliverable.",
      "Bagaimana Anda menangani feedback yang bertentangan dari stakeholder?",
      "Bagaimana Anda memastikan desain Anda accessible dan inclusive?",
      "Ceritakan tentang proyek desain yang paling Anda banggakan dan mengapa.",
      "Bagaimana Anda mengukur keberhasilan desain yang Anda buat?",
    ],
  }] : [];

  const managerSection = isManager ? [{
    category: "👥 Leadership",
    questions: [
      "Bagaimana cara Anda memotivasi tim yang sedang mengalami penurunan performa?",
      "Ceritakan bagaimana Anda mengelola anggota tim yang underperforming.",
      "Bagaimana Anda memprioritaskan pekerjaan ketika semua hal terasa urgent?",
      "Bagaimana cara Anda membangun budaya tim yang positif?",
      "Berikan contoh keputusan sulit yang pernah Anda buat sebagai pemimpin.",
    ],
  }] : [];

  const dataSection = isData ? [{
    category: "📊 Teknikal (Data)",
    questions: [
      "Bagaimana Anda menangani missing data atau outlier dalam dataset?",
      "Ceritakan proyek analisis data terbesar yang pernah Anda kerjakan.",
      "Bagaimana Anda mengkomunikasikan temuan data kepada stakeholder non-teknis?",
      "Tools atau bahasa pemrograman apa yang paling sering Anda gunakan untuk analisis?",
      "Bagaimana Anda memastikan kualitas dan integritas data?",
    ],
  }] : [];

  const marketingSection = isMarketing ? [{
    category: "📣 Teknikal (Marketing)",
    questions: [
      "Ceritakan kampanye marketing yang paling berhasil yang pernah Anda jalankan.",
      "Bagaimana Anda mengukur ROI dari sebuah kampanye?",
      "Bagaimana Anda melakukan riset target audiens?",
      "Bagaimana Anda menghadapi situasi ketika sebuah kampanye tidak berjalan sesuai rencana?",
      "Metrik apa yang paling penting menurut Anda dalam strategi digital marketing?",
    ],
  }] : [];

  const financeSection = isFinance ? [{
    category: "💰 Teknikal (Finance)",
    questions: [
      "Bagaimana Anda memastikan akurasi dalam laporan keuangan?",
      "Ceritakan pengalaman Anda dengan proses audit.",
      "Bagaimana Anda menangani discrepancy dalam laporan keuangan?",
      "Software atau tools akuntansi apa yang pernah Anda gunakan?",
      "Bagaimana Anda tetap up-to-date dengan peraturan perpajakan terbaru?",
    ],
  }] : [];

  const hrSection = isHR ? [{
    category: "🤝 Teknikal (HR)",
    questions: [
      "Bagaimana strategi Anda dalam merekrut talent di pasar yang kompetitif?",
      "Bagaimana Anda menangani konflik antara karyawan?",
      "Ceritakan pengalaman Anda dalam implementasi program employee engagement.",
      "Bagaimana Anda mengukur efektivitas program pelatihan yang Anda buat?",
      "Bagaimana Anda mendekati proses performance review?",
    ],
  }] : [];

  const closingSection = [{
    category: "❓ Pertanyaan untuk Pewawancara",
    questions: [
      `Seperti apa budaya kerja di ${company}?`,
      "Apa tantangan terbesar yang dihadapi tim ini saat ini?",
      "Bagaimana proses onboarding untuk karyawan baru?",
      "Apa yang membuat seseorang sukses di posisi ini?",
      "Bagaimana kesempatan pengembangan karir di sini?",
    ],
  }];

  return [
    ...base,
    ...technicalSection,
    ...designSection,
    ...managerSection,
    ...dataSection,
    ...marketingSection,
    ...financeSection,
    ...hrSection,
    ...closingSection,
  ];
}
