import { api } from "./api";

export interface Notification {
  id: string;
  type: "sale" | "stock" | "repair" | "warranty" | "system" | "info";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    saleId?: string;
    productId?: string;
    repairId?: string;
    warrantyId?: string;
    [key: string]: any;
  };
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
}

export interface LowStockItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  minimumThreshold: number;
  category?: string;
  urgencyLevel: "critical" | "warning" | "low";
  lastUpdated: string;
}

/**
 * Fetch user notifications
 */
export async function getNotifications(
  limit?: number,
  offset?: number
): Promise<NotificationResponse> {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit.toString());
  if (offset) params.append("offset", offset.toString());

  const queryString = params.toString();
  const path = `/api/v1/notifications${queryString ? `?${queryString}` : ""}`;

  return api<NotificationResponse>(path, { method: "GET" });
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  return api<void>(`/api/v1/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  return api<void>("/api/v1/notifications/read-all", {
    method: "PATCH",
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  return api<void>(`/api/v1/notifications/${notificationId}`, {
    method: "DELETE",
  });
}

/**
 * Get low stock alerts from inventory
 */
export async function getLowStockAlerts(): Promise<LowStockItem[]> {
  return api<LowStockItem[]>("/api/v1/inventory/low-stock", {
    method: "GET",
  });
}
