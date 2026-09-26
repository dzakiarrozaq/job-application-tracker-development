import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GitMerge, KanbanSquare, FileText, BarChart3, Shield, Smartphone, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main style={{ backgroundColor: "var(--color-bg)", minHeight: "100vh" }} className="overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03] -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-text) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5 z-10">
        <span className="text-[15px] font-bold tracking-tight flex items-center" style={{ color: "var(--color-text)" }}>
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
          PushToOffer
        </span>
        <nav className="flex items-center gap-1">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800/50"
            style={{ color: "var(--color-text-muted)" }}
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{ backgroundColor: "var(--color-text)", color: "var(--color-bg)" }}
          >
            Daftar Gratis
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 lg:pt-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="max-w-2xl z-10">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide uppercase shadow-sm border"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
                borderColor: "var(--color-border)",
              }}
            >
              <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--color-text-muted)" }} />
              A Personal Developer Tool for Job Hunting
            </div>
            <h1
              className="text-[3rem] font-semibold leading-[1.1] tracking-tight sm:text-[4rem]"
              style={{ color: "var(--color-text)" }}
            >
              Semua lamaranmu,<br />
              <span style={{ color: "var(--color-text-muted)" }}>
                tersusun rapi.
              </span>
            </h1>
            <p
              className="mt-4 max-w-lg text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Lacak setiap proses seleksi — swasta, CPNS, hingga akademi — dalam satu papan Kanban interaktif yang bisa kamu sesuaikan sepenuhnya dengan kebutuhanmu.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link
                href="/register"
                className="group flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:opacity-90 hover:-translate-y-0.5 w-full sm:w-auto shadow-md"
                style={{ backgroundColor: "var(--color-text)", color: "var(--color-bg)" }}
              >
                Mulai Sekarang
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                <CheckCircle2 className="h-4 w-4" style={{ color: "var(--color-text-muted)" }} />
                100% Gratis selamanya
              </div>
            </div>
          </div>

          {/* Kanban CSS Mockup - Minimalist */}
          <div className="relative hidden lg:block perspective-1000">
            <div className="relative w-[110%] -right-10 rotate-y-[-10deg] rotate-x-[5deg] rotate-z-[2deg] rounded-xl border p-4 shadow-2xl backdrop-blur-xl"
                 style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
              <div className="mb-4 flex items-center justify-between px-2">
                <div className="h-4 w-32 rounded-md bg-gray-200 dark:bg-gray-800" />
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                  <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                </div>
              </div>
              <div className="flex gap-4">
                {/* Column 1 */}
                <div className="w-1/3 rounded-lg p-3" style={{ backgroundColor: "var(--color-bg)" }}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-3 w-20 rounded bg-gray-300 dark:bg-gray-600" />
                    <div className="h-4 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="mb-3 rounded p-3 shadow-sm border border-gray-100 dark:border-gray-800" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="mb-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2 w-1/2 rounded bg-gray-100 dark:bg-gray-900" />
                  </div>
                  <div className="rounded p-3 shadow-sm border border-gray-100 dark:border-gray-800" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="mb-2 h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2 w-1/3 rounded bg-gray-100 dark:bg-gray-900" />
                  </div>
                </div>
                {/* Column 2 */}
                <div className="w-1/3 rounded-lg p-3 opacity-90" style={{ backgroundColor: "var(--color-bg)" }}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-3 w-24 rounded bg-gray-400 dark:bg-gray-500" />
                    <div className="h-4 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="rounded p-3 shadow-sm border border-l-2 border-gray-200 border-l-gray-500 dark:border-gray-800 dark:border-l-gray-400 transform -translate-y-1" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="mb-2 h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="mb-3 h-2 w-2/3 rounded bg-gray-100 dark:bg-gray-900" />
                    <div className="flex items-center gap-1">
                       <div className="h-2 w-2 rounded-full bg-gray-500" />
                       <div className="h-2 w-16 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                </div>
                {/* Column 3 */}
                <div className="w-1/3 rounded-lg p-3 opacity-60" style={{ backgroundColor: "var(--color-bg)" }}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-3 w-16 rounded bg-gray-300 dark:bg-gray-600" />
                    <div className="h-4 w-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                  <div className="rounded p-3 shadow-sm border border-gray-100 dark:border-gray-800" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="mb-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-2 w-3/4 rounded bg-gray-100 dark:bg-gray-900" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px" style={{ backgroundColor: "var(--color-border)" }} />
      </div>

      {/* Features */}
      <section className="relative mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--color-text)" }}>Fitur Super Power</h2>
          <p className="mt-2 text-lg" style={{ color: "var(--color-text-secondary)" }}>Semua yang kamu butuhkan untuk menaklukkan proses rekrutmen.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <GitMerge className="h-5 w-5" style={{ color: "var(--color-text)" }} />,
              title: "Alur Tahapan Kustom",
              desc: "Buat alur seleksimu sendiri atau pilih template yang sudah tersedia: Corporate, CPNS, Akademi.",
            },
            {
              icon: <KanbanSquare className="h-5 w-5" style={{ color: "var(--color-text)" }} />,
              title: "Kanban Interaktif",
              desc: "Geser kartu lamaran antar tahapan. Perubahan tersimpan seketika tanpa perlu reload, pakai API HTML5 Drag.",
            },
            {
              icon: <FileText className="h-5 w-5" style={{ color: "var(--color-text)" }} />,
              title: "Manajemen Dokumen",
              desc: "Catat versi CV dan portofolio mana yang kamu kirimkan ke setiap lamaran agar tidak salah kirim.",
            },
            {
              icon: <BarChart3 className="h-5 w-5" style={{ color: "var(--color-text)" }} />,
              title: "Dashboard Analitik",
              desc: "Lihat berapa persen lamaranmu yang sampai tahap interview dan pantau tren bulanan dengan grafik analitik.",
            },
            {
              icon: <Shield className="h-5 w-5" style={{ color: "var(--color-text)" }} />,
              title: "Data Terisolasi",
              desc: "Privasi aman. Setiap akun punya datanya masing-masing, tersimpan rapi dan tidak bocor kemana-mana.",
            },
            {
              icon: <Smartphone className="h-5 w-5" style={{ color: "var(--color-text)" }} />,
              title: "Responsif Mobile",
              desc: "Buka dari HP pun lancar, tampilan menyesuaikan dengan nyaman tanpa kehilangan informasi penting.",
            },
          ].map((f, i) => (
            <div
              key={f.title}
              className="group rounded-xl p-6 transition-all hover:shadow-md hover:-translate-y-1 border"
              style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110 shadow-sm border"
                style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 mt-6" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-sm" style={{ color: "var(--color-text)" }}>
             <span
               className="inline-block h-2 w-2 rounded-full"
               style={{ backgroundColor: "var(--color-accent)" }}
             />
             PushToOffer
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-placeholder)" }}>
            Dibuat oleh Muhammad Dzaki Arrozaq — {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </main>
  );
}
