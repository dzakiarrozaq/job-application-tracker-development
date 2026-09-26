"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsData } from "@/lib/analytics";
import { useTheme } from "@/components/theme-provider";

const OUTCOME_COLORS: Record<string, string> = {
  Aktif: "#3b82f6",
  Penawaran: "#f59e0b",
  Diterima: "#22c55e",
  Ditolak: "#ef4444",
};

export function OutcomePieChart({ data }: { data: AnalyticsData["outcomeCounts"] }) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "#a8a5a0" : "#55524d";
  const chartData = [
    { name: "Aktif", value: data.active },
    { name: "Penawaran", value: data.offer },
    { name: "Diterima", value: data.hired },
    { name: "Ditolak", value: data.rejected },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return <EmptyState label="Belum ada data lamaran untuk ditampilkan." />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie 
          data={chartData} 
          dataKey="value" 
          nameKey="name" 
          innerRadius={60} 
          outerRadius={85} 
          paddingAngle={5}
          label={(props: any) => {
            const { x, y, cx, name, percent = 0 } = props;
            if (percent <= 0.05) return null;
            return (
              <text x={x} y={y} fill={textColor} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={500}>
                {name} {(percent * 100).toFixed(0)}%
              </text>
            );
          }}
          labelLine={false}
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={OUTCOME_COLORS[entry.name]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text)",
            fontSize: "12px",
            boxShadow: "var(--shadow-md)"
          }}
          itemStyle={{ color: "var(--color-text)" }}
        />
        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px", color: "var(--color-text-secondary)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function PipelineBarChart({ data }: { data: AnalyticsData["pipelineBreakdown"] }) {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#2e2c2a" : "#e2e8f0";
  const textColor = theme === "dark" ? "#a8a5a0" : "#6b6762";

  if (data.every((d) => d.total === 0)) {
    return <EmptyState label="Belum ada lamaran per alur tahapan." />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: textColor }} interval={0} angle={-15} textAnchor="end" height={50} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={false} />
        <Tooltip
          cursor={{ fill: "var(--color-accent-subtle)", opacity: 0.4 }}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text)",
            fontSize: "12px",
            boxShadow: "var(--shadow-md)"
          }}
        />
        <Bar dataKey="total" fill="url(#colorBar)" radius={[4, 4, 0, 0]} maxBarSize={50} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLineChart({ data }: { data: AnalyticsData["monthlyTrend"] }) {
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#2e2c2a" : "#e2e8f0";
  const textColor = theme === "dark" ? "#a8a5a0" : "#6b6762";

  const formatMonth = (monthStr: string) => {
    const [y, m] = monthStr.split("-");
    const date = new Date(parseInt(y), parseInt(m) - 1);
    return date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
  };

  if (data.length === 0) {
    return <EmptyState label="Belum ada tren lamaran bulanan." />;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
        <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: textColor }} tickLine={false} axisLine={false} />
        <Tooltip
          labelFormatter={(label) => formatMonth(label as string)}
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text)",
            fontSize: "12px",
            boxShadow: "var(--shadow-md)"
          }}
        />
        <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="grid h-[260px] place-items-center text-sm"
      style={{ color: "var(--color-text-placeholder)" }}
    >
      {label}
    </div>
  );
}
