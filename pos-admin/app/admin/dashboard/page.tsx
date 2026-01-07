"use client";

import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Wrench,
  Clock,
} from "lucide-react";
import SalesTrendChart from "@/components/ui/sales-trend";

export default function DashboardPage() {
  // Mock data - replace with real data from API
  const stats = {
    todaySales: { value: "$12,450", change: "+12.5%", changeType: "increase" as const },
    totalOrders: { value: "45", change: "+8", changeType: "increase" as const },
    lowStock: { value: "12", change: "-3", changeType: "increase" as const },
    activeCustomers: { value: "234", change: "+15", changeType: "increase" as const },
  };

  const recentSales = [
    { id: "INV-001", customer: "John Doe", product: "iPhone 15 Pro", amount: "$999", status: "completed" },
    { id: "INV-002", customer: "Jane Smith", product: "Samsung Galaxy S24", amount: "$899", status: "completed" },
    { id: "INV-003", customer: "Mike Johnson", product: "Phone Case + Charger", amount: "$45", status: "pending" },
    { id: "INV-004", customer: "Sarah Williams", product: "AirPods Pro", amount: "$249", status: "completed" },
  ];

  const lowStockItems = [
    { name: "iPhone 15 Pro 256GB", stock: 3, min: 10 },
    { name: "Samsung Galaxy S24 Ultra", stock: 2, min: 8 },
    { name: "USB-C Cables", stock: 15, min: 50 },
    { name: "Screen Protectors", stock: 8, min: 30 },
  ];

  const pendingRepairs = [
    { id: "REP-001", customer: "Alex Brown", device: "iPhone 14", issue: "Screen replacement", status: "in-progress" },
    { id: "REP-002", customer: "Emily Davis", device: "Samsung S23", issue: "Battery replacement", status: "pending" },
    { id: "REP-003", customer: "Chris Wilson", device: "iPhone 13", issue: "Water damage", status: "waiting-parts" },
  ];

  return (
    <div className="bg-gray-100 p-6 w-full">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening in your store today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          title="Low Stock Items"
          value={stats.lowStock.value}
          change={stats.lowStock.change}
          changeType="decrease"
          icon={<AlertTriangle size={20} />}
        />
        <StatsCard
          title="Active Customers"
          value={stats.activeCustomers.value}
          change={stats.activeCustomers.change}
          changeType={stats.activeCustomers.changeType}
          icon={<Users size={20} />}
        />
      </div>

      {/* Sales Trend Chart */}
      <div className="mb-6 " >
        {/* Lazy-load client component */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <React.Suspense fallback={<div className="p-4">Loading chart…</div>}>
          {/* @ts-ignore */}
          <SalesTrendChart />
        </React.Suspense>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl border ">
          <div className="p-4 border-b ">
            <h3 className="font-semibold text-gray-900">Recent Sales</h3>
          </div>
          <div className="divide-y">
            {recentSales.map((sale) => (
              <div key={sale.id} className="p-4 hover:bg-gray-50 ">
                <div className="flex items-center justify-between mb-1  text-black">
                  <div className="font-medium text-sm">{sale.customer}</div>
                  <div className="font-semibold text-sm">{sale.amount}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">{sale.product}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      sale.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <a href="/admin/sales" className="text-sm text-blue-600 hover:text-blue-700">
              View all sales →
            </a>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b flex items-center gap-2 ">
            <AlertTriangle size={18} className="text-orange-500  " />
            <h3 className="font-semibold text-gray-900">Low Stock Alerts</h3>
          </div>
          <div className="divide-y ">
            {lowStockItems.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 ">
                <div className="flex items-center justify-between mb-2  text-black">
                  <div className="font-medium text-sm">{item.name}</div>
                  <span className="text-xs font-medium text-red-600">
                    {item.stock} left
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${(item.stock / item.min) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Min: {item.min} units
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <a href="/admin/stock/low" className="text-sm text-blue-600 hover:text-blue-700">
              View all stock alerts →
            </a>
          </div>
        </div>

        {/* Pending Repairs */}
        <div className="bg-white rounded-xl border lg:col-span-2">
          <div className="p-4 border-b flex items-center gap-2">
            <Wrench size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">Pending Repairs</h3>
          </div>
          <div className="divide-y">
            {pendingRepairs.map((repair) => (
              <div key={repair.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="font-medium text-sm">{repair.id}</div>
                    <div className="text-sm text-gray-600">{repair.customer}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {repair.device} - {repair.issue}
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    repair.status === "in-progress"
                      ? "bg-blue-100 text-blue-700"
                      : repair.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {repair.status.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View all repairs →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors">
            <ShoppingCart className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">New Sale</div>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors">
            <Package className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Add Product</div>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors">
            <Wrench className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">New Repair</div>
          </button>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg p-4 text-center transition-colors">
            <Users className="mx-auto mb-2" size={24} />
            <div className="text-sm font-medium">Add Customer</div>
          </button>
        </div>
      </div>
    </div>
  );
}
