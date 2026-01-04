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
  icons,
} from "lucide-react";

export const adminNav = [
  {
    label: "Dashboard",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },

  {
    label: "Sales",
    items: [
      { title: "Sales", href: "/sales", icon: ShoppingCart },
      { title: "Returns & Refunds", href: "/returns", icon: RotateCcw },
      { title: "Payments & Reconciliation", href: "/payments", icon: CreditCard },
    ],
  },

  {
    label: "Inventory",
    items: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Categories & Brands", href: "/categories", icon: Tags },
      { title: "Stock Management", href: "/stock", icon: Boxes },
      { title: "Stock Movements", href: "/stock/movements", icon: ClipboardList },
      { title: "Low Stock Alerts", href: "/stock/low", icon: AlertTriangle },
      { title: "Barcodes & Labels", href: "/barcodes", icon: Barcode },
      { title: "Suppliers (Inventory)", href: "/inventory-suppliers", icon: Truck },
    ],
  },

  {
    label: "Repairs & Service",
    items: [
      { title: "Repair Jobs", href: "/repairs", icon: Wrench },
      { title: "Technician Workload", href: "/repairs/workload", icon: Users },
      { title: "Repair History", href: "/repairs/history", icon: ClipboardList },
    ],
  },

  {
    label: "Warranty",
    items: [
      { title: "Warranty Setup", href: "/warranty/setup", icon: ShieldCheck },
      { title: "Registrations", href: "/warranty/registrations", icon: ClipboardList },
      { title: "Claims & Analytics", href: "/warranty/claims", icon: BarChart3 },
    ],
  },

  {
    label: "Customers",
    items: [
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Communications", href: "/communications", icon: Bell },
    ],
  },

  {
    label: "Suppliers & Purchasing",
    items: [
      { title: "Supplier Directory", href: "/suppliers", icon: Truck },
      { title: "Purchase Orders", href: "/purchase-orders", icon: ClipboardList },
    ],
  },

  {
    label: "Pricing & Discounts",
    items: [
      { title: "Price History", href: "/pricing/history", icon: Tags },
      { title: "Bulk Price Updates", href: "/pricing/bulk", icon: Percent },
      { title: "Discount Rules", href: "/discounts", icon: Percent },
    ],
  },

  {
    label: "Reports",
    items: [
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "Custom Report Builder", href: "/reports/builder", icon: Database },
    ],
  },

  {
    label: "Employees",
    items: [
      { title: "Employees", href: "/employees", icon: UserCog },
      { title: "Attendance & Sessions", href: "/attendance", icon: ClipboardList },
      { title: "Performance", href: "/performance", icon: BarChart3 },
      { title: "Audit Logs", href: "/audit-logs", icon: ShieldCheck },
    ],
  },

  {
    label: "Settings",
    items: [
      { title: "Company & Tax", href: "/settings/company", icon: Settings },
      { title: "Notifications", href: "/settings/notifications", icon: Bell },
      { title: "Hardware & Integrations", href: "/settings/integrations", icon: HardDrive },
      { title: "Backup & Restore", href: "/settings/backup", icon: Database },
    ],
  },
];
