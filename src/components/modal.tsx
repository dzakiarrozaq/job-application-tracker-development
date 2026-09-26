"use client";

import { type ReactNode, useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-start sm:justify-center sm:px-4 sm:py-8 animate-fade-in"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className={`w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"} rounded-t-2xl sm:rounded-xl animate-slide-up flex flex-col`}
        style={{
          maxHeight: "92vh",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: "var(--color-border)" }} />
        </div>
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-sm transition-all"
            style={{ color: "var(--color-text-muted)" }}
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-5 flex-1" style={{ overflowY: "auto", overflowX: "visible" }}>
          {children}
        </div>
        {footer && (
          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)", borderBottomLeftRadius: "0.75rem", borderBottomRightRadius: "0.75rem" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
