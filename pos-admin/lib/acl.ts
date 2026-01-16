export type UserRole = "admin" | "manager" | "cashier" | "technician";

export function can(user: any, perm: string) {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === "admin") return true;
  
  // backend /auth/me should include effective permissions list
  const permissions = user.effectivePermissions || user.permissions || [];
  
  // Ensure permissions is an array
  if (!Array.isArray(permissions)) {
    console.warn('User permissions is not an array:', permissions);
    return false;
  }
  
  return permissions.includes(perm);
}

export function hasRole(user: any, roles: UserRole[]): boolean {
  if (!user) return false;
  
  // Handle both user.role (string) and user.roles (array)
  if (user.role) {
    return roles.includes(user.role);
  }
  
  // Check if user has roles array
  if (Array.isArray(user.roles)) {
    return user.roles.some((userRole: any) => {
      const roleName = typeof userRole === 'string' ? userRole : userRole.name;
      return roles.includes(roleName?.toLowerCase() as UserRole);
    });
  }
  
  return false;
}

export function canAll(user: any, perms: string[]): boolean {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === "admin") return true;
  return perms.every(perm => can(user, perm));
}

export function canAny(user: any, perms: string[]): boolean {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === "admin") return true;
  return perms.some(perm => can(user, perm));
}
