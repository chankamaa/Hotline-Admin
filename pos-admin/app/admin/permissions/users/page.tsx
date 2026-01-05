"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Building,
  CheckCircle,
  Edit3,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

interface PermissionUser {
  id: string;
  username: string;
  name: string;
  mobile: string;
  role: string;
  branch: string;
  status: "active" | "inactive";
  lastLogin: string;
}

const mockUsers: PermissionUser[] = [
  {
    id: "1",
    username: "mng",
    name: "Milan Gamage",
    mobile: "0714929222",
    role: "Manager",
    branch: "Tezlaa Colombo",
    status: "active",
    lastLogin: "Jan 4, 2026, 11:13 PM",
  },
  {
    id: "2",
    username: "eee",
    name: "Eesha Dilshan",
    mobile: "0713749528",
    role: "Admin",
    branch: "No Branch",
    status: "active",
    lastLogin: "Never",
  },
  {
    id: "3",
    username: "admin1",
    name: "Tezlaa Super Admin",
    mobile: "N/A",
    role: "Admin",
    branch: "No Branch",
    status: "active",
    lastLogin: "Jan 2, 2026, 09:40 AM",
  },
  {
    id: "4",
    username: "barista",
    name: "Barista User",
    mobile: "0700001122",
    role: "Barista",
    branch: "Tezlaa Cafe",
    status: "active",
    lastLogin: "Jan 4, 2026, 05:22 PM",
  },
  {
    id: "5",
    username: "cashier",
    name: "Cashier A",
    mobile: "0700001133",
    role: "Cashier",
    branch: "Tezlaa Colombo",
    status: "inactive",
    lastLogin: "Dec 28, 2025, 02:05 PM",
  },
  {
    id: "6",
    username: "ops",
    name: "Operations",
    mobile: "0700001144",
    role: "Operations",
    branch: "Tezlaa Warehouse",
    status: "active",
    lastLogin: "Jan 3, 2026, 08:15 AM",
  },
];

const metricsBackgrounds = [
  "from-blue-50 via-blue-50 to-white",
  "from-emerald-50 via-emerald-50 to-white",
  "from-rose-50 via-rose-50 to-white",
  "from-purple-50 via-purple-50 to-white",
];

export default function PermissionUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    const total = mockUsers.length;
    const active = mockUsers.filter((user) => user.status === "active").length;
    const inactive = mockUsers.filter((user) => user.status === "inactive").length;
    const roles = new Set(mockUsers.map((user) => user.role)).size;

    return {
      total,
      active,
      inactive,
      roles,
    };
  }, []);

  const roles = useMemo(
    () => Array.from(new Set(mockUsers.map((user) => user.role))).sort(),
    []
  );

  const branches = useMemo(
    () => Array.from(new Set(mockUsers.map((user) => user.branch))).sort(),
    []
  );

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesSearch = [user.username, user.name, user.mobile, user.branch]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesBranch = branchFilter === "all" || user.branch === branchFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [searchTerm, roleFilter, branchFilter, statusFilter]);

  const metricCards = [
    {
      title: "Total Users",
      value: stats.total,
      icon: <Users className="text-blue-500" size={24} />,
      gradient: metricsBackgrounds[0],
    },
    {
      title: "Active",
      value: stats.active,
      icon: <CheckCircle className="text-emerald-500" size={24} />,
      gradient: metricsBackgrounds[1],
    },
    {
      title: "Inactive",
      value: stats.inactive,
      icon: <XCircle className="text-rose-500" size={24} />,
      gradient: metricsBackgrounds[2],
    },
    {
      title: "Roles",
      value: stats.roles,
      icon: <ShieldCheck className="text-purple-500" size={24} />,
      gradient: metricsBackgrounds[3],
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="User Permissions"
        description="Control user access, branches, and roles across your organization"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setBranchFilter("all");
                setStatusFilter("all");
              }}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button>
              <UserPlus size={16} />
              Add User
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <div
            key={metric.title}
            className={`rounded-2xl border bg-gradient-to-br ${metric.gradient} p-5`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">{metric.title}</span>
              {metric.icon}
            </div>
            <div className="text-3xl font-semibold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Search user by name, role, or branch..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <select
                className="w-full sm:w-44 appearance-none rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <div className="relative">
              <select
                className="w-full sm:w-44 appearance-none rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                value={branchFilter}
                onChange={(event) => setBranchFilter(event.target.value)}
              >
                <option value="all">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
              <Building className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
            <div className="relative">
              <select
                className="w-full sm:w-40 appearance-none rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        <div className="border rounded-2xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 text-sm font-semibold text-gray-600 flex">
            <div className="w-40">Username</div>
            <div className="flex-1">Name</div>
            <div className="w-40">Mobile</div>
            <div className="w-36">Role Type</div>
            <div className="w-44">Branch</div>
            <div className="w-28">Status</div>
            <div className="w-40">Last Login</div>
            <div className="w-40">Manage Password</div>
            <div className="w-20 text-right">Actions</div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No users match the current filters.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="px-6 py-4 border-t text-sm text-gray-700 flex items-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-40 font-medium text-gray-900">{user.username}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user.name}</div>
                </div>
                <div className="w-40">{user.mobile}</div>
                <div className="w-36">
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    <ShieldCheck size={14} />
                    {user.role}
                  </span>
                </div>
                <div className="w-44">{user.branch}</div>
                <div className="w-28">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      user.status === "active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="w-40 text-gray-500">{user.lastLogin}</div>
                <div className="w-40">
                  <button className="text-sm font-medium text-orange-500 hover:text-orange-600">
                    Reset password
                  </button>
                </div>
                <div className="w-20 text-right flex justify-end gap-3">
                  <button
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    aria-label={`Edit ${user.username}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    className="rounded-lg p-2 text-gray-400 hover:text-rose-600 hover:bg-gray-100"
                    aria-label={`Remove ${user.username}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
