/**
 * Frontend Permission Constants
 * Aligned with backend permission system and permission matrix
 */

export const PERMISSIONS = {
  // ============ SALES OPERATIONS ============
  CREATE_SALE: "CREATE_SALE",
  PROCESS_TRANSACTION: "PROCESS_TRANSACTION",
  VIEW_SALES: "VIEW_SALES",
  VOID_SALE: "VOID_SALE",
  ACCEPT_PAYMENTS: "ACCEPT_PAYMENTS",
  GENERATE_RECEIPTS: "GENERATE_RECEIPTS",

  // ============ DISCOUNTS ============
  APPLY_STANDARD_DISCOUNT: "APPLY_STANDARD_DISCOUNT",
  APPLY_HIGH_VALUE_DISCOUNT: "APPLY_HIGH_VALUE_DISCOUNT",
  APPROVE_DISCOUNTS: "APPROVE_DISCOUNTS",

  // ============ RETURNS & REFUNDS ============
  AUTHORIZE_RETURNS: "AUTHORIZE_RETURNS",
  AUTHORIZE_REFUNDS: "AUTHORIZE_REFUNDS",
  PROCESS_RETURNS: "PROCESS_RETURNS",

  // ============ REPORTS ============
  VIEW_SALES_REPORT: "VIEW_SALES_REPORT",
  VIEW_PROFIT_REPORT: "VIEW_PROFIT_REPORT",
  VIEW_FINANCIAL_REPORTS: "VIEW_FINANCIAL_REPORTS",
  VIEW_ALL_REPORTS: "VIEW_ALL_REPORTS",
  VIEW_OWN_PERFORMANCE: "VIEW_OWN_PERFORMANCE",
  VIEW_EMPLOYEE_PERFORMANCE: "VIEW_EMPLOYEE_PERFORMANCE",
  EXPORT_REPORTS: "EXPORT_REPORTS",

  // ============ USER MANAGEMENT ============
  CREATE_USER: "CREATE_USER",
  VIEW_USERS: "VIEW_USERS",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  MANAGE_USERS: "MANAGE_USERS",

  // ============ ROLE MANAGEMENT ============
  MANAGE_ROLES: "MANAGE_ROLES",
  ASSIGN_ROLES: "ASSIGN_ROLES",
  VIEW_ROLES: "VIEW_ROLES",

  // ============ PERMISSION MANAGEMENT ============
  MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",
  ASSIGN_PERMISSIONS: "ASSIGN_PERMISSIONS",
  VIEW_PERMISSIONS: "VIEW_PERMISSIONS",

  // ============ EMPLOYEE MANAGEMENT ============
  VIEW_EMPLOYEES: "VIEW_EMPLOYEES",
  MANAGE_EMPLOYEES: "MANAGE_EMPLOYEES",

  // ============ PRODUCT & CATEGORY MANAGEMENT ============
  CREATE_PRODUCT: "CREATE_PRODUCT",
  VIEW_PRODUCTS: "VIEW_PRODUCTS",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",
  CREATE_CATEGORY: "CREATE_CATEGORY",
  VIEW_CATEGORIES: "VIEW_CATEGORIES",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",

  // ============ INVENTORY MANAGEMENT ============
  MANAGE_INVENTORY: "MANAGE_INVENTORY",
  VIEW_INVENTORY: "VIEW_INVENTORY",
  ADD_INVENTORY: "ADD_INVENTORY",
  EDIT_INVENTORY: "EDIT_INVENTORY",
  DELETE_INVENTORY: "DELETE_INVENTORY",
  INVENTORY_TRANSFER: "INVENTORY_TRANSFER",
  INVENTORY_AUDIT: "INVENTORY_AUDIT",

  // ============ DEVICE REPAIR (TECHNICIAN) ============
  CREATE_REPAIR_JOB: "CREATE_REPAIR_JOB",
  MANAGE_REPAIR_JOBS: "MANAGE_REPAIR_JOBS",
  VIEW_REPAIRS: "VIEW_REPAIRS",
  VIEW_ASSIGNED_REPAIRS: "VIEW_ASSIGNED_REPAIRS",
  UPDATE_REPAIR_STATUS: "UPDATE_REPAIR_STATUS",
  SET_REPAIR_PRICING: "SET_REPAIR_PRICING",

  // ============ SYSTEM SETTINGS ============
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  VIEW_SETTINGS: "VIEW_SETTINGS",
  SYSTEM_CONFIGURATION: "SYSTEM_CONFIGURATION",
  MANAGE_INTEGRATIONS: "MANAGE_INTEGRATIONS",

  // ============ DATABASE & BACKUP ============
  DATABASE_MANAGEMENT: "DATABASE_MANAGEMENT",
  BACKUP_OPERATIONS: "BACKUP_OPERATIONS",
  RESTORE_OPERATIONS: "RESTORE_OPERATIONS",

  // ============ RESTRICTIONS ============
  OVERRIDE_CASHIER_RESTRICTIONS: "OVERRIDE_CASHIER_RESTRICTIONS",
  FULL_SYSTEM_ACCESS: "FULL_SYSTEM_ACCESS",
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Permission categories for UI display
export interface PermissionCategory {
  name: string;
  description: string;
  permissions: Array<{
    code: string;
    description: string;
  }>;
}

export const PERMISSION_CATEGORIES: Record<string, PermissionCategory> = {
  SALES: {
    name: "Sales Operations",
    description: "Manage sales transactions and operations",
    permissions: [
      { code: "CREATE_SALE", description: "Create and process sales" },
      { code: "PROCESS_TRANSACTION", description: "Process transactions" },
      { code: "VIEW_SALES", description: "View sales records" },
      { code: "VOID_SALE", description: "Void or cancel sales" },
      { code: "ACCEPT_PAYMENTS", description: "Accept payments" },
      { code: "GENERATE_RECEIPTS", description: "Generate receipts" },
    ],
  },
  DISCOUNTS: {
    name: "Discounts",
    description: "Manage discount operations",
    permissions: [
      { code: "APPLY_STANDARD_DISCOUNT", description: "Apply standard discounts" },
      { code: "APPLY_HIGH_VALUE_DISCOUNT", description: "Apply high-value discounts" },
      { code: "APPROVE_DISCOUNTS", description: "Approve discount requests" },
    ],
  },
  RETURNS: {
    name: "Returns & Refunds",
    description: "Handle returns and refund operations",
    permissions: [
      { code: "AUTHORIZE_RETURNS", description: "Authorize product returns" },
      { code: "AUTHORIZE_REFUNDS", description: "Authorize refunds" },
      { code: "PROCESS_RETURNS", description: "Process returns" },
    ],
  },
  REPORTS: {
    name: "Reports",
    description: "Access and manage reports",
    permissions: [
      { code: "VIEW_SALES_REPORT", description: "View sales reports" },
      { code: "VIEW_PROFIT_REPORT", description: "View profit reports" },
      { code: "VIEW_FINANCIAL_REPORTS", description: "View financial reports" },
      { code: "VIEW_ALL_REPORTS", description: "View all reports" },
      { code: "VIEW_OWN_PERFORMANCE", description: "View own performance" },
      { code: "VIEW_EMPLOYEE_PERFORMANCE", description: "View employee performance" },
      { code: "EXPORT_REPORTS", description: "Export reports" },
    ],
  },
  USERS: {
    name: "User Management",
    description: "Manage user accounts",
    permissions: [
      { code: "CREATE_USER", description: "Create new users" },
      { code: "VIEW_USERS", description: "View users" },
      { code: "UPDATE_USER", description: "Update user information" },
      { code: "DELETE_USER", description: "Delete users" },
      { code: "MANAGE_USERS", description: "Full user management" },
    ],
  },
  ROLES: {
    name: "Role Management",
    description: "Manage user roles",
    permissions: [
      { code: "MANAGE_ROLES", description: "Manage roles" },
      { code: "ASSIGN_ROLES", description: "Assign roles to users" },
      { code: "VIEW_ROLES", description: "View roles" },
    ],
  },
  PERMISSIONS: {
    name: "Permission Management",
    description: "Manage system permissions",
    permissions: [
      { code: "MANAGE_PERMISSIONS", description: "Manage permissions" },
      { code: "ASSIGN_PERMISSIONS", description: "Assign permissions" },
      { code: "VIEW_PERMISSIONS", description: "View permissions" },
    ],
  },
  EMPLOYEES: {
    name: "Employee Management",
    description: "Manage employee information",
    permissions: [
      { code: "VIEW_EMPLOYEES", description: "View employees" },
      { code: "MANAGE_EMPLOYEES", description: "Manage employees" },
    ],
  },
  PRODUCTS: {
    name: "Product Management",
    description: "Manage product catalog",
    permissions: [
      { code: "CREATE_PRODUCT", description: "Add new products" },
      { code: "VIEW_PRODUCTS", description: "View products" },
      { code: "UPDATE_PRODUCT", description: "Update products" },
      { code: "DELETE_PRODUCT", description: "Delete products" },
    ],
  },
  CATEGORIES: {
    name: "Category Management",
    description: "Manage product categories",
    permissions: [
      { code: "CREATE_CATEGORY", description: "Create categories" },
      { code: "VIEW_CATEGORIES", description: "View categories" },
      { code: "UPDATE_CATEGORY", description: "Update categories" },
      { code: "DELETE_CATEGORY", description: "Delete categories" },
    ],
  },
  INVENTORY: {
    name: "Inventory Management",
    description: "Manage inventory and stock",
    permissions: [
      { code: "MANAGE_INVENTORY", description: "Full inventory management" },
      { code: "VIEW_INVENTORY", description: "View inventory" },
      { code: "ADD_INVENTORY", description: "Add inventory" },
      { code: "EDIT_INVENTORY", description: "Edit inventory" },
      { code: "DELETE_INVENTORY", description: "Delete inventory" },
      { code: "INVENTORY_TRANSFER", description: "Transfer inventory" },
      { code: "INVENTORY_AUDIT", description: "Perform audits" },
    ],
  },
  DEVICES: {
    name: "Device Repairs",
    description: "Manage repair operations",
    permissions: [
      { code: "CREATE_REPAIR_JOB", description: "Create repair jobs" },
      { code: "MANAGE_REPAIR_JOBS", description: "Manage repair jobs" },
      { code: "VIEW_REPAIRS", description: "View repairs" },
      { code: "VIEW_ASSIGNED_REPAIRS", description: "View assigned repairs" },
      { code: "UPDATE_REPAIR_STATUS", description: "Update repair status" },
      { code: "SET_REPAIR_PRICING", description: "Set repair pricing" },
    ],
  },
  SETTINGS: {
    name: "System Settings",
    description: "Manage system configuration",
    permissions: [
      { code: "MANAGE_SETTINGS", description: "Manage settings" },
      { code: "VIEW_SETTINGS", description: "View settings" },
      { code: "SYSTEM_CONFIGURATION", description: "System configuration" },
      { code: "MANAGE_INTEGRATIONS", description: "Manage integrations" },
    ],
  },
  DATABASE: {
    name: "Database Operations",
    description: "Manage database and backups",
    permissions: [
      { code: "DATABASE_MANAGEMENT", description: "Database management" },
      { code: "BACKUP_OPERATIONS", description: "Backup operations" },
      { code: "RESTORE_OPERATIONS", description: "Restore operations" },
    ],
  },
  SYSTEM: {
    name: "System Access",
    description: "System-level permissions",
    permissions: [
      { code: "FULL_SYSTEM_ACCESS", description: "Full system access" },
      { code: "OVERRIDE_CASHIER_RESTRICTIONS", description: "Override restrictions" },
    ],
  },
};

// Role definitions matching the permission matrix
export interface RoleDefinition {
  name: string;
  description: string;
  permissions: string[];
  color?: string;
}

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  ADMIN: {
    name: "Admin",
    description: "Full system access including user creation, system configuration, all reports access, database management, and backup operations",
    color: "red",
    permissions: [
      // Full system access
      "FULL_SYSTEM_ACCESS",
      // All permissions
      ...Object.keys(PERMISSIONS),
    ],
  },
  MANAGER: {
    name: "Manager",
    description: "Authorize returns/refunds, approve high-value discounts, view employee performance, manage inventory, access financial reports, override cashier restrictions",
    color: "blue",
    permissions: [
      "AUTHORIZE_RETURNS", "AUTHORIZE_REFUNDS", "PROCESS_RETURNS",
      "APPLY_STANDARD_DISCOUNT", "APPLY_HIGH_VALUE_DISCOUNT", "APPROVE_DISCOUNTS",
      "VIEW_EMPLOYEE_PERFORMANCE", "VIEW_OWN_PERFORMANCE",
      "MANAGE_INVENTORY", "VIEW_INVENTORY", "ADD_INVENTORY", "EDIT_INVENTORY",
      "DELETE_INVENTORY", "INVENTORY_TRANSFER", "INVENTORY_AUDIT",
      "CREATE_PRODUCT", "VIEW_PRODUCTS", "UPDATE_PRODUCT", "DELETE_PRODUCT",
      "CREATE_CATEGORY", "VIEW_CATEGORIES", "UPDATE_CATEGORY", "DELETE_CATEGORY",
      "VIEW_FINANCIAL_REPORTS", "VIEW_SALES_REPORT", "VIEW_PROFIT_REPORT", "EXPORT_REPORTS",
      "OVERRIDE_CASHIER_RESTRICTIONS",
      "CREATE_SALE", "PROCESS_TRANSACTION", "VIEW_SALES", "ACCEPT_PAYMENTS", "GENERATE_RECEIPTS",
      "VIEW_USERS", "VIEW_EMPLOYEES", "VIEW_ROLES",
    ],
  },
  CASHIER: {
    name: "Cashier",
    description: "Process sales transactions, accept payments, generate receipts, apply standard discounts, view own performance. No return/refund authorization",
    color: "green",
    permissions: [
      "CREATE_SALE", "PROCESS_TRANSACTION", "VIEW_SALES",
      "ACCEPT_PAYMENTS", "GENERATE_RECEIPTS",
      "APPLY_STANDARD_DISCOUNT",
      "VIEW_OWN_PERFORMANCE",
      "VIEW_PRODUCTS", "VIEW_CATEGORIES", "VIEW_INVENTORY",
    ],
  },
  TECHNICIAN: {
    name: "Technician",
    description: "Create and manage repair jobs, set repair pricing, update job status, view assigned repairs, view own performance. No sales or inventory functions",
    color: "purple",
    permissions: [
      "CREATE_REPAIR_JOB", "MANAGE_REPAIR_JOBS",
      "SET_REPAIR_PRICING", "UPDATE_REPAIR_STATUS",
      "VIEW_ASSIGNED_REPAIRS", "VIEW_REPAIRS",
      "VIEW_OWN_PERFORMANCE",
    ],
  },
};

// Helper function to check if role has permission
export function roleHasPermission(role: string, permission: string): boolean {
  const roleDefn = ROLE_DEFINITIONS[role.toUpperCase()];
  if (!roleDefn) return false;
  
  if (roleDefn.permissions.includes("FULL_SYSTEM_ACCESS")) return true;
  return roleDefn.permissions.includes(permission);
}

// Get all permissions for a role
export function getRolePermissions(role: string): string[] {
  const roleDefn = ROLE_DEFINITIONS[role.toUpperCase()];
  return roleDefn ? roleDefn.permissions : [];
}

// Get permission display name
export function getPermissionDisplayName(code: string): string {
  return code.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
}
