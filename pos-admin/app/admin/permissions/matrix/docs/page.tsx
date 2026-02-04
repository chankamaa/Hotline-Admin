"use client";

import { Shield, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { PermissionMatrixDocumentation } from "@/components/permissions/permission-matrix-documentation";

export default function PermissionMatrixDocsPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Permission System Documentation"
        description="Learn how to use the Advanced Permission Matrix to secure your system"
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin/permissions/matrix/advanced"
          className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <Shield size={32} />
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </div>
          <h3 className="text-xl font-bold mb-2">Advanced Permission Matrix</h3>
          <p className="text-blue-100">
            Configure granular permissions for all roles with comprehensive access control
          </p>
        </Link>

        <Link
          href="/admin/permissions/roles"
          className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <BookOpen size={32} className="text-blue-600" />
            <ArrowRight size={24} className="text-gray-400 group-hover:translate-x-2 group-hover:text-blue-600 transition-all" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Roles</h3>
          <p className="text-gray-600">
            Create, edit, and delete user roles with custom permission sets
          </p>
        </Link>
      </div>

      {/* Documentation */}
      <PermissionMatrixDocumentation />
    </div>
  );
}
