"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { 
  Shield,
  Search,
  Download,
  Eye,
  User,
  Calendar,
  MapPin,
  Package,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: Date;
  action: "Create" | "Update" | "Delete" | "Approve" | "Reject" | "Verify" | "Complete";
  module: "Stock Entry" | "Stock Adjustment" | "Stock Transfer" | "Product" | "Location";
  entityType: string;
  entityId: string;
  entityName: string;
  performedBy: string;
  userRole: string;
  ipAddress: string;
  location?: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  notes?: string;
  status: "Success" | "Failed" | "Pending";
}

export default function StockAuditPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isViewingLog, setIsViewingLog] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: new Date("2026-01-07T10:30:00"),
      action: "Create",
      module: "Stock Entry",
      entityType: "Stock Entry",
      entityId: "SE-001",
      entityName: "iPhone 15 Pro - 50 units",
      performedBy: "John Doe",
      userRole: "Inventory Manager",
      ipAddress: "192.168.1.105",
      location: "Main Warehouse",
      notes: "New stock received from Apple Distributor",
      status: "Success"
    },
    {
      id: "2",
      timestamp: new Date("2026-01-07T10:45:00"),
      action: "Verify",
      module: "Stock Entry",
      entityType: "Stock Entry",
      entityId: "SE-001",
      entityName: "iPhone 15 Pro - 50 units",
      performedBy: "Sarah Williams",
      userRole: "Warehouse Supervisor",
      ipAddress: "192.168.1.112",
      location: "Main Warehouse",
      changes: [
        { field: "status", oldValue: "Received", newValue: "Verified" }
      ],
      status: "Success"
    },
    {
      id: "3",
      timestamp: new Date("2026-01-07T11:15:00"),
      action: "Create",
      module: "Stock Adjustment",
      entityType: "Stock Adjustment",
      entityId: "ADJ-001",
      entityName: "iPhone 15 Pro - Decrease 2 units",
      performedBy: "John Doe",
      userRole: "Inventory Manager",
      ipAddress: "192.168.1.105",
      location: "Main Warehouse",
      changes: [
        { field: "quantity", oldValue: "50", newValue: "48" },
        { field: "reason", oldValue: "", newValue: "Damage" }
      ],
      status: "Success"
    },
    {
      id: "4",
      timestamp: new Date("2026-01-07T11:20:00"),
      action: "Approve",
      module: "Stock Adjustment",
      entityType: "Stock Adjustment",
      entityId: "ADJ-001",
      entityName: "iPhone 15 Pro - Decrease 2 units",
      performedBy: "Manager Smith",
      userRole: "Branch Manager",
      ipAddress: "192.168.1.100",
      notes: "Damage confirmed, approved for adjustment",
      status: "Success"
    },
    {
      id: "5",
      timestamp: new Date("2026-01-07T14:00:00"),
      action: "Create",
      module: "Stock Transfer",
      entityType: "Stock Transfer",
      entityId: "TRF-001",
      entityName: "iPhone 15 Pro - 10 units to Branch 1",
      performedBy: "Jane Smith",
      userRole: "Branch Manager",
      ipAddress: "192.168.1.120",
      location: "Main Warehouse",
      status: "Success"
    },
    {
      id: "6",
      timestamp: new Date("2026-01-07T14:05:00"),
      action: "Approve",
      module: "Stock Transfer",
      entityType: "Stock Transfer",
      entityId: "TRF-001",
      entityName: "iPhone 15 Pro - 10 units to Branch 1",
      performedBy: "Manager Smith",
      userRole: "Branch Manager",
      ipAddress: "192.168.1.100",
      changes: [
        { field: "status", oldValue: "Pending", newValue: "Approved" }
      ],
      status: "Success"
    },
    {
      id: "7",
      timestamp: new Date("2026-01-07T16:30:00"),
      action: "Complete",
      module: "Stock Transfer",
      entityType: "Stock Transfer",
      entityId: "TRF-001",
      entityName: "iPhone 15 Pro - 10 units to Branch 1",
      performedBy: "Mike Johnson",
      userRole: "Logistics Staff",
      ipAddress: "192.168.1.125",
      location: "Branch 1 - Downtown",
      changes: [
        { field: "status", oldValue: "In Transit", newValue: "Completed" }
      ],
      status: "Success"
    },
    {
      id: "8",
      timestamp: new Date("2026-01-07T09:15:00"),
      action: "Update",
      module: "Product",
      entityType: "Product",
      entityId: "IPH15P-256",
      entityName: "iPhone 15 Pro 256GB",
      performedBy: "Admin User",
      userRole: "System Admin",
      ipAddress: "192.168.1.101",
      changes: [
        { field: "price", oldValue: "999", newValue: "1049" },
        { field: "reorderLevel", oldValue: "10", newValue: "15" }
      ],
      status: "Success"
    },
    {
      id: "9",
      timestamp: new Date("2026-01-06T17:00:00"),
      action: "Reject",
      module: "Stock Transfer",
      entityType: "Stock Transfer",
      entityId: "TRF-005",
      entityName: "USB-C Cable - 30 units to Branch 2",
      performedBy: "Manager Smith",
      userRole: "Branch Manager",
      ipAddress: "192.168.1.100",
      notes: "Insufficient stock at source location",
      status: "Success"
    },
    {
      id: "10",
      timestamp: new Date("2026-01-06T15:30:00"),
      action: "Delete",
      module: "Stock Entry",
      entityType: "Stock Entry",
      entityId: "SE-999",
      entityName: "Test Entry - Delete",
      performedBy: "Admin User",
      userRole: "System Admin",
      ipAddress: "192.168.1.101",
      notes: "Test entry removed",
      status: "Success"
    }
  ]);

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsViewingLog(true);
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case "Create": return <FileText size={16} className="text-blue-600" />;
      case "Update": return <Edit size={16} className="text-purple-600" />;
      case "Delete": return <Trash2 size={16} className="text-red-600" />;
      case "Approve": return <CheckCircle size={16} className="text-green-600" />;
      case "Reject": return <XCircle size={16} className="text-red-600" />;
      case "Verify": return <Shield size={16} className="text-teal-600" />;
      case "Complete": return <CheckCircle size={16} className="text-green-600" />;
      default: return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case "Create": return "bg-blue-100 text-blue-700";
      case "Update": return "bg-purple-100 text-purple-700";
      case "Delete": return "bg-red-100 text-red-700";
      case "Approve": return "bg-green-100 text-green-700";
      case "Reject": return "bg-red-100 text-red-700";
      case "Verify": return "bg-teal-100 text-teal-700";
      case "Complete": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchesUser = userFilter === "all" || log.performedBy === userFilter;
    return matchesSearch && matchesAction && matchesModule && matchesUser;
  });

  const columns = [
    {
      key: "timestamp",
      label: "Timestamp",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-black">{new Date(log.timestamp).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: "action",
      label: "Action",
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          {getActionIcon(log.action)}
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
            {log.action}
          </span>
        </div>
      )
    },
    {
      key: "module",
      label: "Module",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-black">{log.module}</div>
          <div className="text-xs text-gray-500">{log.entityType}</div>
        </div>
      )
    },
    {
      key: "entity",
      label: "Entity",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="text-black">{log.entityName}</div>
          <div className="text-xs text-gray-500 font-mono">{log.entityId}</div>
        </div>
      )
    },
    {
      key: "user",
      label: "Performed By",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="text-black font-medium flex items-center gap-1">
            <User size={12} className="text-gray-400" />
            {log.performedBy}
          </div>
          <div className="text-xs text-gray-500">{log.userRole}</div>
        </div>
      )
    },
    {
      key: "location",
      label: "Location",
      render: (log: AuditLog) => (
        <div className="text-sm text-black">
          {log.location || "-"}
        </div>
      )
    },
    {
      key: "ipAddress",
      label: "IP Address",
      render: (log: AuditLog) => (
        <div className="text-xs font-mono text-gray-600">{log.ipAddress}</div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (log: AuditLog) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          log.status === "Success" ? "bg-green-100 text-green-700" :
          log.status === "Failed" ? "bg-red-100 text-red-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {log.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (log: AuditLog) => (
        <Button size="sm" variant="outline" onClick={() => handleViewLog(log)}>
          <Eye size={14} />
        </Button>
      )
    }
  ];

  const stats = {
    totalLogs: auditLogs.length,
    todayLogs: auditLogs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length,
    successRate: Math.round((auditLogs.filter(l => l.status === "Success").length / auditLogs.length) * 100),
    uniqueUsers: new Set(auditLogs.map(l => l.performedBy)).size
  };

  const users = Array.from(new Set(auditLogs.map(l => l.performedBy)));
  const modules = ["Stock Entry", "Stock Adjustment", "Stock Transfer", "Product", "Location"];
  const actions = ["Create", "Update", "Delete", "Approve", "Reject", "Verify", "Complete"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Stock Audit Trail"
        description="Complete audit log of all stock-related activities with user tracking"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.totalLogs}</div>
              <div className="text-sm text-gray-500">Total Logs</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.todayLogs}</div>
              <div className="text-sm text-gray-500">Today's Activity</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.successRate}%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <User className="text-orange-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.uniqueUsers}</div>
              <div className="text-sm text-gray-500">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by entity, ID, or user..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="all">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
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
            <Download size={18} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border">
        <DataTable columns={columns} data={filteredLogs} />
      </div>

      {/* View Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={isViewingLog}
          onClose={() => {
            setIsViewingLog(false);
            setSelectedLog(null);
          }}
          title="Audit Log Details"
          size="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsViewingLog(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export Log
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Action Badge */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {getActionIcon(selectedLog.action)}
              <div className="flex-1">
                <div className={`text-lg font-bold ${getActionColor(selectedLog.action).replace('bg-', 'text-').replace('-100', '-600')}`}>
                  {selectedLog.action} Action
                </div>
                <div className="text-sm text-gray-600">{selectedLog.module}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                selectedLog.status === "Success" ? "bg-green-100 text-green-700" :
                selectedLog.status === "Failed" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {selectedLog.status}
              </span>
            </div>

            {/* Log Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Timestamp</div>
                <div className="text-black font-medium">{new Date(selectedLog.timestamp).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Log ID</div>
                <div className="text-black font-mono">{selectedLog.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Entity Type</div>
                <div className="text-black font-medium">{selectedLog.entityType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Entity ID</div>
                <div className="text-black font-mono">{selectedLog.entityId}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500 mb-1">Entity Name</div>
                <div className="text-black font-medium">{selectedLog.entityName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Performed By</div>
                <div className="text-black font-medium">{selectedLog.performedBy}</div>
                <div className="text-xs text-gray-500">{selectedLog.userRole}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">IP Address</div>
                <div className="text-black font-mono text-sm">{selectedLog.ipAddress}</div>
              </div>
              {selectedLog.location && (
                <div className="col-span-2">
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="text-black font-medium">{selectedLog.location}</div>
                </div>
              )}
            </div>

            {/* Changes */}
            {selectedLog.changes && selectedLog.changes.length > 0 && (
              <div className="pt-4 border-t">
                <div className="text-sm font-semibold text-black mb-3">Changes Made</div>
                <div className="space-y-2">
                  {selectedLog.changes.map((change, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-black mb-1 capitalize">{change.field}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-600 line-through">{change.oldValue || "(empty)"}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-green-600 font-semibold">{change.newValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedLog.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Notes</div>
                <div className="text-black bg-gray-50 p-3 rounded-lg">
                  {selectedLog.notes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
