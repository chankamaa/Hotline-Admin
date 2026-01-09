"use client";

import { AuthProvider } from "@/providers/providers";
import { AdminLayout } from "./admin-layout";
import { usePathname } from "next/navigation";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Routes that should NOT have the admin layout (sidebar/navbar)
  const publicRoutes = ["/admin/login", "/admin/signup"];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

  return (
    <AuthProvider>
      {isPublicRoute ? (
        // Render login/signup pages without admin layout
        <>{children}</>
      ) : (
        // Render dashboard and other pages with admin layout
        <AdminLayout>{children}</AdminLayout>
      )}
    </AuthProvider>
  );
}
