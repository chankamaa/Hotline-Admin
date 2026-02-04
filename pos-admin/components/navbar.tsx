"use client";

import { Menu, Bell, Search, Plus, LogOut, User, ChevronDown, AlertCircle, Package, Wrench, ShieldCheck, Info, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "@/providers/providers";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";


export function AdminNavbar({
  onOpenMobileSidebar,
  title = "Dashboard",
}: {
  onOpenMobileSidebar: () => void;
  title?: string;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle notification hover with delay
  const handleNotificationMouseEnter = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotifications(true);
    }, 200);
  };

  const handleNotificationMouseLeave = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotifications(false);
    }, 150);
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both regular notifications and low stock alerts in parallel
      const [notificationData, lowStockData] = await Promise.all([
        getNotifications(10, 0),
        getLowStockAlerts()
      ]);
      
      setNotifications(notificationData.notifications || []);
      setLowStockItems(lowStockData || []);
      
      // Calculate total unread count (notifications + low stock items)
      const totalUnread = (notificationData.unreadCount || 0) + (lowStockData?.length || 0);
      setUnreadCount(totalUnread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch and polling setup
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Poll for new notifications every 30 seconds
      pollingIntervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 30000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [user, fetchNotifications]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Get icon for notification type
  const getNotificationIcon = (type: Notification["type"]) => {
    const iconClass = "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0";
    switch (type) {
      case "sale":
        return <div className={`${iconClass} bg-blue-100`}><Bell size={16} className="text-blue-600" /></div>;
      case "stock":
        return <div className={`${iconClass} bg-amber-100`}><Package size={16} className="text-amber-600" /></div>;
      case "repair":
        return <div className={`${iconClass} bg-green-100`}><Wrench size={16} className="text-green-600" /></div>;
      case "warranty":
        return <div className={`${iconClass} bg-purple-100`}><ShieldCheck size={16} className="text-purple-600" /></div>;
      case "system":
        return <div className={`${iconClass} bg-red-100`}><AlertCircle size={16} className="text-red-600" /></div>;
      default:
        return <div className={`${iconClass} bg-slate-100`}><Info size={16} className="text-slate-600" /></div>;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Get urgency level color and label
  const getUrgencyBadge = (level: LowStockItem["urgencyLevel"]) => {
    switch (level) {
      case "critical":
        return { color: "bg-red-500", label: "Critical", textColor: "text-red-600" };
      case "warning":
        return { color: "bg-amber-500", label: "Warning", textColor: "text-amber-600" };
      case "low":
        return { color: "bg-yellow-500", label: "Low", textColor: "text-yellow-600" };
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="h-16 border-b border-slate-200/60 bg-blue-600 backdrop-blur-xl sticky top-0 z-20 shadow-sm">
      <div className="h-full px-6 flex items-center gap-4">
        {/* Mobile menu */}
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-200 backdrop-blur-sm"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-slate-600" />
        </button>

        {/* Page title */}
        <div className="font-bold text-xl text-white tracking-tight">{title}</div>

        {/* Search */}
        <div className="ml-auto flex items-center gap-3 w-full max-w-[600px]">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
            />
            <input
              className="w-full pl-12 pr-16 py-2.5 text-slate-700 rounded-lg border-2 border-white/80 bg-white/90 backdrop-blur-sm text-[15px] font-normal placeholder:text-slate-400 shadow-sm hover:border-white hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 focus:bg-white transition-all duration-200"
              placeholder="Search sales, products, customers..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-block px-2 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded shadow-sm">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Quick action */}
          <button 
            onClick={() => router.push("/admin/permissions/users")}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus size={16} />
            New
          </button>

          {/* Notifications */}
          <div 
            className="relative" 
            ref={notificationRef}
            onMouseEnter={handleNotificationMouseEnter}
            onMouseLeave={handleNotificationMouseLeave}
          >
            <button
              className="p-3 rounded-xl hover:bg-slate-100/80 transition-all duration-200 backdrop-blur-sm relative group"
              aria-label="Notifications"
            >
              <Bell size={20} className=" group-hover:text-blue-600 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/60 z-50 animate-slideDown overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {isLoading && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={24} className="text-blue-600 animate-spin" />
                    </div>
                  )}

                  {error && (
                    <div className="px-4 py-8 text-center">
                      <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">{error}</p>
                      <button
                        onClick={fetchNotifications}
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {!isLoading && !error && notifications.length === 0 && lowStockItems.length === 0 && (
                    <div className="px-4 py-12 text-center">
                      <Bell size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No notifications yet</p>
                      <p className="text-xs text-slate-400 mt-1">We'll notify you when something new arrives</p>
                    </div>
                  )}

                  {/* Low Stock Alerts Section */}
                  {!isLoading && !error && lowStockItems.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-amber-600" />
                          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                            Low Stock Alerts ({lowStockItems.length})
                          </h4>
                        </div>
                      </div>
                      {lowStockItems.map((item) => {
                        const urgency = getUrgencyBadge(item.urgencyLevel);
                        return (
                          <div
                            key={item.id}
                            className="px-4 py-3 hover:bg-amber-50/50 transition-colors border-b border-slate-100 cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Package size={16} className="text-amber-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                                    {item.productName}
                                  </p>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${urgency.color} text-white font-bold uppercase`}>
                                    {urgency.label}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mb-1">
                                  SKU: <span className="font-mono">{item.sku}</span>
                                </p>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className={`font-semibold ${urgency.textColor}`}>
                                    Current: {item.currentQuantity}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">
                                    Min: {item.minimumThreshold}
                                  </span>
                                  {item.category && (
                                    <>
                                      <span className="text-slate-400">•</span>
                                      <span className="text-slate-500">{item.category}</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                  {formatTimestamp(item.lastUpdated)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Regular Notifications Section */}
                  {!isLoading && !error && notifications.length > 0 && (
                    <div>
                      {lowStockItems.length > 0 && (
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Recent Activity
                          </h4>
                        </div>
                      )}
                      {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleMarkAsRead(notification.id)}
                      className={`px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-slate-100 cursor-pointer group ${
                        !notification.isRead ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium group-hover:text-blue-600 transition-colors ${
                            notification.isRead ? 'text-slate-600' : 'text-slate-800'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatTimestamp(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                        )}
                      </div>
                    </div>
                  ))}
                    </div>
                  )}                </div>
                {/* Footer */}
                {!isLoading && !error && (notifications.length > 0 || lowStockItems.length > 0) && (
                  <div className="px-4 py-3 border-t border-slate-200/60 bg-slate-50/50">
                    <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="px-4 py-3 rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-sm text-sm hover:bg-slate-50/80 flex items-center gap-3 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="h-8 w-8 rounded-full bg-white to-indigo-500 flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <span className="font-medium text-slate-700">{user?.username || "User"}</span>
              <ChevronDown size={16} className="text-slate-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-gray-200   to-indigo-500 backdrop-blur-xl rounded-xl shadow-xl border border-blue-600 py-2 z-50">
                <div className="px-4 py-3  hover:bg-white border-b border-slate-200/60">
                  <p className="text-sm font-semibold text-slate-800">{user?.username}</p>
                  {user?.email && (
                    <p className="text-xs text-slate-500 truncate mt-1">{user.email}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 text-sm text-left hover:bg-red-50 flex items-center gap-3 text-red-500 font-medium transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

