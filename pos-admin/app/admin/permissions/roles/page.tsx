"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ShieldPlus, Edit, Trash2, Users, Key } from "lucide-react";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS } from "@/components/sidebar-config";

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

export default function RolesManagementPage() {
  // Mock data - replace with actual API call
  const [roles] = useState<Role[]>([
    {
      id: 1,
      name: "Admin",
      description: "Full system access with all permissions",
      userCount: 2,
      permissions: ["*"],
      isSystem: true,
      createdAt: "2024-01-01",
    },
    {
      id: 2,
      name: "Manager",
      description: "Manage inventory, authorize returns, approve discounts",
      userCount: 5,
      permissions: [
        "inventory:*",
        "products:*",
        "returns:authorize",
        "discounts:approve",
        "reports:view",
        "employees:view",
      ],
      isSystem: true,
      createdAt: "2024-01-01",
    },
    {
      id: 3,
      name: "Cashier",
      description: "Process sales and handle customer transactions",
      userCount: 12,
      permissions: [
        "sales:create",
        "sales:view",
        "customers:view",
        "products:view",
        "discounts:standard",
      ],
      isSystem: true,
      createdAt: "2024-01-01",
    },
    {
      id: 4,
      name: "Technician",
      description: "Manage repair jobs and warranties",
      userCount: 8,
      permissions: [
        "repairs:*",
        "warranty:*",
        "products:view",
        "customers:view",
      ],
      isSystem: true,
      createdAt: "2024-01-01",
    },
    {
      id: 5,
      name: "Inventory Specialist",
      description: "Manage stock, purchase orders, and suppliers",
      userCount: 3,
      permissions: [
        "inventory:*",
        "products:*",
        "suppliers:*",
        "purchase-orders:*",
        "stock:*",
      ],
      isSystem: false,
      createdAt: "2024-02-15",
    },
  ]);

  return (
    <RequirePerm perm={PERMISSIONS.ROLE_READ}>
      <div className="p-6">
        <PageHeader
          title="Role Management"
          subtitle="Create and manage user roles with specific permissions"
          action={{
            label: "Create Role",
            onClick: () => alert("Create role functionality"),
            icon: ShieldPlus,
          }}
        />

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`bg-white rounded-lg border-2 ${
                role.isSystem ? "border-gray-200" : "border-sky-200"
              } p-6 hover:shadow-lg transition-shadow`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                    {role.isSystem && (
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
                  <Users size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {role.userCount} {role.userCount === 1 ? "user" : "users"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {role.permissions.length === 1 && role.permissions[0] === "*"
                      ? "All permissions"
                      : `${role.permissions.length} permissions`}
                  </span>
                </div>
              </div>

              {/* Permissions Preview */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Key Permissions
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 4).map((perm, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {perm}
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
                  onClick={() => alert(`View ${role.name} details`)}
                >
                  View Details
                </button>
                {!role.isSystem && (
                  <>
                    <button
                      className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Edit Role"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Role"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
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
                <strong>System Roles:</strong> Pre-defined roles (Admin, Manager, Cashier, Technician) cannot be deleted but permissions can be customized.
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
