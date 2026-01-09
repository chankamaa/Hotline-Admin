export function can(user: any, perm: string) {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  // backend /auth/me should include effective permissions list
  return (user.permissions || user.effectivePermissions || []).includes(perm);
}
