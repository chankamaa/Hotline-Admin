/**
 * Report API Service
 * Aligned with backend report controller (/src/controllers/report/reportController.js)
 */

import { api } from "./api";

/* ----------------------------------
   Query Params
---------------------------------- */

export interface ReportQueryParams {
    startDate?: string;
    endDate?: string;
    period?: 'day' | 'week' | 'month' | 'year';
}

/* ----------------------------------
   Response Types
---------------------------------- */

// Sales Summary Report
export interface SalesSummaryData {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalItemsSold: number;
    byPaymentMethod: Array<{
        method: string;
        count: number;
        total: number;
    }>;
    dailyBreakdown: Array<{
        date: string;
        sales: number;
        revenue: number;
    }>;
}

export interface SalesSummaryResponse {
    status: string;
    data: SalesSummaryData;
}

// Profit Report
export interface ProfitData {
    grossRevenue: number;
    totalCost: number;
    grossProfit: number;
    profitMargin: number;
    byCategory: Array<{
        category: string;
        revenue: number;
        cost: number;
        profit: number;
        margin: number;
    }>;
}

export interface ProfitReportResponse {
    status: string;
    data: ProfitData;
}

// Sales by Category Report
export interface CategorySalesData {
    categories: Array<{
        categoryId: string;
        categoryName: string;
        salesCount: number;
        totalRevenue: number;
        itemsSold: number;
        percentage: number;
    }>;
    total: number;
}

export interface SalesByCategoryResponse {
    status: string;
    data: CategorySalesData;
}

// Sales by Cashier Report
export interface CashierSalesData {
    cashiers: Array<{
        userId: string;
        username: string;
        salesCount: number;
        totalRevenue: number;
        averageOrderValue: number;
        itemsSold: number;
    }>;
    total: number;
}

export interface SalesByCashierResponse {
    status: string;
    data: CashierSalesData;
}

// Top Products Report
export interface TopProductData {
    products: Array<{
        productId: string;
        productName: string;
        sku: string;
        quantitySold: number;
        revenue: number;
        profit: number;
    }>;
}

export interface TopProductsResponse {
    status: string;
    data: TopProductData;
}

// Return Analytics Report
export interface ReturnAnalyticsData {
    totalReturns: number;
    totalRefundAmount: number;
    refundCount: number;
    exchangeCount: number;
    averageRefund: number;
    byReason: Array<{
        reason: string;
        count: number;
        total: number;
    }>;
    topReturnedProducts: Array<{
        productId: string;
        productName: string;
        returnCount: number;
        totalRefunded: number;
    }>;
}

export interface ReturnAnalyticsResponse {
    status: string;
    data: ReturnAnalyticsData;
}

/* ----------------------------------
   API Service
---------------------------------- */

const REPORTS_BASE = "/api/v1/reports";

export const reportApi = {
    // Sales summary report (revenue, order count, payment methods)
    getSalesSummary: (params?: ReportQueryParams): Promise<SalesSummaryResponse> =>
        api.get(REPORTS_BASE + "/sales-summary", { params }),

    // Profit report (revenue, cost, margins by category)
    getProfitReport: (params?: ReportQueryParams): Promise<ProfitReportResponse> =>
        api.get(REPORTS_BASE + "/profit", { params }),

    // Sales broken down by category
    getSalesByCategory: (params?: ReportQueryParams): Promise<SalesByCategoryResponse> =>
        api.get(REPORTS_BASE + "/by-category", { params }),

    // Sales broken down by cashier
    getSalesByCashier: (params?: ReportQueryParams): Promise<SalesByCashierResponse> =>
        api.get(REPORTS_BASE + "/by-cashier", { params }),

    // Top selling products
    getTopProducts: (params?: ReportQueryParams & { limit?: number }): Promise<TopProductsResponse> =>
        api.get(REPORTS_BASE + "/top-products", { params }),

    // Return analytics (refund trends, reasons, top returned products)
    getReturnAnalytics: (params?: ReportQueryParams): Promise<ReturnAnalyticsResponse> =>
        api.get(REPORTS_BASE + "/return-analytics", { params }),
};
