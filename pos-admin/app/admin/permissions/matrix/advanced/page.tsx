"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { 
  Save, 
  RotateCcw, 
  Shield, 
  ArrowLeft, 
  Lock, 
  Unlock, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  Search,
  Filter,
  Download,
  Upload
} from "lucide-react";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/lib/permissions";
import Link from "next/link";
import { roleApi, type Role } from "@/lib/api/roleApi";
import { permissionApi, type Permission } from "@/lib/api/permissionApi";
import { useAuth } from "@/providers/providers";
import { useToast } from "@/providers/toast-provider";

// Critical permissions that only main admin can modify
const CRITICAL_PERMISSIONS = [
  PERMISSIONS.MANAGE_PERMISSIONS,
  PERMISSIONS.ASSIGN_PERMISSIONS,
  PERMISSIONS.MANAGE_ROLES,
  PERMISSIONS.DELETE_USER,
  PERMISSIONS.MANAGE_SETTINGS,
];

// Permission categories with descriptions
const PERMISSION_CATEGORIES = {
  SALES: {
    name: "Sales Operations",
    description: "Point of sale, transactions, and refunds",
    color: "blue",
    icon: "💰"
  },
  RETURNS: {
    name: "Returns & Refunds",
    description: "Process returns and manage refunds",
    color: "purple",
    icon: "↩️"
  },
  REPORTS: {
    name: "Reports & Analytics",
    description: "View business reports and analytics",
    color: "green",
    icon: "📊"
  },
  USER_MANAGEMENT: {
    name: "User Management",
    description: "Manage user accounts and profiles",
    color: "orange",
    icon: "👥"
  },
  ROLE_MANAGEMENT: {
    name: "Role & Permission Management",
    description: "Critical: Configure roles and permissions",
    color: "red",
    icon: "🛡️"
  },
  PRODUCT_MANAGEMENT: {
    name: "Product Management",
    description: "Manage product catalog and pricing",
    color: "indigo",
    icon: "📦"
  },
  CATEGORY_MANAGEMENT: {
    name: "Category Management",
    description: "Organize product categories",
    color: "teal",
    icon: "📂"
  },
  INVENTORY: {
    name: "Inventory Control",
    description: "Stock management and tracking",
    color: "yellow",
    icon: "📦"
  },
  REPAIR: {
    name: "Repair Management",
    description: "Device repairs and job tracking",
    color: "pink",
    icon: "🔧"
  },
  WARRANTY: {
    name: "Warranty Management",
    description: "Warranty registration and claims",
    color: "cyan",
    icon: "🛡️"
  },
  SETTINGS: {
    name: "System Settings",
    description: "Critical: System configuration",
    color: "gray",
    icon: "⚙️"
  },
  PROMOTIONS: {
    name: "Promotions & Discounts",
    description: "Marketing and promotional campaigns",
    color: "amber",
    icon: "🎁"
  }
};

interface PermissionMatrix {
  [roleId: string]: {
    [permissionCode: string]: boolean;
  };
}

export default function AdvancedPermissionMatrixPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [matrix, setMatrix] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Check if current user is main admin
  const isMainAdmin = user?.isSuperAdmin === true;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        roleApi.getAll(),
        permissionApi.getAll()
      ]);

      const rolesData = rolesRes.data.roles;
      const permsData = permsRes.data.permissions;

      setRoles(rolesData);
      setPermissions(permsData);

      // Build permission matrix
      const newMatrix: PermissionMatrix = {};
      rolesData.forEach(role => {
        newMatrix[role._id] = {};
        permsData.forEach(perm => {
          newMatrix[role._id][perm.code] = role.permissions.some(p => p.code === perm.code);
        });
      });

      setMatrix(newMatrix);
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0]._id);
      }

      // Expand all categories by default
      setExpandedCategories(new Set(Object.keys(PERMISSION_CATEGORIES)));
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load permission data");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (roleId: string, permissionCode: string) => {
    const permission = permissions.find(p => p.code === permissionCode);
    
    // Check if permission is critical and user is not main admin
    if (!isMainAdmin && CRITICAL_PERMISSIONS.includes(permissionCode as any)) {
      toast.warning("Only the Main Admin can modify this critical permission.");
      return;
    }

    // Check if trying to modify main admin role
    const role = roles.find(r => r._id === roleId);
    if (role?.name.toLowerCase() === "admin" || role?.name.toLowerCase() === "super admin") {
      toast.warning("The Admin role has full system access and cannot be modified.");
      return;
    }

    setMatrix(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionCode]: !prev[roleId][permissionCode]
      }
    }));
    setHasChanges(true);
  };

  const toggleCategory = (roleId: string, category: string, enable: boolean) => {
    const role = roles.find(r => r._id === roleId);
    if (role?.name.toLowerCase() === "admin" || role?.name.toLowerCase() === "super admin") {
      toast.warning("Admin role cannot be modified");
      return;
    }

    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS] || [];
    
    // Check if any critical permissions in category and user is not main admin
    const hasCritical = categoryPerms.some(p => CRITICAL_PERMISSIONS.includes(p as any));
    if (!isMainAdmin && hasCritical && enable) {
      toast.warning("This category contains critical permissions that only Main Admin can modify.");
      return;
    }

    const updates: PermissionMatrix = { ...matrix };
    categoryPerms.forEach(perm => {
      updates[roleId][perm] = enable;
    });
    setMatrix(updates);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);
      
      // Get enabled permissions for the selected role
      const enabledPermissions = Object.entries(matrix[selectedRole])
        .filter(([_, enabled]) => enabled)
        .map(([code, _]) => {
          const perm = permissions.find(p => p.code === code);
          return perm?._id;
        })
        .filter(Boolean) as string[];

      await roleApi.assignPermissions(selectedRole, enabledPermissions);
      
      setHasChanges(false);
      toast.success("Permissions saved successfully!");
      await loadData(); // Reload to get fresh data
    } catch (error) {
      console.error("Failed to save permissions:", error);
      toast.error("Failed to save permissions. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to discard all changes?")) {
      loadData();
      setHasChanges(false);
      toast.info("Changes discarded");
    }
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const getPermissionCount = (roleId: string, category: string) => {
    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS] || [];
    const enabled = categoryPerms.filter(perm => matrix[roleId]?.[perm]).length;
    return { enabled, total: categoryPerms.length };
  };

  const getCategoryColor = (category: string) => {
    const config = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
    const colorMap: Record<string, string> = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      green: "bg-green-100 text-green-700 border-green-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200",
      red: "bg-red-100 text-red-700 border-red-200",
      indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
      teal: "bg-teal-100 text-teal-700 border-teal-200",
      yellow: "bg-yellow-100 text-yellow-700 border-yellow-200",
      pink: "bg-pink-100 text-pink-700 border-pink-200",
      cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
      gray: "bg-gray-100 text-gray-700 border-gray-200",
      amber: "bg-amber-100 text-amber-700 border-amber-200",
    };
    return colorMap[config?.color || "gray"];
  };

  const isCriticalPermission = (permissionCode: string) => {
    return CRITICAL_PERMISSIONS.includes(permissionCode as any);
  };

  const filteredCategories = Object.entries(PERMISSION_GROUPS).filter(([category]) => {
    if (filterCategory !== "ALL" && category !== filterCategory) return false;
    if (!searchTerm) return true;
    
    const categoryPerms = PERMISSION_GROUPS[category as keyof typeof PERMISSION_GROUPS];
    return categoryPerms.some(perm => 
      perm.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Advanced Permission Matrix"
          description="Comprehensive role-based access control management"
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading permission matrix...</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedRoleData = roles.find(r => r._id === selectedRole);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/permissions"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Permissions
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="text-blue-600" size={32} />
              Advanced Permission Matrix
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive role-based access control with granular permission management
            </p>
          </div>
          
          {/* Main Admin Badge */}
          {isMainAdmin && (
            <div className="bg-linear-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <Lock size={16} />
              <span className="font-semibold">Main Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Alert Banner */}
      {!isMainAdmin && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-amber-900">Limited Access</h3>
              <p className="text-sm text-amber-800 mt-1">
                You can modify standard permissions, but critical system permissions (marked with 🔒) 
                can only be changed by the Main Admin to maintain system security.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white text-gray-500 rounded-xl border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="ALL">All Categories</option>
            {Object.keys(PERMISSION_GROUPS).map(cat => (
              <option key={cat} value={cat}>
                {PERMISSION_CATEGORIES[cat as keyof typeof PERMISSION_CATEGORIES]?.name || cat}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Role Selector */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-600" />
          Select Role to Configure
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {roles.map(role => {
            const isAdmin = role.name.toLowerCase() === "admin" || role.name.toLowerCase() === "super admin";
            const permCount = Object.values(matrix[role._id] || {}).filter(v => v).length;
            const totalPerms = permissions.length;
            const percentage = Math.round((permCount / totalPerms) * 100);
            
            return (
              <button
                key={role._id}
                onClick={() => setSelectedRole(role._id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedRole === role._id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{role.name}</h4>
                  {isAdmin && <Lock size={16} className="text-red-500" />}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{role.description}</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{permCount}/{totalPerms} permissions</span>
                    <span className="font-semibold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage === 100 ? "bg-green-600" : "bg-blue-600"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission Matrix */}
      {selectedRole && (
        <div className="space-y-4">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-2">
              Configuring: {selectedRoleData?.name}
            </h2>
            <p className="text-blue-100">
              {selectedRoleData?.description}
            </p>
          </div>

          {/* Permission Categories */}
          {filteredCategories.map(([category, perms]) => {
            const categoryInfo = PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES];
            const { enabled, total } = getPermissionCount(selectedRole, category);
            const isExpanded = expandedCategories.has(category);
            const isCritical = category === "ROLE_MANAGEMENT" || category === "SETTINGS";
            
            return (
              <div
                key={category}
                className="bg-white rounded-xl border overflow-hidden"
              >
                {/* Category Header */}
                <div
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    getCategoryColor(category)
                  }`}
                  onClick={() => toggleCategoryExpansion(category)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{categoryInfo?.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{categoryInfo?.name}</h3>
                          {isCritical && (
                            <Lock size={16} className="text-red-600" />
                          )}
                        </div>
                        <p className="text-sm opacity-75">{categoryInfo?.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Permission Counter */}
                      <div className="text-right mr-4">
                        <div className="font-bold text-lg">
                          {enabled}/{total}
                        </div>
                        <div className="text-xs opacity-75">permissions</div>
                      </div>

                      {/* Toggle All Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(selectedRole, category, enabled < total);
                        }}
                        disabled={
                          selectedRoleData?.name.toLowerCase() === "admin" ||
                          (!isMainAdmin && isCritical)
                        }
                        className="px-3 py-1 rounded-lg bg-white/50 hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {enabled === total ? "Disable All" : "Enable All"}
                      </button>

                      {/* Expand Icon */}
                      <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 w-full bg-white/30 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-white/60 transition-all"
                      style={{ width: `${(enabled / total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Permission List */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map(permCode => {
                        const perm = permissions.find(p => p.code === permCode);
                        if (!perm) return null;

                        const isEnabled = matrix[selectedRole]?.[permCode];
                        const isCrit = isCriticalPermission(permCode);
                        const isLocked = !isMainAdmin && isCrit;
                        
                        return (
                          <button
                            key={permCode}
                            onClick={() => togglePermission(selectedRole, permCode)}
                            disabled={isLocked || selectedRoleData?.name.toLowerCase() === "admin"}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              isEnabled
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            } ${
                              isLocked || selectedRoleData?.name.toLowerCase() === "admin"
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2 flex-1">
                                {isEnabled ? (
                                  <CheckCircle2 size={18} className="text-green-600 shrink-0" />
                                ) : (
                                  <XCircle size={18} className="text-gray-400 shrink-0" />
                                )}
                                <span className="font-medium text-sm text-gray-900">
                                  {perm.code.replace(/_/g, " ")}
                                </span>
                              </div>
                              {isCrit && <Lock size={14} className="text-red-500 shrink-0" />}
                            </div>
                            <p className="text-xs text-gray-600 pl-6">
                              {perm.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Info size={20} />
          Permission Matrix Guidelines
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-semibold mb-2">🔒 Critical Permissions</h4>
            <p>Permissions marked with a lock icon can only be modified by the Main Admin to prevent privilege escalation.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✅ Best Practices</h4>
            <p>Grant only the minimum permissions required for each role. Review permissions regularly.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">🛡️ Protected Roles</h4>
            <p>The Admin role has full system access and cannot be modified to ensure system stability.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">💾 Changes</h4>
            <p>All changes are saved immediately to the database. Use the Reset button to discard unsaved changes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
