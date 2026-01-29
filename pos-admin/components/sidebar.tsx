"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "./sidebar-config";
import {ChevronDown} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/providers";
import { can, hasRole } from "@/lib/acl";

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
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedPath = useMemo(() => {
    return pathname.replace(/^\/admin/, "") || "/";
  }, [pathname]);

  // Sidebar title dropdown options (EXTEND LATER)

  const toggleSection = (sectionLabel: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionLabel)
        ? prev.filter((label) => label !== sectionLabel)
        : [...prev, sectionLabel]
    );
  };

  // Filter navigation based on user permissions and roles
  const filteredNav = useMemo(() => {
    if (!user) return [];

    return adminNav
      .map((section) => {
        // Check if section has role restrictions
        if (section.roles && !hasRole(user, section.roles)) {
          return null;
        }

        // Filter items based on permissions
        const filteredItems = section.items.filter((item) => {
          // If item has permission requirement, check it
          if (item.permission && !can(user, item.permission)) {
            return false;
          }
          return true;
        });

        // Only include section if it has visible items
        if (filteredItems.length === 0) return null;

        return {
          ...section,
          items: filteredItems,
        };
      })
      .filter(Boolean);
  }, [user]);

  return (
    <aside
      className={cx(
        
        
        collapsed ? "w-[76px]" : "w-[280px]",
        "transition-all duration-300 ease-in-out"
      )}
      aria-label="Admin sidebar"
    >
      {/* ================= TITLE / BRAND AREA ================= */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-600/60 bg-blue-600 to-indigo-600">
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="h-10 w-24 rounded-xl bg-white/20 backdrop-blur-sm text--700 flex items-center justify-center font-bold text-lg shadow-lg border border-white/20">
            Hotline
          </div>

          {!collapsed && (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 text-left hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <div className="leading-tight">
                  <div className="text-white/90 font-semibold">Admin Panel</div>
                  <div className="text-xs text-white/70">Management Suite</div>
                </div>
                
              </button>
            </div>
          )}
        </div>  
      </div>

      {/* ================= NAVIGATION ================= */}
      <nav className="px-3 py-4 overflow-y-auto h-[calc(100dvh-64px)] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {filteredNav.map((section: any) => {
          const isExpanded = expandedSections.includes(section.label);
          const hasMultipleItems = section.items.length > 1;

          return (
            <div key={section.label} className="mb-8 text-gray-900 ">
              {!collapsed && hasMultipleItems && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full px-3 py-2.5 text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    {/** Render section-level icon if provided */}
                    {(
                      (section as any).icon &&
                      (() => {
                        const SectionIcon = (section as any).icon as any;
                        return <SectionIcon size={16} className="shrink-0 text-blue-600 group-hover:text-indigo-600 transition-colors" />;
                      })()
                    )}
                    <span className="group-hover:text-slate-900  text-amber-200transition-colors">{section.label}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={cx(
                      "transition-all duration-300 text-slate-500 group-hover:text-slate-700",
                      isExpanded ? "rotate-180" : ""
                    )}
                  />
                </button>
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
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                            "hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 hover:shadow-sm",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:shadow-md",
                            isActive 
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md" 
                              : "text-slate-600 hover:text-slate-900"
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <Icon size={18} className={cx(
                            "shrink-0 transition-colors",
                            isActive ? "text-white" : "text-slate-500 group-hover:text-blue-600"
                          )} />
                          {!collapsed && (
                            <>
                              <span className="flex-1 group-hover:font-semibold transition-all">{item.title}</span>
                              {badge && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-sm">
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
