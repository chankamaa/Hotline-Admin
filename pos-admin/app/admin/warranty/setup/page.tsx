"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Plus } from "lucide-react";

interface WarrantySetup {
  id: string;
  productCategory: string;
  warrantyPeriod: number;
  coverageType: "Parts" | "Labor" | "Both";
  termsAndConditions: string;
  partsCoverage?: string;
  laborCoverage?: string;
  isActive: boolean;
}

export default function WarrantySetupPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WarrantySetup | null>(null);
  const [formData, setFormData] = useState({
    productCategory: "",
    warrantyPeriod: 12,
    coverageType: "Both" as "Parts" | "Labor" | "Both",
    termsAndConditions: "",
    partsCoverage: "",
    laborCoverage: "",
  });

  const [setups, setSetups] = useState<WarrantySetup[]>([
    {
      id: "1",
      productCategory: "Smartphones",
      warrantyPeriod: 12,
      coverageType: "Both",
      termsAndConditions: "Standard manufacturer warranty covers manufacturing defects",
      partsCoverage: "All parts except battery and physical damage",
      laborCoverage: "Free labor for covered repairs",
      isActive: true
    },
    {
      id: "2",
      productCategory: "Accessories",
      warrantyPeriod: 6,
      coverageType: "Parts",
      termsAndConditions: "Limited warranty on manufacturing defects only",
      partsCoverage: "Manufacturing defects only, no wear and tear",
      isActive: true
    },
    {
      id: "3",
      productCategory: "Parts & Components",
      warrantyPeriod: 3,
      coverageType: "Parts",
      termsAndConditions: "Warranty covers defective parts only",
      partsCoverage: "Defective parts replacement",
      isActive: true
    },
  ]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      productCategory: "",
      warrantyPeriod: 12,
      coverageType: "Both",
      termsAndConditions: "",
      partsCoverage: "",
      laborCoverage: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: WarrantySetup) => {
    setEditingItem(item);
    setFormData({
      productCategory: item.productCategory,
      warrantyPeriod: item.warrantyPeriod,
      coverageType: item.coverageType,
      termsAndConditions: item.termsAndConditions,
      partsCoverage: item.partsCoverage || "",
      laborCoverage: item.laborCoverage || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      // Update existing
      setSetups(setups.map(s => s.id === editingItem.id ? {
        ...s,
        ...formData
      } : s));
    } else {
      // Add new
      const newSetup: WarrantySetup = {
        id: String(setups.length + 1),
        ...formData,
        isActive: true
      };
      setSetups([...setups, newSetup]);
    }
    setIsModalOpen(false);
  };

  const columns: DataTableColumn<WarrantySetup>[] = [
    {
      key: "productCategory",
      label: "Product Category",
      render: (item) => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600" />
          <span className="font-medium text-black">{item.productCategory}</span>
        </div>
      )
    },
    {
      key: "warrantyPeriod",
      label: "Warranty Period",
      render: (item) => (
        <div className="text-black">{item.warrantyPeriod} months</div>
      )
    },
    {
      key: "coverageType",
      label: "Coverage Type",
      render: (item) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          item.coverageType === "Both" ? "bg-green-100 text-green-700" :
          item.coverageType === "Parts" ? "bg-blue-100 text-blue-700" :
          "bg-purple-100 text-purple-700"
        }`}>
          {item.coverageType}
        </span>
      )
    },
    {
      key: "partsCoverage",
      label: "Parts Coverage",
      render: (item) => (
        <div className="text-black text-sm max-w-xs truncate">
          {item.partsCoverage || "N/A"}
        </div>
      )
    },
    {
      key: "laborCoverage",
      label: "Labor Coverage",
      render: (item) => (
        <div className="text-black text-sm max-w-xs truncate">
          {item.laborCoverage || "N/A"}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
        }`}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Warranty Setup"
        description="Configure warranty policies by product category"
      />

      <div className="mb-4">
        <Button onClick={handleAdd}>
          <Plus size={16} className="mr-2" />
          Add Warranty Policy
        </Button>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <DataTable
          data={setups}
          columns={columns}
          searchPlaceholder="Search product categories..."
          onSearch={() => {}}
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Warranty Setup" : "Add Warranty Setup"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingItem ? "Update" : "Save"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product Category"
            name="productCategory"
            value={formData.productCategory}
            onChange={(e) => setFormData({ ...formData, productCategory: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Warranty Period (Months)"
              name="warrantyPeriod"
              type="number"
              value={formData.warrantyPeriod}
              onChange={(e) => setFormData({ ...formData, warrantyPeriod: Number(e.target.value) })}
              required
            />
            <Input
              label="Coverage Type"
              name="coverageType"
              type="select"
              value={formData.coverageType}
              onChange={(e) => setFormData({ ...formData, coverageType: e.target.value as any })}
              options={[
                { value: "Parts", label: "Parts Only" },
                { value: "Labor", label: "Labor Only" },
                { value: "Both", label: "Parts & Labor" }
              ]}
            />
          </div>

          <Input
            label="Terms and Conditions"
            name="termsAndConditions"
            type="textarea"
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            rows={3}
          />

          <Input
            label="Parts Coverage Details"
            name="partsCoverage"
            type="textarea"
            value={formData.partsCoverage}
            onChange={(e) => setFormData({ ...formData, partsCoverage: e.target.value })}
            placeholder="Specify what parts are covered..."
            rows={2}
          />

          {(formData.coverageType === "Labor" || formData.coverageType === "Both") && (
            <Input
              label="Labor Coverage Details"
              name="laborCoverage"
              type="textarea"
              value={formData.laborCoverage}
              onChange={(e) => setFormData({ ...formData, laborCoverage: e.target.value })}
              placeholder="Specify labor coverage terms..."
              rows={2}
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
