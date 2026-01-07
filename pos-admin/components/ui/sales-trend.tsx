"use client";

import React, { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

type Range = "today" | "week" | "month";

const sampleData: Record<Range, number[]> = {
  today: Array.from({ length: 24 }, (_, i) => {
    // Hourly data - simulate business hours activity
    if (i < 6 || i > 22) return Math.random() * 10;
    return Math.random() * 100 + 50;
  }),
  week: [0, 0, 0, 0, 120, 200, 175],
  month: Array.from({ length: 30 }, (_, i) => {
    // Last 30 days - spike at the end
    if (i < 25) return Math.random() * 50;
    return 150 + Math.random() * 200;
  }),
};

export default function SalesTrendChart({}: {}) {
  const [range, setRange] = useState<Range>("week");

  const data = useMemo(() => sampleData[range], [range]);

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);

  const viewW = 100;
  const viewH = 40;

  const points = data
    .map((v, i) => {
      const x = (i * viewW) / (data.length - 1 || 1);
      const y = viewH - ((v - min) / (max - min || 1)) * (viewH - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");

  const total = Math.round(data.reduce((s, v) => s + v, 0));

  const labels = useMemo(() => {
    if (range === "today") {
      return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
    }
    if (range === "week") {
      return ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];
    }
    // month - show every few days
    return Array.from({ length: 30 }, (_, i) => String(9 + i));
  }, [range]);

  const periodText = (() => {
    if (range === "today") return "Period: Today (Hourly)";
    if (range === "week") return "Period: Last 7 Days";
    return "Period: Last 30 Days";
  })();

  const displayLabels = useMemo(() => {
    if (range === "today") {
      // Show every 2 hours
      return labels.filter((_, i) => i % 2 === 0);
    }
    if (range === "week") {
      return labels;
    }
    // month - show select days
    return labels.filter((_, i) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29].includes(i));
  }, [labels, range]);

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-start justify-between mb-3  text-black">
        <h3 className="font-semibold text-gray-900">Sales Trend</h3>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as Range)}
            className="text-sm border rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="p-1.5 hover:bg-gray-100 rounded">
            <RefreshCw size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div style={{ height: 220 }} className="w-full">
        <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-full">
          {[0, 0.25, 0.5, 0.75, 1].map((t, idx) => (
            <line
              key={idx}
              x1={0}
              x2={viewW}
              y1={t * viewH}
              y2={t * viewH}
              stroke="#f1f5f9"
              strokeWidth={0.5}
            />
          ))}

          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={0.9}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {data.map((v, i) => {
            const x = (i * viewW) / (data.length - 1 || 1);
            const y = viewH - ((v - min) / (max - min || 1)) * (viewH - 6) - 3;
            return <circle key={i} cx={x} cy={y} r={0.8} fill="#3b82f6" />;
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="text-gray-500">{periodText}</div>
        <div className="text-blue-600 font-medium">Total: Rs.{total}</div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 px-1">
        {displayLabels.map((l, i) => (
          <div key={i} className="text-center">
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
