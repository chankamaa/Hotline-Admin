/**
 * Admin Dashboard Component
 * 
 * Complete system overview with all metrics, controls, and analytics.
 * Admins have access to all features and system-wide data.
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
  getReceivedRepairs,
  getCustomerCount,
} from "@/lib/api/dashboardApi";
import { repairApi } from "@/lib/api/repairApi";

export default function AdminDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  type ChangeType = "increase" | "decrease" | "neutral";
  const [stats, setStats] = useState({
    todaySales: { value: "0", change: "+0%", changeType: "increase" as ChangeType },
    totalOrders: { value: "0", change: "+0", changeType: "neutral" as ChangeType },
    totalProfit: { value: "0.00", change: "+0%", changeType: "increase" as ChangeType },
    lowStock: { value: "0", change: "0", changeType: "decrease" as ChangeType },
    inProgressRepairs: { value: "0", change: "0 active", changeType: "neutral" as ChangeType },
  });

  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [pendingRepairs, setPendingRepairs] = useState<any[]>([]);

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
        inProgressRepairsRes,
        receivedRepairsRes,
        customerCountRes,
        repairDashboardRes,
      ] = await Promise.allSettled([
        getTodaysSales(),
        getRecentSales(5),
        getLowStockItems(),
        getPendingRepairs(5),
        getReceivedRepairs(5),
        getCustomerCount(),
        repairApi.getDashboard(),
      ]);

      // Process sales data
      if (todaysSalesRes.status === "fulfilled") {
        const salesData: any = todaysSalesRes.value;
        const summary = salesData.data?.summary || {};
        const totalSales = summary.totalAmount || 0;
        const orderCount = summary.totalSales || 0;
        const previousDaySales = summary.previousDayAmount || 0;
        const previousOrderCount = summary.previousDayOrders || summary.previousDaySales || 0;

        const salesChange = previousDaySales > 0
          ? ((totalSales - previousDaySales) / previousDaySales * 100)
          : totalSales > 0 ? 100 : 0;

        const orderChange = orderCount - previousOrderCount;

        // Calculate profit: selling price - cost price
        const totalCost = summary.totalCost || 0;
        const totalProfit = totalSales - totalCost;
        const previousDayProfit = (summary.previousDayAmount || 0) - (summary.previousDayCost || 0);
        
        const profitChange = previousDayProfit > 0
          ? ((totalProfit - previousDayProfit) / previousDayProfit * 100)
          : totalProfit > 0 ? 100 : 0;

        setStats(prev => ({
          ...prev,
          todaySales: {
            value: new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalSales),
            change: `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}%`,
            changeType: salesChange >= 0 ? "increase" : "decrease",
          },
          totalOrders: {
            value: orderCount.toString(),
            change: `${orderChange >= 0 ? '+' : ''}${orderChange}`,
            changeType: orderChange > 0 ? "increase" : orderChange < 0 ? "decrease" : "neutral",
          },
          totalProfit: {
            value: new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalProfit),
            change: `${profitChange >= 0 ? '+' : ''}${profitChange.toFixed(1)}%`,
            changeType: profitChange >= 0 ? "increase" : "decrease",
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
          product: sale.items?.map((item: any) => item.productName).join(", ") || "N/A",
          amount: `${sale.grandTotal?.toFixed(2) || 0}`,
          status: sale.status?.toLowerCase() || "completed",
        })));
      }

      // Process low stock
      if (lowStockRes.status === "fulfilled") {
        const stockData: any = lowStockRes.value;
        const items = stockData.data?.items || [];
        setLowStockItems(items.slice(0, 4).map((item: any) => ({
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
      const allRepairs: any[] = [];
      if (inProgressRepairsRes.status === "fulfilled") {
        const repairsData: any = inProgressRepairsRes.value;
        allRepairs.push(...(repairsData.data?.repairs || []));
      }
      if (receivedRepairsRes.status === "fulfilled") {
        const repairsData: any = receivedRepairsRes.value;
        allRepairs.push(...(repairsData.data?.repairs || []));
      }

      setPendingRepairs(allRepairs.map((repair: any) => ({
        id: repair.jobNumber || repair._id,
        customer: repair.customer?.name || "Unknown",
        device: `${repair.device?.brand || ""} ${repair.device?.model || ""}`.trim() || "Unknown",
        issue: repair.problemDescription || "Not specified",
        status: repair.status?.toLowerCase().replace(/_/g, "-") || "pending",
      })));

      // Process repair stats
      if (repairDashboardRes.status === "fulfilled") {
        const repairData: any = repairDashboardRes.value;
        const inProgress = repairData.data?.inProgress || 0;
        const received = repairData.data?.received || 0;
        const ready = repairData.data?.ready || 0;

        setStats(prev => ({
          ...prev,
          inProgressRepairs: {
            value: inProgress.toString(),
            change: `${received + inProgress + ready} total active`,
            changeType: inProgress > 0 ? "increase" : "neutral",
          },
        }));
      }

    } catch (error: any) {
      console.error("Error loading admin dashboard:", error);
      
      // Check if it's a connection error
      const isConnectionError = error.message?.includes("Failed to connect") || 
                                error.message?.includes("NetworkError") ||
                                error.message?.includes("fetch");
      
      if (isConnectionError) {
        toast.error("Connection lost. Retrying automatically...");
        // Auto-retry after 5 seconds on connection errors
        setTimeout(() => {
          loadDashboardData();
        }, 5000);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !recentSales.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <RefreshCw className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-3 sm:p-4 md:p-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <PageHeader
          title="Administrator Dashboard"
          description="Complete system overview and controls"
        />
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={loadDashboardData}
            disabled={loading}
            variant="danger"
            className="flex-1 sm:flex-none"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid - 5 cards for admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
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
          value={stats.inProgressRepairs.value}
          change={stats.inProgressRepairs.change}
          changeType={stats.inProgressRepairs.changeType}
          icon={<Wrench size={20} />}
        />
        <StatsCard
          title="Low Stock Items"
          value={stats.lowStock.value}
          change={stats.lowStock.change}
          changeType="decrease"
          icon={<AlertTriangle size={20} />}
        />
        <StatsCard
          title="Today's Profit"
          value={stats.totalProfit.value}
          change={stats.totalProfit.change}
          changeType={stats.totalProfit.changeType}
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Sales Trend Chart */}
      <div className="mb-4 sm:mb-6">
        <React.Suspense fallback={<div className="p-4">Loading chart...</div>}>
          <SalesTrendChart />
        </React.Suspense>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-lg sm:rounded-xl border shadow-sm">
          <div className="p-3 sm:p-4 border-b">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Recent Sales</h3>
          </div>
          <div className="divide-y">
            {recentSales.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <ShoppingCart className="mx-auto mb-2 opacity-50" size={32} />
                <p>No sales yet today</p>
              </div>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-1 text-black gap-2">
                    <div className="font-medium text-xs sm:text-sm truncate">{sale.customer}</div>
                    <div className="font-semibold text-xs sm:text-sm flex-shrink-0">{sale.amount}</div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500 truncate flex-1">{sale.product}</div>
                    <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${sale.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                      }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 sm:p-4 border-t bg-gray-50">
            <a href="/admin/sales" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all sales →
            </a>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg sm:rounded-xl border shadow-sm">
          <div className="p-3 sm:p-4 border-b flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange-500 sm:w-[18px] sm:h-[18px]" />
            <h3 className="font-semibold text-sm sm:text-base text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="divide-y">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="mx-auto mb-2 opacity-50" size={32} />
                <p>All items well stocked</p>
              </div>
            ) : (
              lowStockItems.map((item, index) => (
                <div key={index} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2 text-black gap-2">
                    <div className="font-medium text-xs sm:text-sm truncate flex-1">{item.name}</div>
                    <span className="text-xs font-medium text-red-600 flex-shrink-0">
                      {item.stock} left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((item.stock / item.min) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Min: {item.min} units</div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 sm:p-4 border-t bg-gray-50">
            <a href="/admin/stock/low" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all alerts →
            </a>
          </div>
        </div>

        {/* Pending Repairs */}
        <div className="bg-white rounded-lg sm:rounded-xl border shadow-sm lg:col-span-2">
          <div className="p-3 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-blue-500 sm:w-[18px] sm:h-[18px]" />
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Active Repairs</h3>
            </div>
            {pendingRepairs.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {pendingRepairs.length} active
              </span>
            )}
          </div>
          <div className="divide-y">
            {pendingRepairs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Wrench className="mx-auto mb-2 opacity-50" size={32} />
                <p>No active repairs</p>
              </div>
            ) : (
              pendingRepairs.map((repair) => (
                <div key={repair.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex-1 text-gray-500 min-w-0 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                      <div className="font-medium text-xs sm:text-sm">{repair.id}</div>
                      <div className="text-xs sm:text-sm text-gray-600 truncate">{repair.customer}</div>
                    </div>
                    <div className="text-xs text-gray-500 line-clamp-2">
                      {repair.device} - {repair.issue}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 whitespace-nowrap ${repair.status === "in-progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                    }`}>
                    {repair.status.replace("-", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
          <div className="p-3 sm:p-4 border-t bg-gray-50">
            <a href="/admin/repairs" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all repairs →
            </a>
          </div>
        </div>
      </div>

      {/* System Analytics Section */}
      <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl border shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <BarChart3 size={20} className="text-blue-600 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Performance</h3>
              <p className="text-xs text-gray-500">System metrics</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Avg Response Time</span>
              <span className="text-xs sm:text-sm font-medium">1.2s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Uptime</span>
              <span className="text-xs sm:text-sm font-medium text-green-600">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Revenue</h3>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Sales Revenue</span>
              <span className="text-xs sm:text-sm font-medium">45,230</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Repair Revenue</span>
              <span className="text-xs sm:text-sm font-medium">12,450</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl border shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
              <UserCog size={20} className="text-purple-600 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-gray-900">Team Activity</h3>
              <p className="text-xs text-gray-500">Active now</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Online Users</span>
              <span className="text-xs sm:text-sm font-medium">5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Logged In Today</span>
              <span className="text-xs sm:text-sm font-medium">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
