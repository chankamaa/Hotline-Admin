"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { 
  Plus,
  ArrowRightLeft,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  AlertCircle,
  Package,
  User
} from "lucide-react";

interface StockTransfer {
  id: string;
  transferDate: Date;
  productName: string;
  productCode: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  requestedBy: string;
  approvedBy?: string;
  completedBy?: string;
  status: "Pending" | "Approved" | "In Transit" | "Completed" | "Rejected";
  priority: "Low" | "Normal" | "High" | "Urgent";
  notes?: string;
  rejectionReason?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

export default function StockTransferPage() {
  const [isCreatingTransfer, setIsCreatingTransfer] = useState(false);
  const [isViewingTransfer, setIsViewingTransfer] = useState(false);
  const [isApprovingTransfer, setIsApprovingTransfer] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    quantity: "",
    fromLocation: "",
    toLocation: "",
    priority: "Normal" as "Low" | "Normal" | "High" | "Urgent",
    estimatedDelivery: "",
    notes: ""
  });

  const locations = [
    "Main Warehouse",
    "Branch 1 - Downtown",
    "Branch 2 - Uptown",
    "Branch 3 - Suburbs",
    "Service Center"
  ];

  const [transfers, setTransfers] = useState<StockTransfer[]>([
    {
      id: "1",
      transferDate: new Date("2026-01-05T09:00:00"),
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      quantity: 10,
      fromLocation: "Main Warehouse",
      toLocation: "Branch 1 - Downtown",
      requestedBy: "Branch Manager - John",
      approvedBy: "Inventory Manager - Sarah",
      completedBy: "Logistics - Mike",
      status: "Completed",
      priority: "High",
      notes: "Urgent restock needed",
      estimatedDelivery: new Date("2026-01-06"),
      actualDelivery: new Date("2026-01-06T14:30:00")
    },
    {
      id: "2",
      transferDate: new Date("2026-01-06T10:30:00"),
      productName: "Samsung Galaxy S24",
      productCode: "SAM-S24-128",
      quantity: 5,
      fromLocation: "Main Warehouse",
      toLocation: "Branch 2 - Uptown",
      requestedBy: "Branch Manager - Jane",
      approvedBy: "Inventory Manager - Sarah",
      status: "In Transit",
      priority: "Normal",
      estimatedDelivery: new Date("2026-01-08")
    },
    {
      id: "3",
      transferDate: new Date("2026-01-07T08:00:00"),
      productName: "Phone Case Universal",
      productCode: "ACC-CASE-001",
      quantity: 50,
      fromLocation: "Branch 1 - Downtown",
      toLocation: "Branch 3 - Suburbs",
      requestedBy: "Branch Manager - Robert",
      status: "Pending",
      priority: "Low",
      estimatedDelivery: new Date("2026-01-10"),
      notes: "No rush, regular transfer"
    },
    {
      id: "4",
      transferDate: new Date("2026-01-07T11:00:00"),
      productName: "Wireless Charger",
      productCode: "ACC-CHRG-003",
      quantity: 20,
      fromLocation: "Main Warehouse",
      toLocation: "Service Center",
      requestedBy: "Service Manager - Tom",
      approvedBy: "Inventory Manager - Sarah",
      status: "Approved",
      priority: "Urgent",
      estimatedDelivery: new Date("2026-01-07"),
      notes: "Needed for repair services"
    },
    {
      id: "5",
      transferDate: new Date("2026-01-05T15:00:00"),
      productName: "USB-C Cable",
      productCode: "ACC-CABLE-002",
      quantity: 30,
      fromLocation: "Main Warehouse",
      toLocation: "Branch 2 - Uptown",
      requestedBy: "Branch Manager - Jane",
      status: "Rejected",
      priority: "Normal",
      rejectionReason: "Insufficient stock at source location"
    }
  ]);

  const handleCreateTransfer = () => {
    const newTransfer: StockTransfer = {
      id: String(transfers.length + 1),
      transferDate: new Date(),
      productName: formData.productName,
      productCode: formData.productCode,
      quantity: Number(formData.quantity),
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      requestedBy: "Current User",
      status: "Pending",
      priority: formData.priority,
      estimatedDelivery: formData.estimatedDelivery ? new Date(formData.estimatedDelivery) : undefined,
      notes: formData.notes
    };
    
    setTransfers([newTransfer, ...transfers]);
    setIsCreatingTransfer(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productCode: "",
      productName: "",
      quantity: "",
      fromLocation: "",
      toLocation: "",
      priority: "Normal",
      estimatedDelivery: "",
      notes: ""
    });
  };

  const handleViewTransfer = (transfer: StockTransfer) => {
    setSelectedTransfer(transfer);
    setIsViewingTransfer(true);
  };

  const handleApprove = (transfer: StockTransfer) => {
    setSelectedTransfer(transfer);
    setIsApprovingTransfer(true);
  };

  const handleApproveConfirm = () => {
    if (selectedTransfer) {
      setTransfers(transfers.map(t => 
        t.id === selectedTransfer.id 
          ? { ...t, status: "Approved" as const, approvedBy: "Current User" }
          : t
      ));
      setIsApprovingTransfer(false);
      setSelectedTransfer(null);
    }
  };

  const handleReject = (transfer: StockTransfer) => {
    const reason = prompt("Enter rejection reason:");
    if (reason) {
      setTransfers(transfers.map(t => 
        t.id === transfer.id 
          ? { ...t, status: "Rejected" as const, rejectionReason: reason }
          : t
      ));
    }
  };

  const handleMarkInTransit = (id: string) => {
    setTransfers(transfers.map(t => 
      t.id === id ? { ...t, status: "In Transit" as const } : t
    ));
  };

  const handleMarkCompleted = (id: string) => {
    setTransfers(transfers.map(t => 
      t.id === id 
        ? { ...t, status: "Completed" as const, completedBy: "Current User", actualDelivery: new Date() }
        : t
    ));
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.toLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transfer.status === statusFilter;
    const matchesLocation = locationFilter === "all" || 
                           transfer.fromLocation === locationFilter || 
                           transfer.toLocation === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const columns = [
    {
      key: "id",
      label: "Transfer ID",
      render: (transfer: StockTransfer) => (
        <div className="font-mono text-sm text-black font-semibold">
          TRF-{transfer.id.padStart(5, '0')}
        </div>
      )
    },
    {
      key: "date",
      label: "Date",
      render: (transfer: StockTransfer) => (
        <div className="text-sm">
          <div className="text-black">{new Date(transfer.transferDate).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(transfer.transferDate).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: "product",
      label: "Product",
      render: (transfer: StockTransfer) => (
        <div>
          <div className="font-medium text-black">{transfer.productName}</div>
          <div className="text-sm text-gray-500">{transfer.productCode}</div>
          <div className="text-sm font-semibold text-blue-600">{transfer.quantity} units</div>
        </div>
      )
    },
    {
      key: "locations",
      label: "Transfer Route",
      render: (transfer: StockTransfer) => (
        <div className="flex items-center gap-2">
          <div className="text-sm">
            <div className="text-black font-medium">{transfer.fromLocation}</div>
            <div className="text-xs text-gray-500">From</div>
          </div>
          <ArrowRightLeft size={16} className="text-gray-400" />
          <div className="text-sm">
            <div className="text-black font-medium">{transfer.toLocation}</div>
            <div className="text-xs text-gray-500">To</div>
          </div>
        </div>
      )
    },
    {
      key: "priority",
      label: "Priority",
      render: (transfer: StockTransfer) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          transfer.priority === "Urgent" ? "bg-red-100 text-red-700" :
          transfer.priority === "High" ? "bg-orange-100 text-orange-700" :
          transfer.priority === "Normal" ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-700"
        }`}>
          {transfer.priority}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (transfer: StockTransfer) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          transfer.status === "Completed" ? "bg-green-100 text-green-700" :
          transfer.status === "In Transit" ? "bg-blue-100 text-blue-700" :
          transfer.status === "Approved" ? "bg-purple-100 text-purple-700" :
          transfer.status === "Rejected" ? "bg-red-100 text-red-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {transfer.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (transfer: StockTransfer) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => handleViewTransfer(transfer)}>
            <Eye size={14} />
          </Button>
          {transfer.status === "Pending" && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleApprove(transfer)}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleReject(transfer)}>
                Reject
              </Button>
            </>
          )}
          {transfer.status === "Approved" && (
            <Button size="sm" variant="outline" onClick={() => handleMarkInTransit(transfer.id)}>
              In Transit
            </Button>
          )}
          {transfer.status === "In Transit" && (
            <Button size="sm" variant="outline" onClick={() => handleMarkCompleted(transfer.id)}>
              Complete
            </Button>
          )}
        </div>
      )
    }
  ];

  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === "Pending").length,
    approved: transfers.filter(t => t.status === "Approved").length,
    inTransit: transfers.filter(t => t.status === "In Transit").length,
    completed: transfers.filter(t => t.status === "Completed").length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Stock Transfer"
        description="Manage stock transfers between multiple locations with approval workflow"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Transfers</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.inTransit}</div>
              <div className="text-sm text-gray-500">In Transit</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by product, code, or location..."
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
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <Button variant="outline">
            <Download size={18} className="mr-2" />
            Export
          </Button>

          <Button onClick={() => setIsCreatingTransfer(true)}>
            <Plus size={18} className="mr-2" />
            Create Transfer
          </Button>
        </div>
      </div>

      {/* Transfer Table */}
      <div className="bg-white rounded-xl border">
        <DataTable columns={columns} data={filteredTransfers} />
      </div>

      {/* Create Transfer Modal */}
      <Modal
        isOpen={isCreatingTransfer}
        onClose={() => {
          setIsCreatingTransfer(false);
          resetForm();
        }}
        title="Create Stock Transfer"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => {
              setIsCreatingTransfer(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateTransfer}>
              Create Transfer Request
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <AlertCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              Transfer requests will be sent for approval. Ensure stock is available at the source location.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Code"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              placeholder="IPH15P-256"
              required
            />
            <Input
              label="Product Name"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="iPhone 15 Pro"
              required
            />
          </div>

          <Input
            label="Transfer Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="10"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                From Location *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.fromLocation}
                onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                required
              >
                <option value="">Select source location</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                To Location *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.toLocation}
                onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                required
              >
                <option value="">Select destination location</option>
                {locations.filter(l => l !== formData.fromLocation).map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Priority Level
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <Input
              label="Estimated Delivery Date"
              type="date"
              value={formData.estimatedDelivery}
              onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
            />
          </div>

          <Input
            label="Transfer Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Reason for transfer, special instructions..."
            rows={3}
          />
        </div>
      </Modal>

      {/* Approval Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={isApprovingTransfer}
          onClose={() => {
            setIsApprovingTransfer(false);
            setSelectedTransfer(null);
          }}
          title="Approve Transfer Request"
          size="md"
          footer={
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => {
                setIsApprovingTransfer(false);
                setSelectedTransfer(null);
              }}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => {
                handleReject(selectedTransfer);
                setIsApprovingTransfer(false);
                setSelectedTransfer(null);
              }}>
                Reject
              </Button>
              <Button onClick={handleApproveConfirm}>
                <CheckCircle size={16} className="mr-2" />
                Approve Transfer
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
              <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                Review the transfer details carefully before approving.
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transfer ID:</span>
                <span className="text-sm font-semibold text-black">TRF-{selectedTransfer.id.padStart(5, '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Product:</span>
                <span className="text-sm font-medium text-black">{selectedTransfer.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Quantity:</span>
                <span className="text-sm font-bold text-blue-600">{selectedTransfer.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">From:</span>
                <span className="text-sm font-medium text-black">{selectedTransfer.fromLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">To:</span>
                <span className="text-sm font-medium text-black">{selectedTransfer.toLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Requested By:</span>
                <span className="text-sm font-medium text-black">{selectedTransfer.requestedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Priority:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedTransfer.priority === "Urgent" ? "bg-red-100 text-red-700" :
                  selectedTransfer.priority === "High" ? "bg-orange-100 text-orange-700" :
                  selectedTransfer.priority === "Normal" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {selectedTransfer.priority}
                </span>
              </div>
            </div>

            {selectedTransfer.notes && (
              <div className="pt-3 border-t">
                <div className="text-sm text-gray-500 mb-1">Notes:</div>
                <div className="text-sm text-black bg-gray-50 p-2 rounded">
                  {selectedTransfer.notes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* View Transfer Details Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={isViewingTransfer}
          onClose={() => {
            setIsViewingTransfer(false);
            setSelectedTransfer(null);
          }}
          title="Transfer Details"
          size="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsViewingTransfer(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export Details
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Status Badge */}
            <div className={`p-4 rounded-lg border-2 ${
              selectedTransfer.status === "Completed" ? "bg-green-50 border-green-200" :
              selectedTransfer.status === "In Transit" ? "bg-blue-50 border-blue-200" :
              selectedTransfer.status === "Approved" ? "bg-purple-50 border-purple-200" :
              selectedTransfer.status === "Rejected" ? "bg-red-50 border-red-200" :
              "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`text-2xl font-bold ${
                    selectedTransfer.status === "Completed" ? "text-green-600" :
                    selectedTransfer.status === "In Transit" ? "text-blue-600" :
                    selectedTransfer.status === "Approved" ? "text-purple-600" :
                    selectedTransfer.status === "Rejected" ? "text-red-600" :
                    "text-yellow-600"
                  }`}>
                    {selectedTransfer.status}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Priority</div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedTransfer.priority === "Urgent" ? "bg-red-100 text-red-700" :
                    selectedTransfer.priority === "High" ? "bg-orange-100 text-orange-700" :
                    selectedTransfer.priority === "Normal" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {selectedTransfer.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Transfer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Transfer ID</div>
                <div className="text-black font-mono font-semibold">TRF-{selectedTransfer.id.padStart(5, '0')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Transfer Date</div>
                <div className="text-black font-medium">{new Date(selectedTransfer.transferDate).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Name</div>
                <div className="text-black font-medium">{selectedTransfer.productName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Code</div>
                <div className="text-black font-medium">{selectedTransfer.productCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Quantity</div>
                <div className="text-blue-600 font-bold text-lg">{selectedTransfer.quantity} units</div>
              </div>
            </div>

            {/* Locations */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-gray-400" />
                    <div className="text-sm text-gray-500">From Location</div>
                  </div>
                  <div className="text-black font-semibold">{selectedTransfer.fromLocation}</div>
                </div>
                <ArrowRightLeft size={24} className="text-gray-300" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={16} className="text-gray-400" />
                    <div className="text-sm text-gray-500">To Location</div>
                  </div>
                  <div className="text-black font-semibold">{selectedTransfer.toLocation}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-4 border-t">
              <div className="text-sm font-semibold text-black mb-3">Transfer Timeline</div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <div className="text-black font-medium">Requested by {selectedTransfer.requestedBy}</div>
                    <div className="text-xs text-gray-500">{new Date(selectedTransfer.transferDate).toLocaleString()}</div>
                  </div>
                </div>
                {selectedTransfer.approvedBy && (
                  <div className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="text-black font-medium">Approved by {selectedTransfer.approvedBy}</div>
                    </div>
                  </div>
                )}
                {selectedTransfer.completedBy && (
                  <div className="flex items-start gap-3">
                    <Package size={16} className="text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="text-black font-medium">Completed by {selectedTransfer.completedBy}</div>
                      {selectedTransfer.actualDelivery && (
                        <div className="text-xs text-gray-500">{new Date(selectedTransfer.actualDelivery).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}
                {selectedTransfer.status === "Rejected" && selectedTransfer.rejectionReason && (
                  <div className="flex items-start gap-3">
                    <XCircle size={16} className="text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="text-red-600 font-medium">Rejected</div>
                      <div className="text-xs text-gray-700">Reason: {selectedTransfer.rejectionReason}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedTransfer.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Notes</div>
                <div className="text-black bg-gray-50 p-3 rounded-lg">
                  {selectedTransfer.notes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
