"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  KanbanSquare,
  FileStack,
  Route,
  FolderOpen,
  Sun,
  Moon,
  LogOut,
  MoreHorizontal,
  Calendar,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Lamaran", icon: FileStack },
  { href: "/board", label: "Kanban", icon: KanbanSquare },
  { href: "/calendar", label: "Kalender", icon: Calendar },
  { href: "/pipelines", label: "Alur Tahapan", icon: Route },
  { href: "/documents", label: "Dokumen", icon: FolderOpen },
];

// 4 main items shown on the mobile bottom nav
const BOTTOM_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Lamaran", icon: FileStack },
  { href: "/board", label: "Kanban", icon: KanbanSquare },
  { href: "/calendar", label: "Kalender", icon: Calendar },
];

// Items accessible via "More" bottom sheet on mobile
const MORE_NAV_ITEMS = [
  { href: "/pipelines", label: "Alur Tahapan", icon: Route },
  { href: "/documents", label: "Dokumen", icon: FolderOpen },
];

export function AppShell({
  children,
  user,
  followUpCount = 0,
}: {
  children: ReactNode;
  user: { name: string; email: string };
  followUpCount?: number;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="flex min-h-screen">

        {/* ── Desktop sidebar (hidden on mobile) ── */}
        <aside
          className="hidden w-56 shrink-0 lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto"
          style={{
            borderRight: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <SidebarContent
            pathname={pathname}
            user={user}
            followUpCount={followUpCount}
            bellOpen={bellOpen}
            setBellOpen={setBellOpen}
          />
        </aside>

        {/* ── Mobile top bar: logo + notification bell only (NO hamburger) ── */}
        <div
          className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-3.5 lg:hidden"
          style={{
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
            backdropFilter: "blur(12px)",
          }}
        >
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
            PushToOffer
          </span>
          <button
            onClick={() => setBellOpen((v) => !v)}
            className="relative rounded-lg p-2 transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Bell className="h-5 w-5" />
            {followUpCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {followUpCount > 9 ? "9+" : followUpCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Notification dropdown ── */}
        {bellOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)}>
            <div
              className="absolute right-4 top-14 lg:left-60 lg:top-4 lg:right-auto w-80 rounded-xl animate-scale-in"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                boxShadow: "var(--shadow-lg)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  Pengingat Follow-Up
                </p>
              </div>
              <div className="px-4 py-3">
                {followUpCount === 0 ? (
                  <p className="text-sm py-4 text-center" style={{ color: "var(--color-text-placeholder)" }}>
                    🎉 Semua lamaran sudah di-follow up!
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      Ada <strong className="text-amber-500">{followUpCount} lamaran</strong> yang sudah lebih dari 7 hari tanpa pergerakan.
                    </p>
                    <Link
                      href="/applications"
                      onClick={() => setBellOpen(false)}
                      className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors"
                      style={{ backgroundColor: "var(--color-accent-subtle)", color: "var(--color-text)" }}
                    >
                      Lihat Daftar Lamaran →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <main className="min-w-0 flex-1 px-4 pb-28 pt-20 sm:px-8 lg:pb-16 lg:pt-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation bar ── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around px-1 py-1.5 lg:hidden"
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all"
              style={{
                color: active ? "var(--color-text)" : "var(--color-text-placeholder)",
                backgroundColor: active ? "var(--color-accent-subtle)" : "transparent",
                minWidth: 56,
              }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* "More" button opens bottom sheet */}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-all"
          style={{ color: "var(--color-text-placeholder)", minWidth: 56 }}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-medium">Lainnya</span>
        </button>
      </nav>

      {/* ── "More" bottom sheet ── */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:hidden animate-fade-in"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setMoreOpen(false)}
        >
          <MoreSheet user={user} pathname={pathname} onClose={() => setMoreOpen(false)} />
        </div>
      )}
    </div>
  );
}

/** Bottom sheet that slides up when "Lainnya" is tapped */
function MoreSheet({
  user,
  pathname,
  onClose,
}: {
  user: { name: string; email: string };
  pathname: string;
  onClose: () => void;
}) {
  const { theme, toggle } = useTheme();

  return (
    <div
      className="w-full rounded-t-2xl animate-slide-up"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-xl)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-4">
        <div className="h-1 w-10 rounded-full" style={{ backgroundColor: "var(--color-border)" }} />
      </div>

      <div className="px-5 pb-10 space-y-1">
        {/* User info card */}
        <div
          className="flex items-center gap-3 mb-4 px-3 py-3 rounded-xl"
          style={{ backgroundColor: "var(--color-bg-elevated)" }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: "var(--color-accent)", color: "var(--color-surface)" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
              {user.name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--color-text-placeholder)" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Extra pages */}
        {MORE_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-all"
              style={{
                backgroundColor: active ? "var(--color-accent-subtle)" : "transparent",
                color: active ? "var(--color-text)" : "var(--color-text-muted)",
              }}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className="h-5 w-5"
                  style={{ color: active ? "var(--color-text)" : "var(--color-text-placeholder)" }}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-2" style={{ borderTop: "1px solid var(--color-border)" }} />

        {/* Theme toggle with visual switch */}
        <button
          onClick={toggle}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3.5 transition-all"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-3">
            {theme === "light" ? (
              <Moon className="h-5 w-5" style={{ color: "var(--color-text-placeholder)" }} />
            ) : (
              <Sun className="h-5 w-5" style={{ color: "var(--color-text-placeholder)" }} />
            )}
            <span className="text-sm font-medium">
              {theme === "light" ? "Mode Gelap" : "Mode Terang"}
            </span>
          </div>
          {/* Toggle switch visual */}
          <div
            className="h-5 w-9 rounded-full flex items-center px-0.5 transition-all duration-200"
            style={{ backgroundColor: theme === "dark" ? "var(--color-accent)" : "var(--color-border)" }}
          >
            <div
              className="h-4 w-4 rounded-full transition-all duration-200"
              style={{
                backgroundColor: "var(--color-surface)",
                transform: theme === "dark" ? "translateX(16px)" : "translateX(0)",
              }}
            />
          </div>
        </button>

        {/* Logout — red */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 transition-all"
          style={{ color: "#dc2626" }}
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
}

/** Desktop-only sidebar content */
function SidebarContent({
  pathname,
  user,
  followUpCount,
  bellOpen,
  setBellOpen,
}: {
  pathname: string;
  user: { name: string; email: string };
  followUpCount: number;
  bellOpen: boolean;
  setBellOpen: (v: boolean) => void;
}) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-full flex-col px-4 py-5">
      {/* Logo */}
      <div className="mb-8 flex items-center justify-between px-2">
        <span className="text-sm font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
          <span className="inline-block h-2 w-2 rounded-full mr-2" style={{ backgroundColor: "var(--color-accent)" }} />
          PushToOffer
        </span>
        <button
          onClick={() => setBellOpen(!bellOpen)}
          className="relative rounded-lg p-1.5 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          title="Pengingat follow-up"
        >
          <Bell className="h-4 w-4" />
          {followUpCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
              {followUpCount > 9 ? "9+" : followUpCount}
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all"
              style={{
                backgroundColor: active ? "var(--color-accent-subtle)" : "transparent",
                fontWeight: active ? 500 : 400,
                color: active ? "var(--color-text)" : "var(--color-text-muted)",
              }}
            >
              <Icon
                className="h-[18px] w-[18px] transition-colors"
                style={{ color: active ? "var(--color-text)" : "var(--color-text-placeholder)" }}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <div className="mt-2 px-1">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all"
          style={{ color: "var(--color-text-muted)" }}
          title={theme === "light" ? "Aktifkan Mode Gelap" : "Aktifkan Mode Terang"}
        >
          {theme === "light" ? (
            <Moon className="h-[18px] w-[18px]" style={{ color: "var(--color-text-placeholder)" }} />
          ) : (
            <Sun className="h-[18px] w-[18px]" style={{ color: "var(--color-text-placeholder)" }} />
          )}
          {theme === "light" ? "Mode Gelap" : "Mode Terang"}
        </button>
      </div>

      {/* User + logout */}
      <div className="mt-2 pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="px-2 mb-3">
          <p className="truncate text-sm font-medium" style={{ color: "var(--color-text)" }}>
            {user.name}
          </p>
          <p className="truncate text-xs" style={{ color: "var(--color-text-placeholder)" }}>
            {user.email}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all"
          style={{ color: "var(--color-text-muted)" }}
        >
          <LogOut className="h-[18px] w-[18px]" style={{ color: "var(--color-text-placeholder)" }} />
          Keluar
        </button>
      </div>
    </div>
  );
}
