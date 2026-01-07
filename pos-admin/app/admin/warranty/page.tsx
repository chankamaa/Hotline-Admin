"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Package,
  TrendingUp
} from "lucide-react";

// Type Definitions
interface WarrantySetup {
  id: string;
  productCategory: string;
  warrantyPeriod: number; // in months
  coverageType: "Parts" | "Labor" | "Both";
  termsAndConditions: string;
  partsCoverage?: string;
  laborCoverage?: string;
}

interface WarrantyRegistration {
  id: string;
  registrationNumber: string;
  productName: string;
  serialNumber: string;
  saleId: string;
  customerId: string;
  customerName: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Expired" | "Claimed";
  certificateGenerated: boolean;
}

interface WarrantyClaim {
  id: string;
  claimNumber: string;
  registrationId: string;
  serialNumber: string;
  productName: string;
  customerName: string;
  customerComplaint: string;
  claimDate: Date;
  status: "Registered" | "Under Review" | "Approved" | "Rejected" | "Completed";
  supportingDocs: string[];
  repairJobId?: string;
  resolutionDetails?: string;
  resolutionDate?: Date;
  supplierClaimForwarded: boolean;
  supplierApprovalStatus?: string;
  supplierResponse?: string;
}

export default function WarrantyPage() {
  const [activeTab, setActiveTab] = useState<"registration" | "claims" | "supplier" | "reports">("registration");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"setup" | "activate" | "claim" | null>(null);
  const [searchSerial, setSearchSerial] = useState("");

  // Mock Data
  const warrantySetups: WarrantySetup[] = [
    {
      id: "1",
      productCategory: "Smartphones",
      warrantyPeriod: 12,
      coverageType: "Both",
      termsAndConditions: "Standard manufacturer warranty",
      partsCoverage: "All parts except battery",
      laborCoverage: "Free labor for covered repairs"
    },
    {
      id: "2",
      productCategory: "Accessories",
      warrantyPeriod: 6,
      coverageType: "Parts",
      termsAndConditions: "Limited warranty on manufacturing defects",
      partsCoverage: "Manufacturing defects only"
    },
  ];

  const registrations: WarrantyRegistration[] = [
    {
      id: "1",
      registrationNumber: "WR-2024-001",
      productName: "iPhone 15 Pro",
      serialNumber: "IMEI123456789",
      saleId: "INV-001",
      customerId: "C001",
      customerName: "John Doe",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-01-01"),
      status: "Active",
      certificateGenerated: true
    },
    {
      id: "2",
      registrationNumber: "WR-2024-002",
      productName: "Samsung Galaxy S24",
      serialNumber: "IMEI987654321",
      saleId: "INV-002",
      customerId: "C002",
      customerName: "Jane Smith",
      startDate: new Date("2024-02-15"),
      endDate: new Date("2025-02-15"),
      status: "Active",
      certificateGenerated: true
    },
  ];

  const claims: WarrantyClaim[] = [
    {
      id: "1",
      claimNumber: "WC-2024-001",
      registrationId: "1",
      serialNumber: "IMEI123456789",
      productName: "iPhone 15 Pro",
      customerName: "John Doe",
      customerComplaint: "Screen not responding properly",
      claimDate: new Date("2024-06-15"),
      status: "Under Review",
      supportingDocs: ["photo1.jpg", "invoice.pdf"],
      supplierClaimForwarded: false
    },
    {
      id: "2",
      claimNumber: "WC-2024-002",
      registrationId: "2",
      serialNumber: "IMEI987654321",
      productName: "Samsung Galaxy S24",
      customerName: "Jane Smith",
      customerComplaint: "Battery draining quickly",
      claimDate: new Date("2024-07-01"),
      status: "Approved",
      supportingDocs: ["photo2.jpg"],
      repairJobId: "REP-001",
      supplierClaimForwarded: true,
      supplierApprovalStatus: "Approved",
      supplierResponse: "Credit approved for parts replacement"
    },
  ];

  // Analytics
  const analytics = {
    totalActive: registrations.filter(r => r.status === "Active").length,
    expiringNext30Days: 5,
    totalClaims: claims.length,
    approvalRate: 75,
    rejectionRate: 15,
    supplierSuccessRate: 85
  };

  // Columns for Warranty Setup
  const setupColumns: DataTableColumn<WarrantySetup>[] = [
    {
      key: "productCategory",
      label: "Product Category",
      render: (item) => <div className="font-medium text-black">{item.productCategory}</div>
    },
    {
      key: "warrantyPeriod",
      label: "Period (Months)",
      render: (item) => <div className="text-black">{item.warrantyPeriod}</div>
    },
    {
      key: "coverageType",
      label: "Coverage Type",
      render: (item) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          {item.coverageType}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button size="sm" variant="outline" onClick={() => {}}>
          Edit
        </Button>
      )
    }
  ];

  // Columns for Registrations
  const registrationColumns: DataTableColumn<WarrantyRegistration>[] = [
    {
      key: "registrationNumber",
      label: "Registration #",
      render: (item) => <div className="font-medium text-black">{item.registrationNumber}</div>
    },
    {
      key: "productName",
      label: "Product",
      render: (item) => <div className="text-black">{item.productName}</div>
    },
    {
      key: "serialNumber",
      label: "Serial/IMEI",
      render: (item) => <div className="text-black font-mono text-sm">{item.serialNumber}</div>
    },
    {
      key: "customerName",
      label: "Customer",
      render: (item) => <div className="text-black">{item.customerName}</div>
    },
    {
      key: "endDate",
      label: "Expires",
      render: (item) => <div className="text-black text-sm">{new Date(item.endDate).toLocaleDateString()}</div>
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.status === "Active" ? "bg-green-100 text-green-700" :
          item.status === "Expired" ? "bg-red-100 text-red-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button size="sm" variant="outline" onClick={() => {}}>
          Certificate
        </Button>
      )
    }
  ];

  // Columns for Claims
  const claimColumns: DataTableColumn<WarrantyClaim>[] = [
    {
      key: "claimNumber",
      label: "Claim #",
      render: (item) => <div className="font-medium text-black">{item.claimNumber}</div>
    },
    {
      key: "productName",
      label: "Product",
      render: (item) => <div className="text-black">{item.productName}</div>
    },
    {
      key: "customerName",
      label: "Customer",
      render: (item) => <div className="text-black">{item.customerName}</div>
    },
    {
      key: "customerComplaint",
      label: "Complaint",
      render: (item) => <div className="text-black text-sm max-w-xs truncate">{item.customerComplaint}</div>
    },
    {
      key: "claimDate",
      label: "Date",
      render: (item) => <div className="text-black text-sm">{new Date(item.claimDate).toLocaleDateString()}</div>
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
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
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => {}}>
            View
          </Button>
          {item.status === "Approved" && !item.supplierClaimForwarded && (
            <Button size="sm" variant="outline" onClick={() => {}}>
              Forward to Supplier
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Warranty Management"
        description="Manage product warranties, claims, and supplier interactions"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("registration")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "registration"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Warranty Registration
        </button>
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
          onClick={() => setActiveTab("supplier")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "supplier"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Supplier Claims
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "reports"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Warranty Reports
        </button>
      </div>

      {/* WARRANTY REGISTRATION TAB */}
      {activeTab === "registration" && (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={() => { setModalType("setup"); setIsModalOpen(true); }}>
              Product Warranty Setup
            </Button>
            <Button onClick={() => { setModalType("activate"); setIsModalOpen(true); }}>
              Activate Warranty on Sale
            </Button>
          </div>

          {/* Warranty Setup Section */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Warranty Setup by Category</h3>
            <DataTable
              data={warrantySetups}
              columns={setupColumns}
              searchPlaceholder="Search categories..."
              onSearch={() => {}}
            />
          </div>

          {/* Active Registrations */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Active Warranty Registrations</h3>
            <DataTable
              data={registrations}
              columns={registrationColumns}
              searchPlaceholder="Search by serial number, customer..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* WARRANTY CLAIMS TAB */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          {/* Search and Register Claim */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Claim Registration</h3>
            <div className="flex gap-2 mb-4">
              <Input
                label=""
                name="searchSerial"
                value={searchSerial}
                onChange={(e) => setSearchSerial(e.target.value)}
                placeholder="Search product by Serial Number/IMEI"
              />
              <Button onClick={() => { setModalType("claim"); setIsModalOpen(true); }}>
                Verify & Register Claim
              </Button>
            </div>
          </div>

          {/* Claims List */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">All Warranty Claims</h3>
              <div className="flex gap-2">
                <select className="border rounded px-3 py-1 text-sm">
                  <option>All Status</option>
                  <option>Registered</option>
                  <option>Under Review</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>
            <DataTable
              data={claims}
              columns={claimColumns}
              searchPlaceholder="Search claims..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* SUPPLIER CLAIMS TAB */}
      {activeTab === "supplier" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Supplier Claim Management</h3>
            <p className="text-sm text-gray-600 mb-4">
              Forward approved warranty claims to suppliers and track their responses
            </p>

            {/* Supplier Claims Table */}
            <table className="min-w-full text-sm">
              <thead className="border-b">
                <tr className="text-left text-black">
                  <th className="py-2 px-2">Claim #</th>
                  <th className="py-2 px-2">Product</th>
                  <th className="py-2 px-2">Forwarded Date</th>
                  <th className="py-2 px-2">Supplier Status</th>
                  <th className="py-2 px-2">Credit/Replacement</th>
                  <th className="py-2 px-2">Response</th>
                  <th className="py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.filter(c => c.supplierClaimForwarded).map(claim => (
                  <tr key={claim.id} className="border-b">
                    <td className="py-2 px-2 text-black">{claim.claimNumber}</td>
                    <td className="py-2 px-2 text-black">{claim.productName}</td>
                    <td className="py-2 px-2 text-black">{new Date(claim.claimDate).toLocaleDateString()}</td>
                    <td className="py-2 px-2">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        {claim.supplierApprovalStatus}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-black">Replacement</td>
                    <td className="py-2 px-2 text-black text-sm max-w-xs truncate">
                      {claim.supplierResponse}
                    </td>
                    <td className="py-2 px-2">
                      <Button size="sm" variant="outline">Document</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WARRANTY REPORTS TAB */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Total Active Warranties</div>
                <ShieldCheck size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.totalActive}</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Expiring (Next 30 Days)</div>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.expiringNext30Days}</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Total Claims</div>
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.totalClaims}</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Approval Rate</div>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.approvalRate}%</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Rejection Rate</div>
                <XCircle size={20} className="text-red-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.rejectionRate}%</div>
            </div>

            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Supplier Success Rate</div>
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.supplierSuccessRate}%</div>
            </div>
          </div>

          {/* Claims vs Registrations Chart Placeholder */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Claims vs. Registrations</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chart visualization placeholder - integrate with charting library
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
