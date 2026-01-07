"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, Download, Search } from "lucide-react";

interface WarrantyRegistration {
  id: string;
  registrationNumber: string;
  productName: string;
  productCategory: string;
  serialNumber: string;
  saleId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Expired" | "Claimed";
  certificateGenerated: boolean;
  warrantyPeriod: number;
  coverageType: string;
}

export default function WarrantyRegistrationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchSerial, setSearchSerial] = useState("");
  const [formData, setFormData] = useState({
    saleId: "",
    serialNumber: "",
    productName: "",
    customerName: "",
    customerPhone: "",
  });

  const [registrations, setRegistrations] = useState<WarrantyRegistration[]>([
    {
      id: "1",
      registrationNumber: "WR-2024-001",
      productName: "iPhone 15 Pro 256GB",
      productCategory: "Smartphones",
      serialNumber: "IMEI123456789012345",
      saleId: "INV-001",
      customerId: "C001",
      customerName: "John Doe",
      customerPhone: "+1234567890",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2025-01-15"),
      status: "Active",
      certificateGenerated: true,
      warrantyPeriod: 12,
      coverageType: "Both"
    },
    {
      id: "2",
      registrationNumber: "WR-2024-002",
      productName: "Samsung Galaxy S24 Ultra",
      productCategory: "Smartphones",
      serialNumber: "IMEI987654321098765",
      saleId: "INV-002",
      customerId: "C002",
      customerName: "Jane Smith",
      customerPhone: "+1234567891",
      startDate: new Date("2024-02-20"),
      endDate: new Date("2025-02-20"),
      status: "Active",
      certificateGenerated: true,
      warrantyPeriod: 12,
      coverageType: "Both"
    },
    {
      id: "3",
      registrationNumber: "WR-2024-003",
      productName: "AirPods Pro",
      productCategory: "Accessories",
      serialNumber: "SN456789012345",
      saleId: "INV-003",
      customerId: "C003",
      customerName: "Mike Johnson",
      customerPhone: "+1234567892",
      startDate: new Date("2023-06-10"),
      endDate: new Date("2023-12-10"),
      status: "Expired",
      certificateGenerated: true,
      warrantyPeriod: 6,
      coverageType: "Parts"
    },
  ]);

  const handleActivateWarranty = () => {
    setFormData({
      saleId: "",
      serialNumber: "",
      productName: "",
      customerName: "",
      customerPhone: "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const newRegistration: WarrantyRegistration = {
      id: String(registrations.length + 1),
      registrationNumber: `WR-2024-${String(registrations.length + 1).padStart(3, '0')}`,
      productName: formData.productName,
      productCategory: "Smartphones", // Get from sale data
      serialNumber: formData.serialNumber,
      saleId: formData.saleId,
      customerId: "C-NEW",
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      status: "Active",
      certificateGenerated: false,
      warrantyPeriod: 12,
      coverageType: "Both"
    };
    setRegistrations([newRegistration, ...registrations]);
    setIsModalOpen(false);
  };

  const generateCertificate = (registration: WarrantyRegistration) => {
    alert(`Generating warranty certificate for ${registration.registrationNumber}`);
  };

  const columns: DataTableColumn<WarrantyRegistration>[] = [
    {
      key: "registrationNumber",
      label: "Registration #",
      render: (item) => (
        <div className="font-medium text-black">{item.registrationNumber}</div>
      )
    },
    {
      key: "productName",
      label: "Product",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.productName}</div>
          <div className="text-xs text-gray-500">{item.productCategory}</div>
        </div>
      )
    },
    {
      key: "serialNumber",
      label: "Serial/IMEI",
      render: (item) => (
        <div className="text-black font-mono text-xs">{item.serialNumber}</div>
      )
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
      key: "saleId",
      label: "Sale ID",
      render: (item) => (
        <div className="text-black text-sm">{item.saleId}</div>
      )
    },
    {
      key: "warranty",
      label: "Warranty Period",
      render: (item) => (
        <div>
          <div className="text-black text-sm">{item.warrantyPeriod} months</div>
          <div className="text-xs text-gray-500">{item.coverageType}</div>
        </div>
      )
    },
    {
      key: "dates",
      label: "Validity",
      render: (item) => (
        <div className="text-sm">
          <div className="text-black">Start: {new Date(item.startDate).toLocaleDateString()}</div>
          <div className="text-black">End: {new Date(item.endDate).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => generateCertificate(item)}
            disabled={!item.certificateGenerated}
          >
            <Download size={14} className="mr-1" />
            Certificate
          </Button>
        </div>
      )
    }
  ];

  const stats = {
    total: registrations.length,
    active: registrations.filter(r => r.status === "Active").length,
    expired: registrations.filter(r => r.status === "Expired").length,
    expiringNext30: registrations.filter(r => {
      const daysUntilExpiry = Math.floor((new Date(r.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Warranty Registrations"
        description="View and manage all warranty registrations linked to sales"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Total Registrations</div>
          <div className="text-2xl font-bold text-black">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Active Warranties</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Expired</div>
          <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-black mb-1">Expiring (30 Days)</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.expiringNext30}</div>
        </div>
      </div>

      {/* Search and Activate */}
      <div className="mb-4 flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            label=""
            name="searchSerial"
            value={searchSerial}
            onChange={(e) => setSearchSerial(e.target.value)}
            placeholder="Search by Serial Number/IMEI..."
          />
          <Button variant="outline">
            <Search size={16} />
          </Button>
        </div>
        <Button onClick={handleActivateWarranty}>
          <ShieldCheck size={16} className="mr-2" />
          Activate Warranty on Sale
        </Button>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border p-4">
        <DataTable
          data={registrations}
          columns={columns}
          searchPlaceholder="Search registrations..."
          onSearch={() => {}}
        />
      </div>

      {/* Activation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Activate Warranty on Sale"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Activate & Generate Certificate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Sale/Invoice ID"
            name="saleId"
            value={formData.saleId}
            onChange={(e) => setFormData({ ...formData, saleId: e.target.value })}
            placeholder="INV-001"
            required
          />
          
          <Input
            label="Serial Number / IMEI"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            placeholder="Enter serial or IMEI number"
            required
          />

          <Input
            label="Product Name"
            name="productName"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            placeholder="Auto-filled from sale"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
            <Input
              label="Customer Phone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-black">
            <strong>Note:</strong> Warranty will be activated based on the product category setup. 
            Start date will be the sale date, and end date will be calculated automatically.
          </div>
        </div>
      </Modal>
    </div>
  );
}
