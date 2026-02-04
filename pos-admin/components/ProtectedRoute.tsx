"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/providers";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackPath?: string;
}

/**
 * Component to protect routes and optionally check for specific permissions
 * Usage:
 * <ProtectedRoute requiredPermission="MANAGE_PRODUCTS">
 *   <YourComponent />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  fallbackPath = "/admin/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(fallbackPath);
    }
  }, [isAuthenticated, loading, router, fallbackPath]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return null;
  }

  // Check permission if required
  if (requiredPermission) {
    const hasPermission = checkUserPermission(user, requiredPermission);
    
    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Helper function to check user permissions
function checkUserPermission(user: any, permission: string): boolean {
  if (!user) return false;

  // Check if user has ALL permissions
  if (user.permissions?.effectivePermissions?.includes("ALL")) {
    return true;
  }

  // Check for specific permission
  if (user.permissions?.effectivePermissions?.includes(permission)) {
    return true;
  }

  // Check legacy permission format
  if (Array.isArray(user.permissions) && user.permissions.includes(permission)) {
    return true;
  }

  return false;
}
