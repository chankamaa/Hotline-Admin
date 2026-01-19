"use client";

import { useAuth } from "@/providers/providers";
import { hasRole } from "@/lib/acl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import TechnicianDashboard from "./technician-dashboard";

/**
 * Technician Dashboard Page
 * 
 * This page is accessible ONLY to users with the 'technician' role.
 * It displays the technician workload overview, performance metrics,
 * and job management interface.
 * 
 * Access Control:
 * - Role Required: technician
 * - Unauthorized users are redirected to /admin/dashboard
 * - Non-authenticated users are redirected to /admin/login (handled by AuthProvider)
 */
export default function TechnicianDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // If no user, AuthProvider will handle redirect to login
    if (!user) return;

    // Check if user has technician role
    if (!hasRole(user, ["technician"])) {
      // Redirect non-technicians to main dashboard
      router.replace("/admin/dashboard");
    }
  }, [loading, user, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading technician dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have technician role
  if (!user || !hasRole(user, ["technician"])) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Technician Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor technician workload, performance metrics, and job assignments
        </p>
      </div>
      
      <TechnicianDashboard />
    </div>
  );
}
