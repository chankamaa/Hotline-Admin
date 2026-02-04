/**
 * Return & Exchange API Service
 * Aligned with backend return controller (/src/controllers/sale/returnController.js)
 */

import { api } from "./api";

/* ----------------------------------
   Constants - Aligned with backend
---------------------------------- */

export const RETURN_TYPES = {
    REFUND: "REFUND",
    EXCHANGE: "EXCHANGE"
} as const;

export const RETURN_STATUS = {
    PENDING: "PENDING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED"
} as const;

export const REFUND_METHODS = {
    CASH: "CASH",
    CARD: "CARD",
    ORIGINAL_METHOD: "ORIGINAL_METHOD"
} as const;

/* ----------------------------------
   Request Types
---------------------------------- */

export interface CreateReturnRequest {
    originalSaleId: string;
    items: Array<{
        saleItemId: string;
        quantity?: number;
    }>;
    reason: string;
    refundMethod?: keyof typeof REFUND_METHODS;
    notes?: string;
}

export interface CreateExchangeRequest {
    originalSaleId: string;
    returnItems: Array<{
        saleItemId: string;
        quantity?: number;
    }>;
    newItems: Array<{
        productId: string;
        quantity: number;
        unitPrice?: number;
        serialNumber?: string;
    }>;
    payments?: Array<{
        method: string;
        amount: number;
        reference?: string;
    }>;
    reason: string;
    customer?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    notes?: string;
}

/* ----------------------------------
   Response Types
---------------------------------- */

export interface ReturnItem {
    product: string;
    productName: string;
    sku: string;
    serialNumber?: string;
    quantity: number;
    unitPrice: number;
    refundAmount: number;
}

export interface Return {
    _id: string;
    returnNumber: string;
    originalSale: {
        _id: string;
        saleNumber: string;
        grandTotal: number;
    };
    returnType: keyof typeof RETURN_TYPES;
    items: ReturnItem[];
    totalRefund: number;
    exchangeSale?: {
        _id: string;
        saleNumber: string;
        grandTotal: number;
    };
    exchangeAmountDue?: number;
    reason: string;
    refundMethod?: string;
    notes?: string;
    status: keyof typeof RETURN_STATUS;
    createdBy: {
        _id: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface ReturnListResponse {
    status: string;
    results: number;
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    data: {
        returns: Return[];
    };
}

export interface ReturnResponse {
    status: string;
    data: {
        return: Return;
        message?: string;
    };
}

export interface ExchangeResponse {
    status: string;
    data: {
        return: Return;
        newSale: {
            _id: string;
            saleNumber: string;
            grandTotal: number;
        };
        summary: {
            returnedAmount: number;
            newPurchaseAmount: number;
            amountDue: number;
            amountPaid: number;
            changeGiven: number;
            refundDue: number;
        };
    };
}

/* ----------------------------------
   API Service
---------------------------------- */

const RETURNS_BASE = "/api/v1/returns";

export const returnApi = {
    // Create a return (refund)
    create: (data: CreateReturnRequest): Promise<ReturnResponse> =>
        api.post(RETURNS_BASE, data),

    // Create an exchange (return + new purchase)
    createExchange: (data: CreateExchangeRequest): Promise<ExchangeResponse> =>
        api.post(RETURNS_BASE + "/exchange", data),

    // Get all returns with filters
    getAll: (params?: {
        returnType?: keyof typeof RETURN_TYPES;
        status?: keyof typeof RETURN_STATUS;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<ReturnListResponse> =>
        api.get(RETURNS_BASE, { params }),

    // Get single return by ID
    getById: (id: string): Promise<ReturnResponse> =>
        api.get(RETURNS_BASE + `/${id}`),
};
