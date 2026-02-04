const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "";

if (typeof window !== "undefined" && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn("⚠️ NEXT_PUBLIC_API_URL is not configured. Using default: http://localhost:5000");
  console.warn("⚠️ Please set NEXT_PUBLIC_API_URL in your .env.local file");
}

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";

function getAccessToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY);
}
function getRefreshToken() {
  return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY);
}
export function setSession(accessToken: string, refreshToken: string, user?: any) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function clearSession() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refresh() {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
    throw new Error("No refresh token");
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // backend: POST /auth/refresh expects { refreshToken } 
      const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/admin/login";
        }
        throw new Error("Session expired");
      }
      const json = await res.json();
      setSession(json.data.accessToken, json.data.refreshToken);
      return json.data.accessToken as string;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Retry configuration for resilient API calls
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const RETRYABLE_STATUS_CODES = [500, 502, 503, 504];

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const token = getAccessToken();

  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // matches authenticate middleware 
      },
      body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
    });

    // Handle 401 - token expired
    if (res.status === 401 && retryCount === 0) {
      try {
        await refresh();
        return api<T>(path, options, retryCount + 1);
      } catch (error) {
        throw error;
      }
    }

    // Handle 5xx server errors - retry with exponential backoff
    if (RETRYABLE_STATUS_CODES.includes(res.status) && retryCount < MAX_RETRIES) {
      console.warn(`Server error ${res.status} on ${path}, retrying in ${RETRY_DELAY_MS * (retryCount + 1)}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY_MS * (retryCount + 1));
      return api<T>(path, options, retryCount + 1);
    }

    let data: any = null;

    try {
      data = await res.json();
    } catch {
      // response is not JSON
    }

    if (!res.ok) {
      const message =
        typeof data?.message === "string"
          ? data.message
          : "Request failed";
      throw new Error(message);
    }

    return data;
  } catch (error: any) {
    // Network error (connection refused, DNS failure, etc.) - retry
    if (error.name === 'TypeError' && retryCount < MAX_RETRIES) {
      console.warn(`Network error on ${path}, retrying in ${RETRY_DELAY_MS * (retryCount + 1)}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await delay(RETRY_DELAY_MS * (retryCount + 1));
      return api<T>(path, options, retryCount + 1);
    }
    
    // Final failure
    if (error.message && error.message !== "Request failed") {
      throw error;
    }
    throw new Error(`Failed to connect to API at ${BASE}${path}. Make sure your backend server is running.`);
  }
}

// Add helper methods to api
api.get = <T>(path: string, options?: { params?: Record<string, any> }) => {
  const queryString = options?.params
    ? '?' + new URLSearchParams(
      Object.entries(options.params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString()
    : '';
  return api<T>(path + queryString, { method: 'GET' });
};

api.post = <T>(path: string, body?: any) => {
  return api<T>(path, { method: 'POST', body });
};

api.put = <T>(path: string, body?: any) => {
  return api<T>(path, { method: 'PUT', body });
};

api.patch = <T>(path: string, body?: any) => {
  return api<T>(path, { method: 'PATCH', body });
};

api.delete = <T>(path: string) => {
  return api<T>(path, { method: 'DELETE' });
};

// helpers
export const endpoints = {
  auth: {
    login: "/api/v1/auth/login",
    me: "/api/v1/auth/me",
    logout: "/api/v1/auth/logout",
  },
  users: `${API_PREFIX}/users`,
  roles: `${API_PREFIX}/roles`,
  permissions: `${API_PREFIX}/permissions`,
  repairs: `${API_PREFIX}/repairs`,
};
