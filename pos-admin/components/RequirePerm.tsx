"use client";
import { useAuth } from "@/providers/providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { can } from "@/lib/acl";

export default function RequirePerm({
  perm,
  children,
}: {
  perm: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !can(user, perm))) router.replace("/unauthorized");
  }, [loading, user, perm, router]);

  if (loading) return <div>Loading...</div>;
  if (!user || !can(user, perm)) return null;
  return <>{children}</>;
}
