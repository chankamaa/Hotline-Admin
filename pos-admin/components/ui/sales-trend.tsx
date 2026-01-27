"use client";

import React, { useMemo, useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { getSalesTrend } from "@/lib/api/dashboardApi";

type Range = "today" | "week" | "month";

export default function SalesTrendChart({}: {}) {
  const [range, setRange] = useState<Range>("week");
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesData();
  }, [range]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      let days = 7;
      if (range === "today") days = 1;
      if (range === "month") days = 30;
      
      const response: any = await getSalesTrend(days);
      console.log("Sales trend data:", response);
      
      // Extract daily sales from response - backend returns { data: { dailyBreakdown: [...] } }
      const dailySales = response.data?.dailyBreakdown || [];
      
      if (range === "today") {
        // For today, if we have data for just today, show it, otherwise use hourly mock
        if (dailySales.length > 0) {
          const todayTotal = dailySales[0].totalRevenue || dailySales[0].totalAmount || 0;
          // Distribute across hours (simplified)
          const hourlyData = Array.from({ length: 24 }, (_, i) => {
            if (i < 9 || i > 20) return 0; // Closed hours
            return todayTotal / 12; // Distribute across open hours
          });
          setData(hourlyData);
        } else {
          setData(Array.from({ length: 24 }, () => 0));
        }
      } else {
        // Use daily data - map totalRevenue
        const values = dailySales.map((day: any) => day.totalRevenue || day.totalAmount || 0);
        
        // Ensure we have the right number of data points
        const expectedLength = range === "week" ? 7 : 30;
        if (values.length < expectedLength) {
          // Pad with zeros at the beginning
          const padding = Array(expectedLength - values.length).fill(0);
          setData([...padding, ...values]);
        } else {
          setData(values);
        }
      }
    } catch (error) {
      console.error("Failed to load sales trend:", error);
      // Use fallback data
      const fallbackData = range === "today" 
        ? Array.from({ length: 24 }, () => 0)
        : range === "week"
        ? [0, 0, 0, 0, 0, 0, 0]
        : Array.from({ length: 30 }, () => 0);
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

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
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return days[date.getDay()];
      });
    }
    // month - show every few days
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return String(date.getDate());
    });
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
    return labels.filter((_, i) => i % 3 === 0);
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
          <button 
            onClick={loadSalesData}
            disabled={loading}
            className="p-1.5 hover:bg-gray-100 rounded"
          >
            <RefreshCw size={16} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
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
