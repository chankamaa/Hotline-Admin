"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  History, 
  TrendingUp, 
  TrendingDown,
  Clock,
  User,
  DollarSign
} from "lucide-react";

interface PriceChange {
  id: string;
  productName: string;
  sku: string;
  category: string;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  percentageChange: number;
  changeType: "Increase" | "Decrease";
  changedBy: string;
  changeReason: string;
  timestamp: Date;
  updateMethod: "Manual" | "Bulk Update" | "Scheduled" | "Auto-Adjustment";
}

export default function PriceHistoryPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showTimeline, setShowTimeline] = useState(false);

  const [priceHistory, setPriceHistory] = useState<PriceChange[]>([
    {
      id: "1",
      productName: "iPhone 15 Pro 256GB",
      sku: "IP15P-256",
      category: "Smartphones",
      oldPrice: 1099.99,
      newPrice: 1199.99,
      priceChange: 100.00,
      percentageChange: 9.09,
      changeType: "Increase",
      changedBy: "Admin User",
      changeReason: "New stock with higher wholesale cost",
      timestamp: new Date("2026-01-05T10:30:00"),
      updateMethod: "Manual"
    },
    {
      id: "2",
      productName: "Samsung Galaxy S24 Ultra",
      sku: "SGS24U-512",
      category: "Smartphones",
      oldPrice: 1399.99,
      newPrice: 1299.99,
      priceChange: -100.00,
      percentageChange: -7.14,
      changeType: "Decrease",
      changedBy: "Manager",
      changeReason: "Promotional discount for holiday season",
      timestamp: new Date("2026-01-03T14:20:00"),
      updateMethod: "Bulk Update"
    },
    {
      id: "3",
      productName: "AirPods Pro 2nd Gen",
      sku: "APP2-USB",
      category: "Accessories",
      oldPrice: 229.99,
      newPrice: 249.99,
      priceChange: 20.00,
      percentageChange: 8.70,
      changeType: "Increase",
      changedBy: "System",
      changeReason: "Scheduled price adjustment",
      timestamp: new Date("2026-01-02T00:00:00"),
      updateMethod: "Scheduled"
    },
    {
      id: "4",
      productName: "iPhone 14 128GB",
      sku: "IP14-128",
      category: "Smartphones",
      oldPrice: 899.99,
      newPrice: 799.99,
      priceChange: -100.00,
      percentageChange: -11.11,
      changeType: "Decrease",
      changedBy: "Manager",
      changeReason: "Clearance for new model",
      timestamp: new Date("2025-12-28T16:45:00"),
      updateMethod: "Manual"
    },
    {
      id: "5",
      productName: "Samsung Galaxy Buds 2 Pro",
      sku: "SGB2P-BK",
      category: "Accessories",
      oldPrice: 199.99,
      newPrice: 229.99,
      priceChange: 30.00,
      percentageChange: 15.00,
      changeType: "Increase",
      changedBy: "Admin User",
      changeReason: "Supplier price increase",
      timestamp: new Date("2025-12-25T09:15:00"),
      updateMethod: "Bulk Update"
    },
    {
      id: "6",
      productName: "iPhone 15 Pro 256GB",
      sku: "IP15P-256",
      category: "Smartphones",
      oldPrice: 1049.99,
      newPrice: 1099.99,
      priceChange: 50.00,
      percentageChange: 4.76,
      changeType: "Increase",
      changedBy: "System",
      changeReason: "Market price adjustment",
      timestamp: new Date("2025-12-20T00:00:00"),
      updateMethod: "Auto-Adjustment"
    },
  ]);

  const handleViewTimeline = (product: PriceChange) => {
    setSelectedProduct(product.sku);
    setShowTimeline(true);
  };

  const productTimeline = selectedProduct 
    ? priceHistory.filter(h => h.sku === selectedProduct).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];

  const columns: DataTableColumn<PriceChange>[] = [
    {
      key: "timestamp",
      label: "Date & Time",
      render: (item) => (
        <div>
          <div className="text-black font-medium">
            {new Date(item.timestamp).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(item.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )
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
      key: "category",
      label: "Category",
      render: (item) => <div className="text-black">{item.category}</div>
    },
    {
      key: "oldPrice",
      label: "Old Price",
      render: (item) => <div className="text-black">{item.oldPrice.toFixed(2)}</div>
    },
    {
      key: "newPrice",
      label: "New Price",
      render: (item) => <div className="text-black font-semibold">{item.newPrice.toFixed(2)}</div>
    },
    {
      key: "change",
      label: "Change",
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.changeType === "Increase" ? (
            <TrendingUp size={16} className="text-green-600" />
          ) : (
            <TrendingDown size={16} className="text-red-600" />
          )}
          <div className={`font-semibold ${item.changeType === "Increase" ? "text-green-600" : "text-red-600"}`}>
            {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            ({item.percentageChange > 0 ? '+' : ''}{item.percentageChange.toFixed(1)}%)
          </div>
        </div>
      )
    },
    {
      key: "changedBy",
      label: "Changed By",
      render: (item) => (
        <div>
          <div className="text-black">{item.changedBy}</div>
          <div className="text-xs text-gray-500">{item.updateMethod}</div>
        </div>
      )
    },
    {
      key: "reason",
      label: "Reason",
      render: (item) => (
        <div className="text-black text-sm max-w-xs truncate" title={item.changeReason}>
          {item.changeReason}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button size="sm" variant="outline" onClick={() => handleViewTimeline(item)}>
          <History size={14} className="mr-1" />
          Timeline
        </Button>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    totalChanges: priceHistory.length,
    increases: priceHistory.filter(h => h.changeType === "Increase").length,
    decreases: priceHistory.filter(h => h.changeType === "Decrease").length,
    avgChange: priceHistory.reduce((sum, h) => sum + Math.abs(h.priceChange), 0) / priceHistory.length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Price History"
        description="Track all price changes across products with audit trail"
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Total Changes</div>
            <History size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-black">{stats.totalChanges}</div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Price Increases</div>
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div className="text-2xl font-bold text-black">{stats.increases}</div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Price Decreases</div>
            <TrendingDown size={20} className="text-red-600" />
          </div>
          <div className="text-2xl font-bold text-black">{stats.decreases}</div>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-black">Avg Change</div>
            <DollarSign size={20} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-black">{stats.avgChange.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <h3 className="text-sm font-semibold mb-3 text-black">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <Input
            label="End Date"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-black mb-2">Update Method</label>
            <select className="w-full border rounded px-3 py-2 text-black">
              <option value="all">All Methods</option>
              <option value="manual">Manual</option>
              <option value="bulk">Bulk Update</option>
              <option value="scheduled">Scheduled</option>
              <option value="auto">Auto-Adjustment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Price History Table */}
      <div className="bg-white rounded-xl border p-4">
        <DataTable
          data={priceHistory}
          columns={columns}
          searchPlaceholder="Search by product name or SKU..."
          onSearch={() => {}}
        />
      </div>

      {/* Product Timeline Modal */}
      <Modal
        isOpen={showTimeline}
        onClose={() => {
          setShowTimeline(false);
          setSelectedProduct(null);
        }}
        title="Price Change Timeline"
        size="lg"
      >
        <div className="space-y-4">
          {productTimeline.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-black mb-2">{productTimeline[0].productName}</h4>
              <p className="text-sm text-gray-500">SKU: {productTimeline[0].sku}</p>
            </div>
          )}

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline items */}
            <div className="space-y-4">
              {productTimeline.map((change, index) => (
                <div key={change.id} className="relative pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-2 w-4 h-4 rounded-full ${
                    change.changeType === "Increase" ? "bg-green-500" : "bg-red-500"
                  }`}></div>

                  {/* Content */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-black">
                          {change.oldPrice.toFixed(2)} → {change.newPrice.toFixed(2)}
                        </div>
                        <div className={`text-sm ${change.changeType === "Increase" ? "text-green-600" : "text-red-600"}`}>
                          {change.priceChange > 0 ? '+' : ''}{change.priceChange.toFixed(2)} ({change.percentageChange > 0 ? '+' : ''}{change.percentageChange.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(change.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-black mb-1">
                      <strong>Reason:</strong> {change.changeReason}
                    </div>
                    <div className="text-xs text-gray-500">
                      Changed by {change.changedBy} via {change.updateMethod}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
