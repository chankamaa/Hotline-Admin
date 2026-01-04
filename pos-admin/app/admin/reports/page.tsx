"use client";

import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Wrench,
  Download,
  Calendar,
} from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Reports & Analytics"
        description="View comprehensive reports and business insights"
      />

      {/* Date Range Selector */}
      <div className="bg-white rounded-xl border p-4 mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-gray-400" />
          <span className="text-sm font-medium">Date Range:</span>
        </div>
        <select className="px-3 py-2 rounded-lg border text-sm">
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Year</option>
          <option>Custom Range</option>
        </select>
        <button className="ml-auto px-4 py-2 bg-black text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800">
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Revenue"
          value="$45,230"
          change="+12.5%"
          changeType="increase"
          icon={<DollarSign size={20} />}
        />
        <StatsCard
          title="Total Sales"
          value="234"
          change="+8.2%"
          changeType="increase"
          icon={<ShoppingCart size={20} />}
        />
        <StatsCard
          title="New Customers"
          value="45"
          change="+15.3%"
          changeType="increase"
          icon={<Users size={20} />}
        />
        <StatsCard
          title="Avg Order Value"
          value="$193.29"
          change="+3.1%"
          changeType="increase"
          icon={<TrendingUp size={20} />}
        />
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Report */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Sales Performance</h3>
            <p className="text-sm text-gray-500">This month vs last month</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Sales</div>
                  <div className="text-2xl font-bold">$45,230</div>
                </div>
                <div className="text-sm text-green-600 font-medium">+12.5%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: "75%" }} />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="text-xs text-gray-500">This Month</div>
                  <div className="font-semibold">$45,230</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Last Month</div>
                  <div className="font-semibold">$40,200</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Performance */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Top Products</h3>
            <p className="text-sm text-gray-500">Best sellers this month</p>
          </div>
          <div className="divide-y">
            {[
              { name: "iPhone 15 Pro", sales: 45, revenue: "$44,955" },
              { name: "Samsung Galaxy S24", sales: 32, revenue: "$38,368" },
              { name: "AirPods Pro", sales: 67, revenue: "$16,683" },
              { name: "Phone Cases", sales: 123, revenue: "$3,690" },
            ].map((product, index) => (
              <div key={index} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sales} units sold</div>
                  </div>
                </div>
                <div className="font-semibold">{product.revenue}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Customer Insights</h3>
            <p className="text-sm text-gray-500">Customer acquisition & retention</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-700">New Customers</div>
                <div className="text-2xl font-bold">45</div>
              </div>
              <Users size={32} className="text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-700">Returning Customers</div>
                <div className="text-2xl font-bold">189</div>
              </div>
              <TrendingUp size={32} className="text-green-600" />
            </div>
            <div className="pt-2">
              <div className="text-sm text-gray-500 mb-2">Retention Rate</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: "80.7%" }} />
              </div>
              <div className="text-right text-sm font-medium text-green-600 mt-1">80.7%</div>
            </div>
          </div>
        </div>

        {/* Repair Services */}
        <div className="bg-white rounded-xl border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Repair Services</h3>
            <p className="text-sm text-gray-500">Service performance metrics</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Pending</div>
                <div className="text-xl font-bold text-yellow-600">12</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">In Progress</div>
                <div className="text-xl font-bold text-blue-600">8</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Completed</div>
                <div className="text-xl font-bold text-green-600">45</div>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Avg Completion Time</span>
                <span className="font-semibold">2.4 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Customer Satisfaction</span>
                <span className="font-semibold text-green-600">4.8/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Health */}
      <div className="mt-6 bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">Inventory Health</h3>
          <p className="text-sm text-gray-500">Stock levels and turnover</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Products</div>
              <div className="text-2xl font-bold">456</div>
              <div className="text-xs text-gray-500 mt-1">Across 12 categories</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Low Stock Items</div>
              <div className="text-2xl font-bold text-orange-600">23</div>
              <div className="text-xs text-orange-600 mt-1">Need reorder</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">5</div>
              <div className="text-xs text-red-600 mt-1">Urgent attention</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Inventory Value</div>
              <div className="text-2xl font-bold text-green-600">$234,567</div>
              <div className="text-xs text-gray-500 mt-1">Total stock value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
