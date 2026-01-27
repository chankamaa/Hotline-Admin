"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Save, RotateCcw, Shield } from "lucide-react";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS } from "@/components/sidebar-config";

interface PermissionModule {
  id: string;
  name: string;
  description: string;
  actions: string[];
}

interface RolePermissions {
  [role: string]: {
    [module: string]: {
      [action: string]: boolean;
    };
  };
}

export default function PermissionMatrixPage() {
  const modules: PermissionModule[] = [
    {
      id: "sales",
      name: "Sales",
      description: "Process transactions and manage sales operations",
      actions: ["create", "read", "update", "delete", "refund"],
    },
    {
      id: "inventory",
      name: "Inventory",
      description: "Manage stock levels and inventory operations",
      actions: ["create", "read", "update", "delete", "transfer", "audit"],
    },
    {
      id: "products",
      name: "Products",
      description: "Manage product catalog and pricing",
      actions: ["create", "read", "update", "delete", "pricing"],
    },
    {
      id: "customers",
      name: "Customers",
      description: "Manage customer information and relationships",
      actions: ["create", "read", "update", "delete"],
    },
    {
      id: "repairs",
      name: "Repairs",
      description: "Manage repair jobs and warranty claims",
      actions: ["create", "read", "update", "delete", "assign"],
    },
    {
      id: "reports",
      name: "Reports",
      description: "Access and generate business reports",
      actions: ["view", "export", "financial", "inventory", "sales"],
    },
    {
      id: "users",
      name: "Users",
      description: "Manage user accounts and authentication",
      actions: ["create", "read", "update", "delete", "reset-password"],
    },
    {
      id: "settings",
      name: "Settings",
      description: "Configure system settings and preferences",
      actions: ["read", "update", "backup", "integrations"],
    },
  ];

  const roles = ["admin", "manager", "cashier"];

  // Initialize permissions state with default values
  const [permissions, setPermissions] = useState<RolePermissions>({
    admin: Object.fromEntries(
      modules.map((m) => [
        m.id,
        Object.fromEntries(m.actions.map((a) => [a, true])),
      ])
    ),
    manager: {
      sales: { create: true, read: true, update: true, delete: false, refund: true },
      inventory: { create: true, read: true, update: true, delete: true, transfer: true, audit: true },
      products: { create: true, read: true, update: true, delete: true, pricing: true },
      customers: { create: true, read: true, update: true, delete: false },
      repairs: { create: true, read: true, update: true, delete: false, assign: true },
      reports: { view: true, export: true, financial: true, inventory: true, sales: true },
      users: { create: false, read: true, update: false, delete: false, "reset-password": false },
      settings: { read: true, update: false, backup: false, integrations: false },
    },
    cashier: {
      sales: { create: true, read: true, update: false, delete: false, refund: false },
      inventory: { create: false, read: true, update: false, delete: false, transfer: false, audit: false },
      products: { create: false, read: true, update: false, delete: false, pricing: false },
      customers: { create: true, read: true, update: true, delete: false },
      repairs: { create: false, read: false, update: false, delete: false, assign: false },
      reports: { view: false, export: false, financial: false, inventory: false, sales: false },
      users: { create: false, read: false, update: false, delete: false, "reset-password": false },
      settings: { read: false, update: false, backup: false, integrations: false },
    },
  });

  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [hasChanges, setHasChanges] = useState(false);

  const togglePermission = (module: string, action: string) => {
    if (selectedRole === "admin") {
      alert("Admin permissions cannot be modified");
      return;
    }

    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: {
          ...prev[selectedRole][module],
          [action]: !prev[selectedRole][module][action],
        },
      },
    }));
    setHasChanges(true);
  };

  const toggleModule = (module: string, enable: boolean) => {
    if (selectedRole === "admin") {
      alert("Admin permissions cannot be modified");
      return;
    }

    const moduleActions = modules.find((m) => m.id === module)?.actions || [];
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: Object.fromEntries(moduleActions.map((a) => [a, enable])),
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // API call to save permissions
    alert("Permissions saved successfully!");
    setHasChanges(false);
  };

  const handleReset = () => {
    // Reset to original values
    setHasChanges(false);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-600 text-white",
      manager: "bg-blue-600 text-white",
      cashier: "bg-green-600 text-white",
    };
    return colors[role] || "bg-gray-600 text-white";
  };

  const getModulePermissionCount = (moduleId: string) => {
    const modulePerms = permissions[selectedRole][moduleId];
    const enabled = Object.values(modulePerms).filter((v) => v === true).length;
    const total = Object.keys(modulePerms).length;
    return { enabled, total };
  };

  return (
    <RequirePerm perm={PERMISSIONS.ROLE_UPDATE}>
      <div className="p-6">
        <PageHeader
          title="Permission Matrix"
          subtitle="Configure granular permissions for each role"
          action={{
            label: hasChanges ? "Save Changes" : "Saved",
            onClick: handleSave,
            icon: Save,
            disabled: !hasChanges,
          }}
        />

        {/* Role Selector */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="text-gray-400" size={20} />
              <span className="text-sm font-medium text-gray-700">Select Role:</span>
              <div className="flex gap-2">
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRole === role
                        ? getRoleBadgeColor(role)
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {hasChanges && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
                Reset Changes
              </button>
            )}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Module
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    All
                  </th>
                  {modules[0].actions.map((action) => (
                    <th
                      key={action}
                      className="px-4 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {action.replace("-", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {modules.map((module) => {
                  const { enabled, total } = getModulePermissionCount(module.id);
                  const allEnabled = enabled === total;

                  return (
                    <tr key={module.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{module.name}</div>
                          <div className="text-xs text-gray-500">{module.description}</div>
                          <div className="text-xs text-sky-600 mt-1">
                            {enabled} of {total} permissions enabled
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={allEnabled}
                          onChange={(e) => toggleModule(module.id, e.target.checked)}
                          disabled={selectedRole === "admin"}
                          className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                        />
                      </td>
                      {module.actions.map((action) => (
                        <td key={action} className="px-4 py-4 text-center">
                          {permissions[selectedRole][module.id] &&
                          permissions[selectedRole][module.id][action] !== undefined ? (
                            <input
                              type="checkbox"
                              checked={permissions[selectedRole][module.id][action]}
                              onChange={() => togglePermission(module.id, action)}
                              disabled={selectedRole === "admin"}
                              className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-sky-50 rounded-lg border border-sky-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Permission Guidelines</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Create:</strong> Add new records to the system</li>
            <li>• <strong>Read:</strong> View and access existing records</li>
            <li>• <strong>Update:</strong> Modify existing records</li>
            <li>• <strong>Delete:</strong> Remove records from the system</li>
            <li>• <strong>Module Toggle:</strong> Use "All" checkbox to enable/disable all permissions for a module</li>
            <li>• <strong>Admin Role:</strong> Has all permissions by default and cannot be modified</li>
          </ul>
        </div>
      </div>
    </RequirePerm>
  );
}
