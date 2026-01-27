/**
 * Repair Job API Service
 * Fully aligned with backend repair controller & router
 */

import { api, endpoints } from "./api";

/* ----------------------------------
   Request Types
---------------------------------- */

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
  customer?: Partial<CreateRepairRequest["customer"]>;
  device?: Partial<CreateRepairRequest["device"]>;
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

export interface CollectPaymentRequest {
  amount: number;
}

export interface CancelRepairRequest {
  reason: string;
}

/* ----------------------------------
   Response Types
---------------------------------- */

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
  balanceDue: number;

  paymentStatus: "PENDING" | "PARTIAL" | "PAID";

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

export interface ApiResponse<T> {
  status: "success" | "fail" | "error";
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

/* ----------------------------------
   Repair API
---------------------------------- */

export const repairApi = {
  /* Create repair job */
  create: (data: CreateRepairRequest) =>
    api.post<ApiResponse<{ repairJob: RepairJob }>>(endpoints.repairs, data),

  /* Get all repairs */
  getAll: (params?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    phone?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<ApiResponse<{ repairs: RepairJob[] }>>(endpoints.repairs, { params }),

  /* Get repair by ID */
  getById: (id: string) =>
    api.get<ApiResponse<{ repair: RepairJob }>>(`${endpoints.repairs}/${id}`),

  /* Get repair by job number */
  getByNumber: (jobNumber: string) =>
    api.get<ApiResponse<{ repair: RepairJob }>>(
      `${endpoints.repairs}/number/${jobNumber}`
    ),

  /* Update repair */
  update: (id: string, data: UpdateRepairRequest) =>
    api.put<ApiResponse<{ repair: RepairJob }>>(
      `${endpoints.repairs}/${id}`,
      data
    ),

  /* Complete repair */
  complete: (id: string, data: CompleteRepairRequest) =>
    api.put<ApiResponse<{ repair: RepairJob }>>(
      `${endpoints.repairs}/${id}/complete`,
      data
    ),

  /* Collect payment */
  collectPayment: (id: string, data: CollectPaymentRequest) =>
    api.put<ApiResponse<{ repair: RepairJob; payment: any }>>(
      `${endpoints.repairs}/${id}/payment`,
      data
    ),

  /* Cancel repair */
  cancel: (id: string, data: CancelRepairRequest) =>
    api.put<ApiResponse<{ repair: RepairJob }>>(
      `${endpoints.repairs}/${id}/cancel`,
      data
    ),

  /* Dashboard stats */
  getDashboard: () =>
    api.get<ApiResponse<{
      received: number;  // Backend returns 'received' (devices received, waiting to start)
      inProgress: number;
      ready: number;
      completedToday: number;
      totalRevenue: number;
    }>>(`${endpoints.repairs}/dashboard`),
};

export default repairApi;
