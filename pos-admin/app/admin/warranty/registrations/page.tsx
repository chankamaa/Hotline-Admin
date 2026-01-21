"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import { WarrantyForm } from "@/components/warranty/warranty-form";
import {
  fetchWarranties,
  searchWarrantiesByPhone,
  type Warranty,
  getWarrantyStatusColor,
  formatWarrantyDuration,
  calculateDaysRemaining,
} from "@/lib/api/warrantyApi";
import { ShieldCheck, FileText, Download, Search, Plus, RefreshCw } from "lucide-react";

export default function WarrantyRegistrationsPage() {
  const toast = useToast();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchPhone, setSearchPhone] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadWarranties();
  }, [currentPage]);

  const loadWarranties = async (status?: string) => {
    setLoading(true);
    try {
      const res = await fetchWarranties({
        status: status as any,
        page: currentPage,
        limit: 20,
      });
      setWarranties(res.data.warranties);
      setTotalPages(res.pagination.pages);
    } catch (error: any) {
      toast.error(error.message || "Failed to load warranties");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSearch = async () => {
    if (searchPhone.length < 3) {
      toast.error("Please enter at least 3 characters");
      return;
    }
    
    setLoading(true);
    try {
      const res = await searchWarrantiesByPhone(searchPhone);
      setWarranties(res.data.warranties);
      toast.success(`Found ${res.results} warranty registrations`);
    } catch (error: any) {
      toast.error(error.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (warranty: Warranty) => {
    // Implement certificate download
    toast.info(`Downloading certificate for ${warranty.warrantyNumber}`);
  };

  const getStatusBadgeClass = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      EXPIRED: "bg-red-100 text-red-700",
      CLAIMED: "bg-yellow-100 text-yellow-700",
      VOID: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getProductName = (product: Warranty["product"]) => {
    return typeof product === "string" ? "—" : product.name;
  };

  const getProductSku = (product: Warranty["product"]) => {
    return typeof product === "string" ? "" : product.sku || "";
  };
  const columns: DataTableColumn<Warranty>[] = [
    {
      key: "warrantyNumber",
      label: "Warranty #",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.warrantyNumber}</div>
          <div className="text-xs text-gray-500">{item.sourceType}</div>
        </div>
      ),
    },
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.productName}</div>
          <div className="text-xs text-gray-500">{getProductSku(item.product)}</div>
        </div>
      ),
    },
    {
      key: "serialNumber",
      label: "Serial/IMEI",
      render: (item) => (
        <div className="text-black font-mono text-xs">
          {item.serialNumber || "—"}
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (item) => (
        <div>
          <div className="text-black">{item.customer.name}</div>
          <div className="text-xs text-gray-500">{item.customer.phone}</div>
        </div>
      ),
    },
    {
      key: "warranty",
      label: "Warranty Period",
      render: (item) => (
        <div>
          <div className="text-black text-sm">
            {formatWarrantyDuration(item.durationMonths)}
          </div>
          <div className="text-xs text-gray-500">{item.warrantyType}</div>
        </div>
      ),
    },
    {
      key: "dates",
      label: "Validity",
      render: (item) => (
        <div className="text-sm">
          <div className="text-black">
            {new Date(item.startDate).toLocaleDateString()}
          </div>
          <div className="text-black">
            to {new Date(item.endDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {calculateDaysRemaining(item)} days left
          </div>
        </div>
      ),
    },
    {
      key: "claims",
      label: "Claims",
      render: (item) => (
        <div className="text-center">
          <div className="text-black font-semibold">{item.claims.length}</div>
          <div className="text-xs text-gray-500">claims</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
            item.status
          )}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownloadCertificate(item)}
          >
            <Download size={14} className="mr-1" />
            Certificate
          </Button>
        </div>
      ),
    },
  ];

  const stats = {
    total: warranties.length,
    active: warranties.filter((w) => w.status === "ACTIVE").length,
    expired: warranties.filter((w) => w.status === "EXPIRED").length,
    claimed: warranties.filter((w) => w.status === "CLAIMED").length,
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Warranty Registrations"
        description="View and manage all warranty registrations"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Total Warranties</div>
          <div className="text-2xl font-bold text-black">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Claimed</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.claimed}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Expired</div>
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mb-4 flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            label=""
            name="searchPhone"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Search by customer phone..."
          />
          <Button variant="outline" onClick={handlePhoneSearch}>
            <Search size={16} />
          </Button>
        </div>
        <Button variant="secondary" onClick={() => loadWarranties()} disabled={loading}>
          <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus size={16} className="mr-2" />
          Create Warranty
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="mb-4 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => loadWarranties()}>
          All
        </Button>
        <Button size="sm" variant="outline" onClick={() => loadWarranties("ACTIVE")}>
          Active
        </Button>
        <Button size="sm" variant="outline" onClick={() => loadWarranties("CLAIMED")}>
          Claimed
        </Button>
        <Button size="sm" variant="outline" onClick={() => loadWarranties("EXPIRED")}>
          Expired
        </Button>
      </div>

      {/* Warranties Table */}
      <div className="bg-white rounded-xl border p-4">
        <DataTable
          data={warranties}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search warranties..."
          onSearch={(q) => {
            // Implement local search if needed
          }}
        />
      </div>

      {/* Warranty Form Modal */}
      <WarrantyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          loadWarranties();
          setIsFormOpen(false);
        }}
      />
    </div>
  );
}
