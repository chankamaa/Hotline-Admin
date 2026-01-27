"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import { fetchStock } from "@/lib/api/inventoryApi";
import { Package, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import Link from "next/link";

interface StockItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    sku?: string;
    category?: {
      _id: string;
      name: string;
    };
    minStockLevel: number;
  };
  quantity: number;
  lastUpdated: string | null;
  isLowStock: boolean;
}

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  /* --------------------------------------------------
     Load stock data
  -------------------------------------------------- */
  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    setLoading(true);
    try {
      console.log("Fetching stock data from backend...");
      const response: any = await fetchStock({ 
        limit: 1000 // Fetch all items
      });
      
      console.log("Backend response:", response);
      
      // Backend returns { status: "success", data: { stock: [...] } }
      const items = response.data?.stock || response.data?.items || [];
      
      console.log(`Loaded ${items.length} stock items`);
      setStockItems(items);
      
      if (items.length === 0) {
        toast.error("No stock data found. Please add products and stock.");
      }
    } catch (error: any) {
      console.error("Failed to load stock:", error);
      toast.error(error.message || "Failed to load stock data");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     Get stock status
  -------------------------------------------------- */
  const getStockStatus = (item: StockItem) => {
    if (item.quantity === 0) {
      return { 
        label: "Out of Stock", 
        color: "text-red-600 bg-red-50",
        icon: <AlertTriangle size={16} className="text-red-600" />
      };
    }
    if (item.isLowStock || item.quantity <= item.product.minStockLevel) {
      return { 
        label: "Low Stock", 
        color: "text-yellow-600 bg-yellow-50",
        icon: <TrendingDown size={16} className="text-yellow-600" />
      };
    }
    return { 
      label: "In Stock", 
      color: "text-green-600 bg-green-50",
      icon: <CheckCircle size={16} className="text-green-600" />
    };
  };

  /* --------------------------------------------------
     Calculate summary statistics
  -------------------------------------------------- */
  const stats = {
    totalProducts: stockItems.length,
    totalQuantity: stockItems.reduce((sum, item) => sum + item.quantity, 0),
    inStock: stockItems.filter(item => item.quantity > item.product.minStockLevel).length,
    lowStock: stockItems.filter(item => item.isLowStock || (item.quantity <= item.product.minStockLevel && item.quantity > 0)).length,
    outOfStock: stockItems.filter(item => item.quantity === 0).length,
  };

  /* --------------------------------------------------
     Table columns
  -------------------------------------------------- */
  const columns: DataTableColumn<StockItem>[] = [
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
      key: "category",
      label: "Category",
      render: (item) => (
        <div className="text-sm text-gray-600">
          {typeof item.product.category === 'object' && item.product.category?.name 
            ? item.product.category.name 
            : "—"}
        </div>
      ),
    },
    {
      key: "currentStock",
      label: "Current Stock",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {item.quantity}
          </span>
          <span className="text-sm text-gray-500">units</span>
        </div>
      ),
    },
    {
      key: "minLevel",
      label: "Min Level",
      render: (item) => (
        <div className="text-lg font-semibold text-gray-600">
          {item.product.minStockLevel}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item) => {
        const status = getStockStatus(item);
        return (
          <div className="flex items-center gap-2">
            {status.icon}
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
        );
      },
    },
    {
      key: "variance",
      label: "Variance",
      render: (item) => {
        const variance = item.quantity - item.product.minStockLevel;
        return (
          <div className="flex items-center gap-1">
            {variance >= 0 ? (
              <>
                <TrendingUp size={16} className="text-green-600" />
                <span className="font-semibold text-green-600">+{variance}</span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="text-red-600" />
                <span className="font-semibold text-red-600">{variance}</span>
              </>
            )}
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
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Stock Overview (${stats.totalProducts})`}
        description="Complete inventory stock levels across all products"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Products</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Total Units</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalQuantity.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">In Stock</div>
          <div className="text-2xl font-bold text-green-600">{stats.inStock}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600 mb-1">Low Stock</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.lowStock}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 mb-1">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">{stats.outOfStock}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Link href="/admin/stock/adjustment">
            <Button>
              <Plus size={18} className="mr-2" />
              Create Adjustment
            </Button>
          </Link>
          <Link href="/admin/stock/low">
            <Button variant="secondary">
              <AlertTriangle size={18} className="mr-2" />
              Low Stock Alerts
            </Button>
          </Link>
        </div>
        <Button onClick={loadStock} disabled={loading} variant="secondary">
          <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stock Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
          <RefreshCw size={24} className="animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Loading stock data...</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <span className="text-sm text-gray-600">
              Showing {stockItems.length} product{stockItems.length !== 1 ? 's' : ''}
            </span>
          </div>
          <DataTable
            columns={columns}
            data={stockItems}
            emptyMessage="No stock data available. Add products to start tracking inventory."
          />
        </>
      )}
    </div>
  );
}
