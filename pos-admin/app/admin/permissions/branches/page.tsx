"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Building, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PermissionBranchesPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="mb-4">
        <Link
          href="/admin/permissions"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Permissions
        </Link>
      </div>
      <PageHeader
        title="Branch Permissions"
        description="Control which branches users can access and manage"
        action={
          <Button>
            <Plus size={16} />
            Add Branch
          </Button>
        }
      />

      <div className="bg-white border rounded-2xl p-12 text-center text-gray-500">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
          <Building className="text-orange-500" size={24} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No branches linked yet</h2>
        <p className="text-sm text-gray-500">
          Once you create branches, you will be able to assign teams, managers, and access scopes from here.
        </p>
      </div>
    </div>
  );
}
