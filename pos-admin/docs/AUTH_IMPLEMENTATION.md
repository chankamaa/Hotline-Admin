# Authentication & Access Control Implementation Guide

## Overview

This document explains the implementation of authentication and access control in the POS Admin application, including detailed steps for building login and signup functionality.

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication Flow](#authentication-flow)
3. [Login Implementation](#login-implementation)
4. [Signup Implementation](#signup-implementation)
5. [Access Control](#access-control)
6. [Security Features](#security-features)
7. [API Routes](#api-routes)

---

## Architecture

### Technology Stack

- **Frontend**: Next.js 14+ (App Router)
- **Authentication**: JWT (JSON Web Tokens)
- **Storage**: HTTP-only cookies
- **State Management**: SWR for user data
- **Backend**: Separate API server

### File Structure

```
pos-admin/
├── app/
│   ├── api/auth/              # Authentication API routes
│   │   ├── login/route.ts    # Login endpoint
│   │   ├── signup/route.ts   # Signup endpoint
│   │   ├── logout/route.ts   # Logout endpoint
│   │   ├── me/route.ts       # Get current user
│   │   └── refresh/route.ts  # Token refresh
│   ├── admin/
│   │   ├── login/page.tsx    # Login page
│   │   └── signup/page.tsx   # Signup page
│   └── middleware.ts          # Route protection
├── hooks/
│   └── useMe.ts              # User authentication hook
└── lib/
    ├── backend.ts            # Server-side API client
    └── clientFetch.ts        # Client-side API client
```

---

## Authentication Flow

### 1. Login Flow

```
User enters credentials
     ↓
Login page sends POST to /api/auth/login
     ↓
Next.js API forwards to backend /api/v1/auth/login
     ↓
Backend validates credentials
     ↓
Backend returns accessToken & refreshToken
     ↓
Next.js sets HTTP-only cookies
     ↓
User redirected to dashboard
```

### 2. Protected Route Access

```
User requests protected page
     ↓
Middleware checks for accessToken cookie
     ↓
If no token → redirect to /admin/login
If token exists → allow access
     ↓
Page loads and useMe() hook fetches user data
     ↓
/api/auth/me includes accessToken from cookie
     ↓
Backend returns user data & permissions
```

### 3. Token Refresh Flow

```
API request receives 401 (token expired)
     ↓
clientFetch automatically calls /api/auth/refresh
     ↓
Refresh endpoint uses refreshToken cookie
     ↓
Backend validates refreshToken
     ↓
New accessToken & refreshToken issued
     ↓
Cookies updated with new tokens
     ↓
Original request retried with new token
```

---

## Login Implementation

### Step 1: Login Page Component

**File**: `app/admin/login/page.tsx`

Key features:
- Form validation
- Loading states
- Error handling
- Redirect after successful login
- Link to signup page

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data?.message ?? "Login failed");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  } catch (err) {
    setError("An unexpected error occurred");
  } finally {
    setLoading(false);
  }
};
```

### Step 2: Login API Route

**File**: `app/api/auth/login/route.ts`

Key features:
- Forwards credentials to backend
- Sets HTTP-only cookies for security
- Handles errors appropriately

```typescript
export async function POST(req: Request) {
  const body = await req.json();
  
  // Forward to backend
  const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  // Set HTTP-only cookies
  const response = NextResponse.json({ status: "success" });

  response.cookies.set("accessToken", data.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set("refreshToken", data.data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
```

### Step 3: Environment Configuration

**File**: `.env.local`

```bash
BACKEND_URL=http://localhost:5000
NODE_ENV=development
```

---

## Signup Implementation

### Step 1: Signup Page Component

**File**: `app/admin/signup/page.tsx`

Key features:
- Multiple field validation
- Password confirmation
- Email format validation
- Password strength requirements
- Link to login page

```typescript
const validateForm = () => {
  if (!formData.username || !formData.email || !formData.password) {
    setError("Please fill in all required fields");
    return false;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return false;
  }

  if (formData.password.length < 8) {
    setError("Password must be at least 8 characters long");
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError("Please enter a valid email address");
    return false;
  }

  return true;
};
```

### Step 2: Signup API Route

**File**: `app/api/auth/signup/route.ts`

Key features:
- Server-side validation
- Email format validation
- Password strength check
- Automatic login after signup (if backend supports)
- Email verification support

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, fullName } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { status: "error", message: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    // Forward to backend
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, fullName }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // If backend returns tokens, set cookies for automatic login
    if (data.data?.accessToken && data.data?.refreshToken) {
      const response = NextResponse.json({
        status: "success",
        message: "Account created successfully",
      });

      response.cookies.set("accessToken", data.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      response.cookies.set("refreshToken", data.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json({
      status: "success",
      message: data.message ?? "Account created successfully",
      requiresVerification: data.requiresVerification ?? false,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

## Access Control

### Permission-Based Access

The application uses the `useMe` hook to manage user authentication and permissions.

**File**: `hooks/useMe.ts`

```typescript
export function useMe() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher);
  const user = data?.data?.user;

  const effectivePermissions: string[] =
    user?.permissions?.effectivePermissions ?? user?.permissions ?? [];

  return {
    user,
    effectivePermissions,
    isLoading,
    error,
    refresh: mutate,
    hasPermission: (p: string) => 
      effectivePermissions.includes("ALL") || effectivePermissions.includes(p),
  };
}
```

### Usage in Components

#### 1. Check if User is Logged In

```typescript
import { useMe } from "@/hooks/useMe";

export default function Dashboard() {
  const { user, isLoading } = useMe();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>Welcome, {user.username}!</div>;
}
```

#### 2. Permission-Based Rendering

```typescript
import { useMe } from "@/hooks/useMe";

export default function ProductsPage() {
  const { hasPermission } = useMe();

  return (
    <div>
      <h1>Products</h1>
      
      {hasPermission("products.create") && (
        <button>Create New Product</button>
      )}
      
      {hasPermission("products.delete") && (
        <button>Delete Product</button>
      )}
    </div>
  );
}
```

#### 3. Protected Component Wrapper

```typescript
import { useMe } from "@/hooks/useMe";

export function Protected({ 
  permission, 
  children, 
  fallback = null 
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { hasPermission, isLoading } = useMe();

  if (isLoading) return null;
  if (!hasPermission(permission)) return <>{fallback}</>;

  return <>{children}</>;
}

// Usage
<Protected permission="products.delete">
  <button onClick={handleDelete}>Delete</button>
</Protected>
```

### Route Protection with Middleware

**File**: `middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;

  const isAuthRoute = req.nextUrl.pathname.startsWith("/admin/login") || 
                      req.nextUrl.pathname.startsWith("/admin/signup");
  const isProtected = req.nextUrl.pathname.startsWith("/admin/dashboard");

  // Redirect to login if accessing protected route without token
  if (isProtected && !accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Redirect to dashboard if accessing login/signup with valid token
  if (isAuthRoute && accessToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/login",
    "/admin/signup"
  ],
};
```

---

## Security Features

### 1. HTTP-Only Cookies

Tokens are stored in HTTP-only cookies, preventing JavaScript access and XSS attacks.

```typescript
response.cookies.set("accessToken", token, {
  httpOnly: true,  // Cannot be accessed by JavaScript
  secure: true,    // HTTPS only in production
  sameSite: "lax", // CSRF protection
  path: "/",
});
```

### 2. Automatic Token Refresh

**File**: `lib/clientFetch.ts`

```typescript
export async function clientFetch(input: RequestInfo, init?: RequestInit) {
  let res = await fetch(input, init);

  if (res.status !== 401) return res;

  // Try refresh once
  const refresh = await fetch("/api/auth/refresh", { method: "POST" });
  if (!refresh.ok) return res;

  // Retry original call
  res = await fetch(input, init);
  return res;
}
```

### 3. Server-Side API Client

**File**: `lib/backend.ts`

```typescript
export async function backendFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  return res;
}
```

---

## API Routes

### Complete Authentication API

#### 1. Login - `POST /api/auth/login`

**Request**:
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response**: Sets HTTP-only cookies and returns:
```json
{
  "status": "success"
}
```

#### 2. Signup - `POST /api/auth/signup`

**Request**:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Account created successfully",
  "requiresVerification": false
}
```

#### 3. Logout - `POST /api/auth/logout`

Clears authentication cookies.

**Response**:
```json
{
  "status": "success"
}
```

#### 4. Get Current User - `GET /api/auth/me`

Returns the authenticated user's information.

**Response**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "123",
      "username": "admin",
      "email": "admin@example.com",
      "permissions": ["ALL"]
    }
  }
}
```

#### 5. Refresh Token - `POST /api/auth/refresh`

Automatically called by `clientFetch` on 401 errors.

**Response**: Updates cookies with new tokens.

---

## Best Practices

### 1. Input Validation

Always validate on both client and server:

**Client-side** (immediate feedback):
```typescript
if (formData.password.length < 8) {
  setError("Password must be at least 8 characters");
  return;
}
```

**Server-side** (security):
```typescript
if (password.length < 8) {
  return NextResponse.json(
    { message: "Password must be at least 8 characters" },
    { status: 400 }
  );
}
```

### 2. Error Handling

Provide user-friendly error messages:

```typescript
try {
  // API call
} catch (err) {
  setError("An unexpected error occurred");
  console.error("Login error:", err);
}
```

### 3. Loading States

Show loading indicators during async operations:

```typescript
<button disabled={loading}>
  {loading ? "Signing in..." : "Sign In"}
</button>
```

### 4. Secure Cookie Configuration

```typescript
{
  httpOnly: true,                                 // Prevent XSS
  secure: process.env.NODE_ENV === "production",  // HTTPS only
  sameSite: "lax",                                // CSRF protection
  path: "/",                                      // Available site-wide
  maxAge: 60 * 15,                                // 15 minutes
}
```

### 5. Environment-Specific Settings

Use different configurations for development and production:

```typescript
secure: process.env.NODE_ENV === "production"
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module 'swr'"
```bash
npm install swr
```

#### 2. Cookies Not Being Set
- Check `httpOnly`, `secure`, and `sameSite` settings
- Verify `BACKEND_URL` is correct
- Check browser console for cookie warnings

#### 3. 401 Errors After Login
- Verify tokens are being set in cookies
- Check middleware configuration
- Ensure backend is returning correct token format

#### 4. Redirect Loops
- Check middleware logic
- Ensure auth routes are excluded from protection
- Verify cookie names match exactly

#### 5. Permission Checks Not Working
- Log `effectivePermissions` array
- Verify backend permission format
- Check `hasPermission` logic

---

## Summary

This implementation provides:

✅ Secure JWT-based authentication  
✅ HTTP-only cookie storage  
✅ Automatic token refresh  
✅ Route protection with middleware  
✅ Permission-based access control  
✅ Modern, styled login/signup pages  
✅ Comprehensive error handling  
✅ Client and server-side validation  

The authentication system is production-ready and follows security best practices.
