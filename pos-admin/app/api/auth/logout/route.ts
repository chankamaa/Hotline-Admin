import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST() {
  // call backend logout (requires access token)
  const res = await backendFetch("/api/v1/auth/logout", { method: "POST" });

  // clear cookies regardless
  const response = NextResponse.json({ status: "success" }, { status: 200 });
  response.cookies.set("accessToken", "", { path: "/", maxAge: 0 });
  response.cookies.set("refreshToken", "", { path: "/", maxAge: 0 });

  if (!res.ok) {
    // still return success so user gets logged out client-side
    return response;
  }

  return response;
}
