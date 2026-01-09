const BASE = process.env.NEXT_PUBLIC_API_URL!;
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "";

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

async function refresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  // backend: POST /auth/refresh expects { refreshToken } 
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");
  const json = await res.json();
  setSession(json.data.accessToken, json.data.refreshToken);
  return json.data.accessToken as string;
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}), // matches authenticate middleware 
      ...(options.headers || {}),
    },
  });

  if (res.status === 401 && retry) {
    // token expired → try refresh once
    await refresh();
    return api<T>(path, options, false);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

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
};
