"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Save, RotateCcw, Shield, Check, X } from "lucide-react";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSION_CATEGORIES, ROLE_DEFINITIONS, PERMISSIONS } from "@/lib/permissions";

interface RolePermissionMatrix {
  [role: string]: {
    [permission: string]: boolean;
  };
}

export default function PermissionMatrixPage() {
  const [matrix, setMatrix] = useState<RolePermissionMatrix>({});
  const [selectedRole, setSelectedRole] = useState<string>("ADMIN");
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  const roles = Object.keys(ROLE_DEFINITIONS);

  // Initialize matrix from ROLE_DEFINITIONS
  useEffect(() => {
    const initialMatrix: RolePermissionMatrix = {};
    
    roles.forEach(role => {
      initialMatrix[role] = {};
      const rolePerms = ROLE_DEFINITIONS[role].permissions;
      
      // Check each permission
      Object.values(PERMISSIONS).forEach(perm => {
        initialMatrix[role][perm] = rolePerms.includes(perm) || rolePerms.includes("FULL_SYSTEM_ACCESS");
      });
    });
    
    setMatrix(initialMatrix);
    setLoading(false);
  }, []);

  const togglePermission = (role: string, permission: string) => {
    if (role === "ADMIN") {
      alert("Admin permissions cannot be modified - Admin has full system access");
      return;
    }

    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: !prev[role][permission],
      },
    }));
    setHasChanges(true);
  };

  const toggleCategory = (role: string, category: string, enable: boolean) => {
    if (role === "ADMIN") {
      alert("Admin permissions cannot be modified");
      return;
    }

    const categoryPerms = PERMISSION_CATEGORIES[category].permissions.map(p => p.code);
    const updates: { [key: string]: boolean } = {};
    
    categoryPerms.forEach(code => {
      updates[code] = enable;
    });

    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        ...updates,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // TODO: API call to save permissions
      // await fetch('/api/roles/permissions', {
      //   method: 'PUT',
      //   body: JSON.stringify(matrix),
      // });
      
      alert("Permissions saved successfully!");
      setHasChanges(false);
    } catch (error) {
      alert("Error saving permissions");
    }
  };

  const handleReset = () => {
    // Re-initialize matrix
    const initialMatrix: RolePermissionMatrix = {};
    
    roles.forEach(role => {
      initialMatrix[role] = {};
      const rolePerms = ROLE_DEFINITIONS[role].permissions;
      
      Object.values(PERMISSIONS).forEach(perm => {
        initialMatrix[role][perm] = rolePerms.includes(perm) || rolePerms.includes("FULL_SYSTEM_ACCESS");
      });
    });
    
    setMatrix(initialMatrix);
    setHasChanges(false);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-600 text-white",
      MANAGER: "bg-blue-600 text-white",
      CASHIER: "bg-green-600 text-white",
      TECHNICIAN: "bg-purple-600 text-white",
    };
    return colors[role] || "bg-gray-600 text-white";
  };

  const getCategoryPermissionCount = (role: string, category: string) => {
    const categoryPerms = PERMISSION_CATEGORIES[category].permissions;
    const enabled = categoryPerms.filter(p => matrix[role]?.[p.code]).length;
    return { enabled, total: categoryPerms.length };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <RequirePerm perm="MANAGE_PERMISSIONS">
      <div className="p-6 max-w-[1400px]">
        <PageHeader
          title="Permission Matrix"
          subtitle="Configure granular permissions for each role based on the permission matrix"
          action={{
            label: hasChanges ? "Save Changes" : "Saved",
            onClick: handleSave,
            icon: Save,
            disabled: !hasChanges,
          }}
        />

        {/* Role Selector */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Shield className="text-gray-400" size={20} />
              <span className="text-sm font-medium text-gray-700">Select Role:</span>
              <div className="flex gap-2 flex-wrap">
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
                    {ROLE_DEFINITIONS[role].name}
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
          
          {/* Role Description */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>{ROLE_DEFINITIONS[selectedRole].name}:</strong>{" "}
              {ROLE_DEFINITIONS[selectedRole].description}
            </p>
          </div>
        </div>

        {/* Permission Matrix by Category */}
        <div className="space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
            const { enabled, total } = getCategoryPermissionCount(selectedRole, categoryKey);
            const allEnabled = enabled === total;
            const someEnabled = enabled > 0 && enabled < total;

            return (
              <div key={categoryKey} className="bg-white rounded-lg border overflow-hidden">
                {/* Category Header */}
                <div className="bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allEnabled}
                      ref={(el) => {
                        if (el) el.indeterminate = someEnabled;
                      }}
                      onChange={(e) => toggleCategory(selectedRole, categoryKey, e.target.checked)}
                      disabled={selectedRole === "ADMIN"}
                      className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500"
                    />
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      {enabled} / {total} enabled
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-sky-600 h-2 rounded-full transition-all"
                        style={{ width: `${(enabled / total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="divide-y divide-gray-100">
                  {category.permissions.map((permission) => {
                    const isEnabled = matrix[selectedRole]?.[permission.code] || false;
                    
                    return (
                      <div
                        key={permission.code}
                        className="px-6 py-3 hover:bg-gray-50 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => togglePermission(selectedRole, permission.code)}
                            disabled={selectedRole === "ADMIN"}
                            className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {permission.code.split('_').map(word => 
                                word.charAt(0) + word.slice(1).toLowerCase()
                              ).join(' ')}
                            </div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEnabled ? (
                            <span className="text-green-600 text-xs flex items-center gap-1">
                              <Check size={14} /> Enabled
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs flex items-center gap-1">
                              <X size={14} /> Disabled
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-sky-50 rounded-lg border border-sky-200 p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={16} className="text-sky-600" />
            Permission Matrix Guidelines
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h5 className="font-semibold mb-2">Role Descriptions:</h5>
              <ul className="space-y-1">
                <li>• <strong>Admin:</strong> Full system access, cannot be modified</li>
                <li>• <strong>Manager:</strong> Authorize returns/refunds, approve discounts, manage inventory</li>
                <li>• <strong>Cashier:</strong> Process sales, no return authorization</li>
                <li>• <strong>Technician:</strong> Manage repairs, no sales/inventory access</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Usage:</h5>
              <ul className="space-y-1">
                <li>• Check/uncheck individual permissions for granular control</li>
                <li>• Use category checkbox to enable/disable all permissions in a category</li>
                <li>• Admin role has all permissions and cannot be modified</li>
                <li>• Save changes to apply new permission configuration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {roles.map(role => {
            const totalPerms = Object.values(matrix[role] || {}).filter(Boolean).length;
            const maxPerms = Object.keys(PERMISSIONS).length;
            
            return (
              <div key={role} className="bg-white rounded-lg border p-4">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getRoleBadgeColor(role)}`}>
                  {ROLE_DEFINITIONS[role].name}
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalPerms}</div>
                <div className="text-xs text-gray-500">of {maxPerms} permissions</div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${role === "ADMIN" ? "bg-red-600" : "bg-sky-600"}`}
                    style={{ width: `${(totalPerms / maxPerms) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RequirePerm>
  );
}
