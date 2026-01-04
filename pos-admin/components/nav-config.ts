import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Wrench,
  Shield,
  BarChart3,
  Settings,
  ClipboardList,
  Truck,
  RefreshCcw,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: any;
  badge?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const adminNav: NavSection[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/dashboard-overview", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { title: "Sales", href: "/sales", icon: ShoppingCart },
      { title: "Returns & Refunds", href: "/returns", icon: RefreshCcw, badge: "3" },
      { title: "Customers", href: "/customers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    items: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Stock Movements", href: "/stock", icon: ClipboardList },
      { title: "Suppliers", href: "/suppliers", icon: Truck },
    ],
  },
  {
    label: "Service",
    items: [
      { title: "Repairs", href: "/repairs", icon: Wrench, badge: "5" },
      { title: "Warranty", href: "/warranty", icon: Shield },
    ],
  },
  {
    label: "Insights",
    items: [{ title: "Reports", href: "/reports", icon: BarChart3 }],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];
