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
  // RBAC disabled - allow all access
  return <>{children}</>;
}
