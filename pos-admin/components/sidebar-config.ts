import {
  LayoutDashboard,
  ShoppingCart,
  RotateCcw,
  CreditCard,
  Package,
  Tags,
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
  icons,
  Building,
} from "lucide-react";

export const adminNav = [
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },

  {
    label: "Sales",
    items: [
      { title: "Sales", href: "/admin/sales", icon: ShoppingCart },
      { title: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw },
      { title: "Payments & Reconciliation", href: "/admin/payments", icon: CreditCard },
    ],
  },

  {
    label: "Inventory",
    items: [
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Categories & Brands", href: "/admin/categories", icon: Tags },
      { title: "Stock Management", href: "/admin/stock", icon: Boxes },
      { title: "Stock Movements", href: "/admin/stock/movements", icon: ClipboardList },
      { title: "Low Stock Alerts", href: "/admin/stock/low", icon: AlertTriangle },
      { title: "Barcodes & Labels", href: "/admin/barcodes", icon: Barcode },
      { title: "Suppliers (Inventory)", href: "/admin/inventory-suppliers", icon: Truck },
    ],
  },

  {
    label: "Repairs & Service",
    items: [
      { title: "Repair Jobs", href: "/admin/repairs", icon: Wrench },
      { title: "Technician Workload", href: "/admin/repairs/workload", icon: Users },
      { title: "Repair History", href: "/admin/repairs/history", icon: ClipboardList },
    ],
  },

  {
    label: "Warranty",
    items: [
      { title: "Warranty Setup", href: "/admin/warranty/setup", icon: ShieldCheck },
      { title: "Registrations", href: "/admin/warranty/registrations", icon: ClipboardList },
      { title: "Claims & Analytics", href: "/admin/warranty/claims", icon: BarChart3 },
    ],
  },

  {
    label: "Customers",
    items: [
      { title: "Customers", href: "/admin/customers", icon: Users },
      { title: "Communications", href: "/admin/communications", icon: Bell },
    ],
  },

  {
    label: "Suppliers & Purchasing",
    items: [
      { title: "Supplier Directory", href: "/admin/suppliers", icon: Truck },
    ],
  },

  {
    label: "Purchase Order",
    items: [
      { title: "Create PO", href: "/admin/purchase-orders/create", icon: Plus },
      { title: "All PO", href: "/admin/purchase-orders", icon: ClipboardList },
    ],
  },

  {
    label: "Pricing & Discounts",
    items: [
      { title: "Price History", href: "/admin/pricing/history", icon: Tags },
      { title: "Bulk Price Updates", href: "/admin/pricing/bulk", icon: Percent },
      { title: "Discount Rules", href: "/admin/discounts", icon: Percent },
    ],
  },

  {
    label: "Reports",
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3 },
      { title: "Custom Report Builder", href: "/admin/reports/builder", icon: Database },
    ],
  },

  {
    label: "Employees",
    items: [
      { title: "Employees", href: "/admin/employees", icon: UserCog },
      { title: "Attendance & Sessions", href: "/admin/attendance", icon: ClipboardList },
      { title: "Performance", href: "/admin/performance", icon: BarChart3 },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    ],
  },

  {
    label: "Permissions",
    items: [
      { title: "Branches", href: "/admin/permissions/branches", icon: Building },
      { title: "Users", href: "/admin/permissions/users", icon: ShieldCheck },
    ],
  },

  {
    label: "Settings",
    items: [
      { title: "Company & Tax", href: "/admin/settings/company", icon: Settings },
      { title: "Notifications", href: "/admin/settings/notifications", icon: Bell },
      { title: "Hardware & Integrations", href: "/admin/settings/integrations", icon: HardDrive },
      { title: "Backup & Restore", href: "/admin/settings/backup", icon: Database },
    ],
  },
];
