/**
 * Main Dashboard Page
 * 
 * This page uses the DashboardSelector to render the appropriate
 * role-specific dashboard based on the authenticated user's role.
 * 
 * Supported roles:
 * - Admin: Complete system overview with all metrics
 * - Manager: Store operations and team performance
 * - Cashier: Sales-focused interface
 * - Technician: Repair jobs and workflow
 * - Inventory Manager: Stock and inventory management
 */

"use client";

import DashboardSelector from "@/components/dashboard/dashboard-selector";

export default function DashboardPage() {
  return <DashboardSelector />;
}
