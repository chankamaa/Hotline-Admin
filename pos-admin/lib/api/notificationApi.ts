import { api } from "./api";

export const getNotifications = async (limit: number, skip: number) => {
  try {
    const response = await api<any>(`/api/v1/notifications?limit=${limit}&skip=${skip}`, {
      method: "GET"
    });
    return response.data;
  } catch (error) {
    // Silently handle notification fetch errors (endpoint may not be implemented)
    return { notifications: [], unreadCount: 0 };
  }
};

export const getLowStockAlerts = async () => {
  try {
    const response = await api<any>("/api/v1/inventory/low-stock", {
      method: "GET"
    });
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    return [];
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    const response = await api<any>(`/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH"
    });
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api<any>("/api/v1/notifications/read-all", {
      method: "PATCH"
    });
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};
