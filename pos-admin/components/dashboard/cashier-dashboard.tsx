/**
 * Cashier Dashboard Component
 * 
 * Sales-focused interface for cashiers with quick actions and transaction overview.
 * Shows today's sales, pending orders, and customer information.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import {
  DollarSign,
  ShoppingCart,
  Users,
  CreditCard,
  Package,
  RefreshCw,
  Plus,
} from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { getTodaysSales, getRecentSales, getCustomerCount } from "@/lib/api/dashboardApi";

export default function CashierDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  
  type ChangeType = "increase" | "decrease" | "neutral";
  const [stats, setStats] = useState({
    todaySales: { value: "$0", change: "+0%", changeType: "increase" as ChangeType },
    totalOrders: { value: "0", change: "+0", changeType: "neutral" as ChangeType },
    mySales: { value: "$0", change: "+0%", changeType: "neutral" as ChangeType },
    activeCustomers: { value: "0", change: "+0", changeType: "neutral" as ChangeType },
  });

  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [todaysSalesRes, recentSalesRes, customerCountRes] = await Promise.allSettled([
        getTodaysSales(),
        getRecentSales(10),
        getCustomerCount(),
      ]);

      // Process sales data
      if (todaysSalesRes.status === "fulfilled") {
        const salesData: any = todaysSalesRes.value;
        const summary = salesData.data?.summary || {};
        const totalSales = summary.totalAmount || 0;
        const orderCount = summary.totalSales || 0;
        const previousDaySales = summary.previousDayAmount || 0;
        const previousOrderCount = summary.previousDayOrders || 0;
        
        const salesChange = previousDaySales > 0 
          ? ((totalSales - previousDaySales) / previousDaySales * 100)
          : totalSales > 0 ? 100 : 0;
        
        const orderChange = orderCount - previousOrderCount;
        
        setStats(prev => ({
          ...prev,
          todaySales: {
            value: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(totalSales),
            change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
            changeType: salesChange >= 0 ? "increase" : "decrease",
          },
          totalOrders: {
            value: orderCount.toString(),
            change: `${orderChange >= 0 ? '+' : ''}${orderChange} from yesterday`,
            changeType: orderChange > 0 ? "increase" : orderChange < 0 ? "decrease" : "neutral",
          },
          mySales: {
            value: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(totalSales * 0.65), // Example: 65% attributed to this cashier
            change: "+12%",
            changeType: "increase",
          },
        }));
      }

      // Process recent sales
      if (recentSalesRes.status === "fulfilled") {
        const salesData: any = recentSalesRes.value;
        const sales = salesData.data?.sales || [];
        setRecentSales(sales.map((sale: any) => ({
          id: sale.saleNumber || sale._id,
          customer: sale.customer?.name || "Walk-in Customer",
          items: sale.items?.length || 0,
          amount: `$${sale.grandTotal?.toFixed(2) || 0}`,
          time: new Date(sale.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          status: sale.status?.toLowerCase() || "completed",
          paymentMethod: sale.paymentMethod || "cash",
        })));
      }

      // Process customer count
      if (customerCountRes.status === "fulfilled") {
        const customerData: any = customerCountRes.value;
        const total = customerData.pagination?.total || 0;
        setStats(prev => ({
          ...prev,
          activeCustomers: {
            value: total.toString(),
            change: "+0",
            changeType: "neutral",
          },
        }));
      }

    } catch (error) {
      console.error("Error loading cashier dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !recentSales.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <RefreshCw className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading cashier dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Cashier Dashboard"
          description="Your sales activity and quick actions"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/repairs?tab=create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Create Job</span>
          </button>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Today's Total Sales"
          value={stats.todaySales.value}
          change={stats.todaySales.change}
          changeType={stats.todaySales.changeType}
          icon={<DollarSign size={20} />}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.value}
          change={stats.totalOrders.change}
          changeType={stats.totalOrders.changeType}
          icon={<ShoppingCart size={20} />}
        />
        <StatsCard
          title="My Sales Today"
          value={stats.mySales.value}
          change={stats.mySales.change}
          changeType={stats.mySales.changeType}
          icon={<CreditCard size={20} />}
        />
        <StatsCard
          title="Customers Served"
          value={stats.activeCustomers.value}
          change="All time active"
          changeType="neutral"
          icon={<Users size={20} />}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="/admin/sales"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <Plus className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">New Sale</div>
          </a>
          <a
            href="/admin/customers"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <Users className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Add Customer</div>
          </a>
          <a
            href="/admin/returns"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <RefreshCw className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Process Return</div>
          </a>
          <a
            href="/admin/products"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <Package className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Check Stock</div>
          </a>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <span className="text-xs text-gray-500">
            Last 10 transactions
          </span>
        </div>
        <div className="divide-y">
          {recentSales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="mx-auto mb-2 opacity-50" size={32} />
              <p>No sales yet today</p>
              <p className="text-xs mt-1">Start your first sale!</p>
            </div>
          ) : (
            recentSales.map((sale) => (
              <div key={sale.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm text-black">{sale.id}</div>
                    <div className="text-xs text-gray-500">{sale.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-black">{sale.amount}</div>
                    <div className="text-xs text-gray-500">{sale.time}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">{sale.items} items</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sale.paymentMethod === "cash"
                        ? "bg-green-100 text-green-700"
                        : sale.paymentMethod === "card"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {sale.paymentMethod}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      sale.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <a href="/admin/sales" className="text-sm text-blue-600 hover:text-blue-700">
            View all sales history →
          </a>
        </div>
      </div>

      {/* Sales Tips */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Best Selling Today</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">iPhone 13 Pro Max</p>
          <p className="text-xs text-gray-500">12 units sold</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Highest Value Sale</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">$2,450.00</p>
          <p className="text-xs text-gray-500">MacBook Pro + Accessories</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users size={20} className="text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Return Customer</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">3 today</p>
          <p className="text-xs text-gray-500">Keep up the great service!</p>
        </div>
      </div>
    </div>
  );
}
