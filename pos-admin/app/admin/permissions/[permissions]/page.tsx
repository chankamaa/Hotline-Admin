"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Shield, Search, AlertCircle } from "lucide-react";
import { permissionApi, Permission, PermissionsByCategory } from "@/lib/api/permissionApi";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS } from "@/lib/permissions";

const CATEGORY_COLORS: Record<string, string> = {
  SALES: "bg-green-100 text-green-700 border-green-200",
  DISCOUNTS: "bg-yellow-100 text-yellow-700 border-yellow-200",
  RETURNS: "bg-orange-100 text-orange-700 border-orange-200",
  REPORTS: "bg-blue-100 text-blue-700 border-blue-200",
  USERS: "bg-purple-100 text-purple-700 border-purple-200",
  ROLES: "bg-indigo-100 text-indigo-700 border-indigo-200",
  PERMISSIONS: "bg-pink-100 text-pink-700 border-pink-200",
  EMPLOYEES: "bg-cyan-100 text-cyan-700 border-cyan-200",
  PRODUCTS: "bg-teal-100 text-teal-700 border-teal-200",
  CATEGORIES: "bg-lime-100 text-lime-700 border-lime-200",
  INVENTORY: "bg-emerald-100 text-emerald-700 border-emerald-200",
  DEVICES: "bg-violet-100 text-violet-700 border-violet-200",
  SETTINGS: "bg-gray-100 text-gray-700 border-gray-200",
  DATABASE: "bg-red-100 text-red-700 border-red-200",
  SYSTEM: "bg-rose-100 text-rose-700 border-rose-200",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  SALES: "Manage sales transactions and operations",
  DISCOUNTS: "Handle discount operations and approvals",
  RETURNS: "Process returns and refund operations",
  REPORTS: "Access and manage business reports",
  USERS: "Manage user accounts and authentication",
  ROLES: "Manage user roles and assignments",
  PERMISSIONS: "Manage system permissions",
  EMPLOYEES: "Manage employee information and performance",
  PRODUCTS: "Manage product catalog and categories",
  CATEGORIES: "Manage product categorization",
  INVENTORY: "Manage inventory and stock levels",
  DEVICES: "Manage device repair operations",
  SETTINGS: "Configure system settings",
  DATABASE: "Manage database and backups",
  SYSTEM: "System-level access controls",
};

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<PermissionsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await permissionApi.getAll();
      setPermissions(response.data.permissions);
      setGroupedPermissions(response.data.grouped);
    } catch (err) {
      console.error("Failed to fetch permissions:", err);
      setError(err instanceof Error ? err.message : "Failed to load permissions");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = Object.keys(groupedPermissions).filter((category) => {
    if (selectedCategory && category !== selectedCategory) return false;
    if (!searchTerm) return true;
    
    const categoryPerms = groupedPermissions[category];
    return categoryPerms.some(
      (perm) =>
        perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader
          title="Permission Management"
          subtitle="View all system permissions organized by category"
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
          title="Permission Management"
          subtitle="View all system permissions organized by category"
        />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Permissions</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequirePerm perm={PERMISSIONS.VIEW_PERMISSIONS}>
      <div className="p-6">
        <PageHeader
          title="Permission Management"
          subtitle="View all system permissions organized by category"
        />

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-sky-100 rounded-lg p-3">
                <Shield className="text-sky-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Permissions</p>
                <p className="text-2xl font-semibold text-gray-900">{permissions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-3">
                <Shield className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.keys(groupedPermissions).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-3">
                <Shield className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Filtered Results</p>
                <p className="text-2xl font-semibold text-gray-900">{filteredCategories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {Object.keys(groupedPermissions).map((category) => (
                  <option key={category} value={category}>
                    {category} ({groupedPermissions[category].length})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Permissions by Category */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const categoryPerms = groupedPermissions[category].filter((perm) =>
              !searchTerm ||
              perm.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
              perm.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (categoryPerms.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Category Header */}
                <div className={`p-4 border-b ${CATEGORY_COLORS[category] || "bg-gray-100"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{category}</h3>
                      <p className="text-sm opacity-80">
                        {CATEGORY_DESCRIPTIONS[category] || "System permissions"}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white/50 backdrop-blur rounded-full text-sm font-medium">
                      {categoryPerms.length} {categoryPerms.length === 1 ? "permission" : "permissions"}
                    </span>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="divide-y divide-gray-100">
                  {categoryPerms.map((perm) => (
                    <div
                      key={perm._id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="text-sm font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded">
                              {perm.code}
                            </code>
                          </div>
                          {perm.description && (
                            <p className="text-sm text-gray-600">{perm.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <Shield className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Permissions Found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory
                  ? "Try adjusting your filters"
                  : "No permissions available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </RequirePerm>
  );
}
