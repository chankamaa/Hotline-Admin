"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Save, ArrowLeft, Shield, AlertCircle, Lock, CheckCircle, Info } from "lucide-react";
import { roleApi, Role } from "@/lib/api/roleApi";
import { permissionApi, Permission, PermissionsByCategory } from "@/lib/api/permissionApi";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS, PERMISSION_CATEGORIES, ROLE_DEFINITIONS, getPermissionDisplayName } from "@/lib/permissions";
import { useAuth } from "@/providers/providers";
import { can } from "@/lib/acl";

const CATEGORY_COLORS: Record<string, string> = {
  SALES: "bg-green-100 text-green-800 border-green-300",
  DISCOUNTS: "bg-yellow-100 text-yellow-800 border-yellow-300",
  RETURNS: "bg-orange-100 text-orange-800 border-orange-300",
  REPORTS: "bg-blue-100 text-blue-800 border-blue-300",
  USERS: "bg-purple-100 text-purple-800 border-purple-300",
  ROLES: "bg-indigo-100 text-indigo-800 border-indigo-300",
  PERMISSIONS: "bg-teal-100 text-teal-800 border-teal-300",
  EMPLOYEES: "bg-cyan-100 text-cyan-800 border-cyan-300",
  PRODUCTS: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CATEGORIES: "bg-lime-100 text-lime-800 border-lime-300",
  INVENTORY: "bg-teal-100 text-teal-800 border-teal-300",
  STOCK: "bg-sky-100 text-sky-800 border-sky-300",
  WARRANTY: "bg-violet-100 text-violet-800 border-violet-300",
  CUSTOMERS: "bg-pink-100 text-pink-800 border-pink-300",
  PURCHASE_ORDERS: "bg-amber-100 text-amber-800 border-amber-300",
  PRICING: "bg-rose-100 text-rose-800 border-rose-300",
  BRANCHES: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
  REPAIRS: "bg-purple-100 text-purple-800 border-purple-300",
  SETTINGS: "bg-gray-100 text-gray-800 border-gray-300",
  DATABASE: "bg-red-100 text-red-800 border-red-300",
  SYSTEM: "bg-red-200 text-red-900 border-red-400",
};

export default function RoleEditPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  const { user } = useAuth();

  const [role, setRole] = useState<Role | null>(null);
  const [groupedPermissions, setGroupedPermissions] = useState<PermissionsByCategory>({});
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Track permissions by code for easier matching with PERMISSION_CATEGORIES
  const [permissionCodeToId, setPermissionCodeToId] = useState<Record<string, string>>({});
  
  // Check if user can manage permissions
  const canManagePermissions = can(user, PERMISSIONS.MANAGE_PERMISSIONS) || can(user, PERMISSIONS.MANAGE_ROLES);

  useEffect(() => {
    fetchData();
  }, [roleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [roleResponse, permissionsResponse] = await Promise.all([
        roleApi.getById(roleId),
        permissionApi.getAll(),
      ]);

      const roleData = roleResponse.data.role;
      setRole(roleData);
      setGroupedPermissions(permissionsResponse.data.grouped);
      
      // Build permission code to ID mapping
      const codeToId: Record<string, string> = {};
      Object.values(permissionsResponse.data.grouped).flat().forEach((perm: Permission) => {
        codeToId[perm.code] = perm._id;
      });
      setPermissionCodeToId(codeToId);
      
      // Initialize selected permissions
      const permIds = new Set(roleData.permissions.map((p: any) => p._id || p));
      setSelectedPermissions(permIds);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!canManagePermissions) {
      alert("You don't have permission to modify role permissions");
      return;
    }
    
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  const toggleCategory = (category: string, enable: boolean) => {
    if (!canManagePermissions) {
      alert("You don't have permission to modify role permissions");
      return;
    }
    
    const categoryPerms = groupedPermissions[category] || [];
    const newSelected = new Set(selectedPermissions);

    categoryPerms.forEach((perm) => {
      if (enable) {
        newSelected.add(perm._id);
      } else {
        newSelected.delete(perm._id);
      }
    });

    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };
  
  const applyRoleTemplate = (templateRole: string) => {
    if (!canManagePermissions) {
      alert("You don't have permission to modify role permissions");
      return;
    }
    
    const roleDefinition = ROLE_DEFINITIONS[templateRole.toUpperCase()];
    if (!roleDefinition) return;
    
    const newSelected = new Set<string>();
    
    // Map permission codes from template to permission IDs
    roleDefinition.permissions.forEach(permCode => {
      const permId = permissionCodeToId[permCode];
      if (permId) {
        newSelected.add(permId);
      }
    });
    
    setSelectedPermissions(newSelected);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!role) return;

    try {
      setSaving(true);
      await roleApi.assignPermissions(roleId, Array.from(selectedPermissions));
      setHasChanges(false);
      alert("Permissions updated successfully!");
      router.push("/admin/permissions/roles");
    } catch (err) {
      console.error("Failed to save permissions:", err);
      alert(err instanceof Error ? err.message : "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Role</h3>
            <p className="text-red-700">{error || "Role not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequirePerm perm={PERMISSIONS.MANAGE_ROLES}>
      <div className="p-6">
        <PageHeader
          title={`Edit Role: ${role.name}`}
          subtitle={role.description || "Manage role permissions"}
          action={{
            label: "Back to Roles",
            onClick: () => router.push("/admin/permissions/roles"),
            icon: ArrowLeft,
          }}
        />

        {/* Permission Access Warning */}
        {!canManagePermissions && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Lock className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-amber-900">Read-Only Mode</h4>
              <p className="text-sm text-amber-800 mt-1">
                You have permission to view this role but not to modify its permissions. 
                Contact an administrator if you need to make changes.
              </p>
            </div>
          </div>
        )}

        {/* Role Info Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="text-sky-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                {role.isDefault && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    <Lock size={12} />
                    System Role
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-sky-600">
                {selectedPermissions.size}
              </div>
              <div className="text-sm text-gray-600">Permissions</div>
            </div>
          </div>
        </div>

        {/* Role Templates */}
        {canManagePermissions && (
          <div className="bg-linear-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-200 p-6 mb-6">\n            <div className="flex items-start gap-3 mb-4">
              <Info className="text-sky-600 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">Quick Apply Role Templates</h4>
                <p className="text-sm text-gray-600">
                  Apply predefined permission sets based on standard roles. This will replace current selections.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(ROLE_DEFINITIONS).map(([key, roleDef]) => (
                <button
                  key={key}
                  onClick={() => applyRoleTemplate(key)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-sky-200 rounded-lg hover:border-sky-400 hover:bg-sky-50 transition-all"
                  title={roleDef.description}
                >
                  <Shield size={16} className={`text-${roleDef.color || 'gray'}-600`} />
                  <span className="font-medium text-gray-900">{roleDef.name}</span>
                  <span className="text-xs text-gray-500">({roleDef.permissions.length} perms)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        {hasChanges && canManagePermissions && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-600" size={20} />
              <span className="text-sm font-medium text-amber-900">You have unsaved changes</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Permissions by Category - Using PERMISSION_CATEGORIES structure */}
        <div className="space-y-6">
          {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, categoryData]) => {
            // Get permissions for this category from backend grouped permissions
            const categoryPerms = groupedPermissions[categoryKey] || [];
            
            if (categoryPerms.length === 0) return null;
            
            const selectedCount = categoryPerms.filter((p) =>
              selectedPermissions.has(p._id)
            ).length;
            const allSelected = selectedCount === categoryPerms.length;
            const someSelected = selectedCount > 0 && !allSelected;

            return (
              <div
                key={categoryKey}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Category Header */}
                <div
                  className={`p-4 border-b flex items-center justify-between ${
                    CATEGORY_COLORS[categoryKey] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={18} className="opacity-70" />
                      <h3 className="text-lg font-semibold">{categoryData.name}</h3>
                    </div>
                    <p className="text-sm opacity-80 mb-2">{categoryData.description}</p>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span className="bg-white/40 px-2 py-0.5 rounded">
                        {selectedCount} of {categoryPerms.length} selected
                      </span>
                      {allSelected && (
                        <span className="bg-green-500/20 text-green-900 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle size={12} />
                          All Selected
                        </span>
                      )}
                    </div>
                  </div>
                  {canManagePermissions && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCategory(categoryKey, !allSelected)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          allSelected
                            ? "bg-white/60 hover:bg-white/80 shadow-sm"
                            : someSelected
                            ? "bg-white/40 hover:bg-white/60"
                            : "bg-white hover:bg-white/90 shadow"
                        }`}
                      >
                        {allSelected ? "Deselect All" : someSelected ? "Select All" : "Select All"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Permissions List */}
                <div className="divide-y divide-gray-100">
                  {categoryPerms.map((perm) => {
                    const isSelected = selectedPermissions.has(perm._id);
                    
                    // Try to get enhanced description from PERMISSION_CATEGORIES
                    const permDetail = categoryData.permissions.find(p => p.code === perm.code);
                    const description = permDetail?.description || perm.description;

                    return (
                      <div
                        key={perm._id}
                        className={`p-4 transition-all ${
                          canManagePermissions ? 'cursor-pointer' : 'cursor-default'
                        } ${
                          isSelected ? "bg-sky-50 border-l-4 border-l-sky-500" : "hover:bg-gray-50"
                        }`}
                        onClick={() => canManagePermissions && togglePermission(perm._id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className="shrink-0 pt-1">
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-sky-600 border-sky-600 shadow-sm"
                                  : "border-gray-300 bg-white"
                              } ${!canManagePermissions && 'opacity-50'}`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.5"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>

                          {/* Permission Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="text-sm font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                                {perm.code}
                              </code>
                              {isSelected && (
                                <span className="text-xs text-sky-600 font-medium">Active</span>
                              )}
                            </div>
                            {description && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {description}
                              </p>
                            )}
                          </div>
                          
                          {!canManagePermissions && isSelected && (
                            <Lock className="text-gray-400 shrink-0" size={16} />
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

        {/* Bottom Save Button */}
        {hasChanges && canManagePermissions && (
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => {
                fetchData();
                setHasChanges(false);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <Save size={20} />
              {saving ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        )}
      </div>
    </RequirePerm>
  );
}
