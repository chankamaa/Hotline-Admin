/**
 * usePermissions Hook
 * Provides permission checking functionality based on authenticated user's permissions
 */

import { useEffect, useState } from "react";
import { getMe } from "@/lib/auth";

export interface User {
  id: string;
  username: string;
  email?: string;
  isSuperAdmin: boolean;
  isActive: boolean;
  roles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  permissions: string[]; // effectivePermissions array
}

export function usePermissions() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getMe();
        setUser(userData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user permissions:", err);
        setError(err instanceof Error ? err.message : "Failed to load user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  /**
   * Check if user has a specific permission
   */
  const can = (permission: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    const permissions = user.permissions || [];
    return permissions.includes(permission);
  };

  /**
   * Check if user has all specified permissions
   */
  const canAll = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    return permissions.every((perm) => can(perm));
  };

  /**
   * Check if user has any of the specified permissions
   */
  const canAny = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    return permissions.some((perm) => can(perm));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    return user.roles?.some(
      (role) => role.name.toLowerCase() === roleName.toLowerCase()
    ) || false;
  };

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roleNames: string[]): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    
    return roleNames.some((roleName) => hasRole(roleName));
  };

  return {
    user,
    loading,
    error,
    can,
    canAll,
    canAny,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    isSuperAdmin: user?.isSuperAdmin || false,
  };
}
