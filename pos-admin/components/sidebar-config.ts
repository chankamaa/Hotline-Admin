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
  Building,
  RefreshCw,
  ArrowRightLeft,
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
    icon: ShoppingCart,
    items: [
      { title: "Sales", href: "/admin/sales", icon: ShoppingCart },
      { title: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw },
      { title: "Payments & Reconciliation", href: "/admin/payments", icon: CreditCard },
    ],
  },

  {
    label: "Inventory",
    icon: Package,
    items: [
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Categories & Brands", href: "/admin/categories", icon: Tags },
      { title: "Barcodes & Labels", href: "/admin/barcodes", icon: Barcode },
    ],
  },

  {
    label: "Stock Management",
    icon: Boxes,
    items: [
      { title: "Stock Overview", href: "/admin/stock", icon: LayoutDashboard },
      { title: "Stock Entry", href: "/admin/stock/entry", icon: Plus },
      { title: "Stock Adjustment", href: "/admin/stock/adjustment", icon: RefreshCw },
      { title: "Stock Transfer", href: "/admin/stock/transfer", icon: ArrowRightLeft },
      { title: "Low Stock Alerts", href: "/admin/stock/low", icon: AlertTriangle },
    ],
  },

  {
    label: "Stock Movements",
    icon: ClipboardList,
    items: [
      { title: "All Movements", href: "/admin/stock/movements", icon: ClipboardList },
      { title: "Audit Trail", href: "/admin/stock/audit", icon: ShieldCheck },
      { title: "Movement Reports", href: "/admin/stock/reports", icon: BarChart3 },
    ],
  },

  {
    label: "Repairs & Service",
    icon: Wrench,
    items: [
      { title: "Repair Jobs", href: "/admin/repairs", icon: Wrench },
      { title: "Technician Workload", href: "/admin/repairs/workload", icon: Users },
      { title: "Repair History", href: "/admin/repairs/history", icon: ClipboardList },
    ],
  },

  {
    label: "Warranty",
    icon: ShieldCheck,
    items: [
      { title: "Warranty Setup", href: "/admin/warranty/setup", icon: ShieldCheck },
      { title: "Registrations", href: "/admin/warranty/registrations", icon: ClipboardList },
      { title: "Claims & Analytics", href: "/admin/warranty/claims", icon: BarChart3 },
    ],
  },

  {
    label: "Customers",
    icon: Users,
    items: [
      { title: "Customers", href: "/admin/customers", icon: Users },
      { title: "Communications", href: "/admin/communications", icon: Bell },
    ],
  },


  {
    label: "Purchase Order",
    icon: Plus,
    items: [
      { title: "Create PO", href: "/admin/purchase-orders/create", icon: Plus },
      { title: "All PO", href: "/admin/purchase-orders", icon: ClipboardList },
       { title: "Supplier Directory", href: "/admin/suppliers", icon: Truck },
    ],
  },

  {
    label: "Pricing & Discounts",
    icon: Percent,
    items: [
      { title: "Price History", href: "/admin/pricing/history", icon: Tags },
      { title: "Bulk Price Updates", href: "/admin/pricing/bulk", icon: Percent },
      { title: "Discount Rules", href: "/admin/discounts", icon: Percent },
    ],
  },

  {
    label: "Reports",
    icon: BarChart3,
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3 },
      { title: "Custom Report Builder", href: "/admin/reports/builder", icon: Database },
    ],
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
  },

  {
    label: "Permissions",
    icon: Building,
    items: [
      { title: "Branches", href: "/admin/permissions/branches", icon: Building },
      { title: "Users", href: "/admin/permissions/users", icon: ShieldCheck },
      { title: "Roles", href: "/admin/permissions/roles", icon: ShieldCheck },
    ],
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
  },
];
