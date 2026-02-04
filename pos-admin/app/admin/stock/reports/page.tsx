"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Package,
  Calendar,
  Download,
  FileText,
  Filter,
  ArrowLeft
} from "lucide-react";

export default function StockReportsPage() {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [reportType, setReportType] = useState("summary");

  // Mock data for visualization
  const movementSummary = {
    entries: 156,
    adjustments: 43,
    transfers: 89,
    sales: 234,
    returns: 12
  };

  const topProducts = [
    { name: "iPhone 15 Pro", movements: 45, trend: "+12%" },
    { name: "Samsung Galaxy S24", movements: 38, trend: "+8%" },
    { name: "Phone Cases", movements: 156, trend: "+25%" },
    { name: "Screen Protectors", movements: 98, trend: "+15%" },
    { name: "Wireless Chargers", movements: 67, trend: "+10%" }
  ];

  const locationActivity = [
    { location: "Main Warehouse", in: 450, out: 320, net: 130 },
    { location: "Branch 1 - Downtown", in: 120, out: 180, net: -60 },
    { location: "Branch 2 - Uptown", in: 98, out: 145, net: -47 },
    { location: "Branch 3 - Suburbs", in: 76, out: 89, net: -13 },
    { location: "Service Center", in: 45, out: 23, net: 22 }
  ];

  const weeklyTrend = [
    { day: "Mon", in: 120, out: 85 },
    { day: "Tue", in: 145, out: 95 },
    { day: "Wed", in: 98, out: 120 },
    { day: "Thu", in: 156, out: 98 },
    { day: "Fri", in: 134, out: 112 },
    { day: "Sat", in: 89, out: 145 },
    { day: "Sun", in: 67, out: 102 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link
          href="/admin/stock"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock Overview
        </Link>
      </div>
      
      <PageHeader
        title="Movement Reports"
        description="Analyze stock movements, trends, and patterns across locations"
      />

      {/* Report Controls */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Analysis</option>
            <option value="trends">Trend Analysis</option>
            <option value="location">Location Analysis</option>
            <option value="product">Product Analysis</option>
          </select>

          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-black"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />

          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-black"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />

          <Button variant="outline">
            <Filter size={18} className="mr-2" />
            Apply Filters
          </Button>

          <Button variant="outline">
            <Download size={18} className="mr-2" />
            Export PDF
          </Button>

          <Button variant="outline">
            <Download size={18} className="mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Movement Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="text-blue-600" />
            <div className="text-sm text-gray-500">Entries</div>
          </div>
          <div className="text-2xl font-bold text-black">{movementSummary.entries}</div>
          <div className="text-xs text-green-600 mt-1">+12% from last period</div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-green-600" />
            <div className="text-sm text-gray-500">Adjustments</div>
          </div>
          <div className="text-2xl font-bold text-black">{movementSummary.adjustments}</div>
          <div className="text-xs text-red-600 mt-1">-5% from last period</div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft size={18} className="text-purple-600" />
            <div className="text-sm text-gray-500">Transfers</div>
          </div>
          <div className="text-2xl font-bold text-black">{movementSummary.transfers}</div>
          <div className="text-xs text-green-600 mt-1">+8% from last period</div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-orange-600" />
            <div className="text-sm text-gray-500">Sales</div>
          </div>
          <div className="text-2xl font-bold text-black">{movementSummary.sales}</div>
          <div className="text-xs text-green-600 mt-1">+18% from last period</div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-teal-600" />
            <div className="text-sm text-gray-500">Returns</div>
          </div>
          <div className="text-2xl font-bold text-black">{movementSummary.returns}</div>
          <div className="text-xs text-red-600 mt-1">-2% from last period</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top Moving Products */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            Top Moving Products
          </h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-black">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.movements} movements</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-600">{product.trend}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend Chart */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Weekly Movement Trend
          </h3>
          <div className="space-y-3">
            {weeklyTrend.map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">{day.day}</span>
                  <div className="flex gap-4">
                    <span className="text-green-600">↑ {day.in}</span>
                    <span className="text-red-600">↓ {day.out}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-2">
                  <div 
                    className="bg-green-400 rounded"
                    style={{ width: `${(day.in / 200) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-400 rounded"
                    style={{ width: `${(day.out / 200) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Location Activity */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <Package size={20} />
          Location Activity Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Stock In</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Stock Out</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Net Change</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Visual</th>
              </tr>
            </thead>
            <tbody>
              {locationActivity.map((location, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-black font-medium">{location.location}</td>
                  <td className="py-3 px-4 text-sm text-green-600 text-right font-semibold">+{location.in}</td>
                  <td className="py-3 px-4 text-sm text-red-600 text-right font-semibold">-{location.out}</td>
                  <td className={`py-3 px-4 text-sm text-right font-bold ${location.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {location.net >= 0 ? '+' : ''}{location.net}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1">
                      <div 
                        className="h-6 bg-green-400 rounded"
                        style={{ width: `${(location.in / 5)}px` }}
                      ></div>
                      <div 
                        className="h-6 bg-red-400 rounded"
                        style={{ width: `${(location.out / 5)}px` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Link href="/admin/stock/movements">
          <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-blue-600" />
              <div>
                <div className="font-semibold text-black">View All Movements</div>
                <div className="text-xs text-gray-500">Complete movement history</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/stock/audit">
          <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-purple-600" />
              <div>
                <div className="font-semibold text-black">Audit Trail</div>
                <div className="text-xs text-gray-500">User activity logs</div>
              </div>
            </div>
          </div>
        </Link>

        <Link href="/admin/stock">
          <div className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-green-600" />
              <div>
                <div className="font-semibold text-black">Stock Overview</div>
                <div className="text-xs text-gray-500">Dashboard & quick actions</div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
