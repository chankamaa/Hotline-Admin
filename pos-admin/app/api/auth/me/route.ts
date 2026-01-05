import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET() {
  const res = await backendFetch("/api/v1/auth/me", { method: "GET" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
