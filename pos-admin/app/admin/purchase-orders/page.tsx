"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  FileDown,
  ChevronDown,
} from "lucide-react";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: Date;
  expectedDate: Date;
  status: "pending" | "completed" | "cancelled";
  totalItems: number;
  totalAmount: number;
  branch: string;
  type: string;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalItems = orders.reduce((sum, o) => sum + o.totalItems, 0);

  const handleCreateOrder = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage and track purchase orders"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={<ShoppingCart className="w-5 h-5" />}
        />
        <StatsCard
          title="Pending Orders"
          value={pendingOrders}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatsCard
          title="Completed Orders"
          value={completedOrders}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatsCard
          title="Total Items"
          value={totalItems}
          icon={<Package className="w-5 h-5" />}
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold">Filter Orders</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search PO or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="inventory">Inventory</option>
              <option value="repairs">Repairs</option>
              <option value="accessories">Accessories</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>

          {/* Branch Filter */}
          <div className="relative">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none bg-white"
            >
              <option value="all">All Branches</option>
              <option value="main">Main Branch</option>
              <option value="branch1">Branch 1</option>
              <option value="branch2">Branch 2</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {orders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Directory */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold">Orders Directory</h3>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={handleCreateOrder}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4" />
              New Order
            </Button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              No purchase orders found
            </h4>
            <p className="text-sm text-gray-500 mb-6">
              Create your first purchase order to get started.
            </p>
            <Button
              onClick={handleCreateOrder}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4" />
              Create Purchase Order
            </Button>
          </div>
        ) : (
          <div>
            {/* Orders table would go here */}
            <p className="text-gray-500 text-center py-8">
              Orders table will be displayed here
            </p>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Purchase Order"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select supplier...</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="">Select branch...</option>
                <option value="main">Main Branch</option>
                <option value="branch1">Branch 1</option>
                <option value="branch2">Branch 2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Select type...</option>
              <option value="inventory">Inventory</option>
              <option value="repairs">Repairs</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Add any notes or special instructions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle create order
                setIsModalOpen(false);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Create Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
