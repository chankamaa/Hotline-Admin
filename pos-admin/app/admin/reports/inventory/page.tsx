"use client";

import { useState, use } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  TrendingDown,
  AlertTriangle,
  Download,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface StockItem {
  id: string;
  productName: string;
  sku: string;
  category: string;
  currentStock: number;
  stockValue: number;
  reorderLevel: number;
  status: "Normal" | "Low" | "Out" | "Overstock";
}

interface StockMovement {
  id: string;
  productName: string;
  sku: string;
  date: Date;
  type: "In" | "Out";
  quantity: number;
  source: string;
  reason: string;
}

interface DeadStockItem {
  id: string;
  productName: string;
  sku: string;
  lastSaleDate: Date;
  daysWithoutSale: number;
  currentStock: number;
  stockValue: number;
  suggestedAction: string;
}

export default function InventoryReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "status" } = use(searchParams);
  const [activeTab, setActiveTab] = useState(tab);

  const stockItems: StockItem[] = [
    { id: "1", productName: "iPhone 15 Pro 256GB", sku: "IP15P-256", category: "Smartphones", currentStock: 45, stockValue: 53999.55, reorderLevel: 20, status: "Normal" },
    { id: "2", productName: "Samsung Galaxy S24 Ultra", sku: "SGS24U-512", category: "Smartphones", currentStock: 8, stockValue: 10399.92, reorderLevel: 15, status: "Low" },
    { id: "3", productName: "AirPods Pro 2nd Gen", sku: "APP2-USB", category: "Accessories", currentStock: 0, stockValue: 0, reorderLevel: 25, status: "Out" },
    { id: "4", productName: "Phone Case Generic", sku: "CASE-GEN", category: "Accessories", currentStock: 350, stockValue: 3500, reorderLevel: 50, status: "Overstock" },
  ];

  const stockMovements: StockMovement[] = [
    { id: "1", productName: "iPhone 15 Pro 256GB", sku: "IP15P-256", date: new Date("2026-01-07"), type: "Out", quantity: 5, source: "Sales", reason: "Customer purchase" },
    { id: "2", productName: "Samsung Galaxy S24 Ultra", sku: "SGS24U-512", date: new Date("2026-01-07"), type: "In", quantity: 20, source: "Purchase Order #PO-001", reason: "Stock replenishment" },
    { id: "3", productName: "AirPods Pro 2nd Gen", sku: "APP2-USB", date: new Date("2026-01-06"), type: "Out", quantity: 3, source: "Returns", reason: "Customer return to supplier" },
    { id: "4", productName: "Phone Case Generic", sku: "CASE-GEN", date: new Date("2026-01-06"), type: "In", quantity: 100, source: "Purchase Order #PO-002", reason: "New stock" },
  ];

  const deadStockItems: DeadStockItem[] = [
    { id: "1", productName: "iPhone 12 64GB", sku: "IP12-64", lastSaleDate: new Date("2025-10-15"), daysWithoutSale: 84, currentStock: 12, stockValue: 7199.88, suggestedAction: "Discount 20%" },
    { id: "2", productName: "Old Phone Case Model", sku: "CASE-OLD", lastSaleDate: new Date("2025-09-01"), daysWithoutSale: 128, currentStock: 45, stockValue: 450, suggestedAction: "Liquidate" },
    { id: "3", productName: "Discontinued Charger", sku: "CHRG-DISC", lastSaleDate: new Date("2025-11-20"), daysWithoutSale: 48, currentStock: 8, stockValue: 160, suggestedAction: "Return to supplier" },
  ];

  const stockColumns: DataTableColumn<StockItem>[] = [
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.productName}</div>
          <div className="text-xs text-gray-500">{item.sku}</div>
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (item) => <div className="text-black">{item.category}</div>
    },
    {
      key: "currentStock",
      label: "Current Stock",
      render: (item) => <div className="text-black font-semibold">{item.currentStock}</div>
    },
    {
      key: "stockValue",
      label: "Stock Value",
      render: (item) => <div className="text-black">{item.stockValue.toFixed(2)}</div>
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.status === "Normal" ? "bg-green-100 text-green-700" :
          item.status === "Low" ? "bg-yellow-100 text-yellow-700" :
          item.status === "Out" ? "bg-red-100 text-red-700" :
          "bg-purple-100 text-purple-700"
        }`}>
          {item.status}
        </span>
      )
    },
  ];

  const movementColumns: DataTableColumn<StockMovement>[] = [
    {
      key: "date",
      label: "Date",
      render: (item) => <div className="text-black">{new Date(item.date).toLocaleDateString()}</div>
    },
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.productName}</div>
          <div className="text-xs text-gray-500">{item.sku}</div>
        </div>
      )
    },
    {
      key: "type",
      label: "Movement",
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.type === "In" ? (
            <>
              <ArrowUp size={16} className="text-green-600" />
              <span className="text-green-600 font-semibold">In</span>
            </>
          ) : (
            <>
              <ArrowDown size={16} className="text-red-600" />
              <span className="text-red-600 font-semibold">Out</span>
            </>
          )}
        </div>
      )
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (item) => <div className="text-black font-semibold">{item.quantity}</div>
    },
    {
      key: "source",
      label: "Source",
      render: (item) => <div className="text-black">{item.source}</div>
    },
    {
      key: "reason",
      label: "Reason",
      render: (item) => <div className="text-black text-sm">{item.reason}</div>
    },
  ];

  const deadStockColumns: DataTableColumn<DeadStockItem>[] = [
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.productName}</div>
          <div className="text-xs text-gray-500">{item.sku}</div>
        </div>
      )
    },
    {
      key: "lastSale",
      label: "Last Sale",
      render: (item) => <div className="text-black">{new Date(item.lastSaleDate).toLocaleDateString()}</div>
    },
    {
      key: "daysWithoutSale",
      label: "Days Without Sale",
      render: (item) => <div className="text-red-600 font-semibold">{item.daysWithoutSale}</div>
    },
    {
      key: "stock",
      label: "Current Stock",
      render: (item) => <div className="text-black">{item.currentStock}</div>
    },
    {
      key: "value",
      label: "Stock Value",
      render: (item) => <div className="text-black">{item.stockValue.toFixed(2)}</div>
    },
    {
      key: "action",
      label: "Suggested Action",
      render: (item) => (
        <span className="px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-semibold">
          {item.suggestedAction}
        </span>
      )
    },
  ];

  const stockStats = {
    totalProducts: stockItems.length,
    totalValue: stockItems.reduce((sum, item) => sum + item.stockValue, 0),
    lowStock: stockItems.filter(i => i.status === "Low").length,
    outOfStock: stockItems.filter(i => i.status === "Out").length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Inventory Reports"
        description="Track stock levels, movements, and dead stock"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("status")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "status"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Stock Status
        </button>
        <button
          onClick={() => setActiveTab("movement")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "movement"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Stock Movement
        </button>
        <button
          onClick={() => setActiveTab("dead")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "dead"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Dead Stock
        </button>
      </div>

      {/* STOCK STATUS TAB */}
      {activeTab === "status" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Total Products</div>
              <div className="text-2xl font-bold text-black">{stockStats.totalProducts}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Total Stock Value</div>
              <div className="text-2xl font-bold text-black">{stockStats.totalValue.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Low Stock Items</div>
              <div className="text-2xl font-bold text-yellow-600">{stockStats.lowStock}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</div>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Current Stock Levels</h3>
              <Button>
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
            <DataTable
              data={stockItems}
              columns={stockColumns}
              searchPlaceholder="Search products..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* STOCK MOVEMENT TAB */}
      {activeTab === "movement" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Stock Movement History</h3>
              <Button>
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
            <DataTable
              data={stockMovements}
              columns={movementColumns}
              searchPlaceholder="Search movements..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* DEAD STOCK TAB */}
      {activeTab === "dead" && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <div className="font-semibold text-black">Dead Stock Alert</div>
              <div className="text-sm text-black">
                {deadStockItems.length} products have not sold in 30+ days. Consider taking action to free up capital.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Dead Stock Analysis</h3>
              <Button>
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
            <DataTable
              data={deadStockItems}
              columns={deadStockColumns}
              searchPlaceholder="Search dead stock..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
}
