/**
 * User API Service
 * Handles all user-related API calls
 */

import { api, endpoints } from "./api";

// Type definitions
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  roles: string[]; // Array of role IDs
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  isActive?: boolean;
  password?: string;
}

export interface AssignRolesRequest {
  roles: string[]; // Array of role IDs
}

export interface AssignDirectPermissionsRequest {
  permissions: Array<{
    permissionId: string;
    type: "ALLOW" | "DENY";
  }>;
}

export interface User {
  _id: string;
  username: string;
  email?: string;
  roles: Array<{
    _id: string;
    name: string;
    description: string;
  }>;
  directPermissions?: Array<{
    permission: {
      _id: string;
      code: string;
      description: string;
    };
    type: "ALLOW" | "DENY";
  }>;
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  results?: number;
  message?: string;
}

/**
 * User API Methods
 */
export const userApi = {
  /**
   * Create a new user
   * POST /api/users
   */
  create: async (data: CreateUserRequest): Promise<ApiResponse<{ user: User }>> => {
    return api.post<ApiResponse<{ user: User }>>(endpoints.users, data);
  },

  /**
   * Get all users
   * GET /api/users
   */
  getAll: async (): Promise<ApiResponse<{ users: User[] }>> => {
    return api.get<ApiResponse<{ users: User[] }>>(endpoints.users);
  },

  /**
   * Get single user by ID
   * GET /api/users/:id
   */
  getById: async (id: string): Promise<ApiResponse<{ user: User }>> => {
    return api.get<ApiResponse<{ user: User }>>(`${endpoints.users}/${id}`);
  },

  /**
   * Update user
   * PUT /api/users/:id
   */
  update: async (
    id: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<{ user: User }>> => {
    return api.put<ApiResponse<{ user: User }>>(`${endpoints.users}/${id}`, data);
  },

  /**
   * Delete user (soft delete)
   * DELETE /api/users/:id
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<ApiResponse<{ message: string }>>(`${endpoints.users}/${id}`);
  },

  /**
   * Assign roles to user
   * PUT /api/users/:id/roles
   */
  assignRoles: async (
    id: string,
    data: AssignRolesRequest
  ): Promise<ApiResponse<{ user: User }>> => {
    return api.put<ApiResponse<{ user: User }>>(`${endpoints.users}/${id}/roles`, data);
  },

  /**
   * Assign direct permissions to user (Admin override)
   * PUT /api/users/:id/permissions
   */
  assignDirectPermissions: async (
    id: string,
    data: AssignDirectPermissionsRequest
  ): Promise<ApiResponse<{ user: User }>> => {
    return api.put<ApiResponse<{ user: User }>>(
      `${endpoints.users}/${id}/permissions`,
      data
    );
  },

  /**
   * Get user's effective permissions
   * GET /api/users/:id/permissions
   */
  getPermissions: async (id: string): Promise<ApiResponse<any>> => {
    return api.get<ApiResponse<any>>(`${endpoints.users}/${id}/permissions`);
  },
};

export default userApi;
