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
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
}

interface SalePayment {
  method: "CASH" | "CARD" | "MOBILE" | "OTHER";
  amount: number;
  reference?: string;
  paidAt: string;
}

interface Sale {
  _id: string;
  saleNumber: string;
  items: SaleItem[];
  payments: SalePayment[];
  subtotal: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  changeGiven: number;
  status: "PENDING" | "COMPLETED" | "VOIDED";
  notes?: string;
  createdBy: {
    _id: string;
    username: string;
  };
  voidedBy?: {
    _id: string;
    username: string;
  };
  voidedAt?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
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
      const res = await getSales({ limit: 50 }) as any;
      if (res.data?.data?.sales) {
        setSales(res.data.data.sales);
      }
    } catch (error) {
      console.error("Failed to load sales:", error);
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
    try {
      const res = await getSaleById(saleId) as any;
      if (res.data?.data?.sale) {
        setViewSale(res.data.data.sale);
        setIsViewOpen(true);
      }
    } catch (error) {
      console.error("Failed to load sale details:", error);
      alert("Failed to load sale details");
    }
  };

  const handleVoid = async (saleId: string) => {
    const reason = prompt("Reason for voiding this sale?");
    if (!reason) return;

    try {
      await voidSale(saleId, reason);
      alert("Sale voided successfully");
      loadSales();
    } catch (error) {
      console.error("Failed to void sale:", error);
      alert("Failed to void sale");
    }
  };

  const handleCreateSale = async () => {
    try {
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

      alert("Sale created successfully");
      setIsCreateOpen(false);
      setItems([{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }]);
      loadSales();
    } catch (error) {
      console.error("Failed to create sale:", error);
      alert("Failed to create sale. Please check the details and try again.");
    }
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
      render: (s) => {
        const totalQty = s.items.reduce((sum, item) => sum + item.quantity, 0);
        return `${s.items.length} item(s) / ${totalQty} units`;
      },
    },
    {
      key: "grandTotal",
      label: "Total",
      render: (s) => (
        <span className="font-semibold">Rs. {s.grandTotal.toFixed(2)}</span>
      ),
    },
    {
      key: "createdBy",
      label: "Cashier",
      render: (s) => s.createdBy?.username || "N/A",
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
              name={`productId-${idx}`}
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
              name={`quantity-${idx}`}
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
              name={`unitPrice-${idx}`}
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
            <div className="text-sm text-gray-600">
              <div>Date: {new Date(viewSale.createdAt).toLocaleString()}</div>
              <div>Cashier: {viewSale.createdBy?.username || "N/A"}</div>
              <div>Status: <span className={`font-semibold ${viewSale.status === "COMPLETED" ? "text-green-600" : "text-red-600"}`}>{viewSale.status}</span></div>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-semibold mb-2">Items</h4>
              {viewSale.items.map((i, idx) => (
                <div key={idx} className="flex justify-between mb-1">
                  <span>
                    {i.productName} (×{i.quantity})
                    {i.discount > 0 && <span className="text-xs text-red-600 ml-1">-Rs.{i.discount}</span>}
                  </span>
                  <span>Rs. {i.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rs. {viewSale.subtotal.toFixed(2)}</span>
              </div>
              {viewSale.discountTotal > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({viewSale.discountType}):</span>
                  <span>-Rs. {viewSale.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>Rs. {viewSale.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Grand Total:</span>
                <span>Rs. {viewSale.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {viewSale.payments && viewSale.payments.length > 0 && (
              <div className="border-t pt-2">
                <h4 className="font-semibold mb-2">Payments</h4>
                {viewSale.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{p.method}</span>
                    <span>Rs. {p.amount.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm mt-1">
                  <span>Amount Paid:</span>
                  <span>Rs. {viewSale.amountPaid.toFixed(2)}</span>
                </div>
                {viewSale.changeGiven > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Change Given:</span>
                    <span>Rs. {viewSale.changeGiven.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {viewSale.status === "VOIDED" && viewSale.voidReason && (
              <div className="border-t pt-2 text-sm">
                <div className="text-red-600 font-semibold">VOIDED</div>
                <div className="text-gray-600">Reason: {viewSale.voidReason}</div>
                <div className="text-gray-600">By: {viewSale.voidedBy?.username || "N/A"}</div>
                <div className="text-gray-600">At: {viewSale.voidedAt ? new Date(viewSale.voidedAt).toLocaleString() : "N/A"}</div>
              </div>
            )}

            {viewSale.notes && (
              <div className="border-t pt-2 text-sm">
                <div className="font-semibold">Notes:</div>
                <div className="text-gray-600">{viewSale.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
