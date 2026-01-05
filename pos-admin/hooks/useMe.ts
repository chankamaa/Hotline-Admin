"use client";

import useSWR from "swr";
import { clientFetch } from "@/lib/clientFetch";

async function fetcher(url: string) {
  const res = await clientFetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Failed");
  return data;
}

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher);
  const user = data?.data?.user;

  // backend returns permissions object; adapt depending on your exact shape
  const effectivePermissions: string[] =
    user?.permissions?.effectivePermissions ?? user?.permissions ?? [];

  return {
    user,
    effectivePermissions,
    isLoading,
    error,
    refresh: mutate,
    hasPermission: (p: string) => effectivePermissions.includes("ALL") || effectivePermissions.includes(p),
  };
}
