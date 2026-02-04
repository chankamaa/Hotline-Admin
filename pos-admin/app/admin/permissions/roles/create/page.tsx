"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Shield, Plus, X, Loader2 } from "lucide-react";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS, PERMISSION_CATEGORIES } from "@/lib/permissions";
import roleApi from "@/lib/api/roleApi";
import Link from "next/link";

interface Permission {
  _id: string;
  code: string;
  description: string;
  category: string;
}

interface SelectedPermissions {
  [category: string]: Set<string>;
}

export default function CreateRolePage() {
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Permissions state
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<SelectedPermissions>({});
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Group permissions by category
  const permissionsByCategory = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Fetch permissions on mount
  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/permissions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch permissions');
      
      const data = await response.json();
      setAllPermissions(data.data.permissions || []);
      
      // Initialize selected permissions
      const initial: SelectedPermissions = {};
      data.data.permissions.forEach((perm: Permission) => {
        if (!initial[perm.category]) {
          initial[perm.category] = new Set();
        }
      });
      setSelectedPermissions(initial);
      
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      alert("Failed to load permissions. Please refresh the page.");
    } finally {
      setLoadingPermissions(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Role name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Role name must be at least 3 characters";
    } else if (!/^[A-Z_]+$/.test(formData.name.toUpperCase())) {
      newErrors.name = "Role name should contain only letters and underscores";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Check if at least one permission is selected
    const totalSelected = Object.values(selectedPermissions).reduce(
      (sum, set) => sum + set.size,
      0
    );
    if (totalSelected === 0) {
      newErrors.permissions = "Please select at least one permission";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Collect all selected permission IDs
      const permissionIds: string[] = [];
      Object.values(selectedPermissions).forEach(set => {
        set.forEach(id => permissionIds.push(id));
      });

      await roleApi.create({
        name: formData.name.toUpperCase(),
        description: formData.description,
        permissions: permissionIds,
      });

      alert(`Role ${formData.name} created successfully!`);
      router.push("/admin/permissions/roles");
      
    } catch (error: any) {
      console.error("Error creating role:", error);
      
      const errorMessage = error.message || "Failed to create role";
      
      if (errorMessage.includes("already exists")) {
        setErrors({ name: "Role name already exists" });
      } else {
        alert(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const togglePermission = (category: string, permissionId: string) => {
    setSelectedPermissions(prev => {
      const newState = { ...prev };
      if (!newState[category]) {
        newState[category] = new Set();
      }
      
      const categorySet = new Set(newState[category]);
      if (categorySet.has(permissionId)) {
        categorySet.delete(permissionId);
      } else {
        categorySet.add(permissionId);
      }
      newState[category] = categorySet;
      
      return newState;
    });

    // Clear permission error when user selects one
    if (errors.permissions) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.permissions;
        return newErrors;
      });
    }
  };

  const toggleCategory = (category: string, enable: boolean) => {
    setSelectedPermissions(prev => {
      const newState = { ...prev };
      const categoryPermissions = permissionsByCategory[category] || [];
      
      if (enable) {
        newState[category] = new Set(categoryPermissions.map(p => p._id));
      } else {
        newState[category] = new Set();
      }
      
      return newState;
    });
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryPermissions = permissionsByCategory[category] || [];
    const selected = selectedPermissions[category] || new Set();
    return categoryPermissions.length > 0 && selected.size === categoryPermissions.length;
  };

  const isCategoryPartiallySelected = (category: string) => {
    const selected = selectedPermissions[category] || new Set();
    return selected.size > 0 && !isCategoryFullySelected(category);
  };

  const getTotalSelectedCount = () => {
    return Object.values(selectedPermissions).reduce(
      (sum, set) => sum + set.size,
      0
    );
  };

  return (
    <RequirePerm perm="MANAGE_ROLES">
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-4">
          <Link
            href="/admin/permissions/roles"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roles
          </Link>
        </div>
        
        <PageHeader
          title="Create New Role"
          subtitle="Define a custom role with specific permissions"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-sky-600" />
              Role Information
            </h3>

            <div className="space-y-4">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.name;
                        return newErrors;
                      });
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="INVENTORY_SPECIALIST"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Use uppercase letters and underscores (e.g., CUSTOM_ROLE)
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    setFormData({ ...formData, description: e.target.value });
                    if (errors.description) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.description;
                        return newErrors;
                      });
                    }
                  }}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe the role's responsibilities and access level"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Permission Selection */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Permissions
              </h3>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-sky-600">{getTotalSelectedCount()}</span> of{" "}
                <span className="font-medium">{allPermissions.length}</span> selected
              </div>
            </div>

            {errors.permissions && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.permissions}</p>
              </div>
            )}

            {loadingPermissions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-gray-400" size={32} />
                <span className="ml-3 text-gray-600">Loading permissions...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => {
                  const isFullySelected = isCategoryFullySelected(category);
                  const isPartiallySelected = isCategoryPartiallySelected(category);
                  const selectedCount = selectedPermissions[category]?.size || 0;

                  return (
                    <div key={category} className="border rounded-lg overflow-hidden">
                      {/* Category Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={isFullySelected}
                            ref={(el) => {
                              if (el) el.indeterminate = isPartiallySelected;
                            }}
                            onChange={(e) => toggleCategory(category, e.target.checked)}
                            className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">
                              {category}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {selectedCount} of {permissions.length} selected
                            </p>
                          </div>
                        </label>
                      </div>

                      {/* Permissions List */}
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {permissions.map((permission) => {
                            const isSelected = selectedPermissions[category]?.has(permission._id);
                            
                            return (
                              <label
                                key={permission._id}
                                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-sky-500 bg-sky-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePermission(category, permission._id)}
                                  className="mt-0.5 w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900">
                                    {permission.code.split('_').map(word => 
                                      word.charAt(0) + word.slice(1).toLowerCase()
                                    ).join(' ')}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-0.5">
                                    {permission.description}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg border p-4">
            <div className="text-sm text-gray-600">
              {getTotalSelectedCount() > 0 ? (
                <span>
                  <span className="font-medium text-sky-600">{getTotalSelectedCount()}</span>{" "}
                  permissions will be assigned to this role
                </span>
              ) : (
                <span className="text-red-500">No permissions selected</span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/permissions/roles")}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loadingPermissions}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Role
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </RequirePerm>
  );
}
