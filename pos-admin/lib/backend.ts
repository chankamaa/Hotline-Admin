import "server-only";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL!;

export async function backendFetch(path: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  // Attach access token automatically (protected routes)
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    // no need for credentials here since we're not relying on backend cookies
    cache: "no-store",
  });

  return res;
}
