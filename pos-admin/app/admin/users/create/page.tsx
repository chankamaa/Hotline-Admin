"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { ArrowLeft, Eye, EyeOff, RefreshCw, Send, Loader2 } from "lucide-react";
import RequirePerm from "@/components/RequirePerm";
import { PERMISSIONS } from "@/components/sidebar-config";
import userApi from "@/lib/api/userApi";
import roleApi, { Role } from "@/lib/api/roleApi";

export default function CreateUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    role: "" as string, // Store role ID instead of name
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(false);
  const [sendCredentials, setSendCredentials] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await roleApi.getAll();
      setRoles(response.data.roles);
      
      // Set default role to CASHIER if available
      const cashierRole = response.data.roles.find(r => r.name === "CASHIER");
      if (cashierRole && !formData.role) {
        setFormData(prev => ({ ...prev, role: cashierRole._id }));
      }
    } catch (error: any) {
      console.error("Error fetching roles:", error);
      alert("Failed to load roles. Please refresh the page.");
    } finally {
      setLoadingRoles(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData((prev) => ({ ...prev, password, confirmPassword: password }));
    setAutoGeneratePassword(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!formData.role) {
      alert("Please select a role");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create user with backend API
      await userApi.create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.confirmPassword,
        roles: [formData.role], // Send role ID in array
      });

      alert(`User ${formData.username} created successfully!`);
      
      // TODO: Implement email sending if sendCredentials is true
      if (sendCredentials) {
        console.log("Sending credentials via email...");
      }
      
      // Redirect to users list
      router.push("/admin/permissions/users");
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Handle specific error messages from backend
      const errorMessage = error.message || "Failed to create user";
      
      if (errorMessage.includes("username") || errorMessage.includes("unique")) {
        setErrors({ username: "Username already exists" });
      } else if (errorMessage.includes("email")) {
        setErrors({ email: "Email already exists" });
      } else {
        alert(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <RequirePerm perm={PERMISSIONS.USER_CREATE}>
      <div className="p-6">
        <PageHeader
          title="Create New User"
          subtitle="Add a new employee with unique username and password"
          action={{
            label: "Back to Users",
            onClick: () => (window.location.href = "/admin/permissions/users"),
            icon: ArrowLeft,
          }}
        />

        <div className="max-w-3xl mx-auto text-gray-400">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Information */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              
              <div className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="john.doe"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                  )}
                </div>

 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="john.doe@company.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={autoGeneratePassword}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        disabled={autoGeneratePassword}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Auto-generate Password */}
                <button
                  type="button"
                  onClick={generatePassword}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-100 transition-colors text-sm font-medium"
                >
                  <RefreshCw size={16} />
                  Auto-generate Secure Password
                </button>
              </div>
            </div>

           

            {/* Role Assignment */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Assignment</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Employee Type <span className="text-red-500">*</span>
                </label>
                
                {loadingRoles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                    <span className="ml-2 text-gray-600">Loading roles...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((role) => {
                      const roleColors: Record<string, string> = {
                        ADMIN: "red",
                        MANAGER: "blue",
                        CASHIER: "green",
                      };
                      const color = roleColors[role.name] || "gray";
                      
                      return (
                        <label
                          key={role._id}
                          className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            formData.role === role._id
                              ? `border-${color}-500 bg-${color}-50`
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role._id}
                            checked={formData.role === role._id}
                            onChange={(e) => handleInputChange("role", e.target.value)}
                            className="mt-1"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">{role.name}</div>
                            <div className="text-xs text-gray-600 mt-1">{role.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Notification Options */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Options</h3>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendCredentials}
                  onChange={(e) => setSendCredentials(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Send credentials via email
                  </div>
                  <div className="text-xs text-gray-600">
                    The user will receive their username and password via email
                  </div>
                </div>
                <Send size={16} className="ml-auto text-gray-400" />
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/permissions/users")}
                disabled={submitting}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || loadingRoles}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RequirePerm>
  );
}
