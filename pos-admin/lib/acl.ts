export type UserRole = "admin" | "manager" | "cashier";

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
  if (!user) {
    console.log('hasRole - No user');
    return false;
  }
  
  console.log('hasRole - Checking roles:', { 
    requiredRoles: roles, 
    userRole: user.role, 
    userRoles: user.roles,
    isSuperAdmin: user.isSuperAdmin 
  });
  
  // Convert required roles to lowercase for comparison
  const normalizedRoles = roles.map(r => r.toLowerCase());
  
  // Handle both user.role (string) and user.roles (array)
  if (user.role) {
    const hasIt = normalizedRoles.includes(user.role.toLowerCase());
    console.log('hasRole - Single role check:', user.role, hasIt);
    return hasIt;
  }
  
  // Check if user has roles array
  if (Array.isArray(user.roles)) {
    const hasIt = user.roles.some((userRole: any) => {
      const roleName = typeof userRole === 'string' ? userRole : userRole.name;
      return normalizedRoles.includes(roleName?.toLowerCase());
    });
    console.log('hasRole - Array roles check:', hasIt);
    return hasIt;
  }
  
  console.log('hasRole - No role found, denied');
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
