import { api } from "./api";

/**
 * Dashboard API Functions
 * Aggregated endpoints for dashboard statistics and data
 */

/**
 * Get today's sales summary
 * GET /api/v1/sales/daily
 */
export const getTodaysSales = () => {
  const today = new Date().toISOString().split('T')[0];
  return api.get("/api/v1/sales/daily", {
    params: { date: today }
  });
};

/**
 * Get sales statistics for a date range
 * GET /api/v1/sales/report
 */
export const getSalesStats = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return api.get("/api/v1/sales/report", { params });
};

/**
 * Get recent sales
 * GET /api/v1/sales?limit=10
 */
export const getRecentSales = (limit: number = 10) => {
  return api.get("/api/v1/sales", {
    params: { limit, page: 1 }
  });
};

/**
 * Get low stock items
 * GET /api/v1/inventory/low-stock
 */
export const getLowStockItems = () => {
  return api.get("/api/v1/inventory/low-stock");
};

/**
 * Get inventory statistics
 * GET /api/v1/inventory/value
 */
export const getInventoryStats = () => {
  return api.get("/api/v1/inventory/value");
};

/**
 * Get customer count
 * This would need a backend endpoint, using a workaround for now
 */
export const getCustomerCount = () => {
  // TODO: Create backend endpoint for customer statistics
  return api.get("/api/v1/customers", {
    params: { limit: 1, page: 1 }
  });
};

/**
 * Get pending repairs (in-progress and received)
 * GET /api/v1/repairs?status=IN_PROGRESS
 */
export const getPendingRepairs = (limit: number = 10, assignedTo?: string) => {
  // Backend only supports single status value, fetch IN_PROGRESS repairs
  const params: any = {
    status: "IN_PROGRESS",
    limit,
    page: 1
  };
  
  if (assignedTo) {
    params.assignedTo = assignedTo;
  }
  
  return api.get("/api/v1/repairs", { params });
};

/**
 * Get assigned repairs for a specific technician
 * GET /api/v1/repairs?status=ASSIGNED&assignedTo=technicianId
 */
export const getAssignedRepairs = (technicianId: string, limit: number = 20) => {
  return api.get("/api/v1/repairs", {
    params: { 
      status: "ASSIGNED",
      assignedTo: technicianId,
      limit,
      page: 1
    }
  });
};

/**
 * Get received repairs (waiting to start)
 */
export const getReceivedRepairs = (limit: number = 10) => {
  return api.get("/api/v1/repairs", {
    params: { 
      status: "RECEIVED",
      limit,
      page: 1
    }
  });
};

/**
 * Get sales trend data (last 7 days)
 */
export const getSalesTrend = (days: number = 7) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return api.get("/api/v1/sales/report", {
    params: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  });
};
