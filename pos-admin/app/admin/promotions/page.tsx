'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
    promotionApi,
    Promotion,
    CreatePromotionRequest,
    PROMOTION_TYPES,
    TARGET_TYPES
} from '@/lib/api/promotionApi';
import { fetchCategories } from '@/lib/api/categoryApi';
import { fetchProducts } from '@/lib/api/productApi';
import { useToast } from '@/providers/toast-provider';
import {
    Plus,
    Percent,
    Tag,
    Calendar,
    Edit,
    Trash2,
    Eye,
    Check,
    X,
    Clock,
    Gift,
    Target,
    Package,
    Layers
} from 'lucide-react';

export default function PromotionsPage() {
    const router = useRouter();
    const toast = useToast();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'upcoming'>('all');

    // Categories and products for targeting
    const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
    const [products, setProducts] = useState<Array<{ _id: string; name: string }>>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreatePromotionRequest>({
        name: '',
        description: '',
        type: 'PERCENTAGE',
        value: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        targetType: 'ALL',
        targetCategories: [],
        targetProducts: [],
        isActive: true,
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

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
            console.error('Error loading categories/products:', error);
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
            console.error('Error loading promotions:', error);
            toast.error(error?.message || 'Failed to load promotions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            if (!formData.name || !formData.value) {
                toast.error('Name and discount value are required');
                return;
            }
            await promotionApi.create(formData);
            toast.success('Promotion created successfully');
            setShowCreateModal(false);
            resetForm();
            loadPromotions();
        } catch (error: any) {
            console.error('Error creating promotion:', error);
            toast.error(error?.message || 'Failed to create promotion');
        }
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        try {
            await promotionApi.update(editingId, formData);
            toast.success('Promotion updated successfully');
            setShowCreateModal(false);
            resetForm();
            loadPromotions();
        } catch (error: any) {
            console.error('Error updating promotion:', error);
            toast.error(error?.message || 'Failed to update promotion');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this promotion?')) return;
        try {
            await promotionApi.delete(id);
            toast.success('Promotion deleted successfully');
            loadPromotions();
        } catch (error: any) {
            console.error('Error deleting promotion:', error);
            toast.error(error?.message || 'Failed to delete promotion');
        }
    };

    const handleEdit = (promotion: Promotion) => {
        setFormData({
            name: promotion.name,
            description: promotion.description || '',
            type: promotion.type,
            value: promotion.value,
            buyQuantity: promotion.buyQuantity,
            getQuantity: promotion.getQuantity,
            minPurchase: promotion.minPurchase,
            maxDiscount: promotion.maxDiscount,
            startDate: promotion.startDate.split('T')[0],
            endDate: promotion.endDate.split('T')[0],
            targetType: promotion.targetType,
            isActive: promotion.isActive,
            priority: promotion.priority,
            usageLimit: promotion.usageLimit,
        });
        setIsEditing(true);
        setEditingId(promotion._id);
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            type: 'PERCENTAGE',
            value: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            targetType: 'ALL',
            targetCategories: [],
            targetProducts: [],
            isActive: true,
        });
        setIsEditing(false);
        setEditingId(null);
    };

    const filteredPromotions = promotions.filter((promo) => {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);

        switch (filter) {
            case 'active':
                return promo.isActive && now >= start && now <= end;
            case 'expired':
                return now > end;
            case 'upcoming':
                return now < start;
            default:
                return true;
        }
    });

    const getStatusBadge = (promo: Promotion) => {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);

        if (now > end) {
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Expired</span>;
        }
        if (now < start) {
            return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600">Upcoming</span>;
        }
        if (promo.isActive) {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">Active</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">Paused</span>;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PERCENTAGE':
                return <Percent className="w-4 h-4 text-blue-500" />;
            case 'FIXED':
                return <Tag className="w-4 h-4 text-green-500" />;
            case 'BUY_X_GET_Y':
                return <Gift className="w-4 h-4 text-purple-500" />;
            default:
                return <Tag className="w-4 h-4" />;
        }
    };

    const getDiscountDisplay = (promo: Promotion) => {
        switch (promo.type) {
            case 'PERCENTAGE':
                return `${promo.value}% OFF`;
            case 'FIXED':
                return `${promo.value} OFF`;
            case 'BUY_X_GET_Y':
                return `Buy ${promo.buyQuantity} Get ${promo.getQuantity} Free`;
            default:
                return `${promo.value}`;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
                    <p className="text-gray-600">Manage discounts and promotional offers</p>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Create Promotion
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    className={`p-4 rounded-lg border cursor-pointer transition ${filter === 'all' ? 'bg-blue-50 border-blue-300' : 'bg-white'
                        }`}
                    onClick={() => setFilter('all')}
                >
                    <div className="text-sm text-gray-600">All Promotions</div>
                    <div className="text-2xl font-bold">{promotions.length}</div>
                </div>
                <div
                    className={`p-4 rounded-lg border cursor-pointer transition ${filter === 'active' ? 'bg-green-50 border-green-300' : 'bg-white'
                        }`}
                    onClick={() => setFilter('active')}
                >
                    <div className="text-sm text-green-600">Active</div>
                    <div className="text-2xl font-bold text-green-700">
                        {promotions.filter((p) => {
                            const now = new Date();
                            return p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now;
                        }).length}
                    </div>
                </div>
                <div
                    className={`p-4 rounded-lg border cursor-pointer transition ${filter === 'upcoming' ? 'bg-blue-50 border-blue-300' : 'bg-white'
                        }`}
                    onClick={() => setFilter('upcoming')}
                >
                    <div className="text-sm text-blue-600">Upcoming</div>
                    <div className="text-2xl font-bold text-blue-700">
                        {promotions.filter((p) => new Date(p.startDate) > new Date()).length}
                    </div>
                </div>
                <div
                    className={`p-4 rounded-lg border cursor-pointer transition ${filter === 'expired' ? 'bg-gray-50 border-gray-300' : 'bg-white'
                        }`}
                    onClick={() => setFilter('expired')}
                >
                    <div className="text-sm text-gray-600">Expired</div>
                    <div className="text-2xl font-bold text-gray-700">
                        {promotions.filter((p) => new Date(p.endDate) < new Date()).length}
                    </div>
                </div>
            </div>

            {/* Promotions Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Promotion
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Discount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Period
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Usage
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <p className="mt-2">Loading promotions...</p>
                                </td>
                            </tr>
                        ) : filteredPromotions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                    No promotions found
                                </td>
                            </tr>
                        ) : (
                            filteredPromotions.map((promo) => (
                                <tr key={promo._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <div className="font-medium text-gray-900">{promo.name}</div>
                                                <div className="text-sm text-gray-500">{promo.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                                            {promo.type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-green-600">{getDiscountDisplay(promo)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(promo.startDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs">
                                            to {new Date(promo.endDate).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(promo)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {promo.usedCount}
                                        {promo.usageLimit && ` / ${promo.usageLimit}`}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedPromotion(promo);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(promo)}
                                                className="text-gray-600 hover:text-gray-800"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title={isEditing ? 'Edit Promotion' : 'Create Promotion'}
                size="lg"
            >
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Promotion Name *
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
                                {formData.type === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount'} *
                            </label>
                            <input
                                type="number"
                                value={formData.value}
                                onChange={(e) =>
                                    setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                min="0"
                                max={formData.type === 'PERCENTAGE' ? 100 : undefined}
                            />
                        </div>
                    </div>

                    {/* Buy X Get Y fields */}
                    {formData.type === 'BUY_X_GET_Y' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Buy Quantity
                                </label>
                                <input
                                    type="number"
                                    value={formData.buyQuantity || ''}
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
                                    value={formData.getQuantity || ''}
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
                                onClick={() => setFormData({ ...formData, targetType: 'ALL', targetCategories: [], targetProducts: [] })}
                                className={`p-3 rounded-lg border text-sm font-medium transition ${formData.targetType === 'ALL'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Layers className="w-4 h-4 mx-auto mb-1" />
                                All Products
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, targetType: 'CATEGORY', targetProducts: [] })}
                                className={`p-3 rounded-lg border text-sm font-medium transition ${formData.targetType === 'CATEGORY'
                                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Tag className="w-4 h-4 mx-auto mb-1" />
                                Categories
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, targetType: 'PRODUCT', targetCategories: [] })}
                                className={`p-3 rounded-lg border text-sm font-medium transition ${formData.targetType === 'PRODUCT'
                                    ? 'bg-green-50 border-green-500 text-green-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Package className="w-4 h-4 mx-auto mb-1" />
                                Products
                            </button>
                        </div>
                    </div>

                    {/* Category Selection */}
                    {formData.targetType === 'CATEGORY' && (
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
                            {formData.targetCategories && formData.targetCategories.length > 0 && (
                                <div className="mt-2 text-xs text-purple-600">
                                    {formData.targetCategories.length} categories selected
                                </div>
                            )}
                        </div>
                    )}

                    {/* Product Selection */}
                    {formData.targetType === 'PRODUCT' && (
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
                            {formData.targetProducts && formData.targetProducts.length > 0 && (
                                <div className="mt-2 text-xs text-green-600">
                                    {formData.targetProducts.length} products selected
                                </div>
                            )}
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
                                    Min Purchase Amount ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.minPurchase || ''}
                                    onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    Max Discount Amount ($)
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxDiscount || ''}
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
                                    value={formData.usageLimit || ''}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                                    min="0"
                                    placeholder="Unlimited"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    Priority (Higher runs first)
                                </label>
                                <input
                                    type="number"
                                    value={formData.priority || ''}
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
                            Promotion is active
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
                            {isEditing ? 'Update Promotion' : 'Create Promotion'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title="Promotion Details"
                size="lg"
            >
                {selectedPromotion && (
                    <div className="space-y-4">
                        <div className="bg-blue-600 rounded-lg p-6 text-white">
                            <h3 className="text-2xl font-bold">{selectedPromotion.name}</h3>
                            <p className="text-blue-100 mt-1">{selectedPromotion.description}</p>
                            <div className="mt-4 text-3xl font-bold">{getDiscountDisplay(selectedPromotion)}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Type:</span>
                                <span className="ml-2 text-gray-900">{selectedPromotion.type.replace('_', ' ')}</span>
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
                                <span className="text-gray-500">Min Purchase:</span>
                                <span className="ml-2 text-gray-900">{selectedPromotion.minPurchase}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Max Discount:</span>
                                <span className="ml-2 text-gray-900">
                                    {selectedPromotion.maxDiscount ? `${selectedPromotion.maxDiscount}` : 'No limit'}
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
