/**
 * Repair Job API Service
 * Handles all repair-related API calls
 */

import { api, endpoints } from "./api";

// Type definitions
export interface CreateRepairRequest {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  device: {
    type: string;
    brand: string;
    model: string;
    serialNumber?: string;
    imei?: string;
    color?: string;
    accessories?: string[];
    condition?: string;
  };
  problemDescription: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  estimatedCost?: number;
  advancePayment?: number;
  expectedCompletionDate?: string;
  assignedTo?: string;
}

export interface UpdateRepairRequest {
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  device?: {
    type?: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    imei?: string;
    color?: string;
    accessories?: string[];
    condition?: string;
  };
  problemDescription?: string;
  diagnosisNotes?: string;
  repairNotes?: string;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  estimatedCost?: number;
  expectedCompletionDate?: string;
}

export interface CompleteRepairRequest {
  laborCost: number;
  partsUsed?: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
  }>;
  diagnosisNotes?: string;
  repairNotes?: string;
}

export interface AssignTechnicianRequest {
  technicianId: string;
}

export interface CollectPaymentRequest {
  amount: number;
}

export interface CancelRepairRequest {
  reason: string;
}

export interface RepairJob {
  _id: string;
  jobNumber: string;
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "READY" | "COMPLETED" | "CANCELLED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
  };
  device: {
    type: string;
    brand: string;
    model: string;
    serialNumber?: string;
    imei?: string;
    color?: string;
    accessories?: string[];
    condition?: string;
  };
  problemDescription: string;
  diagnosisNotes?: string;
  repairNotes?: string;
  assignedTo?: {
    _id: string;
    username: string;
  };
  assignedBy?: {
    _id: string;
    username: string;
  };
  assignedAt?: string;
  partsUsed: Array<{
    _id: string;
    product: string | { _id: string; name: string; sku?: string };
    productName: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  laborCost: number;
  partsTotal: number;
  totalCost: number;
  estimatedCost: number;
  advancePayment: number;
  finalPayment: number;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  balanceDue: number;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  pickupDate?: string;
  createdBy: {
    _id: string;
    username: string;
  };
  completedBy?: {
    _id: string;
    username: string;
  };
  cancelledBy?: {
    _id: string;
    username: string;
  };
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Technician {
  _id: string;
  username: string;
  email?: string;
  activeJobs?: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  results?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
}

/**
 * Repair API Methods
 */
export const repairApi = {
  /**
   * Create a new repair job
   * POST /api/v1/repairs
   */
  create: async (data: CreateRepairRequest): Promise<ApiResponse<{ repairJob: RepairJob }>> => {
    return api.post<ApiResponse<{ repairJob: RepairJob }>>(endpoints.repairs, data);
  },

  /**
   * Get all repair jobs with filters
   * GET /api/v1/repairs
   */
  getAll: async (params?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    phone?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ repairs: RepairJob[] }>> => {
    return api.get<ApiResponse<{ repairs: RepairJob[] }>>(endpoints.repairs, { params });
  },

  /**
   * Get technician's own assigned jobs
   * GET /api/v1/repairs/my-jobs
   */
  getMyJobs: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ repairs: RepairJob[] }>> => {
    return api.get<ApiResponse<{ repairs: RepairJob[] }>>(`${endpoints.repairs}/my-jobs`, { params });
  },

  /**
   * Get single repair job by ID
   * GET /api/v1/repairs/:id
   */
  getById: async (id: string): Promise<ApiResponse<{ repair: RepairJob }>> => {
    return api.get<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/${id}`);
  },

  /**
   * Get repair job by job number
   * GET /api/v1/repairs/number/:jobNumber
   */
  getByNumber: async (jobNumber: string): Promise<ApiResponse<{ repair: RepairJob }>> => {
    return api.get<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/number/${jobNumber}`);
  },

  /**
   * Update repair job
   * PUT /api/v1/repairs/:id
   */
  update: async (
    id: string,
    data: UpdateRepairRequest
  ): Promise<ApiResponse<{ repair: RepairJob }>> => {
    return api.put<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/${id}`, data);
  },

  /**
   * Assign technician to repair job
   * PUT /api/v1/repairs/:id/assign
   */
  assignTechnician: async (
    id: string,
    data: AssignTechnicianRequest
  ): Promise<ApiResponse<{ repair: RepairJob }>> => {
    return api.put<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/${id}/assign`, data);
  },

  /**
   * Start working on repair (Technician)
   * PUT /api/v1/repairs/:id/start
   */
  start: async (id: string): Promise<ApiResponse<{ repair: RepairJob }>> => {
    return api.put<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/${id}/start`, {});
  },

  /**
   * Complete repair (Technician adds parts, labor cost)
   * PUT /api/v1/repairs/:id/complete
   */
  complete: async (
    id: string,
    data: CompleteRepairRequest
  ): Promise<ApiResponse<{ repair: RepairJob }>> => {
    return api.put<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/${id}/complete`, data);
  },

  /**
   * Collect payment and complete (Cashier)
   * PUT /api/v1/repairs/:id/payment
   */
  collectPayment: async (
    id: string,
    data: CollectPaymentRequest
  ): Promise<ApiResponse<{ repair: RepairJob; payment: any }>> => {
    return api.put<ApiResponse<{ repair: RepairJob; payment: any }>>(`${endpoints.repairs}/${id}/payment`, data);
  },

  /**
   * Cancel repair job
   * PUT /api/v1/repairs/:id/cancel
   */
  cancel: async (
    id: string,
    data: CancelRepairRequest
  ): Promise<ApiResponse<{ repair: RepairJob }>> => {
    return api.put<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/${id}/cancel`, data);
  },

  /**
   * Get available technicians
   * GET /api/v1/repairs/technicians
   */
  getTechnicians: async (): Promise<ApiResponse<{ technicians: Technician[] }>> => {
    return api.get<ApiResponse<{ technicians: Technician[] }>>(`${endpoints.repairs}/technicians`);
  },

  /**
   * Get repair dashboard stats
   * GET /api/v1/repairs/dashboard
   */
  getDashboard: async (): Promise<ApiResponse<{
    pending: number;
    inProgress: number;
    ready: number;
    completedToday: number;
    totalRevenue: number;
  }>> => {
    return api.get<ApiResponse<any>>(`${endpoints.repairs}/dashboard`);
  },
};

export default repairApi;
