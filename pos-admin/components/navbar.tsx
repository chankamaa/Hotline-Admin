"use client";

import { Menu, Bell, Search, Plus, LogOut, User, ChevronDown } from "lucide-react";
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
    <header className="h-16 border-b border-slate-200/60 bg-blue-600 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
      <div className="h-full px-6 flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 backdrop-blur-sm"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-slate-600" />
        </button>

        {/* Page title */}
        <div className="font-bold text-xl text-slate-800 tracking-tight">{title}</div>

        {/* Search */}
        <div className="ml-auto flex items-center bg-white/50 gap-3 w-full max-w-[600px]">
          <div className="relative w-full bg-white rounded-xl border">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900"
            />
            <input
              className="w-full pl-10 pr-4 py-3 text-gray-900 rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300/60 transition-all duration-200 placeholder:text-gray-900"
              placeholder="Search sales, products, customers, IMEI..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-900 bg-slate-100 px-2 py-1 rounded-md font-medium">
              ⌘K
            </div>
          </div>

          {/* Quick action */}
          <button className="hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
            <Plus size={16} />
            New
          </button>

          {/* Notifications */}
          <button
            className="p-3 rounded-xl hover:bg-slate-100/80 transition-all duration-200 backdrop-blur-sm relative group"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span className="absolute top-2 right-2 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-sm" />
          </button>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-sm text-sm hover:bg-slate-50/80 flex items-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="h-8 w-8 rounded-full bg-white to-indigo-500 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <span className="font-medium text-slate-700">{user?.username || "User"}</span>
              <ChevronDown size={16} className="text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-blue-600 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/60 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200/60">
                  <p className="text-sm font-semibold text-slate-800">{user?.username}</p>
                  {user?.email && (
                    <p className="text-xs text-slate-500 truncate mt-1">{user.email}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 text-sm text-left hover:bg-red-50 flex items-center gap-3 text-red-500 font-medium transition-colors"
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
