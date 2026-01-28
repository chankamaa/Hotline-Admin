'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
    returnApi,
    Return,
    RETURN_TYPES,
    RETURN_STATUS
} from '@/lib/api/returnApi';
import { useToast } from '@/providers/toast-provider';
import {
    RotateCcw,
    ArrowRightLeft,
    Eye,
    Calendar,
    Clock,
    DollarSign,
    Package,
    Search
} from 'lucide-react';

export default function ReturnsPage() {
    const toast = useToast();
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'REFUND' | 'EXCHANGE'>('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadReturns();
    }, []);

    const loadReturns = async () => {
        try {
            setLoading(true);
            const response = await returnApi.getAll();
            setReturns(response.data.returns || []);
        } catch (error: any) {
            console.error('Error loading returns:', error);
            toast.error(error?.message || 'Failed to load returns');
        } finally {
            setLoading(false);
        }
    };

    const filteredReturns = returns.filter((ret) => {
        const matchesFilter = filter === 'all' || ret.returnType === filter;
        const matchesSearch =
            ret.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ret.originalSale?.saleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getTypeBadge = (type: string) => {
        if (type === 'REFUND') {
            return (
                <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Refund
                </span>
            );
        }
        return (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-600 flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3" />
                Exchange
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            COMPLETED: 'bg-green-100 text-green-700',
            CANCELLED: 'bg-gray-100 text-gray-600'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-600';
    };

    const stats = {
        total: returns.length,
        refunds: returns.filter((r) => r.returnType === 'REFUND').length,
        exchanges: returns.filter((r) => r.returnType === 'EXCHANGE').length,
        totalValue: returns.reduce((sum, r) => sum + (r.totalRefund || 0), 0)
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h1>
                    <p className="text-gray-600">Manage product returns and exchanges</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div
                    className={`p-4 rounded-lg border cursor-pointer transition ${filter === 'all' ? 'bg-blue-50 border-blue-300' : 'bg-white'
                        }`}
                    onClick={() => setFilter('all')}
                >
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        All Transactions
                    </div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div
                    className={`p-4 rounded-lg border cursor-pointer transition ${filter === 'REFUND' ? 'bg-red-50 border-red-300' : 'bg-white'
                        }`}
                    onClick={() => setFilter('REFUND')}
                >
                    <div className="text-sm text-red-600 flex items-center gap-1">
                        <RotateCcw className="w-4 h-4" />
                        Refunds
                    </div>
                    <div className="text-2xl font-bold text-red-700">{stats.refunds}</div>
                </div>
                <div
                    className={`p-4 rounded-lg border cursor-pointer transition ${filter === 'EXCHANGE' ? 'bg-blue-50 border-blue-300' : 'bg-white'
                        }`}
                    onClick={() => setFilter('EXCHANGE')}
                >
                    <div className="text-sm text-blue-600 flex items-center gap-1">
                        <ArrowRightLeft className="w-4 h-4" />
                        Exchanges
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{stats.exchanges}</div>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Total Refunds
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                        ${stats.totalValue.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg border p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by return # or sale #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                </div>
            </div>

            {/* Returns Table */}
            <div className="bg-white rounded-lg border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Return #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Original Sale
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Refund Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <p className="mt-2">Loading returns...</p>
                                </td>
                            </tr>
                        ) : filteredReturns.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                    No returns found
                                </td>
                            </tr>
                        ) : (
                            filteredReturns.map((ret) => (
                                <tr key={ret._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-blue-600">{ret.returnNumber}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {ret.originalSale?.saleNumber || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">{getTypeBadge(ret.returnType)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {ret.items?.length || 0} items
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-red-600">
                                            ${ret.totalRefund?.toFixed(2) || '0.00'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(ret.status)}`}>
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(ret.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedReturn(ret);
                                                setShowDetailsModal(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title={`Return Details - ${selectedReturn?.returnNumber || ''}`}
                size="lg"
            >
                {selectedReturn && (
                    <div className="space-y-4">
                        {/* Summary Card */}
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedReturn.returnNumber}</h3>
                                    <p className="opacity-80">Original Sale: {selectedReturn.originalSale?.saleNumber}</p>
                                </div>
                                {getTypeBadge(selectedReturn.returnType)}
                            </div>
                            <div className="mt-4 text-3xl font-bold">
                                ${selectedReturn.totalRefund?.toFixed(2)}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Reason for Return</h4>
                            <p className="text-gray-700">{selectedReturn.reason}</p>
                        </div>

                        {/* Items */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Returned Items</h4>
                            <div className="space-y-2">
                                {selectedReturn.items?.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center bg-white p-3 rounded border"
                                    >
                                        <div>
                                            <div className="font-medium text-gray-900">{item.productName}</div>
                                            <div className="text-sm text-gray-500">
                                                SKU: {item.sku} | Qty: {item.quantity}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-red-600 font-semibold">
                                                -${item.refundAmount?.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Exchange Info */}
                        {selectedReturn.returnType === 'EXCHANGE' && selectedReturn.exchangeSale && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Exchange Details</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">New Sale #:</span>
                                        <span className="ml-2 text-gray-900 font-medium">
                                            {selectedReturn.exchangeSale.saleNumber}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">New Sale Total:</span>
                                        <span className="ml-2 text-gray-900 font-medium">
                                            ${selectedReturn.exchangeSale.grandTotal?.toFixed(2)}
                                        </span>
                                    </div>
                                    {selectedReturn.exchangeAmountDue !== undefined && (
                                        <div>
                                            <span className="text-gray-500">Amount Due:</span>
                                            <span className="ml-2 text-green-600 font-medium">
                                                ${selectedReturn.exchangeAmountDue?.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {selectedReturn.notes && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                <p className="text-gray-700">{selectedReturn.notes}</p>
                            </div>
                        )}

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="text-gray-500">Processed by:</span>
                                <span className="ml-2">{selectedReturn.createdBy?.username || 'Unknown'}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Date:</span>
                                <span className="ml-2">
                                    {new Date(selectedReturn.createdAt).toLocaleString()}
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
