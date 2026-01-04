"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StockMovement } from "@/lib/types";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, ArrowRightLeft } from "lucide-react";

export default function StockPage() {
  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: "1",
      productId: "p1",
      productName: "iPhone 15 Pro 256GB",
      type: "in",
      quantity: 10,
      toLocation: "Main Store",
      reason: "New stock received",
      reference: "PO-001",
      employeeId: "e1",
      employeeName: "Milan",
      createdAt: new Date("2024-01-04T10:00:00"),
    },
    {
      id: "2",
      productId: "p2",
      productName: "Samsung Galaxy S24",
      type: "out",
      quantity: 2,
      fromLocation: "Main Store",
      reason: "Sales",
      reference: "INV-001",
      employeeId: "e1",
      employeeName: "Milan",
      createdAt: new Date("2024-01-04T11:30:00"),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    productName: "",
    type: "in" as "in" | "out" | "adjustment" | "transfer",
    quantity: 0,
    fromLocation: "",
    toLocation: "",
    reason: "",
    reference: "",
  });

  const resetForm = () => {
    setFormData({
      productName: "",
      type: "in",
      quantity: 0,
      fromLocation: "",
      toLocation: "",
      reason: "",
      reference: "",
    });
  };

  const handleAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const movement: StockMovement = {
      id: String(movements.length + 1),
      productId: `p${movements.length + 1}`,
      productName: formData.productName,
      type: formData.type,
      quantity: formData.quantity,
      fromLocation: formData.fromLocation,
      toLocation: formData.toLocation,
      reason: formData.reason,
      reference: formData.reference,
      employeeId: "e1",
      employeeName: "Milan",
      createdAt: new Date(),
    };

    setMovements([movement, ...movements]);
    setIsModalOpen(false);
    resetForm();
  };

  const getTypeIcon = (type: StockMovement["type"]) => {
    const icons = {
      in: <ArrowDownCircle size={16} className="text-green-600" />,
      out: <ArrowUpCircle size={16} className="text-red-600" />,
      adjustment: <RefreshCw size={16} className="text-blue-600" />,
      transfer: <ArrowRightLeft size={16} className="text-purple-600" />,
    };
    return icons[type];
  };

  const getTypeColor = (type: StockMovement["type"]) => {
    const colors = {
      in: "bg-green-100 text-green-700",
      out: "bg-red-100 text-red-700",
      adjustment: "bg-blue-100 text-blue-700",
      transfer: "bg-purple-100 text-purple-700",
    };
    return colors[type];
  };

  const columns: DataTableColumn<StockMovement>[] = [
    {
      key: "type",
      label: "Type",
      render: (movement) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(movement.type)}
          <span className={`px-2 py-1 rounded-full text-xs capitalize ${getTypeColor(movement.type)}`}>
            {movement.type}
          </span>
        </div>
      ),
    },
    {
      key: "productName",
      label: "Product",
      render: (movement) => (
        <div className="font-medium">{movement.productName}</div>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (movement) => (
        <div className={`font-semibold ${movement.type === 'in' ? 'text-green-600' : movement.type === 'out' ? 'text-red-600' : 'text-blue-600'}`}>
          {movement.type === 'out' ? '-' : '+'}{movement.quantity}
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (movement) => (
        <div className="text-sm">
          {movement.fromLocation && <div>From: {movement.fromLocation}</div>}
          {movement.toLocation && <div>To: {movement.toLocation}</div>}
        </div>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (movement) => (
        <div className="text-sm max-w-xs truncate" title={movement.reason}>
          {movement.reason}
        </div>
      ),
    },
    {
      key: "reference",
      label: "Reference",
      render: (movement) => (
        <div className="text-sm text-blue-600">{movement.reference || "-"}</div>
      ),
    },
    {
      key: "employeeName",
      label: "By",
      render: (movement) => (
        <div className="text-sm">{movement.employeeName}</div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (movement) => (
        <div className="text-sm">{new Date(movement.createdAt).toLocaleString()}</div>
      ),
    },
  ];

  const filteredMovements = movements.filter(
    (movement) =>
      movement.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalIn: movements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0),
    totalOut: movements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0),
    adjustments: movements.filter((m) => m.type === "adjustment").length,
    transfers: movements.filter((m) => m.type === "transfer").length,
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Stock Management"
        description="Track inventory movements and adjustments"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <ArrowDownCircle size={16} className="text-green-600" />
            Stock In
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.totalIn}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <ArrowUpCircle size={16} className="text-red-600" />
            Stock Out
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.totalOut}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <RefreshCw size={16} className="text-blue-600" />
            Adjustments
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.adjustments}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-purple-600" />
            Transfers
          </div>
          <div className="text-2xl font-bold text-purple-600">{stats.transfers}</div>
        </div>
      </div>

      <DataTable
        data={filteredMovements}
        columns={columns}
        searchPlaceholder="Search by product, reason, reference..."
        onSearch={setSearchQuery}
        onAdd={handleAdd}
        onExport={() => alert("Export functionality")}
        addButtonLabel="Record Movement"
      />

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Stock Movement"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Record Movement</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            name="productName"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Movement Type"
              name="type"
              type="select"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              options={[
                { value: "in", label: "Stock In" },
                { value: "out", label: "Stock Out" },
                { value: "adjustment", label: "Adjustment" },
                { value: "transfer", label: "Transfer" },
              ]}
            />
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Number(e.target.value) })
              }
              required
            />
          </div>

          {(formData.type === "out" || formData.type === "transfer") && (
            <Input
              label="From Location"
              name="fromLocation"
              value={formData.fromLocation}
              onChange={(e) =>
                setFormData({ ...formData, fromLocation: e.target.value })
              }
            />
          )}

          {(formData.type === "in" || formData.type === "transfer") && (
            <Input
              label="To Location"
              name="toLocation"
              value={formData.toLocation}
              onChange={(e) =>
                setFormData({ ...formData, toLocation: e.target.value })
              }
            />
          )}

          <Input
            label="Reason"
            name="reason"
            type="textarea"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
            rows={2}
          />

          <Input
            label="Reference"
            name="reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="e.g., PO-001, INV-123"
          />
        </div>
      </Modal>
    </div>
  );
}
