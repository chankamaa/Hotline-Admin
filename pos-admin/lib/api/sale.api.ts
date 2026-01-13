import {api} from "./api";

/* ------------------------------------------------------------------
   Types (mirrors saleModel.js)
------------------------------------------------------------------- */

export type SaleStatus = "PENDING" | "COMPLETED" | "VOIDED";
export type DiscountType = "PERCENTAGE" | "FIXED";
export type PaymentMethod = "CASH" | "CARD" | "MOBILE" | "OTHER";

export interface SaleItemPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
  discount?: number;
}

export interface SalePaymentPayload {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface CreateSalePayload {
  items: SaleItemPayload[];
  payments?: SalePaymentPayload[];
  discountType?: DiscountType;
  discountValue?: number;
  notes?: string;
}

/* ------------------------------------------------------------------
   SALE API FUNCTIONS
------------------------------------------------------------------- */

/**
 * Create a new sale
 * POST /api/v1/sales
 */
export const createSale = (payload: CreateSalePayload) => {
  return api.post("/sales", payload);
};

/**
 * Get all sales (filters + pagination)
 * GET /api/v1/sales
 */
export const getSales = (params?: {
  status?: SaleStatus;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  page?: number;
  limit?: number;
}) => {
  return api.get("/sales", { params });
};

/**
 * Get single sale by ID
 * GET /api/v1/sales/:id
 */
export const getSaleById = (saleId: string) => {
  return api.get(`/sales/${saleId}`);
};

/**
 * Get sale by sale number
 * GET /api/v1/sales/number/:saleNumber
 */
export const getSaleByNumber = (saleNumber: string) => {
  return api.get(`/sales/number/${saleNumber}`);
};

/**
 * Void a sale
 * POST /api/v1/sales/:id/void
 */
export const voidSale = (saleId: string, reason: string) => {
  return api.post(`/sales/${saleId}/void`, { reason });
};

/**
 * Get daily sales summary
 * GET /api/v1/sales/daily
 */
export const getDailySalesSummary = (date?: string) => {
  return api.get("/sales/daily", {
    params: { date }
  });
};

/**
 * Get sales report by date range
 * GET /api/v1/sales/report
 */
export const getSalesReport = (startDate: string, endDate: string) => {
  return api.get("/sales/report", {
    params: { startDate, endDate }
  });
};
