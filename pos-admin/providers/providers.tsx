"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getMe } from "@/lib/auth";
import { clearSession } from "@/lib/api/api";

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  permissions?: any;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/admin/login", "/admin/signup"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    const checkAuth = async () => {
      // Check if we have a token in localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);

        // Redirect to login if trying to access protected route
        if (!isPublicRoute && pathname?.startsWith("/admin")) {
          router.push("/admin/login");
        }
        return;
      }

      try {
        // Fetch user data to validate session
        const me = await getMe();
        setUser(me);
        setIsAuthenticated(true);

        // If user is authenticated and on login page, redirect to dashboard
        if (isPublicRoute && me) {
          router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // Clear invalid session
        clearSession();
        setUser(null);
        setIsAuthenticated(false);

        // Redirect to login if trying to access protected route
        if (!isPublicRoute && pathname?.startsWith("/admin")) {
          router.push("/admin/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, isPublicRoute, router]);

  const logout = () => {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/admin/login");
  };

  // Show loading spinner while checking authentication (only for protected routes)
  if (loading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // For public routes, don't block rendering while loading
  if (loading && isPublicRoute) {
    return (
      <AuthContext.Provider value={{ user, setUser, loading, logout, isAuthenticated }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Block access to protected routes if not authenticated
  if (!isAuthenticated && !isPublicRoute && pathname?.startsWith("/admin")) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
