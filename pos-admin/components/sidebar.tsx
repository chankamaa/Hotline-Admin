"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./nav-config";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  const normalizedPath = useMemo(() => {
    // assuming routes like /dashboard, /sales etc under (admin)
    return pathname.replace(/^\/admin/, "") || "/";
  }, [pathname]);

  return (
    <aside
      className={cx(
        "h-dvh border-r bg-white",
        "sticky top-0",
        collapsed ? "w-[76px]" : "w-[280px]",
        "transition-[width] duration-200 ease-in-out"
      )}
      aria-label="Admin sidebar"
    >
      {/* Brand */}
      <div className="h-14 px-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center font-semibold">
            POS
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-semibold">Admin</div>
              <div className="text-xs text-gray-500">Control panel</div>
            </div>
          )}
        </div>

        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="px-2 py-3 overflow-y-auto h-[calc(100dvh-56px)]">
        {adminNav.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {section.label}
              </div>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  normalizedPath === item.href ||
                  normalizedPath.startsWith(item.href + "/");

                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cx(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                        "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/10",
                        isActive ? "bg-gray-100 font-medium" : "text-gray-700"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
