"use client";

import { PageHeader } from "@/components/ui/page-header";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS } from "@/lib/permissions";

export default function PermissionMatrixPage() {
  return (
    <RequirePerm perm={PERMISSIONS.MANAGE_PERMISSIONS}>
      <div className="p-6">
        <PageHeader
          title="Permission Matrix"
          subtitle="Advanced permission management feature - Coming soon"
        />
        <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-gray-700">
            This feature requires PERMISSION_CATEGORIES and ROLE_DEFINITIONS to be configured.
            Please contact your administrator.
          </p>
        </div>
      </div>
    </RequirePerm>
  );
}
