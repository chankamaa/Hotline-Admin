/**
 * Manager Dashboard Component
 * 
 * Store operations and team performance overview for managers.
 * Shows comprehensive metrics, team activities, and operational insights.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Wrench,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  UserCog,
  BarChart3,
  Plus,
} from "lucide-react";
import SalesTrendChart from "@/components/ui/sales-trend";
import { useToast } from "@/providers/toast-provider";
import {
  getTodaysSales,
  getRecentSales,
  getLowStockItems,
  getPendingRepairs,
  getCustomerCount,
} from "@/lib/api/dashboardApi";
import { repairApi } from "@/lib/api/repairApi";
import { reportApi } from "@/lib/api/reportApi";

export default function ManagerDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  type ChangeType = "increase" | "decrease" | "neutral";
  const [stats, setStats] = useState({
    todaySales: { value: "0", change: "+0%", changeType: "increase" as ChangeType },
    totalOrders: { value: "0", change: "+0", changeType: "neutral" as ChangeType },
    lowStock: { value: "0", change: "0", changeType: "decrease" as ChangeType },
    activeRepairs: { value: "0", change: "0 active", changeType: "neutral" as ChangeType },
    activeStaff: { value: "0", change: "Online now", changeType: "neutral" as ChangeType },
  });

  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        todaysSalesRes,
        recentSalesRes,
        lowStockRes,
        pendingRepairsRes,
        customerCountRes,
        repairDashboardRes,
        cashierSalesRes,
      ] = await Promise.allSettled([
        getTodaysSales(),
        getRecentSales(5),
        getLowStockItems(),
        getPendingRepairs(10),
        getCustomerCount(),
        repairApi.getDashboard(),
        reportApi.getSalesByCashier({ period: 'day' }),
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
            change: `${orderChange >= 0 ? '+' : ''}${orderChange}`,
            changeType: orderChange > 0 ? "increase" : orderChange < 0 ? "decrease" : "neutral",
          },
        }));
      }

      // Process recent sales
      if (recentSalesRes.status === "fulfilled") {
        const salesData: any = recentSalesRes.value;
        const sales = salesData.data?.sales || [];
        setRecentSales(sales.map((sale: any) => ({
          id: sale.saleNumber || sale._id,
          customer: sale.customer?.name || "Walk-in",
          amount: `${sale.grandTotal?.toFixed(2) || 0}`,
          cashier: sale.cashier?.name || "Unknown",
          time: new Date(sale.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        })));
      }

      // Process low stock
      if (lowStockRes.status === "fulfilled") {
        const stockData: any = lowStockRes.value;
        const items = stockData.data?.items || [];
        setLowStockItems(items.slice(0, 3).map((item: any) => ({
          name: item.product?.name || "Unknown",
          stock: item.quantity || 0,
          min: item.product?.minStockLevel || 10,
        })));

        setStats(prev => ({
          ...prev,
          lowStock: {
            value: items.length.toString(),
            change: `-${items.length}`,
            changeType: "decrease",
          },
        }));
      }

      // Process repairs
      if (repairDashboardRes.status === "fulfilled") {
        const repairData: any = repairDashboardRes.value;
        const inProgress = repairData.data?.inProgress || 0;
        const received = repairData.data?.received || 0;

        setStats(prev => ({
          ...prev,
          activeRepairs: {
            value: (inProgress + received).toString(),
            change: `${inProgress} in progress`,
            changeType: inProgress > 0 ? "increase" : "neutral",
          },
        }));
      }

      // Process team performance from cashier sales report
      if (cashierSalesRes.status === "fulfilled") {
        const cashierData: any = cashierSalesRes.value;
        const cashiers = cashierData.data?.cashiers || [];

        setTeamPerformance(cashiers.slice(0, 5).map((c: any) => ({
          name: c.username || "Unknown",
          role: "Cashier",
          sales: c.salesCount || 0,
          revenue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(c.totalRevenue || 0),
        })));

        setStats(prev => ({
          ...prev,
          activeStaff: {
            value: cashiers.length.toString(),
            change: "Active today",
            changeType: "neutral",
          },
        }));
      } else {
        // Fallback if no data
        setTeamPerformance([]);
        setStats(prev => ({
          ...prev,
          activeStaff: {
            value: "0",
            change: "No data",
            changeType: "neutral",
          },
        }));
      }

    } catch (error) {
      console.error("Error loading manager dashboard:", error);
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
          <p className="text-gray-600">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Manager Dashboard"
          description="Store operations and team performance overview"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/repairs?tab=create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Create Job</span>
          </button>
          <Button
            onClick={loadDashboardData}
            disabled={loading}
            variant="danger"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatsCard
          title="Today's Sales"
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
          title="Active Repairs"
          value={stats.activeRepairs.value}
          change={stats.activeRepairs.change}
          changeType={stats.activeRepairs.changeType}
          icon={<Wrench size={20} />}
        />
        <StatsCard
          title="Low Stock Alerts"
          value={stats.lowStock.value}
          change={stats.lowStock.change}
          changeType="decrease"
          icon={<AlertTriangle size={20} />}
        />
        <StatsCard
          title="Active Staff"
          value={stats.activeStaff.value}
          change={stats.activeStaff.change}
          changeType="neutral"
          icon={<UserCog size={20} />}
        />
      </div>

      {/* Sales Trend Chart */}
      <div className="mb-6">
        <React.Suspense fallback={<div className="p-4">Loading chart...</div>}>
          <SalesTrendChart />
        </React.Suspense>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Recent Sales</h3>
          </div>
          <div className="divide-y">
            {recentSales.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-2 opacity-50" size={32} />
                <p>No sales yet today</p>
              </div>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="font-medium text-sm text-black">{sale.customer}</div>
                      <div className="text-xs text-gray-500">by {sale.cashier}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-black">{sale.amount}</div>
                      <div className="text-xs text-gray-500">{sale.time}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t">
            <a href="/admin/sales" className="text-sm text-blue-600 hover:text-blue-700">
              View all sales →
            </a>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center gap-2">
            <UserCog size={18} className="text-purple-500" />
            <h3 className="font-semibold text-gray-900">Team Performance Today</h3>
          </div>
          <div className="divide-y">
            {teamPerformance.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <UserCog className="mx-auto mb-2 opacity-50" size={32} />
                <p>No activity yet</p>
              </div>
            ) : (
              teamPerformance.map((member, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <div className="font-medium text-sm text-black">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm text-black">{member.revenue}</div>
                      <div className="text-xs text-gray-500">
                        {member.sales ? `${member.sales} sales` : `${member.repairs} repairs`}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t">
            <a href="/admin/employees" className="text-sm text-blue-600 hover:text-blue-700">
              View all employees →
            </a>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border lg:col-span-2">
          <div className="p-4 border-b flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Inventory Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 col-span-3">
                <Package className="mx-auto mb-2 opacity-50" size={32} />
                <p>All items well stocked</p>
              </div>
            ) : (
              lowStockItems.map((item, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2 text-black">
                    <div className="font-medium text-sm">{item.name}</div>
                    <span className="text-xs font-medium text-red-600">
                      {item.stock} left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min((item.stock / item.min) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Min: {item.min} units</div>
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
      </div>

      {/* Manager Actions & Insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-xs text-gray-500">vs last week</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Week</span>
              <span className="text-sm font-medium text-green-600">+15%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Target</span>
              <span className="text-sm font-medium">50,000</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Best Performer</h3>
              <p className="text-xs text-gray-500">Top sales today</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-black">John Doe</p>
            <p className="text-sm text-gray-600">12 sales - $3,450</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <AlertTriangle size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Action Required</h3>
              <p className="text-xs text-gray-500">Pending tasks</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">3 purchase orders to approve</p>
            <p className="text-sm text-gray-600">2 staff leave requests</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Manager Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a
            href="/admin/reports"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <BarChart3 className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">View Reports</div>
          </a>
          <a
            href="/admin/employees"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <UserCog className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Manage Staff</div>
          </a>
          <a
            href="/admin/stock"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <Package className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Check Inventory</div>
          </a>
          <a
            href="/admin/purchase-orders"
            className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <ShoppingCart className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Purchase Orders</div>
          </a>
        </div>
      </div>
    </div>
  );
}
