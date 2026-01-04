"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./sidebar-config";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type SidebarTitleOption = {
  label: string;
  onClick: () => void;
};

export function AdminSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedPath = useMemo(() => {
    return pathname.replace(/^\/admin/, "") || "/";
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sidebar title dropdown options (EXTEND LATER)
  const titleOptions: SidebarTitleOption[] = [
    { label: "Dashboard Home", onClick: () => console.log("Dashboard Home") },
    { label: "Reports", onClick: () => console.log("Reports") },
    { label: "Settings", onClick: () => console.log("Settings") },
  ];

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionLabel)
        ? prev.filter((label) => label !== sectionLabel)
        : [...prev, sectionLabel]
    );
  };

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
      {/* ================= TITLE / BRAND AREA ================= */}
      <div className="h-14 px-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
          <div className="h-9 w-9 rounded-xl bg-black text-white flex items-center justify-center font-semibold">
            POS
          </div>

          {!collapsed && (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1 text-left hover:bg-gray-100 px-2 py-1 rounded-lg"
              >
                <div className="leading-tight">
                  <div className="font-semibold">Admin</div>
                  <div className="text-xs text-gray-500">Control panel</div>
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border bg-white shadow-lg overflow-hidden z-50">
                  {titleOptions.map((option) => (
                    <button
                      key={option.label}
                      onClick={() => {
                        option.onClick();
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="px-2 py-3 overflow-y-auto h-[calc(100dvh-56px)]">
        {adminNav.map((section) => {
          const isExpanded = expandedSections.includes(section.label);
          const hasMultipleItems = section.items.length > 1;

          return (
            <div key={section.label} className="mb-2">
              {!collapsed && hasMultipleItems && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    size={14}
                    className={cx(
                      "transition-transform duration-200",
                      isExpanded ? "rotate-180" : ""
                    )}
                  />
                </button>
              )}

              {!collapsed && !hasMultipleItems && (
                <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {section.label}
                </div>
              )}

              {/* Show items only if single item OR expanded */}
              {(!hasMultipleItems || isExpanded) && (
                <ul className="space-y-1 mt-2">
                  {section.items.map((item) => {
                    const isActive =
                      normalizedPath === item.href ||
                      normalizedPath.startsWith(item.href + "/");

                    const badge = (item as { badge?: string }).badge;
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
                              {badge && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-black text-white">
                                  {badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
