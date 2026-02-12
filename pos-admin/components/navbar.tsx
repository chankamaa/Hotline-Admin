"use client";

import { Menu, Bell, Search, Plus, LogOut, User, ChevronDown, AlertCircle, Package, Wrench, ShieldCheck, Info, Loader2, AlertTriangle, ShoppingCart, DollarSign, X } from "lucide-react";
import { useAuth } from "@/providers/providers";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LowStockItem, AppNotification } from "@/types/index.d";
import { getNotifications, getLowStockAlerts, markAsRead, markAllAsRead } from "@/lib/api/notificationApi";
import { fetchProducts } from "@/lib/api/productApi";
import { getSales } from "@/lib/api/sale.api";


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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<"all" | "products" | "sales">("all");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{ products: any[], sales: any[] }>({ products: [], sales: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
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
      // Silently handle notification errors (endpoint may not be implemented yet)
      setNotifications([]);
      setLowStockItems([]);
      setUnreadCount(0);
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
      await markAsRead(notificationId);
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
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Search functionality
  const performSearch = useCallback(async (query: string, category: "all" | "products" | "sales") => {
    if (!query.trim()) {
      setSearchResults({ products: [], sales: [] });
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results: { products: any[], sales: any[] } = { products: [], sales: [] };

      // Fetch products
      if (category === "all" || category === "products") {
        try {
          const productData = await fetchProducts({ search: query, page: 1, limit: 10 });
          results.products = productData?.data?.products || [];
        } catch (err) {
          console.error("Failed to search products:", err);
        }
      }

      // Fetch sales
      if (category === "all" || category === "sales") {
        try {
          const salesData = await getSales({ page: 1, limit: 10 });
          // Filter sales client-side by invoice number or customer name
          const allSales = Array.isArray(salesData) ? salesData : (salesData as any)?.data?.sales || [];
          results.sales = allSales.filter((sale: any) => 
            sale.invoiceNumber?.toLowerCase().includes(query.toLowerCase()) ||
            sale.customerName?.toLowerCase().includes(query.toLowerCase()) ||
            sale._id?.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 10);
        } catch (err) {
          console.error("Failed to search sales:", err);
        }
      }

      setSearchResults(results);
      setShowSearchResults(true);
      setSelectedResultIndex(-1);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      performSearch(searchQuery, searchCategory);
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, searchCategory, performSearch]);

  // Handle keyboard navigation in search
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    const totalResults = (searchCategory === "all" || searchCategory === "products" ? searchResults.products.length : 0) +
                         (searchCategory === "all" || searchCategory === "sales" ? searchResults.sales.length : 0);
    
    if (e.key === "Escape") {
      setShowSearchResults(false);
      searchInputRef.current?.blur();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedResultIndex(prev => (prev + 1) % totalResults);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResultIndex(prev => (prev - 1 + totalResults) % totalResults);
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault();
      handleSelectResult(selectedResultIndex);
    }
  };

  // Handle result selection
  const handleSelectResult = (index: number) => {
    const productCount = (searchCategory === "all" || searchCategory === "products") ? searchResults.products.length : 0;
    
    if (index < productCount) {
      const product = searchResults.products[index];
      router.push(`/admin/products?id=${product._id}`);
    } else {
      const sale = searchResults.sales[index - productCount];
      router.push(`/admin/sales?id=${sale._id}`);
    }
    
    setShowSearchResults(false);
    setSearchQuery("");
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults({ products: [], sales: [] });
    setShowSearchResults(false);
    searchInputRef.current?.focus();
  };

  // Get icon for notification type
  const getNotificationIcon = (type: AppNotification["type"]) => {
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
      case "medium":
        return { color: "bg-orange-500", label: "Medium", textColor: "text-orange-600" };
      case "low":
        return { color: "bg-yellow-500", label: "Low", textColor: "text-yellow-600" };
      default:
        return { color: "bg-slate-500", label: "Unknown", textColor: "text-slate-600" };
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
          <div className="relative w-full" ref={searchRef}>
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none z-10"
            />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onFocus={() => searchQuery && setShowSearchResults(true)}
              className="w-full pl-12 pr-16 py-2.5 text-slate-700 rounded-lg border-2 border-white/80 bg-white/90 backdrop-blur-sm text-[15px] font-normal placeholder:text-slate-400 shadow-sm hover:border-white hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 focus:bg-white transition-all duration-200"
              placeholder="Search products, sales..."
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded shadow-sm">
                ⌘K
              </kbd>
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (searchQuery.trim() || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/60 z-50 animate-slideDown overflow-hidden max-h-[500px] flex flex-col">
                {/* Category Selector */}
                <div className="px-4 py-3 border-b border-slate-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-2">
                  <button
                    onClick={() => setSearchCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      searchCategory === "all"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSearchCategory("products")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      searchCategory === "products"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Package size={12} />
                    Products
                  </button>
                  <button
                    onClick={() => setSearchCategory("sales")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      searchCategory === "sales"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ShoppingCart size={12} />
                    Sales
                  </button>
                </div>

                {/* Results */}
                <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                  {isSearching && (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 size={24} className="text-blue-600 animate-spin" />
                    </div>
                  )}

                  {!isSearching && searchResults.products.length === 0 && searchResults.sales.length === 0 && (
                    <div className="px-4 py-12 text-center">
                      <Search size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No results found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your search query</p>
                    </div>
                  )}

                  {/* Product Results */}
                  {!isSearching && (searchCategory === "all" || searchCategory === "products") && searchResults.products.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-blue-600" />
                          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                            Products ({searchResults.products.length})
                          </h4>
                        </div>
                      </div>
                      {searchResults.products.map((product, idx) => {
                        const globalIndex = idx;
                        const isSelected = selectedResultIndex === globalIndex;
                        return (
                          <div
                            key={product._id}
                            onClick={() => handleSelectResult(globalIndex)}
                            className={`px-4 py-3 hover:bg-blue-50/50 transition-colors border-b border-slate-100 cursor-pointer group ${
                              isSelected ? "bg-blue-50" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Package size={16} className="text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-xs text-slate-600 mb-1">
                                  SKU: <span className="font-mono">{product.sku}</span>
                                </p>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="font-semibold text-green-600">
                                    ${product.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">
                                    Stock: {product.stock}
                                  </span>
                                  {product.category && (
                                    <>
                                      <span className="text-slate-400">•</span>
                                      <span className="text-slate-500">{product.category.name || product.category}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Sales Results */}
                  {!isSearching && (searchCategory === "all" || searchCategory === "sales") && searchResults.sales.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                        <div className="flex items-center gap-2">
                          <ShoppingCart size={14} className="text-green-600" />
                          <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">
                            Sales ({searchResults.sales.length})
                          </h4>
                        </div>
                      </div>
                      {searchResults.sales.map((sale, idx) => {
                        const globalIndex = searchResults.products.length + idx;
                        const isSelected = selectedResultIndex === globalIndex;
                        return (
                          <div
                            key={sale._id}
                            onClick={() => handleSelectResult(globalIndex)}
                            className={`px-4 py-3 hover:bg-green-50/50 transition-colors border-b border-slate-100 cursor-pointer group ${
                              isSelected ? "bg-green-50" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <ShoppingCart size={16} className="text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 group-hover:text-green-600 transition-colors">
                                  Invoice #{sale.invoiceNumber || sale._id.slice(-6)}
                                </p>
                                <p className="text-xs text-slate-600 mb-1">
                                  Customer: {sale.customerName || "Walk-in"}
                                </p>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="font-semibold text-green-600">
                                    ${sale.finalTotal?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">
                                    {new Date(sale.createdAt).toLocaleDateString()}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    sale.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                                    sale.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-slate-100 text-slate-600"
                                  }`}>
                                    {sale.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick action - hidden for technicians */}
          {!(user?.role?.toLowerCase() === 'technician' || user?.roles?.some((r: any) => (typeof r === 'string' ? r : r.name)?.toLowerCase() === 'technician')) && (
            <button 
              onClick={() => router.push("/admin/permissions/users")}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={16} />
              New
            </button>
          )}

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
                            key={item._id}
                            className="px-4 py-3 hover:bg-amber-50/50 transition-colors border-b border-slate-100 cursor-pointer group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <Package size={16} className="text-amber-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-semibold text-slate-800 group-hover:text-amber-600 transition-colors">
                                    {item.name}
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
                                    Current: {item.stock}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-500">
                                    Min: {item.minStockLevel}
                                  </span>
                                  {item.category && (
                                    <>
                                      <span className="text-slate-400">•</span>
                                      <span className="text-slate-500">{item.category.name}</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                  Low stock alert
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

