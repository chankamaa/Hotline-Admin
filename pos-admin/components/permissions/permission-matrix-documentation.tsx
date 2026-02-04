"use client";

import { Shield, Lock, Users, AlertTriangle, CheckCircle, Info } from "lucide-react";

export function PermissionMatrixDocumentation() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Shield className="text-blue-600" size={28} />
          Permission Matrix System Overview
        </h2>
        <p className="text-gray-700 leading-relaxed">
          The Advanced Permission Matrix provides a comprehensive role-based access control (RBAC) system 
          that allows administrators to manage granular permissions across all system modules. This ensures 
          secure access management and prevents unauthorized actions.
        </p>
      </div>

      {/* Key Features */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <CheckCircle className="text-green-600 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900">Granular Control</h4>
              <p className="text-sm text-gray-600">
                Assign individual permissions per role across 12+ modules including Sales, Inventory, Repairs, and more.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Lock className="text-red-600 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900">Critical Permission Protection</h4>
              <p className="text-sm text-gray-600">
                Only Main Admins can modify critical permissions that affect system security and role management.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Users className="text-blue-600 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900">Role-Based Access</h4>
              <p className="text-sm text-gray-600">
                Define custom roles with specific permission sets tailored to your business needs.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-gray-900">Protected Admin Role</h4>
              <p className="text-sm text-gray-600">
                The Admin role maintains full system access and cannot be modified to ensure system stability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Hierarchy */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Permission Hierarchy</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="text-red-600" size={20} />
              <h4 className="font-bold text-red-900">Level 1: Main Admin Only</h4>
            </div>
            <p className="text-sm text-red-800 mb-2">
              Critical permissions that can only be managed by the Main Admin (isSuperAdmin = true):
            </p>
            <ul className="text-sm text-red-800 space-y-1 ml-4">
              <li>• MANAGE_PERMISSIONS - Create and modify permission definitions</li>
              <li>• ASSIGN_PERMISSIONS - Assign permissions to roles</li>
              <li>• MANAGE_ROLES - Create, update, and delete roles</li>
              <li>• DELETE_USER - Permanently delete user accounts</li>
              <li>• MANAGE_SETTINGS - Modify critical system settings</li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-blue-600" size={20} />
              <h4 className="font-bold text-blue-900">Level 2: Standard Admin Permissions</h4>
            </div>
            <p className="text-sm text-blue-800">
              All other permissions can be assigned by any admin user to non-admin roles. This includes 
              operations like sales, inventory management, reporting, user creation, etc.
            </p>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-green-600" size={20} />
              <h4 className="font-bold text-green-900">Level 3: Custom Role Permissions</h4>
            </div>
            <p className="text-sm text-green-800">
              Custom roles (Manager, Cashier, Technician, etc.) can be assigned any combination of 
              non-critical permissions based on job requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Permission Categories */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Permission Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">💰 Sales Operations</h4>
            <p className="text-sm text-gray-600">CREATE_SALE, VOID_SALE, VIEW_SALES, APPLY_DISCOUNT</p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📦 Product Management</h4>
            <p className="text-sm text-gray-600">CREATE_PRODUCT, VIEW_PRODUCTS, UPDATE_PRODUCT, DELETE_PRODUCT</p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Inventory Control</h4>
            <p className="text-sm text-gray-600">MANAGE_INVENTORY, VIEW_INVENTORY</p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">🔧 Repair Management</h4>
            <p className="text-sm text-gray-600">CREATE_REPAIR, VIEW_REPAIRS, ASSIGN_REPAIR, UPDATE_REPAIR, COMPLETE_REPAIR</p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">🛡️ Warranty Management</h4>
            <p className="text-sm text-gray-600">CREATE_WARRANTY, VIEW_WARRANTIES, UPDATE_WARRANTY, CREATE_WARRANTY_CLAIM</p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">👥 User Management</h4>
            <p className="text-sm text-gray-600">CREATE_USER, VIEW_USERS, UPDATE_USER, DELETE_USER</p>
          </div>

          <div className="border rounded-lg p-4 border-red-300 bg-red-50">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <Lock size={16} />
              🛡️ Role Management (Critical)
            </h4>
            <p className="text-sm text-red-800">MANAGE_ROLES, ASSIGN_ROLES, MANAGE_PERMISSIONS, ASSIGN_PERMISSIONS</p>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📈 Reports & Analytics</h4>
            <p className="text-sm text-gray-600">VIEW_PROFIT_REPORT, VIEW_SALES_REPORT, EXPORT_REPORTS</p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Info size={24} />
          Best Practices
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex gap-2">
            <span className="font-bold">1.</span>
            <p><strong>Principle of Least Privilege:</strong> Grant users only the minimum permissions necessary to perform their job functions.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">2.</span>
            <p><strong>Regular Audits:</strong> Review role permissions periodically to ensure they align with current job responsibilities.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">3.</span>
            <p><strong>Separation of Duties:</strong> Avoid giving a single role conflicting permissions (e.g., both creating and approving transactions).</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">4.</span>
            <p><strong>Protected Admin Access:</strong> Limit the number of Main Admin accounts and protect them with strong authentication.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">5.</span>
            <p><strong>Testing Changes:</strong> Test permission changes with a non-critical role before applying to production roles.</p>
          </div>
          <div className="flex gap-2">
            <span className="font-bold">6.</span>
            <p><strong>Documentation:</strong> Document the purpose and permissions of each role for future reference.</p>
          </div>
        </div>
      </div>

      {/* Security Notes */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <AlertTriangle size={24} />
          Security Considerations
        </h3>
        <div className="space-y-3 text-sm text-amber-800">
          <p>
            <strong>⚠️ Critical Permission Changes:</strong> Changes to role management and permission assignment 
            capabilities are restricted to Main Admins to prevent privilege escalation attacks.
          </p>
          <p>
            <strong>🔒 Admin Role Protection:</strong> The Admin role cannot be modified or deleted. This ensures 
            there is always a way to access and manage the system.
          </p>
          <p>
            <strong>📝 Audit Trail:</strong> All permission changes should be logged and reviewed regularly. 
            Consider implementing an audit log system for compliance.
          </p>
          <p>
            <strong>🚨 Emergency Access:</strong> Always ensure at least one Main Admin account is accessible. 
            Lost Main Admin access may require database-level intervention.
          </p>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Common Role Configurations</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
            <h4 className="font-bold text-green-900 mb-2">Manager Role</h4>
            <p className="text-sm text-green-800 mb-2">Typical permissions for a store manager:</p>
            <ul className="text-sm text-green-800 space-y-1 ml-4">
              <li>✅ All sales operations (create, view, refund)</li>
              <li>✅ Inventory management (full access)</li>
              <li>✅ View and export reports</li>
              <li>✅ Manage products and pricing</li>
              <li>✅ View users (no creation/deletion)</li>
              <li>❌ No role/permission management</li>
              <li>❌ No system settings access</li>
            </ul>
          </div>

          <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
            <h4 className="font-bold text-blue-900 mb-2">Cashier Role</h4>
            <p className="text-sm text-blue-800 mb-2">Typical permissions for a cashier:</p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4">
              <li>✅ Create and view sales</li>
              <li>✅ Process returns (with approval)</li>
              <li>✅ View inventory (read-only)</li>
              <li>✅ Create/update customer records</li>
              <li>❌ No void sales or large discounts</li>
              <li>❌ No inventory adjustments</li>
              <li>❌ No access to reports or settings</li>
            </ul>
          </div>

          <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
            <h4 className="font-bold text-orange-900 mb-2">Technician Role</h4>
            <p className="text-sm text-orange-800 mb-2">Typical permissions for a repair technician:</p>
            <ul className="text-sm text-orange-800 space-y-1 ml-4">
              <li>✅ View and update assigned repairs</li>
              <li>✅ Create warranty claims</li>
              <li>✅ View warranty information</li>
              <li>✅ Update repair status and notes</li>
              <li>❌ No sales or inventory access</li>
              <li>❌ Cannot delete or cancel repairs</li>
              <li>❌ No pricing or financial data access</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
