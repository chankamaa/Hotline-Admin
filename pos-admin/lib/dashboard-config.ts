/**
 * Dashboard Configuration
 * 
 * This file defines role-specific dashboard configurations including:
 * - Dashboard components for each role
 * - Feature sets available to each role
 * - Default views and permissions
 */

export type DashboardRole = "admin" | "manager" | "cashier" | "technician" | "inventory-manager";

export interface DashboardConfig {
  role: DashboardRole;
  displayName: string;
  description: string;
  features: string[];
  defaultView: string;
  permissions: string[];
}

/**
 * Dashboard configurations for each role
 */
export const DASHBOARD_CONFIGS: Record<DashboardRole, DashboardConfig> = {
  admin: {
    role: "admin",
    displayName: "Administrator Dashboard",
    description: "Complete system overview with all metrics and controls",
    features: [
      "complete-sales-overview",
      "inventory-management",
      "repair-tracking",
      "user-management",
      "financial-reports",
      "system-settings",
      "performance-analytics",
      "audit-logs",
    ],
    defaultView: "/admin/dashboard",
    permissions: ["*"], // Full access
  },
  
  manager: {
    role: "manager",
    displayName: "Manager Dashboard",
    description: "Store operations and team performance overview",
    features: [
      "sales-overview",
      "inventory-alerts",
      "repair-tracking",
      "employee-performance",
      "financial-reports",
      "customer-insights",
    ],
    defaultView: "/admin/dashboard",
    permissions: [
      "sales:read",
      "inventory:read",
      "repairs:read",
      "reports:view",
      "employees:read",
    ],
  },
  
  cashier: {
    role: "cashier",
    displayName: "Cashier Dashboard",
    description: "Sales and customer-focused interface",
    features: [
      "today-sales",
      "pending-orders",
      "quick-sale-actions",
      "recent-transactions",
      "customer-lookup",
    ],
    defaultView: "/admin/dashboard",
    permissions: [
      "sales:create",
      "sales:read",
      "customers:read",
      "products:read",
    ],
  },
  
  technician: {
    role: "technician",
    displayName: "Technician Dashboard",
    description: "Repair jobs and technical work overview",
    features: [
      "assigned-repairs",
      "pending-repairs",
      "completed-repairs-today",
      "repair-workflow",
      "parts-needed",
      "warranty-claims",
      "repairs:create"
    ],
    defaultView: "/admin/dashboard",
    permissions: [
      "repairs:read",
      "repairs:update",
      "repairs:assign",
      "inventory:read",
      "repairs:create",
    ],
  },
  
  "inventory-manager": {
    role: "inventory-manager",
    displayName: "Inventory Manager Dashboard",
    description: "Stock levels and inventory operations",
    features: [
      "stock-overview",
      "low-stock-alerts",
      "incoming-orders",
      "stock-movements",
      "supplier-management",
      "inventory-reports",
    ],
    defaultView: "/admin/dashboard",
    permissions: [
      "inventory:read",
      "inventory:update",
      "products:read",
      "suppliers:read",
      "reports:view",
    ],
  },
};

/**
 * Get dashboard configuration for a specific role
 */
export function getDashboardConfig(role: string): DashboardConfig {
  const normalizedRole = role.toLowerCase() as DashboardRole;
  
  // Return the specific config or default to cashier for safety
  return DASHBOARD_CONFIGS[normalizedRole] || DASHBOARD_CONFIGS.cashier;
}

/**
 * Check if a role has access to a specific feature
 */
export function hasFeature(role: string, feature: string): boolean {
  const config = getDashboardConfig(role);
  return config.features.includes(feature);
}

/**
 * Get all available roles
 */
export function getAvailableRoles(): DashboardRole[] {
  return Object.keys(DASHBOARD_CONFIGS) as DashboardRole[];
}

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES: Record<DashboardRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  cashier: "Cashier",
  technician: "Technician",
  "inventory-manager": "Inventory Manager",
};
