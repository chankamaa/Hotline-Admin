/**
 * Repair Job API Service
 * Aligned with backend repair controller (/src/controllers/repair/repairController.js)
 */

import { api, endpoints } from "./api";

/* ----------------------------------
   Constants - Aligned with backend
---------------------------------- */

export const REPAIR_STATUS = {
    RECEIVED: "RECEIVED",         // Device received by technician
    IN_PROGRESS: "IN_PROGRESS",   // Technician working on it
    READY: "READY",               // Repair done, waiting for pickup
    COMPLETED: "COMPLETED",       // Customer paid and collected
    CANCELLED: "CANCELLED"        // Job cancelled
} as const;

export const REPAIR_PRIORITY = {
    LOW: "LOW",
    NORMAL: "NORMAL",
    HIGH: "HIGH",
    URGENT: "URGENT"
} as const;

export const DEVICE_TYPES = {
    MOBILE_PHONE: "MOBILE_PHONE",
    TABLET: "TABLET",
    LAPTOP: "LAPTOP",
    SMARTWATCH: "SMARTWATCH",
    OTHER: "OTHER"
} as const;

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
        type?: string;
        brand: string;
        model: string;
        serialNumber?: string;
        imei?: string;
        color?: string;
        accessories?: string[];
        condition?: string;
    };
    problemDescription: string;
    priority?: keyof typeof REPAIR_PRIORITY;
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
    priority?: keyof typeof REPAIR_PRIORITY;
    estimatedCost?: number;
    expectedCompletionDate?: string;
}

export interface CompleteRepairRequest {
    laborCost: number;
    partsUsed?: Array<{
        productId?: string; // Optional - only for inventory parts
        productName: string; // Required for all parts
        sku?: string; // Optional SKU
        quantity: number; // Required
        unitPrice: number; // Required
        isManual?: boolean; // Flag for manually entered parts
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

export interface AssignTechnicianRequest {
    technicianId: string;
}

export interface UpdateAdvancePaymentRequest {
    amount: number;
}

/* ----------------------------------
   Response Types
---------------------------------- */

export interface RepairJob {
    _id: string;
    jobNumber: string;
    status: keyof typeof REPAIR_STATUS;
    priority: keyof typeof REPAIR_PRIORITY;

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

    receivedBy?: {
        _id: string;
        username: string;
    };
    receivedAt?: string;

    partsUsed?: Array<{
        _id: string;
        product: string;
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
    advancePaymentReceivedBy?: {
        _id: string;
        username: string;
    };
    advancePaymentReceivedAt?: string;
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

export interface RepairListResponse {
    status: string;
    results: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    data: {
        repairs: RepairJob[];
    };
}

export interface RepairResponse {
    status: string;
    data: {
        repair: RepairJob;
        paymentInfo?: {
            estimatedCost: number;
            advancePayment: number;
            estimatedBalance: number;
        };
        paymentBreakdown?: {
            totalCost: number;
            laborCost: number;
            partsTotal: number;
            advancePaid: number;
            balanceDue: number;
            amountReceived: number;
            change: number;
            paymentStatus: string;
        };
    };
}

export interface RepairDashboardResponse {
    status: string;
    data: {
        received: number;
        inProgress: number;
        ready: number;
        completedToday: number;
        totalRevenue: number;
    };
}

export interface TechniciansResponse {
    status: string;
    results: number;
    data: {
        technicians: Array<{
            _id: string;
            username: string;
            email: string;
            activeJobs: number;
        }>;
    };
}

/* ----------------------------------
   API Service
---------------------------------- */

const REPAIRS_BASE = "/api/v1/repairs";

export const repairApi = {
    // Dashboard and utility routes
    getDashboard: (): Promise<RepairDashboardResponse> =>
        api.get(REPAIRS_BASE + "/dashboard"),

    getTechnicians: (): Promise<TechniciansResponse> =>
        api.get(REPAIRS_BASE + "/technicians"),

    getMyJobs: (params?: { status?: string; page?: number; limit?: number }): Promise<RepairListResponse> =>
        api.get(REPAIRS_BASE + "/my-jobs", { params }),

    getByJobNumber: (jobNumber: string): Promise<RepairResponse> =>
        api.get(REPAIRS_BASE + `/number/${jobNumber}`),

    // CRUD routes
    create: (data: CreateRepairRequest): Promise<RepairResponse> =>
        api.post(REPAIRS_BASE, data),

    getAll: (params?: {
        status?: string;
        priority?: string;
        assignedTo?: string;
        phone?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<RepairListResponse> =>
        api.get(REPAIRS_BASE, { params }),

    getById: (id: string): Promise<RepairResponse> =>
        api.get(REPAIRS_BASE + `/${id}`),

    update: (id: string, data: UpdateRepairRequest): Promise<RepairResponse> =>
        api.put(REPAIRS_BASE + `/${id}`, data),

    // Workflow routes
    assignTechnician: (id: string, data: AssignTechnicianRequest): Promise<RepairResponse> =>
        api.put(REPAIRS_BASE + `/${id}/assign`, data),

    start: (id: string): Promise<RepairResponse> =>
        api.put(REPAIRS_BASE + `/${id}/start`),

    complete: (id: string, data: CompleteRepairRequest): Promise<RepairResponse> =>
        api.put(REPAIRS_BASE + `/${id}/complete`, data),

    updateAdvancePayment: (id: string, data: UpdateAdvancePaymentRequest): Promise<RepairResponse> =>
        api.put(REPAIRS_BASE + `/${id}/advance`, data),

    collectPayment: (id: string, data: CollectPaymentRequest): Promise<RepairResponse> =>
        api.put(REPAIRS_BASE + `/${id}/payment`, data),

    cancel: (id: string, data: CancelRepairRequest): Promise<RepairResponse> =>
        api.put(REPAIRS_BASE + `/${id}/cancel`, data),
};
