"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Upload,
  TrendingUp,
  Package,
  AlertTriangle
} from "lucide-react";

interface WarrantyClaim {
  id: string;
  claimNumber: string;
  registrationId: string;
  registrationNumber: string;
  serialNumber: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  customerComplaint: string;
  claimDate: Date;
  status: "Registered" | "Under Review" | "Approved" | "Rejected" | "Completed";
  supportingDocs: string[];
  repairJobId?: string;
  resolutionDetails?: string;
  resolutionDate?: Date;
  supplierClaimForwarded: boolean;
  supplierApprovalStatus?: string;
  rejectionReason?: string;
}

export default function WarrantyClaimsPage() {
  const [activeTab, setActiveTab] = useState<"claims" | "analytics">("claims");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<WarrantyClaim | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    serialNumber: "",
    customerComplaint: "",
    supportingDocs: [] as File[]
  });

  const [claims, setClaims] = useState<WarrantyClaim[]>([
    {
      id: "1",
      claimNumber: "WC-2024-001",
      registrationId: "1",
      registrationNumber: "WR-2024-001",
      serialNumber: "IMEI123456789012345",
      productName: "iPhone 15 Pro 256GB",
      customerName: "John Doe",
      customerPhone: "+1234567890",
      customerComplaint: "Screen flickering and touch not responding properly",
      claimDate: new Date("2024-06-15"),
      status: "Under Review",
      supportingDocs: ["photo1.jpg", "video1.mp4"],
      supplierClaimForwarded: false
    },
    {
      id: "2",
      claimNumber: "WC-2024-002",
      registrationId: "2",
      registrationNumber: "WR-2024-002",
      serialNumber: "IMEI987654321098765",
      productName: "Samsung Galaxy S24 Ultra",
      customerName: "Jane Smith",
      customerPhone: "+1234567891",
      customerComplaint: "Battery draining very quickly, not holding charge",
      claimDate: new Date("2024-07-01"),
      status: "Approved",
      supportingDocs: ["battery_test.jpg"],
      repairJobId: "REP-001",
      resolutionDetails: "Battery replacement approved",
      resolutionDate: new Date("2024-07-02"),
      supplierClaimForwarded: true,
      supplierApprovalStatus: "Approved"
    },
    {
      id: "3",
      claimNumber: "WC-2024-003",
      registrationId: "3",
      registrationNumber: "WR-2024-003",
      serialNumber: "SN456789012345",
      productName: "AirPods Pro",
      customerName: "Mike Johnson",
      customerPhone: "+1234567892",
      customerComplaint: "Physical damage due to drop",
      claimDate: new Date("2024-08-10"),
      status: "Rejected",
      supportingDocs: ["damage_photo.jpg"],
      rejectionReason: "Physical damage not covered under warranty",
      resolutionDate: new Date("2024-08-11"),
      supplierClaimForwarded: false
    },
  ]);

  const handleRegisterClaim = () => {
    setFormData({
      serialNumber: "",
      customerComplaint: "",
      supportingDocs: []
    });
    setIsModalOpen(true);
  };

  const handleViewClaim = (claim: WarrantyClaim) => {
    setSelectedClaim(claim);
  };

  const handleForwardToSupplier = (claim: WarrantyClaim) => {
    setClaims(claims.map(c => 
      c.id === claim.id 
        ? { ...c, supplierClaimForwarded: true, supplierApprovalStatus: "Pending" }
        : c
    ));
    alert(`Claim ${claim.claimNumber} forwarded to supplier`);
  };

  const claimColumns: DataTableColumn<WarrantyClaim>[] = [
    {
      key: "claimNumber",
      label: "Claim #",
      render: (item) => (
        <div className="font-medium text-black">{item.claimNumber}</div>
      )
    },
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <div className="text-black font-medium">{item.productName}</div>
          <div className="text-xs text-gray-500 font-mono">{item.serialNumber}</div>
        </div>
      )
    },
    {
      key: "customer",
      label: "Customer",
      render: (item) => (
        <div>
          <div className="text-black">{item.customerName}</div>
          <div className="text-xs text-gray-500">{item.customerPhone}</div>
        </div>
      )
    },
    {
      key: "complaint",
      label: "Complaint",
      render: (item) => (
        <div className="text-black text-sm max-w-xs truncate" title={item.customerComplaint}>
          {item.customerComplaint}
        </div>
      )
    },
    {
      key: "claimDate",
      label: "Claim Date",
      render: (item) => (
        <div className="text-black text-sm">{new Date(item.claimDate).toLocaleDateString()}</div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.status === "Registered" ? "bg-gray-100 text-gray-700" :
          item.status === "Under Review" ? "bg-blue-100 text-blue-700" :
          item.status === "Approved" ? "bg-green-100 text-green-700" :
          item.status === "Rejected" ? "bg-red-100 text-red-700" :
          "bg-purple-100 text-purple-700"
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: "supplierStatus",
      label: "Supplier",
      render: (item) => (
        item.supplierClaimForwarded ? (
          <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700">
            {item.supplierApprovalStatus || "Pending"}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Not Forwarded</span>
        )
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleViewClaim(item)}>
            View
          </Button>
          {item.status === "Approved" && !item.supplierClaimForwarded && (
            <Button size="sm" variant="outline" onClick={() => handleForwardToSupplier(item)}>
              Forward
            </Button>
          )}
        </div>
      )
    }
  ];

  const filteredClaims = statusFilter === "all" 
    ? claims 
    : claims.filter(c => c.status === statusFilter);

  // Analytics Data
  const analytics = {
    totalClaims: claims.length,
    registered: claims.filter(c => c.status === "Registered").length,
    underReview: claims.filter(c => c.status === "Under Review").length,
    approved: claims.filter(c => c.status === "Approved").length,
    rejected: claims.filter(c => c.status === "Rejected").length,
    completed: claims.filter(c => c.status === "Completed").length,
    approvalRate: Math.round((claims.filter(c => c.status === "Approved" || c.status === "Completed").length / claims.length) * 100),
    rejectionRate: Math.round((claims.filter(c => c.status === "Rejected").length / claims.length) * 100),
    supplierForwarded: claims.filter(c => c.supplierClaimForwarded).length,
    supplierApprovalRate: 85
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Claims & Analytics"
        description="Manage warranty claims and view performance analytics"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "claims"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Warranty Claims
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "analytics"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Warranty Analytics
        </button>
      </div>

      {/* CLAIMS TAB */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          {/* Actions and Filters */}
          <div className="flex justify-between items-center">
            <Button onClick={handleRegisterClaim}>
              <FileText size={16} className="mr-2" />
              Register New Claim
            </Button>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-black">Filter by Status:</span>
              <select 
                className="border rounded px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Claims</option>
                <option value="Registered">Registered</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Claims Table */}
          <div className="bg-white rounded-xl border p-4">
            <DataTable
              data={filteredClaims}
              columns={claimColumns}
              searchPlaceholder="Search claims..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Total Claims</div>
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.totalClaims}</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Under Review</div>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.underReview}</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Approved</div>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.approved}</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Rejected</div>
                <XCircle size={20} className="text-red-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.rejected}</div>
            </div>
          </div>

          {/* Claim Status Breakdown */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold mb-4 text-black">Claim Tracking Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-black">Registered</span>
                  <span className="text-sm font-semibold text-black">{analytics.registered}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.registered / analytics.totalClaims) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-black">Under Review</span>
                  <span className="text-sm font-semibold text-black">{analytics.underReview}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.underReview / analytics.totalClaims) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-black">Approved</span>
                  <span className="text-sm font-semibold text-black">{analytics.approved}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.approved / analytics.totalClaims) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-black">Rejected</span>
                  <span className="text-sm font-semibold text-black">{analytics.rejected}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${(analytics.rejected / analytics.totalClaims) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Approval Rate</div>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.approvalRate}%</div>
              <div className="text-xs text-gray-500 mt-1">Claims approved vs total</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Rejection Rate</div>
                <XCircle size={20} className="text-red-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.rejectionRate}%</div>
              <div className="text-xs text-gray-500 mt-1">Claims rejected vs total</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Supplier Success Rate</div>
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.supplierApprovalRate}%</div>
              <div className="text-xs text-gray-500 mt-1">Supplier claim approvals</div>
            </div>
          </div>
        </div>
      )}

      {/* Register Claim Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Warranty Claim"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Register Claim
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Serial Number / IMEI"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            placeholder="Enter to verify warranty validity"
            required
          />

          <Input
            label="Customer Complaint"
            name="customerComplaint"
            type="textarea"
            value={formData.customerComplaint}
            onChange={(e) => setFormData({ ...formData, customerComplaint: e.target.value })}
            placeholder="Describe the issue in detail..."
            rows={4}
            required
          />

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Supporting Documents (Photos, Invoices)
            </label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, PDF up to 10MB
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-black">
            <strong>Next Steps:</strong> After registration, the claim will be reviewed. 
            If approved, a repair job will be created and linked to this claim.
          </div>
        </div>
      </Modal>
    </div>
  );
}
