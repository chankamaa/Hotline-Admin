"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Plus, TrendingUp, TrendingDown, Eye, User, X, Package, RefreshCw, Calendar, Search, Filter, ArrowLeft } from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import Link from "next/link";

import { fetchProducts } from "@/lib/api/productApi";
import { adjustStock, fetchAdjustmentTypes, fetchProductStock, fetchStockHistory } from "@/lib/api/inventoryApi";

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function StockAdjustmentPage() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [adjustmentTypes, setAdjustmentTypes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  /* Product selection for viewing history */
  const [historyProductSearch, setHistoryProductSearch] = useState("");
  const [historyProductOptions, setHistoryProductOptions] = useState<any[]>([]);
  const [selectedHistoryProduct, setSelectedHistoryProduct] = useState<any | null>(null);
  const [showHistorySuggestions, setShowHistorySuggestions] = useState(false);

  /* Filter states */
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  /* Pagination */
  const [pagination, setPagination] = useState<any>(null);

  /* Product autocomplete for creating adjustment */
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  /* Stock information - fetched from backend */
  const [previousQuantity, setPreviousQuantity] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<any>(null);

  const [form, setForm] = useState({
    productId: "",
    type: "",
    quantity: "",
    reason: "",
    reference: "",
    referenceType: "Manual",
  });

  const toast = useToast();

  /* --------------------------------------------------
     Load adjustment types
  -------------------------------------------------- */
  useEffect(() => {
    fetchAdjustmentTypes().then((res: any) =>
      setAdjustmentTypes(res.data.types)
    ).catch((err) => {
      console.error("Failed to fetch adjustment types:", err);
    });
  }, []);

  /* --------------------------------------------------
     Load adjustments for selected product
  -------------------------------------------------- */
  const loadAdjustments = async () => {
    if (!selectedHistoryProduct) {
      setAdjustments([]);
      return;
    }

    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (filterType) params.type = filterType;
      if (filterStartDate) params.startDate = filterStartDate;
      if (filterEndDate) params.endDate = filterEndDate;

      const response = await fetchStockHistory(selectedHistoryProduct._id, params) as any;
      // Backend returns: { status, product, results, pagination, data: { adjustments } }
      const data = response?.data?.adjustments || response?.adjustments || [];
      setAdjustments(data);
      setPagination(response?.pagination || null);
    } catch (error: any) {
      console.error("Failed to load adjustments:", error);
      toast.error(error?.message || "Failed to load adjustment history");
    } finally {
      setLoading(false);
    }
  };

  // Load adjustments when product or filters change
  useEffect(() => {
    if (selectedHistoryProduct) {
      loadAdjustments();
    }
  }, [selectedHistoryProduct, filterType, filterStartDate, filterEndDate]);

  /* --------------------------------------------------
     Product search for history view
  -------------------------------------------------- */
  useEffect(() => {
    if (!historyProductSearch || historyProductSearch.length < 2) {
      setHistoryProductOptions([]);
      setShowHistorySuggestions(false);
      return;
    }

    const loadProducts = async () => {
      try {
        const res = await fetchProducts({ search: historyProductSearch });
        setHistoryProductOptions(res.data.products);
        setShowHistorySuggestions(true);
      } catch (error) {
        console.error("Failed to search products:", error);
      }
    };

    loadProducts();
  }, [historyProductSearch]);

  const handleSelectHistoryProduct = (product: any) => {
    setSelectedHistoryProduct(product);
    setHistoryProductSearch(`${product.name} (${product.sku || 'N/A'})`);
    setHistoryProductOptions([]);
    setShowHistorySuggestions(false);
  };

  const handleClearHistoryProduct = () => {
    setSelectedHistoryProduct(null);
    setHistoryProductSearch("");
    setAdjustments([]);
    setHistoryProductOptions([]);
    setShowHistorySuggestions(false);
    // Clear filters too
    setFilterType("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  /* --------------------------------------------------
     Product autocomplete search for creating adjustment
  -------------------------------------------------- */
  useEffect(() => {
    if (!productSearch || productSearch.length < 2) {
      setProductOptions([]);
      setShowSuggestions(false);
      return;
    }

    const loadProducts = async () => {
      try {
        const res = await fetchProducts({ search: productSearch });
        setProductOptions(res.data.products);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Failed to search products:", error);
      }
    };

    loadProducts();
  }, [productSearch]);

  const handleSelectProduct = async (product: any) => {
    setSelectedProduct(product);
    setForm((prev) => ({ ...prev, productId: product._id }));
    setProductSearch(`${product.name} (${product.sku || 'N/A'})`);
    setProductOptions([]);
    setShowSuggestions(false);

    // Fetch current stock level from backend
    try {
      const response: any = await fetchProductStock(product._id);
      const stockData = response.data;
      setCurrentStock(stockData);
      setPreviousQuantity(stockData.quantity);
    } catch (error) {
      toast.error("Failed to fetch product stock");
      console.error(error);
    }
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setProductSearch("");
    setCurrentStock(null);
    setPreviousQuantity(0);
    setProductOptions([]);
    setShowSuggestions(false);
    setForm((prev) => ({
      ...prev,
      productId: "",
      type: "",
      quantity: "",
    }));
  };

  /* --------------------------------------------------
     Calculate new quantity based on adjustment type
  -------------------------------------------------- */
  const calculateNewQuantity = (): number => {
    if (!form.type || !form.quantity) return previousQuantity;

    const qty = parseInt(form.quantity) || 0;
    const selectedType = adjustmentTypes.find((t) => t.value === form.type);

    if (!selectedType) return previousQuantity;

    // IN types add to stock, OUT types reduce stock
    if (selectedType.direction === "IN") {
      return previousQuantity + qty;
    } else {
      return previousQuantity - qty;
    }
  };

  const newQuantity = calculateNewQuantity();

  /* --------------------------------------------------
     Validation
  -------------------------------------------------- */
  const isValid =
    !!form.productId &&
    !!form.type &&
    form.type !== "" &&
    !!form.quantity &&
    parseInt(form.quantity) >= 1 &&
    newQuantity >= 0 &&
    form.reason.length <= 500;

  /* --------------------------------------------------
     Create adjustment
  -------------------------------------------------- */
  const handleCreate = async () => {
    if (!isValid) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setLoading(true);
    try {
      const response = await adjustStock({
        productId: form.productId,
        type: form.type as any,
        quantity: parseInt(form.quantity),
        reason: form.reason || undefined,
        reference: form.reference || undefined,
        referenceType: form.referenceType as any,
      });

      toast.success("Stock adjustment created successfully");

      // If viewing the same product, refresh its history
      if (selectedHistoryProduct && selectedHistoryProduct._id === form.productId) {
        loadAdjustments();
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create adjustment");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      productId: "",
      type: "",
      quantity: "",
      reason: "",
      reference: "",
      referenceType: "Manual",
    });
    setProductSearch("");
    setSelectedProduct(null);
    setCurrentStock(null);
    setPreviousQuantity(0);
  };

  /* --------------------------------------------------
     Table columns
  -------------------------------------------------- */
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (a: any) => new Date(a.createdAt).toLocaleDateString() + ' ' + new Date(a.createdAt).toLocaleTimeString(),
    },
    {
      key: "type",
      label: "Type",
      render: (a: any) => {
        const change = a.newQuantity - a.previousQuantity;
        return (
          <div className="flex items-center gap-2">
            {change > 0 ? (
              <TrendingUp size={16} className="text-green-600" />
            ) : (
              <TrendingDown size={16} className="text-red-600" />
            )}
            <span className={change > 0 ? "text-green-600" : "text-red-600"}>
              {a.type}
            </span>
          </div>
        );
      },
    },
    {
      key: "quantity",
      label: "Change",
      render: (a: any) => {
        const change = a.newQuantity - a.previousQuantity;

        return (
          <div>
            <div className={`font-bold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? "+" : ""}
              {change}
            </div>
            <div className="text-xs text-gray-500">
              {a.previousQuantity} → {a.newQuantity}
            </div>
          </div>
        );
      },
    },
    {
      key: "reason",
      label: "Reason",
      render: (a: any) => (
        <div className="max-w-xs truncate text-sm" title={a.reason}>
          {a.reason || "—"}
        </div>
      ),
    },
    {
      key: "user",
      label: "Adjusted By",
      render: (a: any) => (
        <div className="flex items-center gap-1">
          <User size={14} />
          {a.createdBy?.username || "Unknown"}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (a: any) => (
        <Button size="sm" variant="secondary" onClick={() => setViewing(a)}>
          <Eye size={14} />
        </Button>
      ),
    },
  ];

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6 text-gray-700">
      <div className="mb-4">
        <Link
          href="/admin/stock"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock Overview
        </Link>
      </div>
      
      <PageHeader
        title="Stock Adjustments"
        description="View and create inventory adjustments"
      />

      {/* Product Selection for Viewing History */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search size={20} />
          View Adjustment History
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Product Search */}
          <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Product
            </label>
            <div className="relative">
              <input
                type="text"
                value={historyProductSearch}
                onChange={(e) => setHistoryProductSearch(e.target.value)}
                onFocus={() => historyProductOptions.length > 0 && setShowHistorySuggestions(true)}
                placeholder="Search product by name or SKU..."
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!selectedHistoryProduct}
              />
              {selectedHistoryProduct && (
                <button
                  onClick={handleClearHistoryProduct}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {showHistorySuggestions && historyProductOptions.length > 0 && !selectedHistoryProduct && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {historyProductOptions.map((p) => (
                  <div
                    key={p._id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleSelectHistoryProduct(p)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center shrink-0">
                        <Package size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          SKU: {p.sku || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter: Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adjustment Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedHistoryProduct}
            >
              <option value="">All Types</option>
              {adjustmentTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.value}</option>
              ))}
            </select>
          </div>

          {/* Filter: Date Range */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedHistoryProduct}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedHistoryProduct}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary - only shown when a product is selected */}
      {selectedHistoryProduct && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-500">Product</div>
            <div className="text-lg font-bold truncate">{selectedHistoryProduct.name}</div>
            <div className="text-xs text-gray-500">SKU: {selectedHistoryProduct.sku}</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Adjustments</div>
            <div className="text-2xl font-bold">{pagination?.total || adjustments.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp size={14} /> Stock In
            </div>
            <div className="text-2xl font-bold text-green-700">
              {adjustments.filter((a) => (a.newQuantity - a.previousQuantity) > 0).length}
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 flex items-center gap-1">
              <TrendingDown size={14} /> Stock Out
            </div>
            <div className="text-2xl font-bold text-red-700">
              {adjustments.filter((a) => (a.newQuantity - a.previousQuantity) < 0).length}
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {selectedHistoryProduct
            ? `Showing ${adjustments.length} adjustment${adjustments.length !== 1 ? 's' : ''} for ${selectedHistoryProduct.name}`
            : 'Select a product to view its adjustment history'}
        </div>
        <div className="flex gap-2">
          {selectedHistoryProduct && (
            <Button onClick={loadAdjustments} disabled={loading} variant="secondary">
              <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            New Adjustment
          </Button>
        </div>
      </div>

      {selectedHistoryProduct ? (
        <DataTable
          data={adjustments}
          columns={columns}
          emptyMessage="No adjustments found for this product. Create one using the button above."
        />
      ) : (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Product</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Search and select a product above to view its stock adjustment history.
            You can also filter by adjustment type and date range.
          </p>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          resetForm();
          setIsModalOpen(false);
        }}
        title="Create Stock Adjustment"
      >
        <div className="space-y-4">
          {/* Product autocomplete with enhanced UI */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                onFocus={() => productOptions.length > 0 && setShowSuggestions(true)}
                placeholder="Search product by name or SKU"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!!selectedProduct}
              />
              {selectedProduct && (
                <button
                  onClick={handleClearProduct}
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Autocomplete dropdown */}
            {showSuggestions && productOptions.length > 0 && !selectedProduct && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {productOptions.map((p) => (
                  <div
                    key={p._id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => handleSelectProduct(p)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center shrink-0">
                        <Package size={16} className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          SKU: {p.sku || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Quantity Display (fetched from backend) */}
          {currentStock && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-medium">Current Stock</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {previousQuantity}
                  </div>
                </div>
                {currentStock.isLowStock && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                    Low Stock
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Adjustment Type */}
          <Input
            name="type"
            label="Adjustment Type"
            type="select"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            options={adjustmentTypes.map((t) => ({
              value: t.value,
              label: `${t.value} (${t.direction})`,
            }))}
            disabled={!selectedProduct}
            required
          />

          {/* Quantity to adjust */}
          <Input
            name="quantity"
            label="Quantity"
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
            placeholder="Enter adjustment quantity"
            disabled={!selectedProduct}
            required
          />

          {/* New Quantity Preview (calculated) */}
          {form.quantity && form.type && (
            <div className={`border rounded-lg p-4 ${newQuantity >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
              <div className={`text-sm font-medium ${newQuantity >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                New Quantity
              </div>
              <div className={`text-2xl font-bold ${newQuantity >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                {newQuantity}
              </div>
              {newQuantity < 0 && (
                <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <span>⚠️</span> Cannot reduce stock below zero
                </div>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (max 500 chars)
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter reason for adjustment"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={!selectedProduct}
            />
            <div className="text-xs text-gray-500 mt-1">
              {form.reason.length}/500 characters
            </div>
          </div>

          {/* Reference */}
          <Input
            name="reference"
            label="Reference"
            value={form.reference}
            onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
            placeholder="Reference number (optional)"
            disabled={!selectedProduct}
          />

          {/* Reference Type */}
          <Input
            name="referenceType"
            label="Reference Type"
            type="select"
            value={form.referenceType}
            onChange={(e) => setForm((prev) => ({ ...prev, referenceType: e.target.value }))}
            options={[
              { value: "Manual", label: "Manual" },
              { value: "Sale", label: "Sale" },
              { value: "Purchase", label: "Purchase" },
              { value: "Transfer", label: "Transfer" },
            ]}
            disabled={!selectedProduct}
          />

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setIsModalOpen(false);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1"
              disabled={!isValid || loading}
            >
              {loading ? "Saving..." : "Save Adjustment"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      {viewing && (
        <Modal
          isOpen={!!viewing}
          onClose={() => setViewing(null)}
          title="Adjustment Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">
                  {new Date(viewing.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Adjusted By</div>
                <div className="font-medium">{viewing.createdBy?.username}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">Product</div>
              <div className="font-medium">
                {viewing.product?.name || selectedHistoryProduct?.name}
              </div>
              <div className="text-xs text-gray-500">
                SKU: {viewing.product?.sku || selectedHistoryProduct?.sku}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">Adjustment Type</div>
              <div className="flex items-center gap-2">
                {(viewing.newQuantity - viewing.previousQuantity) > 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
                <span className="font-medium">{viewing.type}</span>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Previous</div>
                <div className="text-xl font-bold text-gray-700">
                  {viewing.previousQuantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Change</div>
                <div className={`text-xl font-bold ${(viewing.newQuantity - viewing.previousQuantity) > 0
                  ? 'text-green-600'
                  : 'text-red-600'
                  }`}>
                  {(viewing.newQuantity - viewing.previousQuantity) > 0 ? '+' : ''}
                  {viewing.newQuantity - viewing.previousQuantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">New</div>
                <div className="text-xl font-bold text-blue-600">
                  {viewing.newQuantity}
                </div>
              </div>
            </div>

            {viewing.reason && (
              <div className="border-t pt-4">
                <div className="text-sm text-gray-500 mb-1">Reason</div>
                <div className="text-gray-700">{viewing.reason}</div>
              </div>
            )}

            {viewing.reference && (
              <div className="border-t pt-4">
                <div className="text-sm text-gray-500 mb-1">Reference</div>
                <div className="font-medium">{viewing.reference}</div>
                <div className="text-xs text-gray-500">{viewing.referenceType}</div>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={() => setViewing(null)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
