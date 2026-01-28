/**
 * Dashboard Selector Component
 * 
 * This component dynamically routes users to their role-specific dashboard.
 * It determines the user's role and renders the appropriate dashboard component.
 */

"use client";

import React from "react";
import { useAuth } from "@/providers/providers";
import { getDashboardConfig } from "@/lib/dashboard-config";
import { RefreshCw } from "lucide-react";

// Import role-specific dashboards
import AdminDashboard from "./admin-dashboard";
import ManagerDashboard from "./manager-dashboard";
import CashierDashboard from "./cashier-dashboard";
import TechnicianDashboard from "./technician-dashboard";
import InventoryManagerDashboard from "./inventory-manager-dashboard";

export default function DashboardSelector() {
  const { user, loading } = useAuth();

  // Show loading state while authenticating
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <RefreshCw className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Get user's primary role
  const userRole = user.role?.toLowerCase() || "";

  console.log("Dashboard Selector - User role:", userRole);
  console.log("Dashboard Selector - Full user:", user);

  // Super admin gets admin dashboard
  if (user.isSuperAdmin) {
    console.log("Rendering Admin Dashboard (Super Admin)");
    return <AdminDashboard />;
  }

  // Route to appropriate dashboard based on role
  switch (userRole) {
    case "admin":
    case "administrator":
      console.log("Rendering Admin Dashboard");
      return <AdminDashboard />;

    case "manager":
    case "store-manager":
      console.log("Rendering Manager Dashboard");
      return <ManagerDashboard />;

    case "cashier":
    case "sales":
      console.log("Rendering Cashier Dashboard");
      return <CashierDashboard />;

    case "technician":
    case "tech":
    case "repair-technician":
      console.log("Rendering Technician Dashboard");
      return <TechnicianDashboard />;

    case "inventory-manager":
    case "inventory":
    case "stock-manager":
      console.log("Rendering Inventory Manager Dashboard");
      return <InventoryManagerDashboard />;

    default:
      // Default to cashier dashboard if role is unknown
      console.log("Unknown role, defaulting to Cashier Dashboard");
      return <CashierDashboard />;
  }
}

/**
 * Get dashboard config for display (can be used in other components)
 */
export function useDashboardConfig() {
  const { user } = useAuth();

  if (!user) return null;

  const userRole = user.role?.toLowerCase() || "cashier";
  return getDashboardConfig(userRole);
}
