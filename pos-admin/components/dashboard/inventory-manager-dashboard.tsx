/**
 * Inventory Manager Dashboard Component
 * 
 * Stock and inventory-focused interface for inventory managers.
 * Shows stock levels, movements, alerts, and supplier information.
 */

"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Truck,
  BoxIcon,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { getLowStockItems } from "@/lib/api/dashboardApi";

export default function InventoryManagerDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  
  type ChangeType = "increase" | "decrease" | "neutral";
  const [stats, setStats] = useState({
    totalProducts: { value: "0", change: "+0 this week", changeType: "neutral" as ChangeType },
    lowStockItems: { value: "0", change: "Need attention", changeType: "decrease" as ChangeType },
    stockValue: { value: "$0", change: "+0%", changeType: "neutral" as ChangeType },
    pendingOrders: { value: "0", change: "Incoming", changeType: "neutral" as ChangeType },
  });

  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [recentMovements, setRecentMovements] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [lowStockRes] = await Promise.allSettled([
        getLowStockItems(),
      ]);

      // Process low stock items
      if (lowStockRes.status === "fulfilled") {
        const stockData: any = lowStockRes.value;
        const items = stockData.data?.items || [];
        
        setLowStockItems(items.map((item: any) => ({
          name: item.product?.name || "Unknown Product",
          sku: item.product?.sku || "N/A",
          stock: item.quantity || 0,
          min: item.product?.minStockLevel || 10,
          category: item.product?.category?.name || "Uncategorized",
          status: item.quantity === 0 ? "out-of-stock" : "low-stock",
        })));
        
        setStats(prev => ({
          ...prev,
          lowStockItems: {
            value: items.length.toString(),
            change: "Need attention",
            changeType: "decrease",
          },
          totalProducts: {
            value: "245",
            change: "+8 this week",
            changeType: "increase",
          },
          stockValue: {
            value: "$124,500",
            change: "+5.2%",
            changeType: "increase",
          },
          pendingOrders: {
            value: "3",
            change: "Arriving soon",
            changeType: "neutral",
          },
        }));
      }

      // Mock recent movements
      setRecentMovements([
        { 
          product: "iPhone 13 Pro", 
          type: "in", 
          quantity: 50, 
          from: "Supplier A",
          date: "2 hours ago" 
        },
        { 
          product: "Samsung Galaxy S21", 
          type: "out", 
          quantity: 15, 
          from: "Sales",
          date: "3 hours ago" 
        },
        { 
          product: "MacBook Air M2", 
          type: "in", 
          quantity: 10, 
          from: "Purchase Order #1234",
          date: "5 hours ago" 
        },
        { 
          product: "AirPods Pro", 
          type: "adjustment", 
          quantity: -2, 
          from: "Stock Correction",
          date: "6 hours ago" 
        },
      ]);

      // Mock top products
      setTopProducts([
        { name: "iPhone 13 Pro Max", stock: 45, value: "$54,000", trend: "up" },
        { name: "Samsung Galaxy S22", stock: 32, value: "$28,800", trend: "up" },
        { name: "MacBook Pro 14\"", stock: 12, value: "$28,800", trend: "down" },
      ]);

    } catch (error) {
      console.error("Error loading inventory dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !lowStockItems.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <RefreshCw className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading inventory dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Inventory Manager Dashboard"
          description="Stock levels and inventory operations"
        />
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.value}
          change={stats.totalProducts.change}
          changeType="increase"
          icon={<Package size={20} />}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStockItems.value}
          change={stats.lowStockItems.change}
          changeType="decrease"
          icon={<AlertTriangle size={20} />}
        />
        <StatsCard
          title="Total Stock Value"
          value={stats.stockValue.value}
          change={stats.stockValue.change}
          changeType="increase"
          icon={<TrendingUp size={20} />}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders.value}
          change={stats.pendingOrders.change}
          changeType="neutral"
          icon={<Truck size={20} />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
            </div>
            {lowStockItems.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {lowStockItems.length} items
              </span>
            )}
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="mx-auto mb-2 opacity-50" size={32} />
                <p>All items well stocked</p>
              </div>
            ) : (
              lowStockItems.map((item, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-black">{item.name}</div>
                      <div className="text-xs text-gray-500">SKU: {item.sku} • {item.category}</div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.status === "out-of-stock"
                        ? "bg-red-100 text-red-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {item.stock} left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === "out-of-stock" ? "bg-red-500" : "bg-orange-500"
                      }`}
                      style={{ width: `${Math.min((item.stock / item.min) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-xs text-gray-500">Min: {item.min} units</div>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Create PO
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t">
            <a href="/admin/stock/low" className="text-sm text-blue-600 hover:text-blue-700">
              View all alerts →
            </a>
          </div>
        </div>

        {/* Recent Stock Movements */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center gap-2">
            <RefreshCw size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Recent Stock Movements</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BoxIcon className="mx-auto mb-2 opacity-50" size={32} />
                <p>No recent movements</p>
              </div>
            ) : (
              recentMovements.map((movement, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      movement.type === "in"
                        ? "bg-green-100"
                        : movement.type === "out"
                        ? "bg-red-100"
                        : "bg-blue-100"
                    }`}>
                      {movement.type === "in" ? (
                        <ArrowDownCircle size={16} className="text-green-600" />
                      ) : movement.type === "out" ? (
                        <ArrowUpCircle size={16} className="text-red-600" />
                      ) : (
                        <RefreshCw size={16} className="text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-black">{movement.product}</div>
                      <div className="text-xs text-gray-500">{movement.from}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${
                        movement.type === "in"
                          ? "text-green-600"
                          : movement.type === "out"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`}>
                        {movement.type === "in" ? "+" : ""}{movement.quantity}
                      </div>
                      <div className="text-xs text-gray-500">{movement.date}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t">
            <a href="/admin/stock/movements" className="text-sm text-blue-600 hover:text-blue-700">
              View all movements →
            </a>
          </div>
        </div>
      </div>

      {/* Top Products by Value */}
      <div className="mb-6 bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Top Products by Stock Value</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
          {topProducts.map((product, index) => (
            <div key={index} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-medium text-sm text-black mb-1">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.stock} units in stock</div>
                </div>
                {product.trend === "up" ? (
                  <TrendingUp size={16} className="text-green-500" />
                ) : (
                  <TrendingDown size={16} className="text-red-500" />
                )}
              </div>
              <div className="text-lg font-semibold text-gray-900">{product.value}</div>
              <div className={`text-xs mt-1 ${
                product.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {product.trend === "up" ? "↑ Increasing" : "↓ Decreasing"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stock Overview</h3>
              <p className="text-xs text-gray-500">Current status</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">In Stock</span>
              <span className="text-sm font-medium text-green-600">215</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low Stock</span>
              <span className="text-sm font-medium text-orange-600">{stats.lowStockItems.value}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Out of Stock</span>
              <span className="text-sm font-medium text-red-600">12</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Truck size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Incoming Stock</h3>
              <p className="text-xs text-gray-500">Expected deliveries</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-sm font-medium">3 orders</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Items</span>
              <span className="text-sm font-medium">245 units</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stock Turnover</h3>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Turnover Rate</span>
              <span className="text-sm font-medium text-green-600">2.4x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Days</span>
              <span className="text-sm font-medium">12.5 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Inventory Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="/admin/stock/adjustment"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <RefreshCw className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Stock Adjustment</div>
          </a>
          <a
            href="/admin/purchase-orders/create"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <Truck className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Create PO</div>
          </a>
          <a
            href="/admin/products"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <Package className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">View Products</div>
          </a>
          <a
            href="/admin/stock/audit"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <BoxIcon className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Audit Trail</div>
          </a>
        </div>
      </div>
    </div>
  );
}
