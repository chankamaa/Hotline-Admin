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
  serialNumber?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  discount: number;
  total: number;
}

interface SalePayment {
  method: "CASH" | "CARD" | "MOBILE" | "OTHER";
  amount: number;
  reference?: string;
}

interface Sale {
  _id: string;
  saleNumber: string;
  items: SaleItem[];
  payments?: SalePayment[];
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  grandTotal: number;
  amountPaid?: number;
  changeGiven?: number;
  status: "COMPLETED" | "VOIDED";
  voidReason?: string;
  notes?: string;
  createdAt: string;
  createdBy?: {
    _id: string;
    username: string;
  };
}

/* ======================================================
   PAGE
====================================================== */

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
      // Handle different response structures
      const salesData = res?.data?.data?.sales || res?.data?.sales || [];
      setSales(salesData);
    } catch (error: any) {
      console.error("Error loading sales:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  /* ======================================================
     SEARCH & FILTER
  ===================================================== */

  const filteredSales = sales.filter((sale) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search by sale number
    if (sale.saleNumber.toLowerCase().includes(query)) return true;
    
    // Search by customer name
    if (sale.customer?.name?.toLowerCase().includes(query)) return true;
    
    // Search by customer phone
    if (sale.customer?.phone?.toLowerCase().includes(query)) return true;
    
    // Search by product names
    if (sale.items.some(item => item.productName.toLowerCase().includes(query))) return true;
    
    // Search by cashier name
    if (sale.createdBy?.username?.toLowerCase().includes(query)) return true;
    
    return false;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  /* ======================================================
     HANDLERS
  ===================================================== */

  const handleView = async (saleId: string) => {
    try {
      const res = await getSaleById(saleId);
      const saleData = res?.data?.data?.sale || res?.data?.sale;
      if (saleData) {
        setViewSale(saleData);
        setIsViewOpen(true);
      } else {
        alert("Sale not found");
      }
    } catch (error: any) {
      alert(error.message || "Failed to load sale details");
    }
  };

  const handleVoid = async (saleId: string) => {
    const reason = prompt("Reason for voiding this sale?");
    if (!reason) return;

    try {
      await voidSale(saleId, reason);
      loadSales();
    } catch (error: any) {
      alert(error.message || "Failed to void sale");
    }
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
      label: "Invoice #",
      render: (s) => (
        <div>
          <div className="font-medium">{s.saleNumber}</div>
          {s.customer?.name && (
            <div className="text-xs text-gray-500">{s.customer.name}</div>
          )}
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (s) => (
        <div>
          <div>{s.items.length} item(s)</div>
          <div className="text-xs text-gray-500">
            {s.items.slice(0, 2).map(i => i.productName).join(", ")}
            {s.items.length > 2 && "..."}
          </div>
        </div>
      ),
    },
    {
      key: "grandTotal",
      label: "Total",
      render: (s) => (
        <div>
          <div className="font-semibold">Rs. {s.grandTotal.toFixed(2)}</div>
          {s.discountTotal > 0 && (
            <div className="text-xs text-gray-500">
              Disc: Rs. {s.discountTotal.toFixed(2)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "payment",
      label: "Payment",
      render: (s) => (
        <div className="text-sm">
          {s.payments && s.payments.length > 0 ? (
            <div>
              {s.payments[0].method}
              {s.payments.length > 1 && (
                <span className="text-xs text-gray-500"> +{s.payments.length - 1}</span>
              )}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (s) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
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
      label: "Date & Time",
      render: (s) => (
        <div className="text-sm">
          <div>{new Date(s.createdAt).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">
            {new Date(s.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (s) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleView(s._id)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {s.status === "COMPLETED" && (
            <button
              onClick={() => handleVoid(s._id)}
              className="p-1 hover:bg-red-50 text-red-600 rounded"
              title="Void Sale"
            >
              <Trash2 size={16} />
            </button>
          )}
          <button 
            className="p-1 hover:bg-gray-100 rounded"
            title="Print Receipt"
          >
            <Printer size={16} />
          </button>
        </div>
      ),
    },
  ];

  /* ======================================================
     RENDER
  ===================================================== */

  return (
    <div className="p-6" >
      <PageHeader
        title="Sales"
        description="Manage all sales transactions"
      />

      <DataTable
        data={filteredSales}
        columns={columns}
        loading={loading}
        onSearch={handleSearch}
        searchPlaceholder="Search by invoice, customer, product..."
        onAdd={() => setIsCreateOpen(true)}
        addButtonLabel="New Sale"
        className="mt-6 text-gray-900"
      />


     
      {/* ================= View Sale Modal ================= */}

      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={`Invoice ${viewSale?.saleNumber || ""}`}
      >
        {viewSale && (
          <div className="space-y-4  text-gray-900">
            {/* Customer Info */}
            {viewSale.customer && (viewSale.customer.name || viewSale.customer.phone) && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Customer</h4>
                <div className="text-sm space-y-1">
                  {viewSale.customer.name && <div>{viewSale.customer.name}</div>}
                  {viewSale.customer.phone && <div>{viewSale.customer.phone}</div>}
                  {viewSale.customer.email && <div className="text-gray-600">{viewSale.customer.email}</div>}
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <h4 className="font-semibold text-sm mb-2">Items</h4>
              <div className="space-y-2">
                {viewSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-2 border-b last:border-0">
                    <div className="flex-1">
                      <div className="font-medium">{item.productName}</div>
                      {item.sku && (
                        <div className="text-xs text-gray-500">SKU: {item.sku}</div>
                      )}
                      <div className="text-sm text-gray-600">
                        {item.quantity} × Rs. {item.unitPrice.toFixed(2)}
                        {item.discount > 0 && ` - Rs. ${item.discount.toFixed(2)} disc`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Rs. {item.total.toFixed(2)}</div>
                      {item.taxAmount && item.taxAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          +Tax: Rs. {item.taxAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>Rs. {viewSale.subtotal.toFixed(2)}</span>
              </div>
              {viewSale.discountTotal > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span>- Rs. {viewSale.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>Rs. {viewSale.taxTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Grand Total:</span>
                <span>Rs. {viewSale.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payments */}
            {viewSale.payments && viewSale.payments.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Payment Methods</h4>
                <div className="space-y-1">
                  {viewSale.payments.map((payment, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>
                        {payment.method}
                        {payment.reference && ` (${payment.reference})`}
                      </span>
                      <span>Rs. {payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {viewSale.notes && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-1">Notes</h4>
                <p className="text-sm">{viewSale.notes}</p>
              </div>
            )}

            {/* Void Info */}
            {viewSale.status === "VOIDED" && viewSale.voidReason && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <h4 className="font-semibold text-sm text-red-700 mb-1">Voided</h4>
                <p className="text-sm text-red-600">{viewSale.voidReason}</p>
              </div>
            )}

            {/* Meta Info */}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div>Created: {new Date(viewSale.createdAt).toLocaleString()}</div>
              {viewSale.createdBy && <div>Cashier: {viewSale.createdBy.username}</div>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
