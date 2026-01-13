"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Calendar,
  User,
} from "lucide-react";

/* --------------------------------------------------
   Backend adjustment types (inline – no type file)
-------------------------------------------------- */
const ADJUSTMENT_TYPES = [
  "ADDITION",
  "REDUCTION",
  "PURCHASE",
  "SALE",
  "RETURN",
  "DAMAGE",
  "THEFT",
  "CORRECTION",
  "TRANSFER_IN",
  "TRANSFER_OUT",
] as const;

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function StockAdjustmentPage() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);

  const [form, setForm] = useState({
    productName: "",
    sku: "",
    type: "ADDITION",
    quantity: 0,
    previousQuantity: 0,
    reason: "",
    reference: "",
    referenceType: "Manual",
  });

  /* --------------------------------------------------
     Create (local simulation)
  -------------------------------------------------- */
  const handleCreate = () => {
    const isIncrease = ["ADDITION", "PURCHASE", "RETURN", "TRANSFER_IN"].includes(form.type);

    const newQuantity = isIncrease
      ? form.previousQuantity + form.quantity
      : form.previousQuantity - form.quantity;

    const newAdjustment = {
      _id: String(Date.now()),
      product: {
        name: form.productName,
        sku: form.sku,
      },
      type: form.type,
      quantity: form.quantity,
      previousQuantity: form.previousQuantity,
      newQuantity,
      reason: form.reason || undefined,
      reference: form.reference || undefined,
      referenceType: form.referenceType,
      createdBy: {
        username: "current.user",
      },
      createdAt: new Date().toISOString(),
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setIsModalOpen(false);
  };

  /* --------------------------------------------------
     Table columns
  -------------------------------------------------- */
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (a: any) => new Date(a.createdAt).toLocaleString(),
    },
    {
      key: "product",
      label: "Product",
      render: (a: any) => (
        <div>
          <div className="font-medium">{a.product.name}</div>
          <div className="text-xs text-gray-500">{a.product.sku}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (a: any) => (
        <div className="flex items-center gap-2">
          {a.newQuantity > a.previousQuantity ? (
            <TrendingUp size={16} className="text-green-600" />
          ) : (
            <TrendingDown size={16} className="text-red-600" />
          )}
          <span>{a.type}</span>
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (a: any) => (
        <div>
          <div className="font-bold">
            {a.newQuantity > a.previousQuantity ? "+" : "-"}
            {a.quantity}
          </div>
          <div className="text-xs text-gray-500">
            {a.previousQuantity} → {a.newQuantity}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      label: "Adjusted By",
      render: (a: any) => (
        <div className="flex items-center gap-1">
          <User size={14} />
          {a.createdBy.username}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (a: any) => (
        <Button size="sm" variant="outline" onClick={() => setViewing(a)}>
          <Eye size={14} />
        </Button>
      ),
    },
  ];

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6 text-gray-700">
      <PageHeader
        title="Stock Adjustments"
        description="Inventory adjustment audit trail"
      />

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          New Adjustment
        </Button>
      </div>

      <DataTable data={adjustments} columns={columns} />

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Stock Adjustment"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={form.productName}
            onChange={(e) =>
              setForm({ ...form, productName: e.target.value })
            }
          />

          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) =>
              setForm({ ...form, sku: e.target.value })
            }
          />

          <Input
            label="Previous Quantity"
            type="number"
            value={form.previousQuantity}
            onChange={(e) =>
              setForm({ ...form, previousQuantity: Number(e.target.value) })
            }
          />

          <Input
            label="Adjustment Type"
            type="select"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
            options={ADJUSTMENT_TYPES.map((t) => ({
              value: t,
              label: t,
            }))}
          />

          <Input
            label="Quantity"
            type="number"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: Number(e.target.value) })
            }
          />

          <Input
            label="Reason"
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />

          <Input
            label="Reference"
            value={form.reference}
            onChange={(e) =>
              setForm({ ...form, reference: e.target.value })
            }
          />

          <Button onClick={handleCreate} className="w-full">
            Save Adjustment
          </Button>
        </div>
      </Modal>

      {/* View Modal */}
      {viewing && (
        <Modal
          isOpen={true}
          onClose={() => setViewing(null)}
          title="Adjustment Details"
        >
          <div className="space-y-2">
            <div><strong>Product:</strong> {viewing.product.name}</div>
            <div><strong>Type:</strong> {viewing.type}</div>
            <div><strong>Quantity:</strong> {viewing.quantity}</div>
            <div><strong>Adjusted By:</strong> {viewing.createdBy.username}</div>
            <div>
              <strong>Date:</strong>{" "}
              {new Date(viewing.createdAt).toLocaleString()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
