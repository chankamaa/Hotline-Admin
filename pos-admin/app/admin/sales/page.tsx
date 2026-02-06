"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
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
  Download,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Tag,
  Calendar,
  RefreshCw,
  Percent,
} from "lucide-react";
import Link from "next/link";

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
  const [timeFilter, setTimeFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProfit: 0,
    totalCost: 0,
    totalSellingPrice: 0,
    totalDiscounts: 0,
  });

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
      const salesData = (res as any)?.data?.data?.sales || (res as any)?.data?.sales || [];
      setSales(salesData);
      
      // Calculate stats from filtered sales data
      const filteredByTime = filterSalesByTime(salesData);
      const completedSales = filteredByTime.filter((sale: Sale) => sale.status === 'COMPLETED');
      const totalSales = completedSales.reduce((sum: number, sale: Sale) => sum + sale.grandTotal, 0);
      const totalCost = completedSales.reduce((sum: number, sale: Sale) => {
        return sum + sale.items.reduce((itemSum, item) => {
          // Assume cost is 70% of selling price if not available
          const costPrice = item.unitPrice * 0.7;
          return itemSum + (costPrice * item.quantity);
        }, 0);
      }, 0);
      const totalSellingPrice = completedSales.reduce((sum: number, sale: Sale) => {
        return sum + sale.items.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0);
      }, 0);
      const totalDiscounts = completedSales.reduce((sum: number, sale: Sale) => sum + (sale.discountTotal || 0), 0);
      const totalProfit = totalSellingPrice - (totalCost + totalDiscounts);
      
      setStats({
        totalSales,
        totalProfit,
        totalCost,
        totalSellingPrice,
        totalDiscounts,
      });
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

  // Recalculate stats when time filter changes
  useEffect(() => {
    if (sales.length > 0) {
      const filteredByTime = filterSalesByTime(sales);
      const completedSales = filteredByTime.filter((sale: Sale) => sale.status === 'COMPLETED');
      const totalSales = completedSales.reduce((sum: number, sale: Sale) => sum + sale.grandTotal, 0);
      const totalCost = completedSales.reduce((sum: number, sale: Sale) => {
        return sum + sale.items.reduce((itemSum, item) => {
          const costPrice = item.unitPrice * 0.7;
          return itemSum + (costPrice * item.quantity);
        }, 0);
      }, 0);
      const totalSellingPrice = completedSales.reduce((sum: number, sale: Sale) => {
        return sum + sale.items.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0);
      }, 0);
      const totalDiscounts = completedSales.reduce((sum: number, sale: Sale) => sum + (sale.discountTotal || 0), 0);
      const totalProfit = totalSellingPrice - (totalCost + totalDiscounts);
      
      setStats({
        totalSales,
        totalProfit,
        totalCost,
        totalSellingPrice,
        totalDiscounts,
      });
    }
  }, [timeFilter, sales, customStartDate, customEndDate]);

  /* ======================================================
     HELPER: Filter by Time Period
  ===================================================== */
  
  const filterSalesByTime = (salesList: Sale[]) => {
    const now = new Date();
    
    if (timeFilter === 'all') return salesList;
    
    return salesList.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      
      if (timeFilter === 'daily') {
        // Today only
        return (
          saleDate.getDate() === now.getDate() &&
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }
      
      if (timeFilter === 'weekly') {
        // Last 7 days
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return saleDate >= weekAgo;
      }
      
      if (timeFilter === 'monthly') {
        // Current month
        return (
          saleDate.getMonth() === now.getMonth() &&
          saleDate.getFullYear() === now.getFullYear()
        );
      }
      
      if (timeFilter === 'custom') {
        // Custom date range
        if (!customStartDate && !customEndDate) return true;
        
        const start = customStartDate ? new Date(customStartDate) : null;
        const end = customEndDate ? new Date(customEndDate) : null;
        
        // Set end date to end of day
        if (end) {
          end.setHours(23, 59, 59, 999);
        }
        
        if (start && end) {
          return saleDate >= start && saleDate <= end;
        } else if (start) {
          return saleDate >= start;
        } else if (end) {
          return saleDate <= end;
        }
      }
      
      return true;
    });
  };

  /* ======================================================
     SEARCH & FILTER
  ===================================================== */

  const filteredSales = filterSalesByTime(sales).filter((sale) => {
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
      const saleData = (res as any)?.data?.data?.sale || (res as any)?.data?.sale;
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

      {/* Time Filter Buttons */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTimeFilter('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeFilter('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Custom
            </button>
          </div>
        </div>
        
        {/* Custom Date Range Inputs */}
        {timeFilter === 'custom' && (
          <div className="flex items-center gap-3 ml-7 bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">From:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300  text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">To:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300  text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <StatsCard
          title="Total Sales"
          value={stats.totalSales.toFixed(2)}
          icon={<ShoppingCart size={20} />}
        />
        <StatsCard
          title="Total Profit"
          value={Math.abs(stats.totalProfit).toFixed(2)}
          icon={<TrendingUp size={20} />}
        />
        <StatsCard
          title="Cost Price"
          value={stats.totalCost.toFixed(2)}
          icon={<Tag size={20} />}
        />
        <StatsCard
          title="Selling Price"
          value={stats.totalSellingPrice.toFixed(2)}
          icon={<DollarSign size={20} />}
        />
        <StatsCard
          title="Total Discounts"
          value={stats.totalDiscounts.toFixed(2)}
          icon={<Percent size={20} />}
        />
      </div>

      <div className="flex justify-end gap-2 mb-4">
        <Button
          onClick={loadSales}
          disabled={loading}
          variant="danger"
        >
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Link href="/admin/sales/export">
          <Button variant="secondary">
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
        </Link>
      </div>

      <DataTable
        data={filteredSales}
        columns={columns}
        onSearch={handleSearch}
        searchPlaceholder="Search by invoice, customer, product..."
        onAdd={() => setIsCreateOpen(true)}
        addButtonLabel="New Sale"
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
