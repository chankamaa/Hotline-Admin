"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { UserPlus, Search, Edit, Trash2, Lock, Power, RefreshCw, ArrowLeft } from "lucide-react";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS } from "@/app/sidebar/sidebar-config";
import { userApi, User as ApiUser } from "@/lib/api/userApi";
import Link from "next/link";

// Use the API User type
type User = ApiUser;

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await userApi.getAll();
      console.log("API Response:", response); // Debug log
      
      // The API returns { data: { users: User[] } }
      const userData = response.data?.users || [];
      console.log("User Data:", userData); // Debug log
      
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load users");
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingUserId(userId);
      console.log(`Attempting to delete user: ${userId}`);
      
      const response = await userApi.delete(userId);
      console.log("Delete response:", response);
      
      // Show success message
      alert(`User "${username}" has been deleted successfully!`);
      
      // Refresh the user list
      await fetchUsers(true);
    } catch (err: any) {
      console.error("Error deleting user:", err);
      console.error("Full error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Extract meaningful error message
      let errorMessage = "Failed to delete user";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error deleting user: ${errorMessage}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  // Handle user activation toggle
  const handleToggleActive = async (userId: string, currentStatus: boolean, username: string) => {
    try {
      console.log(`Toggling user ${userId} status from ${currentStatus} to ${!currentStatus}`);
      
      const response = await userApi.update(userId, { isActive: !currentStatus });
      console.log("Update response:", response);
      
      // Show success message
      const newStatus = !currentStatus ? "activated" : "deactivated";
      alert(`User "${username}" has been ${newStatus} successfully!`);
      
      // Refresh the user list
      await fetchUsers(true);
    } catch (err: any) {
      console.error("Error updating user:", err);
      console.error("Full error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      // Extract meaningful error message
      let errorMessage = "Failed to update user status";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error updating user: ${errorMessage}`);
      alert(err.response?.data?.message || "Failed to update user status");
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if user has the selected role
    const matchesRole = selectedRole === "all" || 
                       (user.roles && user.roles.some(role => role.name.toLowerCase() === selectedRole.toLowerCase()));
    
    return matchesSearch && matchesRole;
  }) : [];

  const getRoleBadgeColor = (roleName: string) => {
    const lowerRole = roleName.toLowerCase();
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      cashier: "bg-green-100 text-green-800",
      technician: "bg-orange-100 text-orange-800",
    };
    return colors[lowerRole] || "bg-gray-100 text-gray-800";
  };

  return (
    <RequirePerm perm={PERMISSIONS.VIEW_USERS}>
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
          title="User Management"
          subtitle="Manage user accounts, roles, and permissions"
          action={{
            label: "Create User",
            onClick: () => (window.location.href = "/admin/users/create"),
            icon: UserPlus,
          }}
        />

        {/* Summary Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">Active Users</div>
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">Admins</div>
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.roles.some(r => r.name.toLowerCase() === "admin")).length}
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">Managers</div>
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.roles.some(r => r.name.toLowerCase() === "manager")).length}
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            variant="danger"
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchUsers()}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg border p-12">
            <div className="flex flex-col items-center justify-center">
              <RefreshCw size={40} className="animate-spin text-sky-500 mb-4" />
              <p className="text-gray-500">Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border p-4 mb-6 text-gray-900">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or employee ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {/* Sort by Label and Role Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Sort by:</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="technician">Technician</option>
                  </select>
                </div>
              </div>
            </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user._id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email || "N/A"}</div>
                      <div className="text-sm text-gray-500">User ID: {user._id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <span 
                              key={role._id}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(role.name)}`}
                            >
                              {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            No Role
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.location.href = `/admin/users/edit/${user._id}`}
                          className="text-sky-600 hover:text-sky-900 disabled:opacity-50"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                          title="Reset Password"
                          onClick={() => alert("Password reset functionality coming soon")}
                        >
                          <Lock size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user._id, user.isActive, user.username)}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title={user.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.username)}
                          disabled={deletingUserId === user._id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Delete User"
                        >
                          {deletingUserId === user._id ? (
                            <RefreshCw size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </RequirePerm>
  );
}
