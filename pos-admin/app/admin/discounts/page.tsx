"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  promotionApi,
  Promotion,
  CreatePromotionRequest,
  PROMOTION_TYPES,
  TARGET_TYPES
} from "@/lib/api/promotionApi";
import { fetchCategories } from "@/lib/api/categoryApi";
import { fetchProducts } from "@/lib/api/productApi";
import { useToast } from "@/providers/toast-provider";
import {
  Plus,
  Percent,
  Tag,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Gift,
  Target,
  Package,
  Layers,
  RefreshCw,
  DollarSign,
  Clock,
  TrendingUp
} from "lucide-react";

export default function DiscountsPage() {
  const toast = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "all" | "expired">("active");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Categories and products for targeting
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ _id: string; name: string }>>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreatePromotionRequest>({
    name: "",
    description: "",
    type: "PERCENTAGE",
    value: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    targetType: "ALL",
    targetCategories: [],
    targetProducts: [],
    isActive: true,
  });

  useEffect(() => {
    loadPromotions();
    loadCategoriesAndProducts();
  }, []);

  const loadCategoriesAndProducts = async () => {
    setLoadingOptions(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetchCategories(),
        fetchProducts({ limit: 100 })
      ]);
      setCategories(catRes.data?.categories || []);
      setProducts(prodRes.data?.products || []);
    } catch (error) {
      console.error("Error loading categories/products:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadPromotions = async () => {
    try {
      setLoading(true);
      const response = await promotionApi.getAll();
      setPromotions(response.data.promotions || []);
    } catch (error: any) {
      console.error("Error loading discounts:", error);
      toast.error(error?.message || "Failed to load discount rules");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.value) {
        toast.error("Name and discount value are required");
        return;
      }
      await promotionApi.create(formData);
      toast.success("Discount rule created successfully");
      setShowCreateModal(false);
      resetForm();
      loadPromotions();
    } catch (error: any) {
      console.error("Error creating discount:", error);
      toast.error(error?.message || "Failed to create discount rule");
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      await promotionApi.update(editingId, formData);
      toast.success("Discount rule updated successfully");
      setShowCreateModal(false);
      resetForm();
      loadPromotions();
    } catch (error: any) {
      console.error("Error updating discount:", error);
      toast.error(error?.message || "Failed to update discount rule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this discount rule?")) return;
    try {
      await promotionApi.delete(id);
      toast.success("Discount rule deactivated successfully");
      loadPromotions();
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      toast.error(error?.message || "Failed to deactivate discount rule");
    }
  };

  const handleEdit = (promo: Promotion) => {
    setFormData({
      name: promo.name,
      description: promo.description || "",
      type: promo.type,
      value: promo.value,
      buyQuantity: promo.buyQuantity,
      getQuantity: promo.getQuantity,
      minPurchase: promo.minPurchase,
      maxDiscount: promo.maxDiscount,
      startDate: promo.startDate.split("T")[0],
      endDate: promo.endDate.split("T")[0],
      targetType: promo.targetType,
      isActive: promo.isActive,
      priority: promo.priority,
      usageLimit: promo.usageLimit,
    });
    setIsEditing(true);
    setEditingId(promo._id);
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "PERCENTAGE",
      value: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      targetType: "ALL",
      targetCategories: [],
      targetProducts: [],
      isActive: true,
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Filter promotions based on tab
  const filteredPromotions = promotions.filter((promo) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    switch (activeTab) {
      case "active":
        return promo.isActive && now >= start && now <= end;
      case "expired":
        return now > end || !promo.isActive;
      default:
        return true;
    }
  });

  // Statistics
  const stats = {
    total: promotions.length,
    active: promotions.filter((p) => {
      const now = new Date();
      return p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now;
    }).length,
    percentage: promotions.filter((p) => p.type === "PERCENTAGE").length,
    fixed: promotions.filter((p) => p.type === "FIXED").length,
    buyXGetY: promotions.filter((p) => p.type === "BUY_X_GET_Y").length,
  };

  const getStatusBadge = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);

    if (!promo.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Inactive</span>;
    }
    if (now > end) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Expired</span>;
    }
    if (now < start) {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">Upcoming</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Active</span>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="w-4 h-4 text-blue-500" />;
      case "FIXED":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "BUY_X_GET_Y":
        return <Gift className="w-4 h-4 text-purple-500" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getDiscountDisplay = (promo: Promotion) => {
    switch (promo.type) {
      case "PERCENTAGE":
        return `${promo.value}% OFF`;
      case "FIXED":
        return `Rs. ${promo.value} OFF`;
      case "BUY_X_GET_Y":
        return `Buy ${promo.buyQuantity} Get ${promo.getQuantity} Free`;
      default:
        return `${promo.value}`;
    }
  };

  const getTargetDisplay = (promo: Promotion) => {
    switch (promo.targetType) {
      case "ALL":
        return "All Products";
      case "CATEGORY":
        return promo.targetCategories?.length
          ? `${promo.targetCategories.length} Categories`
          : "Categories";
      case "PRODUCT":
        return promo.targetProducts?.length
          ? `${promo.targetProducts.length} Products`
          : "Products";
      default:
        return "All";
    }
  };

  const columns: DataTableColumn<Promotion>[] = [
    {
      key: "name",
      label: "Discount Rule",
      render: (promo) => (
        <div className="flex items-center gap-3">
          <div>
            <div className="font-medium text-gray-900">{promo.name}</div>
            <div className="text-sm text-gray-500">{promo.description || "No description"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (promo) => (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
          {promo.type.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "discount",
      label: "Discount",
      render: (promo) => (
        <span className="font-semibold text-green-600">{getDiscountDisplay(promo)}</span>
      ),
    },
    {
      key: "target",
      label: "Applies To",
      render: (promo) => (
        <div className="text-sm text-gray-600">{getTargetDisplay(promo)}</div>
      ),
    },
    {
      key: "validity",
      label: "Valid Period",
      render: (promo) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="w-3 h-3" />
            {new Date(promo.startDate).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-500">
            to {new Date(promo.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      render: (promo) => (
        <div className="text-sm text-gray-600">
          {promo.usedCount}
          {promo.usageLimit && ` / ${promo.usageLimit}`}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (promo) => getStatusBadge(promo),
    },
    {
      key: "actions",
      label: "Actions",
      render: (promo) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPromotion(promo);
              setShowDetailsModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(promo)}
            className="text-gray-600 hover:text-gray-800 p-1"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(promo._id)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Deactivate"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <PageHeader
          title="Discount Rules"
          description="Manage discount and promotional rules connected to backend"
        />
        <div className="flex gap-2">
          <Button variant="danger" onClick={loadPromotions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Discount Rule
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Rules</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-500">Active Now</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Percent className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600">{stats.percentage}</div>
              <div className="text-sm text-gray-500">Percentage</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600">{stats.fixed}</div>
              <div className="text-sm text-gray-500">Fixed Amount</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.buyXGetY}</div>
              <div className="text-sm text-gray-500">Buy X Get Y</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "active"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
            }`}
        >
          Active ({stats.active})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "all"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
            }`}
        >
          All Rules ({stats.total})
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "expired"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
            }`}
        >
          Expired/Inactive
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border">
        <DataTable
          data={filteredPromotions}
          columns={columns}
          searchPlaceholder="Search discount rules..."
          onSearch={() => { }}
        />
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title={isEditing ? "Edit Discount Rule" : "Create Discount Rule"}
        size="lg"
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rule Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="e.g. Summer Sale 20% Off"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              rows={2}
              placeholder="Optional description"
            />
          </div>

          {/* Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as keyof typeof PROMOTION_TYPES })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="PERCENTAGE">Percentage Off</option>
                <option value="FIXED">Fixed Amount Off</option>
                <option value="BUY_X_GET_Y">Buy X Get Y Free</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.type === "PERCENTAGE" ? "Discount %" : "Discount Amount (Rs.)"} *
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                min="0"
                max={formData.type === "PERCENTAGE" ? 100 : undefined}
              />
            </div>
          </div>

          {/* Buy X Get Y fields */}
          {formData.type === "BUY_X_GET_Y" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buy Quantity
                </label>
                <input
                  type="number"
                  value={formData.buyQuantity || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, buyQuantity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Get Free Quantity
                </label>
                <input
                  type="number"
                  value={formData.getQuantity || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, getQuantity: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Applies To
              </div>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, targetType: "ALL", targetCategories: [], targetProducts: [] })}
                className={`p-3 rounded-lg border text-sm font-medium transition ${formData.targetType === "ALL"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Layers className="w-4 h-4 mx-auto mb-1" />
                All Products
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, targetType: "CATEGORY", targetProducts: [] })}
                className={`p-3 rounded-lg border text-sm font-medium transition ${formData.targetType === "CATEGORY"
                  ? "bg-purple-50 border-purple-500 text-purple-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Tag className="w-4 h-4 mx-auto mb-1" />
                Categories
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, targetType: "PRODUCT", targetCategories: [] })}
                className={`p-3 rounded-lg border text-sm font-medium transition ${formData.targetType === "PRODUCT"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <Package className="w-4 h-4 mx-auto mb-1" />
                Products
              </button>
            </div>
          </div>

          {/* Category Selection */}
          {formData.targetType === "CATEGORY" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Categories
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {loadingOptions ? (
                  <div className="text-center py-2 text-gray-500">Loading...</div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-2 text-gray-500">No categories found</div>
                ) : (
                  categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetCategories?.includes(cat._id) || false}
                        onChange={(e) => {
                          const current = formData.targetCategories || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, targetCategories: [...current, cat._id] });
                          } else {
                            setFormData({ ...formData, targetCategories: current.filter(id => id !== cat._id) });
                          }
                        }}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-900">{cat.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Product Selection */}
          {formData.targetType === "PRODUCT" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Products
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                {loadingOptions ? (
                  <div className="text-center py-2 text-gray-500">Loading...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-2 text-gray-500">No products found</div>
                ) : (
                  products.map((prod) => (
                    <label key={prod._id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetProducts?.includes(prod._id) || false}
                        onChange={(e) => {
                          const current = formData.targetProducts || [];
                          if (e.target.checked) {
                            setFormData({ ...formData, targetProducts: [...current, prod._id] });
                          } else {
                            setFormData({ ...formData, targetProducts: current.filter(id => id !== prod._id) });
                          }
                        }}
                        className="w-4 h-4 text-green-600 rounded"
                      />
                      <span className="text-sm text-gray-900">{prod.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Limits & Settings */}
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limits & Settings
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Min Purchase Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.minPurchase || ""}
                  onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Max Discount Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount || ""}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  min="0"
                  placeholder="No limit"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit || ""}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  min="0"
                  placeholder="Unlimited"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Priority (Higher = First)
                </label>
                <input
                  type="number"
                  value={formData.priority || ""}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Discount rule is active
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={isEditing ? handleUpdate : handleCreate}>
              {isEditing ? "Update Rule" : "Create Rule"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Discount Rule Details"
        size="lg"
      >
        {selectedPromotion && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-2xl font-bold">{selectedPromotion.name}</h3>
              <p className="text-indigo-100 mt-1">{selectedPromotion.description || "No description"}</p>
              <div className="mt-4 text-3xl font-bold">{getDiscountDisplay(selectedPromotion)}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 text-gray-900">{selectedPromotion.type.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2">{getStatusBadge(selectedPromotion)}</span>
              </div>
              <div>
                <span className="text-gray-500">Start Date:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(selectedPromotion.startDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">End Date:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(selectedPromotion.endDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Applies To:</span>
                <span className="ml-2 text-gray-900">{getTargetDisplay(selectedPromotion)}</span>
              </div>
              <div>
                <span className="text-gray-500">Min Purchase:</span>
                <span className="ml-2 text-gray-900">Rs. {selectedPromotion.minPurchase}</span>
              </div>
              <div>
                <span className="text-gray-500">Max Discount:</span>
                <span className="ml-2 text-gray-900">
                  {selectedPromotion.maxDiscount ? `Rs. ${selectedPromotion.maxDiscount}` : "No limit"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Usage:</span>
                <span className="ml-2 text-gray-900">
                  {selectedPromotion.usedCount}
                  {selectedPromotion.usageLimit && ` / ${selectedPromotion.usageLimit}`}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className="ml-2 text-gray-900">{selectedPromotion.priority}</span>
              </div>
              <div>
                <span className="text-gray-500">Created By:</span>
                <span className="ml-2 text-gray-900">
                  {selectedPromotion.createdBy?.username || "Unknown"}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
