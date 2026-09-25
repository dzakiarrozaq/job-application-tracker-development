"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, KanbanSquare, FileStack, Route, FolderOpen, Sun, Moon, LogOut, Menu, X, Calendar } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "Lamaran", icon: FileStack },
  { href: "/board", label: "Kanban", icon: KanbanSquare },
  { href: "/calendar", label: "Kalender", icon: Calendar },
  { href: "/pipelines", label: "Pipeline", icon: Route },
  { href: "/documents", label: "Dokumen", icon: FolderOpen },
];

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: { name: string; email: string };
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <aside
          className="hidden w-56 shrink-0 lg:flex lg:flex-col sticky top-0 h-screen overflow-y-auto"
          style={{
            borderRight: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <SidebarContent pathname={pathname} user={user} />
        </aside>

        {/* Mobile top bar */}
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
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-lg p-2 transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden animate-fade-in"
            style={{ backgroundColor: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileOpen(false)}
          >
            <aside
              className="absolute left-0 top-0 h-full w-56 animate-slide-up"
              style={{ backgroundColor: "var(--color-surface)", boxShadow: "var(--shadow-xl)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                onNavigate={() => setMobileOpen(false)}
              />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 px-5 pb-16 pt-20 sm:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  onNavigate,
}: {
  pathname: string;
  user: { name: string; email: string };
  onNavigate?: () => void;
}) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex h-full flex-col px-4 py-5">
      {/* Logo */}
      <div className="mb-8 px-2">
        <span className="text-sm font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
          <span className="inline-block h-2 w-2 rounded-full mr-2" style={{ backgroundColor: "var(--color-accent)" }} />
          PushToOffer
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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

      {/* User section */}
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
