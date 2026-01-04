"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RepairJob } from "@/lib/types";
import { Edit, Trash2, Eye, Wrench, Clock, CheckCircle } from "lucide-react";

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<RepairJob[]>([
    {
      id: "1",
      jobNumber: "REP-001",
      customer: {
        id: "c1",
        name: "Alex Brown",
        phone: "+1234567892",
        totalPurchases: 0,
        createdAt: new Date(),
      },
      device: "iPhone 14 Pro",
      imei: "123456789012345",
      issue: "Cracked screen - needs replacement",
      diagnosis: "Screen digitizer damaged, LCD functional",
      estimatedCost: 250,
      finalCost: 250,
      status: "in-progress",
      priority: "high",
      technicianId: "t1",
      technicianName: "John Tech",
      parts: [
        { partId: "p1", partName: "iPhone 14 Pro Screen Assembly", quantity: 1, cost: 180 },
      ],
      notes: "Customer wants same-day service",
      createdAt: new Date("2024-01-04T09:00:00"),
    },
    {
      id: "2",
      jobNumber: "REP-002",
      customer: {
        id: "c2",
        name: "Emily Davis",
        phone: "+1234567893",
        totalPurchases: 0,
        createdAt: new Date(),
      },
      device: "Samsung Galaxy S23",
      issue: "Battery draining quickly",
      diagnosis: "Battery health at 65%, needs replacement",
      estimatedCost: 120,
      status: "pending",
      priority: "medium",
      parts: [],
      createdAt: new Date("2024-01-04T10:30:00"),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentRepair, setCurrentRepair] = useState<RepairJob | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    device: "",
    imei: "",
    issue: "",
    diagnosis: "",
    estimatedCost: 0,
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    status: "pending" as RepairJob["status"],
    technicianName: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      device: "",
      imei: "",
      issue: "",
      diagnosis: "",
      estimatedCost: 0,
      priority: "medium",
      status: "pending",
      technicianName: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    setCurrentRepair(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (repair: RepairJob) => {
    setCurrentRepair(repair);
    setFormData({
      customerName: repair.customer.name,
      customerPhone: repair.customer.phone,
      device: repair.device,
      imei: repair.imei || "",
      issue: repair.issue,
      diagnosis: repair.diagnosis || "",
      estimatedCost: repair.estimatedCost,
      priority: repair.priority,
      status: repair.status,
      technicianName: repair.technicianName || "",
      notes: repair.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this repair job?")) {
      setRepairs(repairs.filter((r) => r.id !== id));
    }
  };

  const handleView = (repair: RepairJob) => {
    setCurrentRepair(repair);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    const repair: RepairJob = {
      id: currentRepair?.id || String(repairs.length + 1),
      jobNumber:
        currentRepair?.jobNumber ||
        `REP-${String(repairs.length + 1).padStart(3, "0")}`,
      customer: {
        id: currentRepair?.customer.id || `c${Math.random()}`,
        name: formData.customerName,
        phone: formData.customerPhone,
        totalPurchases: 0,
        createdAt: new Date(),
      },
      device: formData.device,
      imei: formData.imei,
      issue: formData.issue,
      diagnosis: formData.diagnosis,
      estimatedCost: formData.estimatedCost,
      finalCost: currentRepair?.finalCost,
      status: formData.status,
      priority: formData.priority,
      technicianId: currentRepair?.technicianId,
      technicianName: formData.technicianName,
      parts: currentRepair?.parts || [],
      notes: formData.notes,
      createdAt: currentRepair?.createdAt || new Date(),
      completedAt: currentRepair?.completedAt,
    };

    if (currentRepair) {
      setRepairs(repairs.map((r) => (r.id === currentRepair.id ? repair : r)));
    } else {
      setRepairs([...repairs, repair]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getStatusColor = (status: RepairJob["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      "in-progress": "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
      "waiting-parts": "bg-orange-100 text-orange-700",
      ready: "bg-purple-100 text-purple-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority: RepairJob["priority"]) => {
    const colors = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-blue-100 text-blue-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority];
  };

  const columns: DataTableColumn<RepairJob>[] = [
    {
      key: "jobNumber",
      label: "Job #",
      render: (repair) => (
        <div className="font-medium text-blue-600">{repair.jobNumber}</div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (repair) => (
        <div>
          <div className="font-medium">{repair.customer.name}</div>
          <div className="text-xs text-gray-500">{repair.customer.phone}</div>
        </div>
      ),
    },
    {
      key: "device",
      label: "Device",
      render: (repair) => (
        <div>
          <div className="font-medium text-sm">{repair.device}</div>
          {repair.imei && (
            <div className="text-xs text-gray-500 font-mono">{repair.imei}</div>
          )}
        </div>
      ),
    },
    {
      key: "issue",
      label: "Issue",
      render: (repair) => (
        <div className="text-sm max-w-xs truncate" title={repair.issue}>
          {repair.issue}
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (repair) => (
        <span className={`px-2 py-1 rounded-full text-xs capitalize ${getPriorityColor(repair.priority)}`}>
          {repair.priority}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (repair) => (
        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(repair.status)}`}>
          {repair.status.replace("-", " ")}
        </span>
      ),
    },
    {
      key: "estimatedCost",
      label: "Cost",
      render: (repair) => (
        <div className="font-semibold">${repair.estimatedCost.toFixed(2)}</div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (repair) => (
        <div className="text-sm">{new Date(repair.createdAt).toLocaleDateString()}</div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (repair) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(repair)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(repair)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(repair.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredRepairs = repairs.filter(
    (repair) =>
      repair.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repair.imei?.includes(searchQuery)
  );

  const stats = {
    total: repairs.length,
    pending: repairs.filter((r) => r.status === "pending").length,
    inProgress: repairs.filter((r) => r.status === "in-progress").length,
    completed: repairs.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Repair Jobs"
        description="Manage device repairs and track technician workload"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <Wrench size={16} />
            Total Jobs
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <Clock size={16} />
            Pending
          </div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <Wrench size={16} />
            In Progress
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <CheckCircle size={16} />
            Completed
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
        </div>
      </div>

      <DataTable
        data={filteredRepairs}
        columns={columns}
        searchPlaceholder="Search by job #, customer, device, IMEI..."
        onSearch={setSearchQuery}
        onAdd={handleAdd}
        onExport={() => alert("Export functionality")}
        addButtonLabel="New Repair Job"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentRepair ? "Edit Repair Job" : "New Repair Job"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentRepair ? "Update" : "Create"} Job
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Customer Phone"
              name="customerPhone"
              type="tel"
              value={formData.customerPhone}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Device"
              name="device"
              value={formData.device}
              onChange={handleInputChange}
              placeholder="e.g., iPhone 14 Pro"
              required
            />
            <Input
              label="IMEI (Optional)"
              name="imei"
              value={formData.imei}
              onChange={handleInputChange}
              placeholder="15-digit IMEI"
            />
          </div>

          <Input
            label="Issue Description"
            name="issue"
            type="textarea"
            value={formData.issue}
            onChange={handleInputChange}
            required
            rows={2}
          />

          <Input
            label="Diagnosis"
            name="diagnosis"
            type="textarea"
            value={formData.diagnosis}
            onChange={handleInputChange}
            rows={2}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Estimated Cost"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Priority"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={handleInputChange}
              options={[
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" },
              ]}
            />
            <Input
              label="Status"
              name="status"
              type="select"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: "pending", label: "Pending" },
                { value: "in-progress", label: "In Progress" },
                { value: "waiting-parts", label: "Waiting Parts" },
                { value: "ready", label: "Ready" },
                { value: "completed", label: "Completed" },
                { value: "cancelled", label: "Cancelled" },
              ]}
            />
          </div>

          <Input
            label="Assigned Technician"
            name="technicianName"
            value={formData.technicianName}
            onChange={handleInputChange}
            placeholder="Technician name"
          />

          <Input
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
          />
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Repair Job: ${currentRepair?.jobNumber}`}
        size="lg"
      >
        {currentRepair && (
          <div className="space-y-6">
            <div className="flex items-start justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
              <div>
                <h3 className="text-lg font-bold mb-1">{currentRepair.device}</h3>
                <div className="text-sm opacity-90">
                  {currentRepair.customer.name} • {currentRepair.customer.phone}
                </div>
                {currentRepair.imei && (
                  <div className="text-xs opacity-75 font-mono mt-1">
                    IMEI: {currentRepair.imei}
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(currentRepair.status)} bg-white/20 backdrop-blur`}>
                  {currentRepair.status.replace("-", " ")}
                </span>
                <div className="mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(currentRepair.priority)}`}>
                    {currentRepair.priority} priority
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm text-gray-500">Issue</h4>
              <div className="p-3 bg-red-50 rounded-lg text-sm">{currentRepair.issue}</div>
            </div>

            {currentRepair.diagnosis && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-gray-500">Diagnosis</h4>
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  {currentRepair.diagnosis}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Estimated Cost</div>
                <div className="text-xl font-bold">
                  ${currentRepair.estimatedCost.toFixed(2)}
                </div>
              </div>
              {currentRepair.finalCost && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-700 mb-1">Final Cost</div>
                  <div className="text-xl font-bold text-green-600">
                    ${currentRepair.finalCost.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {currentRepair.technicianName && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1">Assigned Technician</div>
                <div className="font-medium">{currentRepair.technicianName}</div>
              </div>
            )}

            {currentRepair.parts.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Parts Used</h4>
                <div className="space-y-2">
                  {currentRepair.parts.map((part, index) => (
                    <div key={index} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{part.partName}</div>
                        <div className="text-xs text-gray-500">Qty: {part.quantity}</div>
                      </div>
                      <div className="font-semibold">${part.cost.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentRepair.notes && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1 font-medium">Notes</div>
                <div className="text-sm">{currentRepair.notes}</div>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">
                Created: {new Date(currentRepair.createdAt).toLocaleString()}
              </div>
              {currentRepair.completedAt && (
                <div className="text-sm text-gray-500 mt-1">
                  Completed: {new Date(currentRepair.completedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
