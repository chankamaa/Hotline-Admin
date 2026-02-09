"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  RefreshCw,
  Eye,
  Package,
  User,
  Calendar,
  AlertCircle,
  Download
} from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import Link from "next/link";
import {
  fetchWarranties,
  fetchWarrantyStats,
  fetchExpiringSoon,
  fetchWarrantyById,
  type Warranty,
  type WarrantyClaim as ApiWarrantyClaim
} from "@/lib/api/warrantyApi";

// Type Definitions for display
interface WarrantyRegistration {
  id: string;
  registrationNumber: string;
  productName: string;
  serialNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Expired" | "Claimed" | "Void";
  warrantyType: string;
  durationMonths: number;
  sourceType: string;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  claims: ClaimDisplay[];
}

interface ClaimDisplay {
  id: string;
  claimNumber: string;
  issue: string;
  claimDate: Date;
  resolution?: string;
  resolvedDate?: Date;
  notes?: string;
  processedBy?: string;
}

interface WarrantyClaimList {
  id: string;
  claimNumber: string;
  productName: string;
  customerName: string;
  issue: string;
  claimDate: Date;
  status: "Pending" | "Approved" | "Rejected";
  resolution?: string;
}

export default function WarrantyPage() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"registration" | "claims" | "reports">("registration");
  const [loading, setLoading] = useState(true);
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Data state - loaded from API
  const [registrations, setRegistrations] = useState<WarrantyRegistration[]>([]);
  const [claims, setClaims] = useState<WarrantyClaimList[]>([]);
  const [analytics, setAnalytics] = useState({
    totalActive: 0,
    expiringNext30Days: 0,
    totalClaims: 0,
    approvalRate: 0,
    rejectionRate: 0
  });

  // Search state
  const [registrationSearchQuery, setRegistrationSearchQuery] = useState("");
  const [claimsSearchQuery, setClaimsSearchQuery] = useState("");

  // Load warranty data from API
  useEffect(() => {
    loadWarrantyData();
  }, []);

  const loadWarrantyData = async () => {
    setLoading(true);
    try {
      const [warrantiesRes, statsRes, expiringRes] = await Promise.allSettled([
        fetchWarranties({ limit: 100 }),
        fetchWarrantyStats(),
        fetchExpiringSoon(30),
      ]);

      // Process warranties
      if (warrantiesRes.status === "fulfilled") {
        const warranties = warrantiesRes.value.data?.warranties || [];

        // Map API warranty data to local WarrantyRegistration format
        const mappedRegistrations: WarrantyRegistration[] = warranties.map((w: Warranty) => ({
          id: w._id,
          registrationNumber: w.warrantyNumber,
          productName: typeof w.product === "string" ? w.productName : w.product?.name || w.productName || "Unknown Product",
          serialNumber: w.serialNumber || "N/A",
          customerName: w.customer?.name || "Unknown Customer",
          customerPhone: w.customer?.phone || "N/A",
          customerEmail: w.customer?.email,
          startDate: new Date(w.startDate),
          endDate: new Date(w.endDate),
          status: w.status === "ACTIVE" ? "Active" : w.status === "EXPIRED" ? "Expired" : w.status === "VOID" ? "Void" : "Claimed",
          warrantyType: w.warrantyType,
          durationMonths: w.durationMonths,
          sourceType: w.sourceType,
          notes: w.notes,
          createdBy: typeof w.createdBy === "string" ? w.createdBy : w.createdBy?.username,
          createdAt: new Date(w.createdAt),
          claims: (w.claims || []).map((c: ApiWarrantyClaim) => ({
            id: c._id,
            claimNumber: c.claimNumber,
            issue: c.issue,
            claimDate: new Date(c.claimDate),
            resolution: c.resolution,
            resolvedDate: c.resolvedDate ? new Date(c.resolvedDate) : undefined,
            notes: c.notes,
            processedBy: typeof c.processedBy === "string" ? c.processedBy : c.processedBy?.username
          }))
        }));
        setRegistrations(mappedRegistrations);

        // Extract claims from warranties for claims tab
        const allClaims: WarrantyClaimList[] = [];
        warranties.forEach((w: Warranty) => {
          if (w.claims && w.claims.length > 0) {
            w.claims.forEach((c: ApiWarrantyClaim) => {
              allClaims.push({
                id: c._id,
                claimNumber: c.claimNumber,
                productName: typeof w.product === "string" ? w.productName : w.product?.name || w.productName || "Unknown Product",
                customerName: w.customer?.name || "Unknown Customer",
                issue: c.issue,
                claimDate: new Date(c.claimDate),
                status: c.resolution === "REJECTED" ? "Rejected" :
                  c.resolution === "REPAIR" || c.resolution === "REPLACE" || c.resolution === "REFUND" ? "Approved" :
                    "Pending",
                resolution: c.resolution
              });
            });
          }
        });
        setClaims(allClaims);
      }

      // Process statistics
      if (statsRes.status === "fulfilled") {
        const stats = statsRes.value.data;
        const summary = stats?.summary;
        if (summary) {
          const approvedClaims = summary.claimedWarranties || 0;
          const totalClaims = summary.totalClaims || 0;
          const approvalRate = totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0;

          setAnalytics(prev => ({
            ...prev,
            totalActive: summary.activeWarranties || 0,
            totalClaims: summary.totalClaims || 0,
            approvalRate: approvalRate,
            rejectionRate: 100 - approvalRate,
          }));
        }
      }

      // Process expiring warranties
      if (expiringRes.status === "fulfilled") {
        const expiringCount = expiringRes.value.results || 0;
        setAnalytics(prev => ({
          ...prev,
          expiringNext30Days: expiringCount,
        }));
      }

    } catch (error) {
      console.error("Error loading warranty data:", error);
      toast.error("Failed to load warranty data");
    } finally {
      setLoading(false);
    }
  };

  // Handle view warranty details
  const handleViewWarranty = async (warranty: WarrantyRegistration) => {
    setSelectedWarranty(warranty);
    setIsModalOpen(true);
  };

  // Calculate days remaining
  const calculateDaysRemaining = (endDate: Date): number => {
    const now = new Date();
    const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // Format warranty type
  const formatWarrantyType = (type: string): string => {
    switch (type) {
      case "MANUFACTURER": return "Manufacturer Warranty";
      case "SHOP": return "Shop Warranty";
      case "EXTENDED": return "Extended Warranty";
      case "REPAIR": return "Repair Warranty";
      default: return type;
    }
  };

  // Filter registrations based on search query
  const filteredRegistrations = registrations.filter((warranty) => {
    if (!registrationSearchQuery) return true;
    
    const query = registrationSearchQuery.toLowerCase();
    return (
      warranty.registrationNumber.toLowerCase().includes(query) ||
      warranty.productName.toLowerCase().includes(query) ||
      warranty.customerName.toLowerCase().includes(query) ||
      warranty.customerPhone.toLowerCase().includes(query) ||
      warranty.serialNumber.toLowerCase().includes(query) ||
      (warranty.customerEmail?.toLowerCase().includes(query) || false) ||
      warranty.status.toLowerCase().includes(query) ||
      warranty.warrantyType.toLowerCase().includes(query)
    );
  });

  // Filter claims based on search query
  const filteredClaims = claims.filter((claim) => {
    if (!claimsSearchQuery) return true;
    
    const query = claimsSearchQuery.toLowerCase();
    return (
      claim.claimNumber.toLowerCase().includes(query) ||
      claim.productName.toLowerCase().includes(query) ||
      claim.customerName.toLowerCase().includes(query) ||
      claim.issue.toLowerCase().includes(query) ||
      claim.status.toLowerCase().includes(query) ||
      (claim.resolution?.toLowerCase().includes(query) || false)
    );
  });

  // Handle search for registrations
  const handleRegistrationSearch = (query: string) => {
    setRegistrationSearchQuery(query);
  };

  // Handle search for claims
  const handleClaimsSearch = (query: string) => {
    setClaimsSearchQuery(query);
  };

  // Columns for Registrations (read-only)
  const registrationColumns: DataTableColumn<WarrantyRegistration>[] = [
    {
      key: "registrationNumber",
      label: "Warranty #",
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
      render: (item) => (
        <div>
          <div className="text-black">{item.customerName}</div>
          <div className="text-xs text-gray-500">{item.customerPhone}</div>
        </div>
      )
    },
    {
      key: "warrantyType",
      label: "Type",
      render: (item) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          {item.warrantyType}
        </span>
      )
    },
    {
      key: "endDate",
      label: "Expires",
      render: (item) => (
        <div>
          <div className="text-black text-sm">{new Date(item.endDate).toLocaleDateString()}</div>
          {item.status === "Active" && (
            <div className="text-xs text-gray-500">{calculateDaysRemaining(item.endDate)} days left</div>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.status === "Active" ? "bg-green-100 text-green-700" :
            item.status === "Expired" ? "bg-red-100 text-red-700" :
              item.status === "Void" ? "bg-gray-100 text-gray-700" :
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
        <Button size="sm" variant="secondary" onClick={() => handleViewWarranty(item)}>
          <Eye size={14} />
          View
        </Button>
      )
    }
  ];

  // Columns for Claims (read-only)
  const claimColumns: DataTableColumn<WarrantyClaimList>[] = [
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
      key: "issue",
      label: "Issue",
      render: (item) => <div className="text-black text-sm max-w-xs truncate">{item.issue}</div>
    },
    {
      key: "claimDate",
      label: "Date",
      render: (item) => <div className="text-black text-sm">{new Date(item.claimDate).toLocaleDateString()}</div>
    },
    {
      key: "resolution",
      label: "Resolution",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.resolution === "REPAIR" ? "bg-blue-100 text-blue-700" :
            item.resolution === "REPLACE" ? "bg-purple-100 text-purple-700" :
              item.resolution === "REFUND" ? "bg-green-100 text-green-700" :
                item.resolution === "REJECTED" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-700"
          }`}>
          {item.resolution || "Pending"}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.status === "Pending" ? "bg-gray-100 text-gray-700" :
            item.status === "Approved" ? "bg-green-100 text-green-700" :
              "bg-red-100 text-red-700"
          }`}>
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Warranty Management"
          description="View product warranties, claims, and reports"
        />
        <div className="flex gap-2">
          <Link href="/admin/warranty/export">
            <Button variant="secondary">
              <Download size={16} className="mr-2" />
              Export PDF
            </Button>
          </Link>
          <Button
            onClick={loadWarrantyData}
            disabled={loading}
            variant="danger"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("registration")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "registration"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
            }`}
        >
          Warranty Registrations
        </button>
        <button
          onClick={() => setActiveTab("claims")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "claims"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
            }`}
        >
          Warranty Claims
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "reports"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
            }`}
        >
          Reports & Analytics
        </button>
      </div>

      {/* WARRANTY REGISTRATION TAB */}
      {activeTab === "registration" && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Registrations</div>
                <ShieldCheck size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-black">{registrations.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Warranties</div>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.totalActive}</div>
            </div>
            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Expiring (30 Days)</div>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.expiringNext30Days}</div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">All Warranty Registrations</h3>
            <DataTable
              data={filteredRegistrations}
              columns={registrationColumns}
              searchPlaceholder="Search by warranty #, product, customer..."
              onSearch={handleRegistrationSearch}
            />
          </div>
        </div>
      )}

      {/* WARRANTY CLAIMS TAB */}
      {activeTab === "claims" && (
        <div className="space-y-4">
          {/* Claims Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Claims</div>
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-black">{claims.length}</div>
            </div>
            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Approved</div>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">
                {claims.filter(c => c.status === "Approved").length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Pending</div>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-black">
                {claims.filter(c => c.status === "Pending").length}
              </div>
            </div>
          </div>

          {/* Claims Table */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">All Warranty Claims</h3>
            <DataTable
              data={filteredClaims}
              columns={claimColumns}
              searchPlaceholder="Search by claim #, product, customer, issue..."
              onSearch={handleClaimsSearch}
            />
          </div>
        </div>
      )}

      {/* WARRANTY REPORTS TAB */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Total Active Warranties</div>
                <ShieldCheck size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.totalActive}</div>
            </div>

            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Expiring (Next 30 Days)</div>
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.expiringNext30Days}</div>
            </div>

            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Total Claims</div>
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.totalClaims}</div>
            </div>

            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Approval Rate</div>
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.approvalRate}%</div>
            </div>

            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Rejection Rate</div>
                <XCircle size={20} className="text-red-600" />
              </div>
              <div className="text-2xl font-bold text-black">{analytics.rejectionRate}%</div>
            </div>

            <div className="bg-white rounded-xl border border-blue-600 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">Resolution Efficiency</div>
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-black">
                {analytics.totalClaims > 0 ? Math.round((claims.filter(c => c.status !== "Pending").length / analytics.totalClaims) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold mb-4 text-black">Warranty Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 mb-1">Active</div>
                <div className="text-lg font-semibold text-green-600">
                  {registrations.filter(r => r.status === "Active").length}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 mb-1">Expired</div>
                <div className="text-lg font-semibold text-red-600">
                  {registrations.filter(r => r.status === "Expired").length}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 mb-1">Claimed</div>
                <div className="text-lg font-semibold text-yellow-600">
                  {registrations.filter(r => r.status === "Claimed").length}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-gray-600 mb-1">Total</div>
                <div className="text-lg font-semibold text-black">
                  {registrations.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WARRANTY DETAILS MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWarranty(null);
        }}
        title={`Warranty Details - ${selectedWarranty?.registrationNumber || ""}`}
        size="lg"
      >
        {selectedWarranty && (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${selectedWarranty.status === "Active" ? "bg-green-50 border border-green-200" :
                selectedWarranty.status === "Expired" ? "bg-red-50 border border-red-200" :
                  selectedWarranty.status === "Void" ? "bg-gray-50 border border-gray-200" :
                    "bg-yellow-50 border border-yellow-200"
              }`}>
              {selectedWarranty.status === "Active" ? (
                <CheckCircle size={24} className="text-green-600" />
              ) : selectedWarranty.status === "Expired" ? (
                <XCircle size={24} className="text-red-600" />
              ) : (
                <AlertCircle size={24} className="text-yellow-600" />
              )}
              <div>
                <div className={`font-semibold ${selectedWarranty.status === "Active" ? "text-green-700" :
                    selectedWarranty.status === "Expired" ? "text-red-700" :
                      selectedWarranty.status === "Void" ? "text-gray-700" :
                        "text-yellow-700"
                  }`}>
                  Warranty {selectedWarranty.status}
                </div>
                {selectedWarranty.status === "Active" && (
                  <div className="text-sm text-green-600">
                    {calculateDaysRemaining(selectedWarranty.endDate)} days remaining
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package size={18} className="text-blue-600" />
                <h4 className="font-semibold text-gray-900">Product Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Product Name</div>
                  <div className="font-medium text-gray-900">{selectedWarranty.productName}</div>
                </div>
                <div>
                  <div className="text-gray-500">Serial/IMEI</div>
                  <div className="font-medium text-gray-900 font-mono">{selectedWarranty.serialNumber}</div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User size={18} className="text-blue-600" />
                <h4 className="font-semibold text-gray-900">Customer Information</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">{selectedWarranty.customerName}</div>
                </div>
                <div>
                  <div className="text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">{selectedWarranty.customerPhone}</div>
                </div>
                {selectedWarranty.customerEmail && (
                  <div className="col-span-2">
                    <div className="text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{selectedWarranty.customerEmail}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Warranty Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={18} className="text-blue-600" />
                <h4 className="font-semibold text-gray-900">Warranty Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Warranty Type</div>
                  <div className="font-medium text-gray-900">{formatWarrantyType(selectedWarranty.warrantyType)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Duration</div>
                  <div className="font-medium text-gray-900">{selectedWarranty.durationMonths} months</div>
                </div>
                <div>
                  <div className="text-gray-500">Start Date</div>
                  <div className="font-medium text-gray-900">{selectedWarranty.startDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">End Date</div>
                  <div className="font-medium text-gray-900">{selectedWarranty.endDate.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Source</div>
                  <div className="font-medium text-gray-900">{selectedWarranty.sourceType}</div>
                </div>
                {selectedWarranty.createdBy && (
                  <div>
                    <div className="text-gray-500">Created By</div>
                    <div className="font-medium text-gray-900">{selectedWarranty.createdBy}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Claims History */}
            {selectedWarranty.claims.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Claims History ({selectedWarranty.claims.length})</h4>
                </div>
                <div className="space-y-3">
                  {selectedWarranty.claims.map((claim) => (
                    <div key={claim.id} className="bg-white rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{claim.claimNumber}</div>
                        <span className={`px-2 py-1 rounded-full text-xs ${claim.resolution === "REPAIR" ? "bg-blue-100 text-blue-700" :
                            claim.resolution === "REPLACE" ? "bg-purple-100 text-purple-700" :
                              claim.resolution === "REFUND" ? "bg-green-100 text-green-700" :
                                claim.resolution === "REJECTED" ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                          }`}>
                          {claim.resolution || "Pending"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{claim.issue}</div>
                      <div className="text-xs text-gray-500">
                        Filed: {claim.claimDate.toLocaleDateString()}
                        {claim.resolvedDate && ` • Resolved: ${claim.resolvedDate.toLocaleDateString()}`}
                        {claim.processedBy && ` • By: ${claim.processedBy}`}
                      </div>
                      {claim.notes && (
                        <div className="text-xs text-gray-500 mt-1 italic">Notes: {claim.notes}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedWarranty.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-500 text-sm mb-1">Notes</div>
                <div className="text-gray-900">{selectedWarranty.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
