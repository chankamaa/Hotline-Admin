"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ShieldPlus, Edit, Trash2, Users, Key, AlertCircle, ArrowLeft } from "lucide-react";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS } from "@/lib/permissions";
import { roleApi, Role } from "@/lib/api/roleApi";
import Link from "next/link";

export default function RolesManagementPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roleApi.getAll();
      setRoles(response.data.roles);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (deleteConfirm !== roleId) {
      setDeleteConfirm(roleId);
      return;
    }

    try {
      await roleApi.delete(roleId);
      setRoles(roles.filter((r) => r._id !== roleId));
      setDeleteConfirm(null);
      alert(`Role "${roleName}" deleted successfully`);
    } catch (err) {
      console.error("Failed to delete role:", err);
      alert(err instanceof Error ? err.message : "Failed to delete role");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Role Management"
          subtitle="Create and manage user roles with specific permissions"
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader
          title="Role Management"
          subtitle="Create and manage user roles with specific permissions"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Roles</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequirePerm perm={PERMISSIONS.VIEW_ROLES}>
      <div className="p-6">
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
          title="Role Management"
          subtitle="Create and manage user roles with specific permissions"
          action={{
            label: "Create Role",
            onClick: () => router.push("/admin/permissions/roles/create"),
            icon: ShieldPlus,
          }}
        />

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role._id}
              className={`bg-white rounded-lg border-2 ${
                role.isDefault ? "border-gray-200" : "border-sky-200"
              } p-6 hover:shadow-lg transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    {role.isDefault && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        System
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{role.description}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {role.permissions.length} {role.permissions.length === 1 ? "permission" : "permissions"}
                  </span>
                </div>
              </div>

              {/* Permissions Preview */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-60 uppercase tracking-wider mb-2  ">   
                  Key Permissions
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 4).map((perm, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {perm.code}
                    </span>
                  ))}
                  {role.permissions.length > 4 && (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                      +{role.permissions.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  className="flex-1 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors text-sm font-medium"
                  onClick={() => router.push(`/admin/permissions/roles/${role._id}`)}
                >
                  Edit Permissions
                </button>
                {!role.isDefault && (
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      deleteConfirm === role._id
                        ? "bg-red-600 text-white"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                    title={deleteConfirm === role._id ? "Click again to confirm" : "Delete Role"}
                    onClick={() => handleDelete(role._id, role.name)}
                    onMouseLeave={() => setDeleteConfirm(null)}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Created Date */}
              <div className="mt-3 pt-3 border-t">
                <span className="text-xs text-gray-500">
                  Created {new Date(role.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
        <div className="mt-8 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Management Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold">
                1
              </div>
              <div>
                <strong>System Roles:</strong> Pre-defined roles (Admin, Manager, Cashier) cannot be deleted but permissions can be customized.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold">
                2
              </div>
              <div>
                <strong>Custom Roles:</strong> Create specialized roles for unique business needs with granular permission control.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold">
                3
              </div>
              <div>
                <strong>Permission Inheritance:</strong> Roles can inherit permissions from other roles for easier management.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-semibold">
                4
              </div>
              <div>
                <strong>Best Practice:</strong> Assign the minimum required permissions following the principle of least privilege.
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequirePerm>
  );
}
