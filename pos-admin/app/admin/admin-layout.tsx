"use client";

import { useState } from "react";
import { AdminSidebar } from "../sidebar/sidebar";
import { AdminNavbar } from "../../components/navbar";


export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-100 h-screen flex">
      {/* Desktop Sidebar - Fixed */}
      <div className="hidden md:block">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar - Overlay */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
          
          {/* Mobile Sidebar */}
          <div className="fixed left-0 top-0 h-full z-50 md:hidden">
            <AdminSidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar - Fixed */}
        <AdminNavbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          title="Dashboard"
        />

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

       
      </div>
    </div>
  );
}