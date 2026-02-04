"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { AlertTriangle, Package, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchLowStock } from "@/lib/api/inventoryApi";
import { useToast } from "@/providers/toast-provider";

interface LowStockItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku?: string;
    minStockLevel: number;
  };
  quantity: number;
  lastUpdated: string | null;
  isLowStock: boolean;
}

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  /* --------------------------------------------------
     Load low stock products
  -------------------------------------------------- */
  useEffect(() => {
    loadLowStock();
  }, []);

  const loadLowStock = async () => {
    setLoading(true);
    try {
      const response: any = await fetchLowStock();
      // Backend returns { status: "success", data: { items: [...] } }
      const items = response.data?.items || [];
      setLowStockItems(items);
    } catch (error: any) {
      toast.error(error.message || "Failed to load low stock products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     Calculate stock status
  -------------------------------------------------- */
  const getStockStatus = (item: LowStockItem) => {
    if (item.quantity === 0) return { label: "Out of Stock", color: "text-red-600 bg-red-50" };
    if (item.quantity <= item.product.minStockLevel / 2) return { label: "Critical", color: "text-orange-600 bg-orange-50" };
    return { label: "Low Stock", color: "text-yellow-600 bg-yellow-50" };
  };

  /* --------------------------------------------------
     Table columns
  -------------------------------------------------- */
  const columns: DataTableColumn<LowStockItem>[] = [
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-gray-500" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.product.name}</div>
            <div className="text-xs text-gray-500">
              SKU: {item.product.sku || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "stockLevels",
      label: "Stock Levels",
      render: (item) => {
        const status = getStockStatus(item);
        return (
          <div className="space-y-2">
            {/* Current Stock */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 w-16">Current:</div>
              <span className="text-xl font-bold text-gray-900">
                {item.quantity}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${status.color}`}>
                {status.label}
              </span>
            </div>
            {/* Min Level */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 w-16">Min Level:</div>
              <span className="text-lg font-semibold text-gray-700">
                {Number(item.product.minStockLevel) || 0}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "shortage",
      label: "Shortage",
      render: (item) => {
        const minLevel = Number(item.product.minStockLevel) || 0;
        const quantity = Number(item.quantity) || 0;
        const shortage = Math.max(0, minLevel - quantity);
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle size={16} className="text-red-500" />
            <span className="text-red-600 font-semibold">
              {shortage > 0 ? `-${shortage}` : "—"}
            </span>
          </div>
        );
      },
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      render: (item) => (
        <div className="text-sm text-gray-500">
          {item.lastUpdated
            ? new Date(item.lastUpdated).toLocaleDateString()
            : "Never"}
        </div>
      ),
    },
  ];

  /* --------------------------------------------------
     Summary Stats
  -------------------------------------------------- */
  const stats = {
    totalItems: lowStockItems.length,
    outOfStock: lowStockItems.filter(item => item.quantity === 0).length,
    critical: lowStockItems.filter(item => item.quantity > 0 && item.quantity <= item.product.minStockLevel / 2).length,
    totalShortage: lowStockItems.reduce((sum, item) => {
      const minLevel = Number(item.product.minStockLevel) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + Math.max(0, minLevel - quantity);
    }, 0),
  };

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6 space-y-6">
      <div className="mb-4">
        <Link
          href="/admin/stock"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock Overview
        </Link>
      </div>
      
      <PageHeader
        title={`Low Stock Products (${stats.totalItems})`}
        description="Products with stock levels below their minimum threshold"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Low Stock Items</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 mb-1">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600 mb-1">Critical Level</div>
          <div className="text-2xl font-bold text-orange-600">{stats.critical}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 mb-1">Total Shortage</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.totalShortage}</div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          onClick={loadLowStock}
          disabled={loading}
          variant="secondary"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {/* Low Stock Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading low stock items...</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-600">Showing {lowStockItems.length} product{lowStockItems.length !== 1 ? 's' : ''}</span>
          </div>
          <DataTable
            columns={columns}
            data={lowStockItems}
            emptyMessage="No low stock items found. All products are adequately stocked!"
          />
        </>
      )}
    </div>
  );
}
