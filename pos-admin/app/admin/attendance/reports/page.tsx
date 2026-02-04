"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  BarChart3,
  FileText
} from "lucide-react";

export default function AttendanceReportsPage() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  // Mock employee list
  const employees = [
    { id: "EMP001", name: "John Doe" },
    { id: "EMP002", name: "Jane Smith" },
    { id: "EMP003", name: "Mike Johnson" },
    { id: "EMP004", name: "Sarah Williams" },
    { id: "EMP005", name: "Robert Brown" }
  ];

  // Mock monthly summary data
  const monthlySummary = [
    {
      employeeId: "EMP001",
      employeeName: "John Doe",
      totalDays: 22,
      present: 20,
      absent: 1,
      leaves: 1,
      lateCount: 3,
      totalHours: 180,
      avgHoursPerDay: 9,
      overtimeHours: 12,
      attendanceRate: 91
    },
    {
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      totalDays: 22,
      present: 21,
      absent: 0,
      leaves: 1,
      lateCount: 1,
      totalHours: 168,
      avgHoursPerDay: 8,
      overtimeHours: 0,
      attendanceRate: 95
    },
    {
      employeeId: "EMP003",
      employeeName: "Mike Johnson",
      totalDays: 22,
      present: 22,
      absent: 0,
      leaves: 0,
      lateCount: 0,
      totalHours: 176,
      avgHoursPerDay: 8,
      overtimeHours: 8,
      attendanceRate: 100
    },
    {
      employeeId: "EMP004",
      employeeName: "Sarah Williams",
      totalDays: 22,
      present: 18,
      absent: 2,
      leaves: 2,
      lateCount: 5,
      totalHours: 144,
      avgHoursPerDay: 8,
      overtimeHours: 0,
      attendanceRate: 82
    },
    {
      employeeId: "EMP005",
      employeeName: "Robert Brown",
      totalDays: 22,
      present: 19,
      absent: 3,
      leaves: 0,
      lateCount: 4,
      totalHours: 152,
      avgHoursPerDay: 8,
      overtimeHours: 4,
      attendanceRate: 86
    }
  ];

  // Weekly attendance chart data
  const weeklyData = [
    { week: "Week 1", present: 23, absent: 2, onLeave: 0 },
    { week: "Week 2", present: 24, absent: 1, onLeave: 0 },
    { week: "Week 3", present: 22, absent: 2, onLeave: 1 },
    { week: "Week 4", present: 25, absent: 0, onLeave: 0 }
  ];

  const totalStats = {
    totalEmployees: employees.length,
    avgAttendanceRate: Math.round(monthlySummary.reduce((sum, emp) => sum + emp.attendanceRate, 0) / monthlySummary.length),
    totalHoursWorked: monthlySummary.reduce((sum, emp) => sum + emp.totalHours, 0),
    totalOvertimeHours: monthlySummary.reduce((sum, emp) => sum + emp.overtimeHours, 0),
    totalLateCount: monthlySummary.reduce((sum, emp) => sum + emp.lateCount, 0)
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link
          href="/admin/attendance"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Attendance
        </Link>
      </div>
      
      <div className="mb-6">
        <PageHeader
          title="Attendance Reports"
          description="Comprehensive attendance reports with daily, weekly, and monthly summaries"
        />
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={reportType === "daily" ? "default" : "outline"}
              onClick={() => setReportType("daily")}
            >
              Daily
            </Button>
            <Button 
              size="sm" 
              variant={reportType === "weekly" ? "default" : "outline"}
              onClick={() => setReportType("weekly")}
            >
              Weekly
            </Button>
            <Button 
              size="sm" 
              variant={reportType === "monthly" ? "default" : "outline"}
              onClick={() => setReportType("monthly")}
            >
              Monthly
            </Button>
          </div>

          <input
            type="month"
            className="border rounded-lg px-4 py-2 text-black"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          <Button variant="outline">
            <Filter size={18} className="mr-2" />
            More Filters
          </Button>

          <div className="ml-auto flex gap-2">
            <Button variant="outline">
              <Download size={18} className="mr-2" />
              Export Excel
            </Button>
            <Button variant="outline">
              <Download size={18} className="mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{totalStats.totalEmployees}</div>
              <div className="text-sm text-gray-500">Employees</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{totalStats.avgAttendanceRate}%</div>
              <div className="text-sm text-gray-500">Avg Attendance</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{totalStats.totalHoursWorked}</div>
              <div className="text-sm text-gray-500">Total Hours</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{totalStats.totalOvertimeHours}</div>
              <div className="text-sm text-gray-500">Overtime Hours</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{totalStats.totalLateCount}</div>
              <div className="text-sm text-gray-500">Late Arrivals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Summary Table */}
      <div className="bg-white rounded-xl border mb-6">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-black flex items-center gap-2">
            <FileText size={20} />
            Monthly Attendance Summary - {new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Employee</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total Days</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Present</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Absent</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Leaves</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Late Count</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Total Hours</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Avg Hrs/Day</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Overtime</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
              </tr>
            </thead>
            <tbody>
              {monthlySummary.map((emp, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-black">{emp.employeeName}</div>
                    <div className="text-xs text-gray-500">{emp.employeeId}</div>
                  </td>
                  <td className="py-3 px-4 text-center text-sm text-black">{emp.totalDays}</td>
                  <td className="py-3 px-4 text-center text-sm font-semibold text-green-600">{emp.present}</td>
                  <td className="py-3 px-4 text-center text-sm font-semibold text-red-600">{emp.absent}</td>
                  <td className="py-3 px-4 text-center text-sm text-purple-600">{emp.leaves}</td>
                  <td className="py-3 px-4 text-center text-sm text-orange-600">{emp.lateCount}</td>
                  <td className="py-3 px-4 text-center text-sm font-bold text-black">{emp.totalHours}h</td>
                  <td className="py-3 px-4 text-center text-sm text-black">{emp.avgHoursPerDay}h</td>
                  <td className="py-3 px-4 text-center text-sm text-blue-600">{emp.overtimeHours}h</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      emp.attendanceRate >= 95 ? "bg-green-100 text-green-700" :
                      emp.attendanceRate >= 85 ? "bg-blue-100 text-blue-700" :
                      emp.attendanceRate >= 75 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {emp.attendanceRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
          <BarChart3 size={20} />
          Weekly Attendance Trend
        </h3>
        <div className="space-y-4">
          {weeklyData.map((week, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{week.week}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">Present: {week.present}</span>
                  <span className="text-red-600">Absent: {week.absent}</span>
                  <span className="text-purple-600">Leave: {week.onLeave}</span>
                </div>
              </div>
              <div className="flex gap-1 h-8 rounded overflow-hidden">
                <div 
                  className="bg-green-400 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(week.present / 25) * 100}%` }}
                >
                  {week.present}
                </div>
                <div 
                  className="bg-red-400 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(week.absent / 25) * 100}%` }}
                >
                  {week.absent > 0 && week.absent}
                </div>
                <div 
                  className="bg-purple-400 flex items-center justify-center text-white text-xs font-semibold"
                  style={{ width: `${(week.onLeave / 25) * 100}%` }}
                >
                  {week.onLeave > 0 && week.onLeave}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-green-600" />
            <h4 className="font-semibold text-black">Best Performers</h4>
          </div>
          <div className="space-y-2">
            {monthlySummary
              .sort((a, b) => b.attendanceRate - a.attendanceRate)
              .slice(0, 3)
              .map((emp, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{emp.employeeName}</span>
                  <span className="font-semibold text-green-600">{emp.attendanceRate}%</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-blue-600" />
            <h4 className="font-semibold text-black">Most Overtime</h4>
          </div>
          <div className="space-y-2">
            {monthlySummary
              .sort((a, b) => b.overtimeHours - a.overtimeHours)
              .slice(0, 3)
              .map((emp, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{emp.employeeName}</span>
                  <span className="font-semibold text-blue-600">{emp.overtimeHours}h</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={18} className="text-red-600" />
            <h4 className="font-semibold text-black">Most Late Arrivals</h4>
          </div>
          <div className="space-y-2">
            {monthlySummary
              .sort((a, b) => b.lateCount - a.lateCount)
              .slice(0, 3)
              .map((emp, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{emp.employeeName}</span>
                  <span className="font-semibold text-red-600">{emp.lateCount}x</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
