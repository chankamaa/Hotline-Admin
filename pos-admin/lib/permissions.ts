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

  // ============ STOCK MANAGEMENT ============
  VIEW_STOCK_OVERVIEW: "VIEW_STOCK_OVERVIEW",
  ADJUST_STOCK: "ADJUST_STOCK",
  VIEW_LOW_STOCK_ALERTS: "VIEW_LOW_STOCK_ALERTS",
  VIEW_STOCK_MOVEMENTS: "VIEW_STOCK_MOVEMENTS",
  APPROVE_STOCK_ADJUSTMENTS: "APPROVE_STOCK_ADJUSTMENTS",

  // ============ WARRANTY MANAGEMENT ============
  SETUP_WARRANTY: "SETUP_WARRANTY",
  VIEW_WARRANTY: "VIEW_WARRANTY",
  REGISTER_WARRANTY: "REGISTER_WARRANTY",
  PROCESS_WARRANTY_CLAIM: "PROCESS_WARRANTY_CLAIM",
  VIEW_WARRANTY_CLAIMS: "VIEW_WARRANTY_CLAIMS",

  // ============ CUSTOMER MANAGEMENT ============
  CREATE_CUSTOMER: "CREATE_CUSTOMER",
  VIEW_CUSTOMERS: "VIEW_CUSTOMERS",
  UPDATE_CUSTOMER: "UPDATE_CUSTOMER",
  DELETE_CUSTOMER: "DELETE_CUSTOMER",
  MANAGE_CUSTOMER_COMMUNICATIONS: "MANAGE_CUSTOMER_COMMUNICATIONS",

  // ============ PURCHASE ORDERS & SUPPLIERS ============
  CREATE_PURCHASE_ORDER: "CREATE_PURCHASE_ORDER",
  VIEW_PURCHASE_ORDERS: "VIEW_PURCHASE_ORDERS",
  UPDATE_PURCHASE_ORDER: "UPDATE_PURCHASE_ORDER",
  APPROVE_PURCHASE_ORDER: "APPROVE_PURCHASE_ORDER",
  VIEW_SUPPLIERS: "VIEW_SUPPLIERS",
  MANAGE_SUPPLIERS: "MANAGE_SUPPLIERS",

  // ============ PRICING & DISCOUNTS ============
  VIEW_PRICE_HISTORY: "VIEW_PRICE_HISTORY",
  UPDATE_BULK_PRICES: "UPDATE_BULK_PRICES",
  MANAGE_DISCOUNT_RULES: "MANAGE_DISCOUNT_RULES",

  // ============ BRANCHES ============
  CREATE_BRANCH: "CREATE_BRANCH",
  VIEW_BRANCHES: "VIEW_BRANCHES",
  UPDATE_BRANCH: "UPDATE_BRANCH",
  DELETE_BRANCH: "DELETE_BRANCH",

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
    description: "Manage inventory and stock - Admin/Manager access",
    permissions: [
      { code: "MANAGE_INVENTORY", description: "Full inventory management - Complete control over inventory operations" },
      { code: "VIEW_INVENTORY", description: "View inventory - Read-only access to inventory levels" },
      { code: "ADD_INVENTORY", description: "Add inventory - Create new inventory items and receive stock" },
      { code: "EDIT_INVENTORY", description: "Edit inventory - Modify existing inventory records" },
      { code: "DELETE_INVENTORY", description: "Delete inventory - Remove inventory items from system" },
      { code: "INVENTORY_TRANSFER", description: "Transfer inventory - Move stock between locations" },
      { code: "INVENTORY_AUDIT", description: "Perform audits - Conduct stock audits and reconciliation" },
    ],
  },
  STOCK: {
    name: "Stock Management",
    description: "Monitor and adjust stock levels - Admin/Manager access",
    permissions: [
      { code: "VIEW_STOCK_OVERVIEW", description: "View stock overview - Access stock dashboard" },
      { code: "ADJUST_STOCK", description: "Adjust stock - Make manual stock adjustments" },
      { code: "VIEW_LOW_STOCK_ALERTS", description: "View low stock alerts - Monitor reorder thresholds" },
      { code: "VIEW_STOCK_MOVEMENTS", description: "View stock movements - Track all stock transactions" },
      { code: "APPROVE_STOCK_ADJUSTMENTS", description: "Approve stock adjustments - Review and authorize changes" },
    ],
  },
  WARRANTY: {
    name: "Warranty Management",
    description: "Manage warranties and claims - Admin/Manager/Cashier access",
    permissions: [
      { code: "SETUP_WARRANTY", description: "Setup warranty - Configure warranty policies" },
      { code: "VIEW_WARRANTY", description: "View warranty - Access warranty information" },
      { code: "REGISTER_WARRANTY", description: "Register warranty - Register product warranties" },
      { code: "PROCESS_WARRANTY_CLAIM", description: "Process warranty claim - Handle claims" },
      { code: "VIEW_WARRANTY_CLAIMS", description: "View warranty claims - Monitor all claims" },
    ],
  },
  CUSTOMERS: {
    name: "Customer Management",
    description: "Manage customer information - Admin/Manager/Cashier access",
    permissions: [
      { code: "CREATE_CUSTOMER", description: "Create customer - Add new customers" },
      { code: "VIEW_CUSTOMERS", description: "View customers - Access customer database" },
      { code: "UPDATE_CUSTOMER", description: "Update customer - Edit customer information" },
      { code: "DELETE_CUSTOMER", description: "Delete customer - Remove customer records" },
      { code: "MANAGE_CUSTOMER_COMMUNICATIONS", description: "Manage communications - Send notifications" },
    ],
  },
  PURCHASE_ORDERS: {
    name: "Purchase Order Management",
    description: "Manage purchase orders and suppliers - Admin/Manager access",
    permissions: [
      { code: "CREATE_PURCHASE_ORDER", description: "Create purchase order - Generate new POs" },
      { code: "VIEW_PURCHASE_ORDERS", description: "View purchase orders - Access PO records" },
      { code: "UPDATE_PURCHASE_ORDER", description: "Update purchase order - Modify PO details" },
      { code: "APPROVE_PURCHASE_ORDER", description: "Approve purchase order - Authorize POs" },
      { code: "VIEW_SUPPLIERS", description: "View suppliers - Access supplier directory" },
      { code: "MANAGE_SUPPLIERS", description: "Manage suppliers - Add/edit suppliers" },
    ],
  },
  PRICING: {
    name: "Pricing & Discount Management",
    description: "Manage pricing and discount rules - Admin/Manager access",
    permissions: [
      { code: "VIEW_PRICE_HISTORY", description: "View price history - Access pricing changes" },
      { code: "UPDATE_BULK_PRICES", description: "Update bulk prices - Modify multiple prices" },
      { code: "MANAGE_DISCOUNT_RULES", description: "Manage discount rules - Configure discounts" },
    ],
  },
  BRANCHES: {
    name: "Branch Management",
    description: "Manage branch locations - Admin only",
    permissions: [
      { code: "CREATE_BRANCH", description: "Create branch - Add new branch locations" },
      { code: "VIEW_BRANCHES", description: "View branches - Access branch information" },
      { code: "UPDATE_BRANCH", description: "Update branch - Modify branch details" },
      { code: "DELETE_BRANCH", description: "Delete branch - Remove branch records" },
    ],
  },
 REPAIRS: {
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
    description: "Manage sales, reports, inventory and assign roles - Full operational control with staff oversight",
    color: "blue",
    permissions: [
      // Sales & Transactions
      "CREATE_SALE", "PROCESS_TRANSACTION", "VIEW_SALES", "ACCEPT_PAYMENTS", "GENERATE_RECEIPTS",
      "AUTHORIZE_RETURNS", "AUTHORIZE_REFUNDS", "PROCESS_RETURNS",
      
      // Discounts & Pricing
      "APPLY_STANDARD_DISCOUNT", "APPLY_HIGH_VALUE_DISCOUNT", "APPROVE_DISCOUNTS",
      "VIEW_PRICE_HISTORY", "UPDATE_BULK_PRICES", "MANAGE_DISCOUNT_RULES",
      
      // Inventory & Stock
      "MANAGE_INVENTORY", "VIEW_INVENTORY", "ADD_INVENTORY", "EDIT_INVENTORY",
      "DELETE_INVENTORY", "INVENTORY_TRANSFER", "INVENTORY_AUDIT",
      "VIEW_STOCK_OVERVIEW", "ADJUST_STOCK", "VIEW_LOW_STOCK_ALERTS",
      "VIEW_STOCK_MOVEMENTS", "APPROVE_STOCK_ADJUSTMENTS",
      
      // Products & Categories
      "CREATE_PRODUCT", "VIEW_PRODUCTS", "UPDATE_PRODUCT", "DELETE_PRODUCT",
      "CREATE_CATEGORY", "VIEW_CATEGORIES", "UPDATE_CATEGORY", "DELETE_CATEGORY",
      
      // Reports
      "VIEW_FINANCIAL_REPORTS", "VIEW_SALES_REPORT", "VIEW_PROFIT_REPORT",
      "VIEW_ALL_REPORTS", "EXPORT_REPORTS", "VIEW_EMPLOYEE_PERFORMANCE", "VIEW_OWN_PERFORMANCE",
      
      // Customers
      "CREATE_CUSTOMER", "VIEW_CUSTOMERS", "UPDATE_CUSTOMER", "MANAGE_CUSTOMER_COMMUNICATIONS",
      
      // Warranty
      "SETUP_WARRANTY", "VIEW_WARRANTY", "REGISTER_WARRANTY",
      "PROCESS_WARRANTY_CLAIM", "VIEW_WARRANTY_CLAIMS",
      
      // Purchase Orders & Suppliers
      "CREATE_PURCHASE_ORDER", "VIEW_PURCHASE_ORDERS", "UPDATE_PURCHASE_ORDER",
      "APPROVE_PURCHASE_ORDER", "VIEW_SUPPLIERS", "MANAGE_SUPPLIERS",
      
      // User & Role Management
      "VIEW_USERS", "VIEW_EMPLOYEES", "VIEW_ROLES", "ASSIGN_ROLES", "MANAGE_EMPLOYEES",
      
      // System
      "OVERRIDE_CASHIER_RESTRICTIONS",
    ],
  },
  CASHIER: {
    name: "Cashier",
    description: "Process sales, manage customer interactions, and handle warranty registrations - Front-line operations",
    color: "green",
    permissions: [
      // Sales Operations
      "CREATE_SALE", "PROCESS_TRANSACTION", "VIEW_SALES",
      "ACCEPT_PAYMENTS", "GENERATE_RECEIPTS",
      
      // Discounts (Standard Only)
      "APPLY_STANDARD_DISCOUNT",
      
      // Products & Inventory (View Only)
      "VIEW_PRODUCTS", "VIEW_CATEGORIES", "VIEW_INVENTORY",
      "VIEW_STOCK_OVERVIEW", "VIEW_LOW_STOCK_ALERTS",
      
      // Customer Management
      "CREATE_CUSTOMER", "VIEW_CUSTOMERS", "UPDATE_CUSTOMER",
      
      // Warranty Operations
      "VIEW_WARRANTY", "REGISTER_WARRANTY", "VIEW_WARRANTY_CLAIMS",
      
      // Performance
      "VIEW_OWN_PERFORMANCE",
    ],
  },
  TECHNICIAN: {
    name: "Technician",
    description: "Manage repair jobs and diagnostics - Specialized repair operations with limited system access",
    color: "purple",
    permissions: [
      // Repair Operations
      "CREATE_REPAIR_JOB", "MANAGE_REPAIR_JOBS",
      "SET_REPAIR_PRICING", "UPDATE_REPAIR_STATUS",
      "VIEW_ASSIGNED_REPAIRS", "VIEW_REPAIRS",
      
      // Warranty (View Only)
      "VIEW_WARRANTY", "VIEW_WARRANTY_CLAIMS",
      
      // Limited Product View
      "VIEW_PRODUCTS", "VIEW_INVENTORY",
      
      // Performance
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
