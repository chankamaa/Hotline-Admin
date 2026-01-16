"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createSale,
  getSales,
  getSaleById,
  voidSale,
} from "@/lib/api/sale.api";
import {
  Eye,
  Printer,
  Plus,
  Trash2,
  Minus,
} from "lucide-react";

/* ======================================================
   TYPES (Backend-aligned)
====================================================== */

interface SaleItem {
  product: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Sale {
  _id: string;
  saleNumber: string;
  items: SaleItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: "COMPLETED" | "VOIDED";
  createdAt: string;
}

/* ======================================================
   PAGE
====================================================== */

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  /* ---------------- Create Sale State ---------------- */

  const [items, setItems] = useState([
    { productId: "", quantity: 1, unitPrice: 0, discount: 0 },
  ]);

  /* ======================================================
     DATA FETCH
  ===================================================== */

  const loadSales = async () => {
    setLoading(true);
    try {
      const res = await getSales({ limit: 50 });
      setSales(res.data.data.sales);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  /* ======================================================
     HANDLERS
  ===================================================== */

  const handleView = async (saleId: string) => {
    const res = await getSaleById(saleId);
    setViewSale(res.data.data.sale);
    setIsViewOpen(true);
  };

  const handleVoid = async (saleId: string) => {
    const reason = prompt("Reason for voiding this sale?");
    if (!reason) return;

    await voidSale(saleId, reason);
    loadSales();
  };

  const handleCreateSale = async () => {
    await createSale({
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discount: i.discount,
      })),
      payments: [
        {
          method: "CASH",
          amount: items.reduce(
            (sum, i) => sum + i.quantity * i.unitPrice - i.discount,
            0
          ),
        },
      ],
    });

    setIsCreateOpen(false);
    setItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
    loadSales();
  };

  /* ======================================================
     TABLE COLUMNS
  ===================================================== */

  const columns: DataTableColumn<Sale>[] = [
    {
      key: "saleNumber",
      label: "Invoice",
      render: (s) => <span className="font-medium">{s.saleNumber}</span>,
    },
    {
      key: "items",
      label: "Items",
      render: (s) => `${s.items.length} item(s)`,
    },
    {
      key: "grandTotal",
      label: "Total",
      render: (s) => (
        <span className="font-semibold">Rs. {s.grandTotal.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (s) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            s.status === "COMPLETED"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {s.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (s) => new Date(s.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <div className="flex gap-2">
          <button onClick={() => handleView(s._id)}>
            <Eye size={16} />
          </button>
          {s.status === "COMPLETED" && (
            <button
              onClick={() => handleVoid(s._id)}
              className="text-red-600"
            >
              <Trash2 size={16} />
            </button>
          )}
          <Printer size={16} />
        </div>
      ),
    },
  ];

  /* ======================================================
     RENDER
  ===================================================== */

  return (
    <div className="p-6">
      <PageHeader
        title="Sales"
        description="Manage all sales transactions"
      />

      <DataTable
        data={sales}
        columns={columns}
        loading={loading}
        onAdd={() => setIsCreateOpen(true)}
        addButtonLabel="New Sale"
      />

      {/* ================= Create Sale Modal ================= */}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Sale"
        footer={
          <Button onClick={handleCreateSale}>Create Sale</Button>
        }
      >
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-4 gap-2 mb-2">
            <Input
              placeholder="Product ID"
              value={item.productId}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i, index) =>
                    index === idx
                      ? { ...i, productId: e.target.value }
                      : i
                  )
                )
              }
            />
            <Input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i, index) =>
                    index === idx
                      ? { ...i, quantity: Number(e.target.value) }
                      : i
                  )
                )
              }
            />
            <Input
              type="number"
              placeholder="Price"
              value={item.unitPrice}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((i, index) =>
                    index === idx
                      ? { ...i, unitPrice: Number(e.target.value) }
                      : i
                  )
                )
              }
            />
            <Button
              variant="secondary"
              onClick={() =>
                setItems((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              <Minus size={16} />
            </Button>
          </div>
        ))}

        <Button
          variant="secondary"
          onClick={() =>
            setItems((prev) => [
              ...prev,
              { productId: "", quantity: 1, unitPrice: 0, discount: 0 },
            ])
          }
        >
          <Plus size={16} /> Add Item
        </Button>
      </Modal>

      {/* ================= View Sale Modal ================= */}

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Invoice ${viewSale?.saleNumber}`}
      >
        {viewSale && (
          <div className="space-y-3">
            {viewSale.items.map((i, idx) => (
              <div key={idx} className="flex justify-between">
                <span>
                  {i.productName} × {i.quantity}
                </span>
                <span>Rs. {i.total.toFixed(2)}</span>
              </div>
            ))}

            <div className="border-t pt-2 font-semibold">
              Total: Rs. {viewSale.grandTotal.toFixed(2)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
