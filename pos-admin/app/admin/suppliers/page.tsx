"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/lib/types";
import { Edit, Trash2, Eye, Mail, Phone, Globe, RefreshCw } from "lucide-react";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "TechWholesale Inc.",
      contactPerson: "Robert Johnson",
      email: "robert@techwholesale.com",
      phone: "+1234567894",
      address: "123 Business Park, NY",
      website: "www.techwholesale.com",
      paymentTerms: "Net 30",
      notes: "Reliable supplier for Apple products",
      createdAt: new Date("2023-05-10"),
    },
    {
      id: "2",
      name: "Mobile Parts Direct",
      contactPerson: "Sarah Lee",
      email: "sarah@mobileparts.com",
      phone: "+1234567895",
      address: "456 Industry Ave, CA",
      website: "www.mobileparts.com",
      paymentTerms: "Net 15",
      notes: "Best prices for accessories and parts",
      createdAt: new Date("2023-07-22"),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    paymentTerms: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      paymentTerms: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    setCurrentSupplier(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      website: supplier.website || "",
      paymentTerms: supplier.paymentTerms || "",
      notes: supplier.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
    }
  };

  const handleView = (supplier: Supplier) => {
    setCurrentSupplier(supplier);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    const supplier: Supplier = {
      id: currentSupplier?.id || String(suppliers.length + 1),
      ...formData,
      createdAt: currentSupplier?.createdAt || new Date(),
    };

    if (currentSupplier) {
      setSuppliers(suppliers.map((s) => (s.id === currentSupplier.id ? supplier : s)));
    } else {
      setSuppliers([...suppliers, supplier]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const columns: DataTableColumn<Supplier>[] = [
    {
      key: "name",
      label: "Supplier",
      render: (supplier) => (
        <div>
          <div className="font-medium">{supplier.name}</div>
          <div className="text-xs text-gray-500">{supplier.contactPerson}</div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (supplier) => (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <Mail size={12} className="text-gray-400" />
            {supplier.email}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Phone size={12} className="text-gray-400" />
            {supplier.phone}
          </div>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (supplier) => (
        <div className="text-sm max-w-xs truncate" title={supplier.address}>
          {supplier.address}
        </div>
      ),
    },
    {
      key: "paymentTerms",
      label: "Payment Terms",
      render: (supplier) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {supplier.paymentTerms || "-"}
        </span>
      ),
    },
    {
      key: "website",
      label: "Website",
      render: (supplier) =>
        supplier.website ? (
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <Globe size={14} />
            {supplier.website}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (supplier) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(supplier)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(supplier)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(supplier.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <PageHeader
        title={`Suppliers (${suppliers.length})`}
        description="Manage your supplier directory and relationships"
      />

      <div className="flex justify-end mb-4">
        <Button onClick={() => setSuppliers([...suppliers])} variant="secondary">
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Total Suppliers</div>
          <div className="text-2xl font-bold">{suppliers.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Active This Month</div>
          <div className="text-2xl font-bold text-green-600">
            {suppliers.length}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Payment Terms</div>
          <div className="text-sm font-medium">Net 15-30 Days</div>
        </div>
      </div>

      <DataTable
        data={filteredSuppliers}
        columns={columns}
        searchPlaceholder="Search by name, contact, email..."
        onSearch={setSearchQuery}
        onAdd={handleAdd}
        onExport={() => alert("Export functionality")}
        addButtonLabel="Add Supplier"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSupplier ? "Edit Supplier" : "Add New Supplier"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentSupplier ? "Update" : "Create"} Supplier
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Supplier Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={(e) =>
                setFormData({ ...formData, contactPerson: e.target.value })
              }
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Website"
              name="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="www.example.com"
            />
            <Input
              label="Payment Terms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={(e) =>
                setFormData({ ...formData, paymentTerms: e.target.value })
              }
              placeholder="e.g., Net 30"
            />
          </div>

          <Input
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Supplier Details"
        size="lg"
      >
        {currentSupplier && (
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
              <h3 className="text-xl font-bold mb-1">{currentSupplier.name}</h3>
              <div className="text-sm opacity-90">
                Supplier since {new Date(currentSupplier.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Contact Person</div>
                <div className="font-medium">{currentSupplier.contactPerson}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Payment Terms</div>
                <div className="font-medium">{currentSupplier.paymentTerms || "-"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Mail size={14} /> Email
                </div>
                <div className="font-medium">{currentSupplier.email}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Phone size={14} /> Phone
                </div>
                <div className="font-medium">{currentSupplier.phone}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Address</div>
              <div className="font-medium">{currentSupplier.address}</div>
            </div>

            {currentSupplier.website && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1 flex items-center gap-1">
                  <Globe size={14} /> Website
                </div>
                <a
                  href={`https://${currentSupplier.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {currentSupplier.website}
                </a>
              </div>
            )}

            {currentSupplier.notes && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1 font-medium">Notes</div>
                <div className="text-sm">{currentSupplier.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
