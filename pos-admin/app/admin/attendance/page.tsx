"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  Clock,
  Calendar,
  Users,
  TrendingUp,
  Download,
  Search,
  Filter,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  BarChart3
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  clockIn?: Date;
  clockOut?: Date;
  totalHours: number;
  status: "Present" | "Absent" | "Late" | "Half Day" | "On Leave";
  lateBy?: number; // minutes
  overtimeHours?: number;
  location?: string;
  notes?: string;
}

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Mock attendance data
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: "1",
      employeeId: "EMP001",
      employeeName: "John Doe",
      date: new Date("2026-01-07"),
      clockIn: new Date("2026-01-07T09:00:00"),
      clockOut: new Date("2026-01-07T18:00:00"),
      totalHours: 9,
      status: "Present",
      overtimeHours: 1,
      location: "Main Office"
    },
    {
      id: "2",
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      date: new Date("2026-01-07"),
      clockIn: new Date("2026-01-07T09:15:00"),
      totalHours: 0,
      status: "Present",
      lateBy: 15,
      location: "Main Office"
    },
    {
      id: "3",
      employeeId: "EMP003",
      employeeName: "Mike Johnson",
      date: new Date("2026-01-07"),
      clockIn: new Date("2026-01-07T08:55:00"),
      clockOut: new Date("2026-01-07T17:55:00"),
      totalHours: 9,
      status: "Present",
      location: "Branch 1"
    },
    {
      id: "4",
      employeeId: "EMP004",
      employeeName: "Sarah Williams",
      date: new Date("2026-01-07"),
      totalHours: 0,
      status: "On Leave",
      notes: "Sick leave"
    },
    {
      id: "5",
      employeeId: "EMP005",
      employeeName: "Robert Brown",
      date: new Date("2026-01-07"),
      totalHours: 0,
      status: "Absent"
    },
    {
      id: "6",
      employeeId: "EMP001",
      employeeName: "John Doe",
      date: new Date("2026-01-06"),
      clockIn: new Date("2026-01-06T09:05:00"),
      clockOut: new Date("2026-01-06T18:10:00"),
      totalHours: 9,
      status: "Present",
      lateBy: 5,
      overtimeHours: 1,
      location: "Main Office"
    },
    {
      id: "7",
      employeeId: "EMP002",
      employeeName: "Jane Smith",
      date: new Date("2026-01-06"),
      clockIn: new Date("2026-01-06T09:00:00"),
      clockOut: new Date("2026-01-06T13:00:00"),
      totalHours: 4,
      status: "Half Day",
      location: "Main Office",
      notes: "Left early for appointment"
    }
  ]);

  const handleClockIn = () => {
    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: String(attendanceRecords.length + 1),
      employeeId: selectedEmployee || "EMP001",
      employeeName: "Current User",
      date: now,
      clockIn: now,
      totalHours: 0,
      status: "Present",
      location: "Main Office"
    };
    setAttendanceRecords([newRecord, ...attendanceRecords]);
    setIsClockingIn(false);
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDate = new Date(record.date).toDateString() === new Date(selectedDate).toDateString();
    return matchesSearch && matchesStatus && matchesDate;
  });

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (record: AttendanceRecord) => (
        <div>
          <div className="font-medium text-black">{record.employeeName}</div>
          <div className="text-sm text-gray-500">{record.employeeId}</div>
        </div>
      )
    },
    {
      key: "clockIn",
      label: "Clock In",
      render: (record: AttendanceRecord) => (
        <div className="text-sm">
          {record.clockIn ? (
            <>
              <div className="text-black font-medium flex items-center gap-1">
                <LogIn size={14} className="text-green-600" />
                {new Date(record.clockIn).toLocaleTimeString()}
              </div>
              {record.lateBy && record.lateBy > 0 && (
                <div className="text-xs text-red-600">Late by {record.lateBy} min</div>
              )}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      key: "clockOut",
      label: "Clock Out",
      render: (record: AttendanceRecord) => (
        <div className="text-sm">
          {record.clockOut ? (
            <div className="text-black font-medium flex items-center gap-1">
              <LogOut size={14} className="text-red-600" />
              {new Date(record.clockOut).toLocaleTimeString()}
            </div>
          ) : record.clockIn ? (
            <span className="text-blue-600">Still working...</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      key: "totalHours",
      label: "Total Hours",
      render: (record: AttendanceRecord) => (
        <div className="text-sm">
          <div className="font-bold text-black">{record.totalHours}h</div>
          {record.overtimeHours && record.overtimeHours > 0 && (
            <div className="text-xs text-blue-600">+{record.overtimeHours}h OT</div>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (record: AttendanceRecord) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          record.status === "Present" ? "bg-green-100 text-green-700" :
          record.status === "Late" ? "bg-yellow-100 text-yellow-700" :
          record.status === "Half Day" ? "bg-blue-100 text-blue-700" :
          record.status === "On Leave" ? "bg-purple-100 text-purple-700" :
          "bg-red-100 text-red-700"
        }`}>
          {record.status}
        </span>
      )
    },
    {
      key: "location",
      label: "Location",
      render: (record: AttendanceRecord) => (
        <div className="text-sm text-black">{record.location || "-"}</div>
      )
    },
    {
      key: "notes",
      label: "Notes",
      render: (record: AttendanceRecord) => (
        <div className="text-sm text-gray-600">{record.notes || "-"}</div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (record: AttendanceRecord) => (
        <Button size="sm" variant="outline">
          <Eye size={14} />
        </Button>
      )
    }
  ];

  // Calculate stats
  const stats = {
    totalEmployees: new Set(attendanceRecords.map(r => r.employeeId)).size,
    present: filteredRecords.filter(r => r.status === "Present" || r.status === "Late" || r.status === "Half Day").length,
    absent: filteredRecords.filter(r => r.status === "Absent").length,
    onLeave: filteredRecords.filter(r => r.status === "On Leave").length,
    avgHours: filteredRecords.length > 0 
      ? (filteredRecords.reduce((sum, r) => sum + r.totalHours, 0) / filteredRecords.length).toFixed(1)
      : 0
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Attendance & Session Management"
        description="Track employee attendance, clock-in/clock-out records, and working hours"
      />

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Button className="h-auto py-4 flex flex-col gap-2" onClick={() => setIsClockingIn(true)}>
          <LogIn size={24} />
          <span>Clock In/Out</span>
        </Button>
        <Link href="/admin/attendance/reports">
          <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 w-full">
            <FileText size={24} />
            <span>View Reports</span>
          </Button>
        </Link>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <Download size={24} />
          <span>Export to Excel</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
          <BarChart3 size={24} />
          <span>Monthly Summary</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.totalEmployees}</div>
              <div className="text-sm text-gray-500">Total Employees</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-500">Present</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-500">Absent</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.onLeave}</div>
              <div className="text-sm text-gray-500">On Leave</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.avgHours}</div>
              <div className="text-sm text-gray-500">Avg Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={viewMode === "daily" ? "default" : "outline"}
              onClick={() => setViewMode("daily")}
            >
              Daily
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === "weekly" ? "default" : "outline"}
              onClick={() => setViewMode("weekly")}
            >
              Weekly
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === "monthly" ? "default" : "outline"}
              onClick={() => setViewMode("monthly")}
            >
              Monthly
            </Button>
          </div>

          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-black"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by employee name or ID..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
            <option value="Half Day">Half Day</option>
            <option value="On Leave">On Leave</option>
          </select>

          <Button variant="outline">
            <Download size={18} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-black">
            Attendance Records - {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
        </div>
        <DataTable columns={columns} data={filteredRecords} />
      </div>

      {/* Clock In/Out Modal */}
      <Modal
        isOpen={isClockingIn}
        onClose={() => setIsClockingIn(false)}
        title="Clock In/Out"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsClockingIn(false)}>
              Cancel
            </Button>
            <Button onClick={handleClockIn}>
              <LogIn size={16} className="mr-2" />
              Clock In Now
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={32} className="text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-black">
                  {new Date().toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Select Employee
            </label>
            <select
              className="w-full border rounded-lg px-4 py-2 text-black"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
            >
              <option value="">Select employee...</option>
              <option value="EMP001">John Doe (EMP001)</option>
              <option value="EMP002">Jane Smith (EMP002)</option>
              <option value="EMP003">Mike Johnson (EMP003)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Location
            </label>
            <select className="w-full border rounded-lg px-4 py-2 text-black">
              <option value="main">Main Office</option>
              <option value="branch1">Branch 1</option>
              <option value="branch2">Branch 2</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          <Input
            label="Notes (Optional)"
            type="textarea"
            placeholder="Any notes about this session..."
            rows={2}
          />
        </div>
      </Modal>
    </div>
  );
}
