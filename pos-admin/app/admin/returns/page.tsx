'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { returnApi, Return, RETURN_TYPES } from '@/lib/api/returnApi';
import { useToast } from '@/providers/toast-provider';
import {
    RotateCcw,
    ArrowRightLeft,
    Eye,
    Calendar,
    DollarSign,
    Package,
    Search,
    RefreshCw,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    CreditCard,
    Banknote,
    User,
    Clock,
    FileText,
    Hash,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    PackageCheck,
    PackageX,
} from 'lucide-react';

/* --------------------------------------------------
   Constants & Helpers
-------------------------------------------------- */
type FilterType = 'all' | keyof typeof RETURN_TYPES;

const REFUND_METHOD_LABELS: Record<string, { label: string; icon: typeof Banknote }> = {
    CASH: { label: 'Cash', icon: Banknote },
    CARD: { label: 'Card', icon: CreditCard },
    ORIGINAL_METHOD: { label: 'Original Method', icon: CreditCard },
};

const CONDITION_CONFIG: Record<string, { label: string; color: string }> = {
    GOOD: { label: 'Good', color: 'bg-green-100 text-green-700' },
    DAMAGED: { label: 'Damaged', color: 'bg-red-100 text-red-700' },
    DEFECTIVE: { label: 'Defective', color: 'bg-orange-100 text-orange-700' },
    USED: { label: 'Used', color: 'bg-yellow-100 text-yellow-700' },
};

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    COMPLETED: { color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    PENDING: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    CANCELLED: { color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function ReturnsPage() {
    const toast = useToast();
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const PAGE_LIMIT = 20;

    // Date filter
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        loadReturns();
    }, [currentPage, filter, statusFilter, startDate, endDate]);

    /* ---- Data loading ---- */
    const loadReturns = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: Record<string, any> = {
                page: currentPage,
                limit: PAGE_LIMIT,
            };
            if (filter !== 'all') params.returnType = filter;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await returnApi.getAll(params);
            setReturns(response.data.returns || []);

            if (response.pagination) {
                setTotalPages(response.pagination.pages);
                setTotalRecords(response.pagination.total);
            }
        } catch (err: any) {
            const msg = err?.message || 'Failed to load returns';
            setError(msg);
            toast.error(msg);
            setReturns([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (ret: Return) => {
        setSelectedReturn(ret);
        setShowDetailsModal(true);

        // Fetch full details (includes populated items.product)
        try {
            setDetailLoading(true);
            const res = await returnApi.getById(ret._id);
            setSelectedReturn(res.data.return);
        } catch {
            // keep the list-level data if detail fetch fails
        } finally {
            setDetailLoading(false);
        }
    };

    /* ---- Filter helpers ---- */
    const handleFilterChange = (f: FilterType) => {
        setFilter(f);
        setCurrentPage(1);
    };

    const handleDateFilter = () => {
        setCurrentPage(1);
        loadReturns();
    };

    const clearDateFilter = () => {
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    /* ---- Client-side search on loaded page ---- */
    const filteredReturns = returns.filter((r) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            r.returnNumber?.toLowerCase().includes(q) ||
            r.originalSale?.saleNumber?.toLowerCase().includes(q) ||
            r.reason?.toLowerCase().includes(q) ||
            r.items?.some((i) => i.productName?.toLowerCase().includes(q))
        );
    });

    /* ---- Badges ---- */
    const getTypeBadge = (type: string) => {
        if (type === 'REFUND') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                    <RotateCcw className="w-3 h-3" />
                    Refund
                </span>
            );
        }
        if (type === 'WARRANTY_REFUND') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                    <ShieldCheck className="w-3 h-3" />
                    Warranty
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                <ArrowRightLeft className="w-3 h-3" />
                Exchange
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CANCELLED;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${cfg.color}`}>
                <Icon className="w-3 h-3" />
                {status}
            </span>
        );
    };

    /* ---- Page-level stats (from loaded data) ---- */
    const stats = {
        total: totalRecords || returns.length,
        refunds: returns.filter((r) => r.returnType === 'REFUND').length,
        exchanges: returns.filter((r) => r.returnType === 'EXCHANGE').length,
        warranty: returns.filter((r) => r.returnType === 'WARRANTY_REFUND').length,
        totalValue: returns.reduce((s, r) => s + (r.totalRefund || 0), 0),
    };

    /* ==================== RENDER ==================== */
    return (
        <div className="p-6 space-y-6">
            {/* ---- Header ---- */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Returns &amp; Refunds</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and manage product returns, refunds, and exchanges
                    </p>
                </div>
                <Button onClick={() => { setCurrentPage(1); loadReturns(); }} variant="danger" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* ---- Error Banner ---- */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-red-800 font-medium">Error Loading Returns</p>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                    <Button onClick={() => { setCurrentPage(1); loadReturns(); }} variant="danger" size="sm">
                        Retry
                    </Button>
                </div>
            )}

            {/* ---- Stats Cards ---- */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-gray-600">
                {([
                    { key: 'all' as FilterType, label: 'All Returns', value: stats.total, icon: Package, activeColor: 'bg-blue-50 border-blue-300' },
                    { key: 'REFUND' as FilterType, label: 'Refunds', value: stats.refunds, icon: RotateCcw, activeColor: 'bg-red-50 border-red-300' },
                    { key: 'EXCHANGE' as FilterType, label: 'Exchanges', value: stats.exchanges, icon: ArrowRightLeft, activeColor: 'bg-sky-50 border-sky-300' },
                    { key: 'WARRANTY_REFUND' as FilterType, label: 'Warranty', value: stats.warranty, icon: ShieldCheck, activeColor: 'bg-purple-50 border-purple-300' },
                ] as const).map((card) => {
                    const Icon = card.icon;
                    const active = filter === card.key;
                    return (
                        <div
                            key={card.key}
                            onClick={() => handleFilterChange(card.key)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                active ? card.activeColor : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                            <div className="text-sm flex items-center gap-1.5 text-gray-500">
                                <Icon className="w-4 h-4" />
                                {card.label}
                            </div>
                            <div className="text-2xl font-bold mt-1">{card.value}</div>
                        </div>
                    );
                })}

                <div className="p-4 rounded-xl border bg-white">
                    <div className="text-sm text-gray-500 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        Total Refunded
                    </div>
                    <div className="text-2xl font-bold text-green-700 mt-1">
                        {stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* ---- Filters Row ---- */}
            <div className="bg-white rounded-xl border p-4">
                <div className="flex flex-wrap items-end gap-3">
                    {/* Date range */}
                    <div className="flex-1 min-w-40">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 text-gray-900"
                        />
                    </div>
                    <div className="flex-1 min-w-40">
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 text-gray-900"
                        />
                    </div>

                    {/* Status */}
                    <div className="flex-1 min-w-35">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 text-gray-900"
                        >
                            <option value="all">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <Button onClick={handleDateFilter} disabled={loading} size="sm">Apply</Button>
                    {(startDate || endDate) && (
                        <Button onClick={clearDateFilter} variant="secondary" size="sm" disabled={loading}>Clear</Button>
                    )}

                    {/* Search */}
                    <div className="flex-2 min-w-50">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Return #, sale #, product, reason…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10 text-gray-900"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ---- Returns Table ---- */}
            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return #</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Sale</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed By</th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-5 py-12 text-center text-gray-500">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-black" />
                                        <p className="mt-2 text-sm">Loading returns…</p>
                                    </td>
                                </tr>
                            ) : filteredReturns.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-5 py-12 text-center text-gray-400">
                                        <Package className="mx-auto w-8 h-8 mb-2" />
                                        <p className="text-sm">No returns found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredReturns.map((ret) => {
                                    const refundInfo = REFUND_METHOD_LABELS[ret.refundMethod || ''];
                                    return (
                                        <tr key={ret._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-semibold text-blue-600 text-sm">{ret.returnNumber}</span>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-900">
                                                {ret.originalSale?.saleNumber || '—'}
                                            </td>
                                            <td className="px-5 py-3">{getTypeBadge(ret.returnType)}</td>
                                            <td className="px-5 py-3">
                                                <span className="text-sm text-gray-700">{ret.items?.length || 0} item{(ret.items?.length || 0) !== 1 ? 's' : ''}</span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className="font-semibold text-red-600 text-sm">
                                                    {ret.totalRefund?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                {refundInfo ? (
                                                    <span className="flex items-center gap-1">
                                                        <refundInfo.icon className="w-3.5 h-3.5" />
                                                        {refundInfo.label}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-5 py-3">{getStatusBadge(ret.status)}</td>
                                            <td className="px-5 py-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(ret.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {ret.createdBy?.username || '—'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button
                                                    onClick={() => handleViewDetails(ret)}
                                                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ---- Pagination ---- */}
            {!loading && totalPages > 1 && (
                <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages} · {totalRecords} total
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            variant="secondary"
                            size="sm"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                        </Button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let num: number;
                                if (totalPages <= 5) num = i + 1;
                                else if (currentPage <= 3) num = i + 1;
                                else if (currentPage >= totalPages - 2) num = totalPages - 4 + i;
                                else num = currentPage - 2 + i;
                                return (
                                    <button
                                        key={num}
                                        onClick={() => setCurrentPage(num)}
                                        disabled={loading}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === num
                                                ? 'bg-black text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100 border'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                );
                            })}
                        </div>
                        <Button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || loading}
                            variant="secondary"
                            size="sm"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ==================== DETAILS MODAL ==================== */}
            <Modal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                title={`Return Details — ${selectedReturn?.returnNumber || ''}`}
                size="lg"
            >
                {selectedReturn && (
                    <div className="space-y-5">
                        {/* Summary banner */}
                        <div className="bg-linear-to-r from-gray-900 to-gray-700 rounded-xl p-6 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold">{selectedReturn.returnNumber}</h3>
                                    <p className="text-gray-300 text-sm mt-1">
                                        Sale: {selectedReturn.originalSale?.saleNumber || '—'}
                                        {selectedReturn.originalSale?.grandTotal != null &&
                                            ` · Original Total: ${selectedReturn.originalSale.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    {getTypeBadge(selectedReturn.returnType)}
                                    {getStatusBadge(selectedReturn.status)}
                                </div>
                            </div>
                            <div className="mt-4 text-3xl font-bold">
                                {selectedReturn.totalRefund?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                <span className="text-sm font-normal text-gray-300 ml-2">refunded</span>
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <InfoCard icon={Calendar} label="Date" value={new Date(selectedReturn.createdAt).toLocaleDateString()} />
                            <InfoCard icon={Clock} label="Time" value={new Date(selectedReturn.createdAt).toLocaleTimeString()} />
                            <InfoCard icon={User} label="Processed By" value={selectedReturn.createdBy?.username || '—'} />
                            <InfoCard
                                icon={REFUND_METHOD_LABELS[selectedReturn.refundMethod || '']?.icon || Banknote}
                                label="Refund Method"
                                value={REFUND_METHOD_LABELS[selectedReturn.refundMethod || '']?.label || selectedReturn.refundMethod || '—'}
                            />
                        </div>

                        {/* Reason */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                Reason for Return
                            </h4>
                            <p className="text-gray-700 text-sm">{selectedReturn.reason}</p>
                        </div>

                        {/* Returned items */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
                                <Package className="w-4 h-4" />
                                Returned Items ({selectedReturn.items?.length || 0})
                            </h4>

                            {detailLoading ? (
                                <div className="text-center py-6 text-gray-400 text-sm">Loading item details…</div>
                            ) : (
                                <div className="space-y-2">
                                    {selectedReturn.items?.map((item, idx) => (
                                        <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50/60">
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                                        {item.sku && (
                                                            <span className="flex items-center gap-1">
                                                                <Hash className="w-3 h-3" />
                                                                SKU: {item.sku}
                                                            </span>
                                                        )}
                                                        {item.serialNumber && (
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="w-3 h-3" />
                                                                S/N: {item.serialNumber}
                                                            </span>
                                                        )}
                                                        <span>Qty: {item.quantity}</span>
                                                        <span>Unit Price: {item.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                    </div>

                                                    {/* Condition + Restockable */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {item.condition && (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${CONDITION_CONFIG[item.condition]?.color || 'bg-gray-100 text-gray-600'}`}>
                                                                {CONDITION_CONFIG[item.condition]?.label || item.condition}
                                                            </span>
                                                        )}
                                                        {item.restockable !== undefined && (
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${item.restockable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                                {item.restockable ? <PackageCheck className="w-3 h-3" /> : <PackageX className="w-3 h-3" />}
                                                                {item.restockable ? 'Restockable' : 'Not Restockable'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="text-red-600 font-bold text-sm">
                                                        -{item.refundAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Exchange details */}
                        {selectedReturn.returnType === 'EXCHANGE' && selectedReturn.exchangeSale && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-3">
                                    <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                                    Exchange Details
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 block text-xs">New Sale #</span>
                                        <span className="font-semibold text-gray-900">{selectedReturn.exchangeSale.saleNumber}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block text-xs">New Sale Total</span>
                                        <span className="font-semibold text-gray-900">
                                            {selectedReturn.exchangeSale.grandTotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    {selectedReturn.exchangeAmountDue != null && (
                                        <div>
                                            <span className="text-gray-500 block text-xs">Amount Due</span>
                                            <span className="font-semibold text-green-700">
                                                {selectedReturn.exchangeAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {selectedReturn.notes && (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5 mb-1">
                                    <FileText className="w-4 h-4" />
                                    Notes
                                </h4>
                                <p className="text-gray-700 text-sm">{selectedReturn.notes}</p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="border-t pt-3 flex flex-wrap gap-6 text-xs text-gray-400">
                            <span>Created: {new Date(selectedReturn.createdAt).toLocaleString()}</span>
                            <span>Updated: {new Date(selectedReturn.updatedAt).toLocaleString()}</span>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end pt-2 border-t">
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

/* --------------------------------------------------
   Small info card component used in the detail modal
-------------------------------------------------- */
function InfoCard({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
    return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                <Icon className="w-3 h-3" />
                {label}
            </div>
            <p className="font-semibold text-gray-900 text-sm truncate">{value}</p>
        </div>
    );
}
