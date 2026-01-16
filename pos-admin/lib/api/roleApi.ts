/**
 * Role API Service
 * Handles all role-related API calls
 */

import { api, endpoints } from "./api";

// Type definitions
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Array<{
    _id: string;
    code: string;
    description: string;
    category: string;
  }>;
  isDefault: boolean;
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
 * Role API Methods
 */
export const roleApi = {
  /**
   * Get all roles
   * GET /api/roles
   */
  getAll: async (): Promise<ApiResponse<{ roles: Role[] }>> => {
    return api.get<ApiResponse<{ roles: Role[] }>>(endpoints.roles);
  },

  /**
   * Get single role by ID
   * GET /api/roles/:id
   */
  getById: async (id: string): Promise<ApiResponse<{ role: Role }>> => {
    return api.get<ApiResponse<{ role: Role }>>(`${endpoints.roles}/${id}`);
  },

  /**
   * Create new role
   * POST /api/roles
   */
  create: async (data: {
    name: string;
    description: string;
    permissions: string[];
  }): Promise<ApiResponse<{ role: Role }>> => {
    return api.post<ApiResponse<{ role: Role }>>(endpoints.roles, data);
  },

  /**
   * Update role
   * PUT /api/roles/:id
   */
  update: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      permissions?: string[];
    }
  ): Promise<ApiResponse<{ role: Role }>> => {
    return api.put<ApiResponse<{ role: Role }>>(`${endpoints.roles}/${id}`, data);
  },

  /**
   * Delete role
   * DELETE /api/roles/:id
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return api.delete<ApiResponse<{ message: string }>>(`${endpoints.roles}/${id}`);
  },

  /**
   * Assign permissions to role
   * PUT /api/roles/:id/permissions
   */
  assignPermissions: async (
    id: string,
    permissions: string[]
  ): Promise<ApiResponse<{ role: Role }>> => {
    return api.put<ApiResponse<{ role: Role }>>(
      `${endpoints.roles}/${id}/permissions`,
      { permissions }
    );
  },
};

export default roleApi;
