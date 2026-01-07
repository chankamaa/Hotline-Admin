"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Wrench, 
  Clock, 
  Star,
  Users,
  Target
} from "lucide-react";

// Type definitions
interface SalesPerformance {
  employeeId: string;
  employeeName: string;
  totalSales: number;
  transactionCount: number;
  averageTransaction: number;
  revenueGenerated: number;
  discountsApplied: number;
  returnsProcessed: number;
  period: string;
}

interface RepairPerformance {
  technicianId: string;
  technicianName: string;
  jobsCompleted: number;
  revenueFromRepairs: number;
  averageRepairTime: number; // in hours
  customerSatisfaction: number; // rating out of 5
  pendingJobs: number;
  completedJobs: number;
  jobComplexityScore: number;
}

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [activeTab, setActiveTab] = useState<"sales" | "repair" | "overall">("sales");

  // Mock data - replace with backend API calls
  const salesData: SalesPerformance[] = [
    {
      employeeId: "E001",
      employeeName: "John Doe",
      totalSales: 45000,
      transactionCount: 120,
      averageTransaction: 375,
      revenueGenerated: 45000,
      discountsApplied: 2500,
      returnsProcessed: 5,
      period: "This Week"
    },
    {
      employeeId: "E002",
      employeeName: "Jane Smith",
      totalSales: 52000,
      transactionCount: 145,
      averageTransaction: 358,
      revenueGenerated: 52000,
      discountsApplied: 1800,
      returnsProcessed: 3,
      period: "This Week"
    },
  ];

  const repairData: RepairPerformance[] = [
    {
      technicianId: "T001",
      technicianName: "Mike Wilson",
      jobsCompleted: 35,
      revenueFromRepairs: 28000,
      averageRepairTime: 2.5,
      customerSatisfaction: 4.8,
      pendingJobs: 8,
      completedJobs: 35,
      jobComplexityScore: 7.2
    },
    {
      technicianId: "T002",
      technicianName: "Sarah Johnson",
      jobsCompleted: 42,
      revenueFromRepairs: 31500,
      averageRepairTime: 2.1,
      customerSatisfaction: 4.9,
      pendingJobs: 5,
      completedJobs: 42,
      jobComplexityScore: 6.8
    },
  ];

  // Sales Performance Columns
  const salesColumns: DataTableColumn<SalesPerformance>[] = [
    {
      key: "employeeName",
      label: "Employee",
      render: (item) => <div className="font-medium text-black">{item.employeeName}</div>
    },
    {
      key: "transactionCount",
      label: "Transactions",
      render: (item) => <div className="text-black">{item.transactionCount}</div>
    },
    {
      key: "totalSales",
      label: "Total Sales",
      render: (item) => <div className="font-semibold text-black">Rs.{item.totalSales.toLocaleString()}</div>
    },
    {
      key: "averageTransaction",
      label: "Avg Transaction",
      render: (item) => <div className="text-black">Rs.{item.averageTransaction}</div>
    },
    {
      key: "discountsApplied",
      label: "Discounts",
      render: (item) => <div className="text-black">Rs.{item.discountsApplied.toLocaleString()}</div>
    },
    {
      key: "returnsProcessed",
      label: "Returns",
      render: (item) => <div className="text-black">{item.returnsProcessed}</div>
    },
  ];

  // Repair Performance Columns
  const repairColumns: DataTableColumn<RepairPerformance>[] = [
    {
      key: "technicianName",
      label: "Technician",
      render: (item) => <div className="font-medium text-black">{item.technicianName}</div>
    },
    {
      key: "jobsCompleted",
      label: "Jobs Completed",
      render: (item) => <div className="text-black">{item.jobsCompleted}</div>
    },
    {
      key: "revenueFromRepairs",
      label: "Revenue",
      render: (item) => <div className="font-semibold text-black">Rs.{item.revenueFromRepairs.toLocaleString()}</div>
    },
    {
      key: "averageRepairTime",
      label: "Avg Time (hrs)",
      render: (item) => <div className="text-black">{item.averageRepairTime}</div>
    },
    {
      key: "customerSatisfaction",
      label: "Satisfaction",
      render: (item) => (
        <div className="flex items-center gap-1 text-black">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          {item.customerSatisfaction}
        </div>
      )
    },
    {
      key: "pendingJobs",
      label: "Pending",
      render: (item) => <div className="text-black">{item.pendingJobs}</div>
    },
    {
      key: "jobComplexityScore",
      label: "Complexity Score",
      render: (item) => <div className="text-black">{item.jobComplexityScore}/10</div>
    },
  ];

  // Calculate overall metrics
  const overallMetrics = {
    totalRevenue: salesData.reduce((sum, s) => sum + s.revenueGenerated, 0) + 
                  repairData.reduce((sum, r) => sum + r.revenueFromRepairs, 0),
    totalTransactions: salesData.reduce((sum, s) => sum + s.transactionCount, 0),
    totalRepairs: repairData.reduce((sum, r) => sum + r.jobsCompleted, 0),
    avgSatisfaction: (repairData.reduce((sum, r) => sum + r.customerSatisfaction, 0) / repairData.length).toFixed(1),
    productivityScore: 87.5, // Calculate based on your logic
    teamAverage: 82.3,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Performance Tracking"
        description="Monitor employee and team performance metrics"
      />

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setSelectedPeriod("daily")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === "daily" 
              ? "bg-blue-600 text-white" 
              : "bg-white text-black border"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setSelectedPeriod("weekly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === "weekly" 
              ? "bg-blue-600 text-white" 
              : "bg-white text-black border"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setSelectedPeriod("monthly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedPeriod === "monthly" 
              ? "bg-blue-600 text-white" 
              : "bg-white text-black border"
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Total Revenue</div>
            <DollarSign size={20} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-black">Rs.{overallMetrics.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">All sources combined</div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Transactions</div>
            <ShoppingCart size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-black">{overallMetrics.totalTransactions}</div>
          <div className="text-xs text-gray-500 mt-1">Sales processed</div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Repairs Completed</div>
            <Wrench size={20} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-black">{overallMetrics.totalRepairs}</div>
          <div className="text-xs text-gray-500 mt-1">This period</div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Avg Satisfaction</div>
            <Star size={20} className="text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-black">{overallMetrics.avgSatisfaction}/5</div>
          <div className="text-xs text-gray-500 mt-1">Customer ratings</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-4 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "sales"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Sales Performance (Cashiers)
        </button>
        <button
          onClick={() => setActiveTab("repair")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "repair"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Repair Performance (Technicians)
        </button>
        <button
          onClick={() => setActiveTab("overall")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overall"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Overall Metrics
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "sales" && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-lg font-semibold mb-4 text-black">Sales Performance - {selectedPeriod}</h3>
          <DataTable
            data={salesData}
            columns={salesColumns}
            searchPlaceholder="Search employees..."
            onSearch={() => {}}
          />
        </div>
      )}

      {activeTab === "repair" && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-lg font-semibold mb-4 text-black">Repair Performance - {selectedPeriod}</h3>
          <DataTable
            data={repairData}
            columns={repairColumns}
            searchPlaceholder="Search technicians..."
            onSearch={() => {}}
          />
        </div>
      )}

      {activeTab === "overall" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">Overall Performance Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">Productivity Score</span>
                  <span className="text-lg font-bold text-black">{overallMetrics.productivityScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{ width: `${overallMetrics.productivityScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black">Team Average</span>
                  <span className="text-lg font-bold text-black">{overallMetrics.teamAverage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${overallMetrics.teamAverage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} className="text-green-600" />
                  <span className="text-sm text-black">Performance Trends</span>
                </div>
                <div className="text-xs text-gray-600">Improving over time</div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} className="text-blue-600" />
                  <span className="text-sm text-black">Goal Achievement</span>
                </div>
                <div className="text-xs text-gray-600">92% of targets met</div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-purple-600" />
                  <span className="text-sm text-black">Team Comparison</span>
                </div>
                <div className="text-xs text-gray-600">Above average</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
