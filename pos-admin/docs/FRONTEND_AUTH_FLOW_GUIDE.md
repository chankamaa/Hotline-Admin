# Frontend Authentication Flow Design Guide

This guide outlines how to wire the POS Admin frontend to the existing backend authentication and authorization system. It distills the backend module behaviour (login, refresh, logout, role/permission resolution) into concrete frontend responsibilities.

---

## 1. Core Authentication Flow

### A. Login Flow

- **Frontend endpoint**: `POST /api/auth/login` (Next.js API route proxy)
- **Backend endpoint**: `POST /api/v1/auth/login`
- **Payload**: `{ username: string, password: string }`
- **On success**: backend returns `{ accessToken, refreshToken, user }`

**Frontend tasks**
- Render a login form with username and password fields.
- Submit credentials to `/api/auth/login` and rely on the API route to forward them.
- Tokens arrive as HTTP-only cookies; store lightweight user snapshot (id, username, email, isSuperAdmin) in React/SWR state for UI consumption.
- Redirect authenticated users to the admin dashboard.
- Surface validation errors for:
  - `400` missing/invalid payload (show inline form errors).
  - `401` bad credentials or deactivated account (show “Invalid username/password” or backend message).

### B. Token Management

- **Access token**: 15 min TTL, used on every authenticated request via `Authorization: Bearer <token>`
- **Refresh token**: 7 day TTL, stored in HTTP-only cookie.
- **Refresh flow**: `POST /api/auth/refresh` → backend `POST /api/v1/auth/refresh`

**Frontend tasks**
- Wrap `fetch` calls with the `clientFetch` helper (already provided) to retry once on `401` by invoking the refresh endpoint.
- If refresh succeeds, `clientFetch` repeats the original request seamlessly.
- If refresh fails (refresh token missing/expired), clear auth state and redirect to login with a “Session expired” toast.

### C. Logout Flow

- **Frontend endpoint**: `POST /api/auth/logout`
- **Backend endpoint**: `POST /api/v1/auth/logout`

**Frontend tasks**
- Trigger via logout button in the global navigation.
- Call `/api/auth/logout`; regardless of backend response, clear local auth state and route user to `/admin/login`.
- Optionally show confirmation toast.

---

## 2. Authorization Header Structure

Every authenticated request to backend-facing API routes must include:

```
Authorization: Bearer <accessToken>
```

The `backendFetch` utility already attaches this header by reading the cookie-sourced access token in server components and API handlers.

---

## 3. User Profile & Permissions

- **Endpoint**: `GET /api/auth/me` → backend `GET /api/v1/auth/me`
- **Response**: `{ data: { user: { id, username, email, isSuperAdmin, roles, permissions, directPermissions, deniedPermissions } } }`

**Frontend tasks**
- Call `/api/auth/me` after login and on app boot (if cookies exist) using the `useMe` hook (SWR-based).
- Normalize permissions into an `effectivePermissions` array (already implemented in `useMe.ts`).
- Store user object and permissions in shared context/SWR cache for conditional rendering.

---

## 4. Frontend Authorization Design

### Permission Hierarchy (as exposed by backend)

1. **Super Admin flag** → bypasses all checks.
2. **Direct user permission overrides** → allow or deny specific codes.
3. **Role-based permissions** → inherited from assigned roles.

### UI Patterns

- Use the `hasPermission` helper (`useMe`) to gate buttons, menu items, and routes.
- Render guarded components only when the user has the required permission.
- Display explanatory tooltips or disabled states when permissions are missing.
- Provide centralized “Access denied” handling for server `403` responses.

**Sample permission codes** (align UI copy with backend):
- Sales: `SALES.CREATE`, `SALES.VIEW`, `SALES.VOID`
- Users: `USERS.CREATE`, `USERS.UPDATE`, `USERS.DELETE`
- Roles: `ROLES.MANAGE`, `ROLES.ASSIGN`
- Inventory: `INVENTORY.MANAGE`, `INVENTORY.VIEW`
- Reports: `REPORTS.VIEW`, `REPORTS.EXPORT`

---

## 5. Auth State Shape

Maintain a consistent global structure (context or Zustand/Redux):

```ts
interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null; // optional mirror of cookie for client-only calls
  user: {
    id: string;
    username: string;
    email: string;
    isSuperAdmin: boolean;
    roles: Array<{ id: string; name: string; description?: string }>;
    permissions: string[]; // effective permission codes
  } | null;
  loading: boolean;
  error: string | null;
}
```

State lives primarily in SWR (`useMe`) plus lightweight context to expose helper methods (`login`, `logout`, `refresh`).

---

## 6. Error Handling Strategy

| Status | Meaning | UI Response |
| ------ | ------- | ----------- |
| 400 | Validation issue | Show field-level errors |
| 401 | Unauthorized (expired/invalid token) | Trigger refresh flow; if still failing, redirect to login |
| 403 | Forbidden | Render “Access denied” view/toast and keep user on current safe page |
| 404 | Not found | Display resource-missing message |
| 429 | Too many attempts | Inform user about rate limiting |

Also handle user lifecycle responses from backend (`isActive` false, deleted user) by clearing session and guiding user to re-authenticate or contact admin.

---

## 7. User Management Module

Backend endpoints (all protected by permission codes):

- `POST /api/v1/users` → requires `USERS.CREATE`
- `GET /api/v1/users` → requires `USERS.VIEW`
- `GET /api/v1/users/:id` → requires `USERS.VIEW`
- `PUT /api/v1/users/:id` → requires `USERS.UPDATE`
- `DELETE /api/v1/users/:id` → requires `USERS.DELETE`
- `PUT /api/v1/users/:id/roles` → requires `ROLES.ASSIGN`
- `PUT /api/v1/users/:id/permissions` → requires `PERMISSIONS.ASSIGN`

**Frontend design**
- User table with action buttons hidden or disabled based on `hasPermission`.
- Forms for create/edit supporting role multi-select and direct permission toggles.
- Visual indicators (badges) for super admins and inactive accounts.

---

## 8. Role Management Module

Backend endpoints (require `ROLES.MANAGE`):

- `POST /api/v1/roles`
- `GET /api/v1/roles`
- `GET /api/v1/roles/:id`
- `PUT /api/v1/roles/:id`
- `DELETE /api/v1/roles/:id` (skip defaults)
- `PUT /api/v1/roles/:id/permissions`

**Frontend design**
- Roles list showing permission counts and usage.
- Role editor with grouped permission checklists reflecting backend categories.
- Guard deletion UI based on `role.isDefault` to prevent removing system roles.

---

## 9. Security Best Practices

- Keep tokens in HTTP-only cookies; avoid localStorage for refresh tokens.
- Use `secure` cookies in production (`NODE_ENV === "production"`).
- Sanitize all user inputs client-side before submission, even though backend re-validates.
- Implement idle timeout/auto logout on refresh failures.
- Never log tokens or sensitive payloads to the browser console.

---

## 10. User Experience Flow

### Initial Load

1. Check for auth cookies (handled implicitly by `useMe`).
2. Attempt `/api/auth/me`; if success, hydrate state and proceed to dashboard.
3. If unauthorized, redirect to `/admin/login`.

### Session Expiry

1. Access token expires.
2. Next request returns `401`.
3. `clientFetch` calls `/api/auth/refresh` and retries request.
4. On repeated failure, clear state, show “Session expired”, and send user to login.

### Navigation

- Sidebar/menu items appear only when `hasPermission` passes.
- User avatar menu shows profile info and logout action.
- Keep login/signup routes unprotected; guard admin routes via middleware/layout.

---

## 11. Suggested Frontend Structure

```
frontend/
├── contexts/
│   └── auth-context.tsx        # exposes login/logout, current user, permissions
├── hooks/
│   ├── useAuth.ts              # consumes context
│   └── usePermission.ts        # lightweight permission helper
├── guards/
│   ├── AuthGuard.tsx           # wraps protected pages
│   └── PermissionGuard.tsx     # ensures specific permission
├── services/
│   └── api-client.ts           # fetch wrapper with refresh logic
├── utils/
│   └── permissions.ts          # shared constants matching backend codes
└── app/
    ├── admin/login/page.tsx
    ├── admin/signup/page.tsx
    ├── admin/dashboard/
    └── admin/users/
```

This structure mirrors the backend separation of concerns and keeps permission logic centralized.

---

## 12. API Integration Patterns

### Request Wrapper

- Attach `Authorization` header automatically when cookies expose a valid access token.
- Serialize/deserialize JSON uniformly.
- Centralize error parsing (message extraction).

### Response Handling

- Intercept `401` → run refresh logic.
- Intercept `403` → trigger a shared “Access denied” modal/snackbar.
- For `422`/`400`, bubble field errors back to forms.

### Debugging Tips

- Log backend errors during development but strip sensitive info before production builds.
- Use the browser network inspector to confirm cookies and headers for auth routes.

---

## Summary Checklist

- [ ] Login form calls `/api/auth/login` and handles cookies.
- [ ] `useMe` hydrates user profile and permissions on load.
- [ ] `clientFetch` refreshes tokens automatically.
- [ ] Middleware/layout protects `/admin/**` routes.
- [ ] UI respects permission codes via `hasPermission` helper.
- [ ] Logout clears cookies and context, redirecting to `/admin/login`.

Following this plan keeps the frontend aligned with the backend RBAC model while delivering a secure, predictable user experience.
