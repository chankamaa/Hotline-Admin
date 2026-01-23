/**
 * Permission API Service
 * Handles all permission-related API calls
 */

import { api, endpoints } from "./api";

// Type definitions
export interface Permission {
  _id: string;
  code: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsByCategory {
  [category: string]: Permission[];
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  results?: number;
  message?: string;
}

/**
 * Permission API Methods
 */
export const permissionApi = {
  /**
   * Get all permissions
   * GET /api/permissions
   */
  getAll: async (params?: { category?: string }): Promise<ApiResponse<{ 
    permissions: Permission[];
    grouped: PermissionsByCategory;
  }>> => {
    return api.get<ApiResponse<{ 
      permissions: Permission[];
      grouped: PermissionsByCategory;
    }>>(endpoints.permissions, { params });
  },

  /**
   * Get single permission by ID
   * GET /api/permissions/:id
   */
  getById: async (id: string): Promise<ApiResponse<{ permission: Permission }>> => {
    return api.get<ApiResponse<{ permission: Permission }>>(`${endpoints.permissions}/${id}`);
  },
};

export default permissionApi;
