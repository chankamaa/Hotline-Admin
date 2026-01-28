import {
  LayoutDashboard,
  ShoppingCart,
  RotateCcw,
  CreditCard,
  Package,
  Tags,
  Tag,
  Boxes,
  ClipboardList,
  AlertTriangle,
  Barcode,
  Wrench,
  Users,
  ShieldCheck,
  Truck,
  Percent,
  BarChart3,
  UserCog,
  Bell,
  Settings,
  Database,
  HardDrive,
  Plus,
  Building,
  RefreshCw,
  ArrowRightLeft,
  LucideIcon,
} from "lucide-react";

// User roles
export type UserRole = "admin" | "manager" | "cashier" | "technician" | "inventory-manager";

// Navigation item types
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

export interface NavSection {
  label: string;
  icon?: LucideIcon;
  items: NavItem[];
  roles?: UserRole[];
}

// Permission constants - Aligned with backend (/src/constants/permission.js)
export const PERMISSIONS = {
  // Sales Operations
  CREATE_SALE: "CREATE_SALE",
  VOID_SALE: "VOID_SALE",
  VIEW_SALES: "VIEW_SALES",
  APPLY_DISCOUNT: "APPLY_DISCOUNT",

  // Returns
  CREATE_RETURN: "CREATE_RETURN",
  VIEW_RETURNS: "VIEW_RETURNS",

  // Reports
  VIEW_PROFIT_REPORT: "VIEW_PROFIT_REPORT",
  VIEW_SALES_REPORT: "VIEW_SALES_REPORT",
  EXPORT_REPORTS: "EXPORT_REPORTS",

  // User Management
  CREATE_USER: "CREATE_USER",
  VIEW_USERS: "VIEW_USERS",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  UPDATE_OWN_PROFILE: "UPDATE_OWN_PROFILE",

  // Role Management
  MANAGE_ROLES: "MANAGE_ROLES",
  ASSIGN_ROLES: "ASSIGN_ROLES",

  // Permission Management
  MANAGE_PERMISSIONS: "MANAGE_PERMISSIONS",
  ASSIGN_PERMISSIONS: "ASSIGN_PERMISSIONS",

  // Category Management
  CREATE_CATEGORY: "CREATE_CATEGORY",
  VIEW_CATEGORIES: "VIEW_CATEGORIES",
  UPDATE_CATEGORY: "UPDATE_CATEGORY",
  DELETE_CATEGORY: "DELETE_CATEGORY",

  // Product Management
  CREATE_PRODUCT: "CREATE_PRODUCT",
  VIEW_PRODUCTS: "VIEW_PRODUCTS",
  UPDATE_PRODUCT: "UPDATE_PRODUCT",
  DELETE_PRODUCT: "DELETE_PRODUCT",

  // Inventory
  MANAGE_INVENTORY: "MANAGE_INVENTORY",
  VIEW_INVENTORY: "VIEW_INVENTORY",

  // Repair Management
  CREATE_REPAIR: "CREATE_REPAIR",
  VIEW_REPAIRS: "VIEW_REPAIRS",
  VIEW_OWN_REPAIRS: "VIEW_OWN_REPAIRS",
  ASSIGN_REPAIR: "ASSIGN_REPAIR",
  UPDATE_REPAIR: "UPDATE_REPAIR",
  COMPLETE_REPAIR: "COMPLETE_REPAIR",
  COLLECT_REPAIR_PAYMENT: "COLLECT_REPAIR_PAYMENT",
  CANCEL_REPAIR: "CANCEL_REPAIR",

  // Warranty Management
  CREATE_WARRANTY: "CREATE_WARRANTY",
  VIEW_WARRANTIES: "VIEW_WARRANTIES",
  UPDATE_WARRANTY: "UPDATE_WARRANTY",
  VOID_WARRANTY: "VOID_WARRANTY",
  CREATE_WARRANTY_CLAIM: "CREATE_WARRANTY_CLAIM",
  VIEW_WARRANTY_REPORTS: "VIEW_WARRANTY_REPORTS",

  // Settings
  MANAGE_SETTINGS: "MANAGE_SETTINGS",

  // Promotions
  MANAGE_PROMOTIONS: "MANAGE_PROMOTIONS",
  VIEW_PROMOTIONS: "VIEW_PROMOTIONS",
} as const;

export const adminNav = [
  {
    label: "Dashboard",
    items: [
      { title: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
    roles: ["admin"],
  },
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
    roles: ["manager", "cashier", "technician", "inventory-manager"],
  },

  {
    label: "Sales",
    icon: ShoppingCart,
    items: [
      { title: "Sales", href: "/admin/sales", icon: ShoppingCart },
      { title: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw },
      { title: "Payments & Reconciliation", href: "/admin/payments", icon: CreditCard },
    ],
    roles: ["admin", "manager", "cashier"],
  },

  {
    label: "Inventory",
    icon: Package,
    items: [
      { title: "Products", href: "/admin/products", icon: Package, },
      { title: "Categories & Brands", href: "/admin/categories", icon: Tags, },
      { title: "Barcodes & Labels", href: "/admin/barcodes", icon: Barcode, },
    ],
    roles: ["admin", "manager", "cashier"],
  },

  {
    label: "Stock Management",
    icon: Boxes,
    items: [
      { title: "Stock Overview", href: "/admin/stock", icon: LayoutDashboard, },
      { title: "Stock Adjustment", href: "/admin/stock/adjustment", icon: RefreshCw, },
      { title: "Low Stock Alerts", href: "/admin/stock/low", icon: AlertTriangle, },
    ],
    roles: ["admin", "manager"]
  },
  /*
   {
    label: "Stock Movements",
     icon: ClipboardList,
     items: [
       { title: "All Movements", href: "/admin/stock/movements", icon: ClipboardList },
       { title: "Audit Trail", href: "/admin/stock/audit", icon: ShieldCheck },
       { title: "Movement Reports", href: "/admin/stock/reports", icon: BarChart3 },
     ],
     roles: ["admin", ""],
   },
 */
  {
    label: "Repairs & Service",
    icon: Wrench,
    items: [
      { title: "Repair Jobs", href: "/admin/repairs", icon: Wrench },
      { title: "Repair History", href: "/admin/repairs/history", icon: ClipboardList },
    ],
    roles: ["admin", "manager", "cashier", "technician"],
  },

  {
    label: "Warranty",
    icon: ShieldCheck,
    items: [
      { title: "Warranty Setup", href: "/admin/warranty/setup", icon: ShieldCheck },
      { title: "Registrations", href: "/admin/warranty/registrations", icon: ClipboardList },
      { title: "Claims & Analytics", href: "/admin/warranty/claims", icon: BarChart3 },
    ],
    roles: ["admin", "", "cashier", "technician"],
  },

  {
    label: "Customers",
    icon: Users,
    items: [
      { title: "Customers", href: "/admin/customers", icon: Users },
      { title: "Communications", href: "/admin/communications", icon: Bell },
    ],
    roles: ["admin", "", "cashier"],
  },


  {
    label: "Purchase Order",
    icon: Plus,
    items: [
      { title: "Create PO", href: "/admin/purchase-orders/create", icon: Plus },
      { title: "All PO", href: "/admin/purchase-orders", icon: ClipboardList },
      { title: "Supplier Directory", href: "/admin/suppliers", icon: Truck },
    ],
    roles: ["admin", ""],
  },

  {
    label: "Pricing & Promotions",
    icon: Percent,
    items: [
      { title: "Promotions", href: "/admin/promotions", icon: Tag, permission: PERMISSIONS.VIEW_PROMOTIONS },
      { title: "Price History", href: "/admin/pricing/history", icon: Tags },
      { title: "Bulk Price Updates", href: "/admin/pricing/bulk", icon: Percent },
      { title: "Discount Rules", href: "/admin/discounts", icon: Percent },
    ],
    roles: ["admin", "manager"],
  },

  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3, permission: PERMISSIONS.VIEW_SALES_REPORT },
      { title: "Custom Report Builder", href: "/admin/reports/builder", icon: Database, permission: PERMISSIONS.VIEW_SALES_REPORT },
    ],
    roles: ["admin", "manager", "cashier"],
  },

  {
    label: "Employees",
    icon: UserCog,
    items: [
      { title: "Employees", href: "/admin/employees", icon: UserCog },
      { title: "Attendance & Sessions", href: "/admin/attendance", icon: ClipboardList },
      { title: "Performance", href: "/admin/performance", icon: BarChart3 },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    ],
    roles: ["admin", ""],
  },

  {
    label: "Permissions",
    icon: Building,
    items: [
      { title: "Branches", href: "/admin/permissions/branches", icon: Building },
      { title: "Users", href: "/admin/permissions/users", icon: Users, permission: PERMISSIONS.VIEW_USERS },
      { title: "Roles", href: "/admin/permissions/roles", icon: ShieldCheck, permission: PERMISSIONS.MANAGE_ROLES },
      { title: "Permission Matrix", href: "/admin/permissions/matrix", icon: ShieldCheck, permission: PERMISSIONS.MANAGE_ROLES },
    ],
    roles: ["admin"],
  },

  {
    label: "Settings",
    icon: Settings,
    items: [
      { title: "Company & Tax", href: "/admin/settings/company", icon: Settings },
      { title: "Notifications", href: "/admin/settings/notifications", icon: Bell },
      { title: "Hardware & Integrations", href: "/admin/settings/integrations", icon: HardDrive },
      { title: "Backup & Restore", href: "/admin/settings/backup", icon: Database },
    ],
    roles: ["admin"]
  },
];
