/**
 * Promotion API Service
 * Aligned with backend promotion controller (/src/controllers/promotion/promotionController.js)
 */

import { api } from "./api";

/* ----------------------------------
   Constants - Aligned with backend
---------------------------------- */

export const PROMOTION_TYPES = {
    PERCENTAGE: "PERCENTAGE",    // Percentage off
    FIXED: "FIXED",              // Fixed amount off
    BUY_X_GET_Y: "BUY_X_GET_Y"   // Buy X get Y free
} as const;

export const TARGET_TYPES = {
    ALL: "ALL",              // Applies to all products
    CATEGORY: "CATEGORY",    // Applies to specific categories
    PRODUCT: "PRODUCT"       // Applies to specific products
} as const;

/* ----------------------------------
   Request Types
---------------------------------- */

export interface CreatePromotionRequest {
    name: string;
    description?: string;
    type: keyof typeof PROMOTION_TYPES;
    value: number;
    // For BUY_X_GET_Y type
    buyQuantity?: number;
    getQuantity?: number;
    // Limits
    minPurchase?: number;
    maxDiscount?: number | null;
    // Scheduling
    startDate: string;
    endDate: string;
    // Targeting
    targetType?: keyof typeof TARGET_TYPES;
    targetProducts?: string[];
    targetCategories?: string[];
    // Settings
    isActive?: boolean;
    priority?: number;
    usageLimit?: number | null;
}

export interface UpdatePromotionRequest extends Partial<CreatePromotionRequest> { }

/* ----------------------------------
   Response Types
---------------------------------- */

export interface Promotion {
    _id: string;
    name: string;
    description?: string;
    type: keyof typeof PROMOTION_TYPES;
    value: number;
    buyQuantity?: number;
    getQuantity?: number;
    minPurchase: number;
    maxDiscount?: number | null;
    startDate: string;
    endDate: string;
    targetType: keyof typeof TARGET_TYPES;
    targetProducts: string[];
    targetCategories: Array<{
        _id: string;
        name: string;
    }>;
    isActive: boolean;
    priority: number;
    usageLimit?: number | null;
    usedCount: number;
    createdBy: {
        _id: string;
        username: string;
    };
    createdAt: string;
    updatedAt: string;
    // Virtuals
    isCurrentlyActive: boolean;
    daysRemaining: number;
}

export interface PromotionListResponse {
    status: string;
    results: number;
    data: {
        promotions: Promotion[];
    };
}

export interface PromotionResponse {
    status: string;
    data: {
        promotion: Promotion;
    };
}

/* ----------------------------------
   API Service
---------------------------------- */

const PROMOTIONS_BASE = "/api/v1/promotions";

export const promotionApi = {
    // Get active promotions (for POS - cashiers need this)
    getActive: (): Promise<PromotionListResponse> =>
        api.get(PROMOTIONS_BASE + "/active"),

    // Get promotions for specific product
    getForProduct: (productId: string): Promise<PromotionListResponse> =>
        api.get(PROMOTIONS_BASE + `/for-product/${productId}`),

    // CRUD operations
    create: (data: CreatePromotionRequest): Promise<PromotionResponse> =>
        api.post(PROMOTIONS_BASE, data),

    getAll: (params?: { page?: number; limit?: number }): Promise<PromotionListResponse> =>
        api.get(PROMOTIONS_BASE, { params }),

    getById: (id: string): Promise<PromotionResponse> =>
        api.get(PROMOTIONS_BASE + `/${id}`),

    update: (id: string, data: UpdatePromotionRequest): Promise<PromotionResponse> =>
        api.patch(PROMOTIONS_BASE + `/${id}`, data),

    delete: (id: string): Promise<{ status: string; message: string }> =>
        api.delete(PROMOTIONS_BASE + `/${id}`),
};
