"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  FileText,
  BarChart3,
  Calendar,
  MapPin
} from "lucide-react";

interface StockSummary {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStock: number;
}

interface RecentActivity {
  id: string;
  type: "Entry" | "Adjustment" | "Transfer";
  description: string;
  date: Date;
  status: string;
}

export default function StockPage() {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  // Mock summary data
  const summary: StockSummary = {
    totalProducts: 458,
    totalValue: 1245780,
    lowStockItems: 23,
    outOfStock: 5
  };

  // Mock recent activities
  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "Entry",
      description: "50 units of iPhone 15 Pro received from Apple Distributor",
      date: new Date("2026-01-05T10:30:00"),
      status: "Verified"
    },
    {
      id: "2",
      type: "Adjustment",
      description: "2 units of iPhone 15 Pro decreased due to Damage",
      date: new Date("2026-01-05T10:30:00"),
      status: "Completed"
    },
    {
      id: "3",
      type: "Transfer",
      description: "10 units transferred from Main Warehouse to Branch 1",
      date: new Date("2026-01-05T09:00:00"),
      status: "Completed"
    },
    {
      id: "4",
      type: "Entry",
      description: "30 units of Samsung Galaxy S24 received",
      date: new Date("2026-01-06T10:30:00"),
      status: "Received"
    },
    {
      id: "5",
      type: "Transfer",
      description: "5 units transfer request pending approval",
      date: new Date("2026-01-07T08:00:00"),
      status: "Pending"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case "Entry": return <Package size={16} className="text-blue-600" />;
      case "Adjustment": return <TrendingDown size={16} className="text-orange-600" />;
      case "Transfer": return <ArrowRightLeft size={16} className="text-purple-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Completed":
      case "Verified":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Received":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Stock Management"
        description="Comprehensive stock management with entry, adjustment, and transfer workflows"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{summary.totalProducts}</div>
              <div className="text-sm text-gray-500">Total Products</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">${(summary.totalValue / 1000).toFixed(0)}k</div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{summary.lowStockItems}</div>
              <div className="text-sm text-gray-500">Low Stock Items</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{summary.outOfStock}</div>
              <div className="text-sm text-gray-500">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <FileText size={20} />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link href="/admin/stock/entry">
              <Button className="w-full justify-start" variant="outline">
                <Plus size={18} className="mr-2" />
                Record Stock Entry
              </Button>
            </Link>
            <Link href="/admin/stock/adjustment">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp size={18} className="mr-2" />
                Stock Adjustment
              </Button>
            </Link>
            <Link href="/admin/stock/transfer">
              <Button className="w-full justify-start" variant="outline">
                <ArrowRightLeft size={18} className="mr-2" />
                Stock Transfer
              </Button>
            </Link>
            <Link href="/admin/stock/low">
              <Button className="w-full justify-start" variant="outline">
                <AlertTriangle size={18} className="mr-2" />
                Low Stock Alerts
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-span-2 bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-black flex items-center gap-2">
              <Calendar size={20} />
              Recent Activities
            </h3>
            <Button size="sm" variant="outline">View All</Button>
          </div>
          <div className="space-y-3">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg border">
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-black">{activity.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(activity.date).toLocaleString()}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Locations */}
      <div className="mt-6 bg-white rounded-xl border p-6">
        <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
          <MapPin size={20} />
          Stock by Location
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { name: "Main Warehouse", count: 245, value: 675000 },
            { name: "Branch 1 - Downtown", count: 89, value: 245000 },
            { name: "Branch 2 - Uptown", count: 67, value: 178000 },
            { name: "Branch 3 - Suburbs", count: 45, value: 98000 },
            { name: "Service Center", count: 12, value: 49780 }
          ].map(location => (
            <div key={location.name} className="p-4 border rounded-lg">
              <div className="text-sm text-gray-500 mb-2">{location.name}</div>
              <div className="text-xl font-bold text-black">{location.count}</div>
              <div className="text-xs text-gray-500">${(location.value / 1000).toFixed(0)}k value</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
