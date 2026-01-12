export type UserRole = "admin" | "manager" | "cashier" | "technician";

export function can(user: any, perm: string) {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === "admin") return true;
  // backend /auth/me should include effective permissions list
  return (user.permissions || user.effectivePermissions || []).includes(perm);
}

export function hasRole(user: any, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
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
