"use client";

import { Menu, Bell, Search, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/providers/providers";
import { useState, useRef, useEffect } from "react";

export function AdminNavbar({
  onOpenMobileSidebar,
  title = "Dashboard",
}: {
  onOpenMobileSidebar: () => void;
  title?: string;
}) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b bg-white sticky top-0 z-20">
      <div className="h-full px-4 flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div className="font-semibold text-gray-900">{title}</div>

        {/* Search */}
        <div className="ml-auto flex items-center gap-2 w-full max-w-[520px]">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Search sales, products, customers, IMEI..."
            />
          </div>

          {/* Quick action */}
          <button className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black text-white text-sm hover:opacity-90">
            <Plus size={16} />
            New
          </button>

          {/* Notifications */}
          <button
            className="p-2 rounded-xl hover:bg-gray-100 relative"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="px-3 py-2 rounded-xl border text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <User size={16} />
              {user?.username || "User"} ▾
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                  {user?.email && (
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
