# Technician Role-Based Access Control Setup

## Overview
This document explains how the Technician role is configured to only access the "Repairs & Service" section.

## Frontend Implementation ✅

### 1. Sidebar Filtering (`components/sidebar.tsx`)
The sidebar now filters sections and items based on:
- **User permissions**: Checks `can(user, permission)` for each item
- **Role restrictions**: Checks `hasRole(user, roles)` for sections with role requirements
- Only shows sections that have at least one accessible item

### 2. Permission Requirements (`components/sidebar-config.ts`)
Added permission checks to navigation items:

```typescript
{
  label: "Repairs & Service",
  icon: Wrench,
  items: [
    { 
      title: "Repair Jobs", 
      href: "/admin/repairs", 
      icon: Wrench, 
      permission: PERMISSIONS.REPAIR_READ 
    },
    { 
      title: "Technician Workload", 
      href: "/admin/repairs/workload", 
      icon: Users, 
      permission: PERMISSIONS.REPAIR_READ 
    },
    { 
      title: "Repair History", 
      href: "/admin/repairs/history", 
      icon: ClipboardList, 
      permission: PERMISSIONS.REPAIR_READ 
    },
  ],
}
```

### 3. Page-Level Protection
All repair pages are wrapped with `RequirePerm` component:
- `/admin/repairs/page.tsx` → Requires `REPAIR_READ`
- `/admin/repairs/workload/page.tsx` → Requires `REPAIR_READ`
- `/admin/repairs/history/page.tsx` → Requires `REPAIR_READ`

This ensures that even if someone tries to access the URL directly, they'll be redirected to `/unauthorized`.

### 4. Permission Mapping
The sidebar uses these permission constants from `sidebar-config.ts`:
- `REPAIR_READ: "repairs:read"`
- `REPAIR_CREATE: "repairs:create"`
- `REPAIR_UPDATE: "repairs:update"`

## Backend Configuration Required ⚠️

For this to work correctly, you need to ensure your backend is configured properly:

### 1. Technician Role Permissions
In your backend `roleSeed.js` or role creation, the Technician role should have:

```javascript
const TECHNICIAN_PERMISSIONS = [
  'VIEW_REPAIRS',           // View repair jobs
  'VIEW_ASSIGNED_REPAIRS',  // View assigned repairs
  'CREATE_REPAIR_JOB',      // Create new repair jobs
  'UPDATE_REPAIR_STATUS',   // Update repair status
  'MANAGE_REPAIR_JOBS',     // Manage repair jobs
];
```

### 2. Backend Permission Format
Your backend uses this format:
```javascript
{
  code: 'VIEW_REPAIRS',
  category: 'DEVICE_REPAIR',
  description: 'View repair jobs'
}
```

### 3. User Object from `/auth/me` Endpoint
The frontend expects the user object to include:
```javascript
{
  _id: "...",
  username: "technician1",
  email: "tech@example.com",
  roles: [
    {
      _id: "...",
      name: "Technician",
      permissions: [...]
    }
  ],
  effectivePermissions: ['VIEW_REPAIRS', 'CREATE_REPAIR_JOB', ...],
  isSuperAdmin: false,
  isActive: true
}
```

**Important**: The `effectivePermissions` array must contain all permission codes the user has access to.

### 4. Permission Checking Logic (`lib/acl.ts`)
```typescript
export function can(user: any, perm: string) {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === "admin") return true;
  
  // Checks effectivePermissions or permissions array
  return (user.permissions || user.effectivePermissions || []).includes(perm);
}
```

## How It Works Together

1. **User logs in** → Backend returns user object with `effectivePermissions`
2. **Sidebar renders** → `filteredNav` filters sections/items based on permissions
3. **User clicks link** → Can only see "Repairs & Service" items
4. **Page loads** → `RequirePerm` checks permission, allows access if authorized
5. **No permission** → Redirects to `/unauthorized`

## Testing Technician Access

### As a Technician, you should:
✅ **See only**:
- Dashboard (if no permission check)
- Repairs & Service
  - Repair Jobs
  - Technician Workload
  - Repair History

❌ **NOT see**:
- Sales
- Inventory
- Stock Management
- Reports (unless given permission)
- Permissions/Users
- Settings
- All other sections

### To Test:
1. Log in as a technician user
2. Verify sidebar only shows "Repairs & Service"
3. Try accessing `/admin/sales` directly → Should redirect to `/unauthorized`
4. Access `/admin/repairs` → Should work fine

## Troubleshooting

### Issue: Technician sees all sections
**Cause**: User object doesn't have `effectivePermissions` or backend isn't properly configured
**Fix**: Check `/auth/me` endpoint response in browser DevTools

### Issue: Sidebar shows nothing
**Cause**: Permission codes don't match between frontend and backend
**Fix**: Align permission codes:
- Frontend: `PERMISSIONS.REPAIR_READ = "repairs:read"`
- Backend: User must have `"repairs:read"` in effectivePermissions

### Issue: Page shows "Loading..." forever
**Cause**: `RequirePerm` is checking a permission the user doesn't have
**Fix**: Ensure backend returns correct permissions for technician role

## Next Steps

1. **Verify Backend**: Check that technician role has repair permissions
2. **Test Login**: Log in as technician and verify sidebar
3. **Test Navigation**: Click each repair section link
4. **Test Direct URLs**: Try accessing non-repair URLs (should be blocked)
5. **Check Console**: Look for permission check logs in browser console

## Permission Alignment Reference

| Frontend Permission | Backend Permission | Access Level |
|-------------------|-------------------|-------------|
| `repairs:read` | `VIEW_REPAIRS` | View repair jobs |
| `repairs:create` | `CREATE_REPAIR_JOB` | Create repairs |
| `repairs:update` | `UPDATE_REPAIR_STATUS` | Update status |
| `repairs:assign` | `MANAGE_REPAIR_JOBS` | Assign jobs |

Make sure your backend's permission seeding matches these mappings!
