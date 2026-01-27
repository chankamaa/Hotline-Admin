"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  TrendingUp,
  BarChart3,
  FileText,
  Download,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const reportCategories = [
    {
      title: "Financial Reports",
      icon: DollarSign,
      color: "blue",
      description: "Daily reports, P&L statements, revenue analysis",
      reports: [
        { name: "Daily Reports", href: "/admin/reports/financial?tab=daily", count: "Available" },
        { name: "Weekly/Monthly Reports", href: "/admin/reports/financial?tab=weekly", count: "Available" },
        { name: "Profit & Loss", href: "/admin/reports/financial?tab=profit", count: "Available" },
      ]
    },
    {
      title: "Inventory Reports",
      icon: Package,
      color: "purple",
      description: "Stock levels, movements, dead stock analysis",
      reports: [
        { name: "Stock Status", href: "/admin/reports/inventory?tab=status", count: "Available" },
        { name: "Stock Movement", href: "/admin/reports/inventory?tab=movement", count: "Available" },
        { name: "Dead Stock", href: "/admin/reports/inventory?tab=dead", count: "Available" },
      ]
    },
    {
      title: "Sales Reports",
      icon: ShoppingCart,
      color: "green",
      description: "Sales summary, product analysis, discount tracking",
      reports: [
        { name: "Sales Summary", href: "/admin/reports/sales?tab=summary", count: "Available" },
        { name: "Product Sales Analysis", href: "/admin/reports/sales?tab=products", count: "Available" },
        { name: "Discount Analysis", href: "/admin/reports/sales?tab=discounts", count: "Available" },
      ]
    },
    {
      title: "Employee Performance",
      icon: Users,
      color: "orange",
      description: "Individual and team performance metrics",
      reports: [
        { name: "Individual Performance", href: "/admin/performance", count: "Available" },
        { name: "Comparative Analysis", href: "/admin/performance", count: "Available" },
      ]
    },
  ];

  const quickStats = [
    {
      label: "Today's Revenue",
      value: "$12,450",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "green"
    },
    {
      label: "Total Transactions",
      value: "156",
      change: "+8.3%",
      trend: "up",
      icon: ShoppingCart,
      color: "blue"
    },
    {
      label: "Active Reports",
      value: "24",
      change: "3 scheduled",
      trend: "neutral",
      icon: FileText,
      color: "purple"
    },
    {
      label: "Low Stock Items",
      value: "12",
      change: "Needs attention",
      trend: "warning",
      icon: AlertCircle,
      color: "red"
    },
  ];

  const recentReports = [
    {
      name: "Daily Sales Report",
      type: "Financial",
      generatedAt: new Date("2026-01-07T08:30:00"),
      generatedBy: "Admin User",
      format: "PDF"
    },
    {
      name: "Stock Movement Report",
      type: "Inventory",
      generatedAt: new Date("2026-01-06T17:45:00"),
      generatedBy: "Manager",
      format: "Excel"
    },
    {
      name: "Employee Performance",
      type: "Performance",
      generatedAt: new Date("2026-01-06T15:20:00"),
      generatedBy: "HR Manager",
      format: "PDF"
    },
    {
      name: "Weekly P&L Statement",
      type: "Financial",
      generatedAt: new Date("2026-01-05T09:00:00"),
      generatedBy: "Finance Team",
      format: "Excel"
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Reports & Analytics"
        description="Generate comprehensive reports and analyze business performance"
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-black">{stat.label}</div>
                <Icon size={20} className={`text-${stat.color}-600`} />
              </div>
              <div className="text-2xl font-bold text-black mb-1">{stat.value}</div>
              <div className={`text-xs ${
                stat.trend === "up" ? "text-green-600" :
                stat.trend === "warning" ? "text-red-600" :
                "text-gray-500"
              }`}>
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/admin/reports/financial?tab=daily">
            <Button className="w-full" variant="outline">
              <FileText size={16} className="mr-2" />
              Generate Daily Report
            </Button>
          </Link>
          <Link href="/admin/reports/builder">
            <Button className="w-full" variant="outline">
              <BarChart3 size={16} className="mr-2" />
              Custom Report Builder
            </Button>
          </Link>
          <Button className="w-full" variant="outline">
            <Download size={16} className="mr-2" />
            Export All Data
          </Button>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {reportCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={index} className="bg-white rounded-xl border p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 rounded-lg bg-${category.color}-100`}>
                  <Icon size={24} className={`text-${category.color}-600`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">{category.title}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {category.reports.map((report, idx) => (
                  <Link key={idx} href={report.href}>
                    <div className="flex justify-between items-center p-3 rounded hover:bg-gray-50 transition-colors cursor-pointer">
                      <span className="text-black">{report.name}</span>
                      <span className="text-xs text-gray-500">{report.count}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-lg font-semibold text-black mb-4">Recently Generated Reports</h3>
        <div className="space-y-3">
          {recentReports.map((report, index) => (
            <div key={index} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-400" />
                <div>
                  <div className="font-medium text-black">{report.name}</div>
                  <div className="text-xs text-gray-500">
                    {report.type} • Generated by {report.generatedBy}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-black">
                    {new Date(report.generatedAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(report.generatedAt).toLocaleTimeString()}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download size={14} className="mr-1" />
                  {report.format}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
