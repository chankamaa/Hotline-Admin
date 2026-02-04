"use client";

import { useAuth } from "@/providers/providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Admin Root Page
 * 
 * This page redirects authenticated users to the main dashboard.
 */
export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      // Redirect all users to the main dashboard
      router.replace("/admin/dashboard");
    }
  }, [user, loading, router]);

  // Show loading while determining redirect
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
