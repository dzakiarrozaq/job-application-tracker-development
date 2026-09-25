"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { id } from "date-fns/locale";
import type { Application, Document, PipelineWithStages } from "@/lib/types";
import { Modal } from "@/components/modal";
import { ApplicationForm } from "@/components/application-form";

export function CalendarClient({
  applications,
  pipelines,
  documents,
  documentsByApplication,
}: {
  applications: Application[];
  pipelines: PipelineWithStages[];
  documents: Document[];
  documentsByApplication: Record<string, string[]>;
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const getGCalLink = (app: Application) => {
    const interviewDate = app.interviewDate;
    if (!interviewDate) return "#";
    const start = new Date(interviewDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tes+Wawancara+-+${encodeURIComponent(app.company)}&details=${encodeURIComponent(app.position)}&dates=${formatDate(start)}/${formatDate(end)}`;
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
            Jadwal Tes & Wawancara
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Lihat jadwal tes yang sudah Anda atur di lamaran.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={today} className="btn-secondary mr-2">Hari Ini</button>
          <button onClick={prevMonth} className="btn-secondary px-3">&lt;</button>
          <span className="font-medium text-sm w-32 text-center" style={{ color: "var(--color-text)" }}>
            {format(currentDate, dateFormat, { locale: id })}
          </span>
          <button onClick={nextMonth} className="btn-secondary px-3">&gt;</button>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b bg-gray-50/50 dark:bg-white/5" style={{ borderColor: "var(--color-border)" }}>
          {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((dayName) => (
            <div key={dayName} className="py-3 text-center text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-[120px] divide-y divide-x" style={{ borderColor: "var(--color-border-subtle)" }}>
          {days.map((day, i) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isCurrentDay = isToday(day);

            // Find apps for this day
            const dayApps = applications.filter((app) => 
              app.interviewDate && isSameDay(new Date(app.interviewDate), day)
            );

            return (
              <div 
                key={day.toISOString()} 
                className={`p-2 transition-colors ${!isCurrentMonth ? "bg-black/5 dark:bg-white/5 opacity-50" : ""}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span 
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium
                      ${isCurrentDay ? "bg-blue-600 text-white" : ""}`}
                    style={{ color: !isCurrentDay ? "var(--color-text)" : undefined }}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                  {dayApps.map((app) => (
                    <div 
                      key={app.id} 
                      onClick={() => setSelectedApp(app)}
                      className="rounded p-1 text-[10px] leading-tight cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        backgroundColor: "var(--color-accent-subtle)", 
                        borderLeft: "2px solid var(--color-accent)",
                        color: "var(--color-text)" 
                      }}
                      title={`${app.position} di ${app.company}`}
                    >
                      <div className="font-semibold truncate">{format(new Date(app.interviewDate!), "HH:mm")}</div>
                      <div className="truncate">{app.company}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedApp && (
        <Modal open={!!selectedApp} onClose={() => setSelectedApp(null)} title="Detail Jadwal Tes">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>Posisi & Perusahaan</p>
              <p className="font-medium text-lg mt-0.5" style={{ color: "var(--color-text)" }}>{selectedApp.position} di {selectedApp.company}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>Waktu Tes</p>
              <p className="font-medium mt-0.5" style={{ color: "var(--color-text)" }}>
                {format(new Date(selectedApp.interviewDate!), "EEEE, d MMMM yyyy HH:mm", { locale: id })}
              </p>
            </div>
            <div className="pt-4 flex flex-col gap-3" style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
              <a
                href={getGCalLink(selectedApp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4285F4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3367D6]"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z" />
                </svg>
                Tambah ke Google Calendar
              </a>
              <button
                onClick={() => {
                  setEditingApp(selectedApp);
                  setSelectedApp(null);
                }}
                className="btn-secondary w-full"
              >
                Edit Lamaran
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editingApp && (
        <Modal open={!!editingApp} onClose={() => setEditingApp(null)} title="Edit Lamaran" wide>
          <ApplicationForm
            initial={editingApp}
            initialDocumentIds={documentsByApplication[editingApp.id] ?? []}
            pipelines={pipelines}
            documents={documents}
            onSuccess={() => setEditingApp(null)}
            onCancel={() => setEditingApp(null)}
          />
        </Modal>
      )}
    </div>
  );
}
