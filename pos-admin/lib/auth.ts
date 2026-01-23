import { api, endpoints } from "@/lib/api/api";

export async function getMe() {
  const res: any = await api(endpoints.auth.me);
  const user = res.data.user;
  
  console.log('Auth - Raw user from backend:', user);
  
  // Backend returns roles as array, extract first role name for backward compatibility
  const primaryRole = user.roles && user.roles.length > 0 
    ? (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0].name)
    : null;
  
  console.log('Auth - Extracted primary role:', primaryRole);
  console.log('Auth - Effective permissions:', user.permissions);
  
  // Ensure effectivePermissions is available as 'permissions'
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isSuperAdmin: user.isSuperAdmin,
    isActive: user.isActive,
    role: primaryRole?.toLowerCase(), // Single role for legacy compatibility
    roles: user.roles || [], // Keep full roles array
    permissions: user.permissions || [], // This should be effectivePermissions from backend
  };
}
