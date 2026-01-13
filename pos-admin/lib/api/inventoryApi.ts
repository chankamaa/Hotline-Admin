import {api} from "./api";

/* =====================================================
   STOCK OVERVIEW
===================================================== */

/**
 * Get all stock levels
 * GET /api/v1/inventory
 */
export const fetchStock = (params?: {
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) => {
  return api.get("/inventory", {
    params: {
      ...params,
      lowStock: params?.lowStock ? "true" : undefined,
    },
  });
};

/**
 * Get stock for a single product
 * GET /api/v1/inventory/:productId
 */
export const fetchProductStock = (productId: string) => {
  return api.get(`/inventory/${productId}`);
};

/**
 * Get low stock products
 * GET /api/v1/inventory/low-stock
 */
export const fetchLowStock = () => {
  return api.get("/inventory/low-stock");
};

/* =====================================================
   STOCK ADJUSTMENTS
===================================================== */

/**
 * Adjust stock (add / reduce / correction / transfer)
 * POST /api/v1/inventory/adjust
 */
export const adjustStock = (data: {
  productId: string;
  type:
    | "ADDITION"
    | "REDUCTION"
    | "PURCHASE"
    | "SALE"
    | "RETURN"
    | "DAMAGE"
    | "THEFT"
    | "CORRECTION"
    | "TRANSFER_IN"
    | "TRANSFER_OUT";
  quantity: number;
  reason?: string;
  reference?: string;
  referenceType?: "Sale" | "Purchase" | "Transfer" | "Manual";
}) => {
  return api.post("/inventory/adjust", data);
};

/**
 * Get stock adjustment history for a product
 * GET /api/v1/inventory/:productId/history
 */
export const fetchStockHistory = (
  productId: string,
  params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
) => {
  return api.get(`/inventory/${productId}/history`, {
    params,
  });
};

/**
 * Get available adjustment types
 * (Used for dropdowns)
 * GET /api/v1/inventory/adjustment-types
 */
export const fetchAdjustmentTypes = () => {
  return api.get("/inventory/adjustment-types");
};

/* =====================================================
   INVENTORY VALUE
===================================================== */

/**
 * Get total inventory value
 * GET /api/v1/inventory/value
 */
export const fetchInventoryValue = (category?: string) => {
  return api.get("/inventory/value", {
    params: { category },
  });
};
