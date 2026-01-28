"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Plus, TrendingUp, TrendingDown, Eye, User, X, Package, RefreshCw, Calendar } from "lucide-react";
import { useToast } from "@/providers/toast-provider";

import { fetchProducts } from "@/lib/api/productApi";
import { adjustStock, fetchAdjustmentTypes, fetchProductStock, fetchAllAdjustments } from "@/lib/api/inventoryApi";

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function StockAdjustmentPage() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [adjustmentTypes, setAdjustmentTypes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  /* Product autocomplete */
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
    fetchAdjustmentTypes().then((res) =>
      setAdjustmentTypes(res.data.types)
    ).catch((err) => {
      console.error("Failed to fetch adjustment types:", err);
    });
  }, []);

  /* --------------------------------------------------
     Load all adjustments on mount
  -------------------------------------------------- */
  const loadAdjustments = async () => {
    setLoading(true);
    try {
      const response = await fetchAllAdjustments({ limit: 100 }) as any;
      const data = response?.data?.adjustments || response?.adjustments || [];
      setAdjustments(data);
    } catch (error: any) {
      console.error("Failed to load adjustments:", error);
      // If endpoint doesn't exist, show empty state gracefully
      if (error?.status !== 404) {
        toast.error(error?.message || "Failed to load adjustments");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdjustments();
  }, []);

  /* --------------------------------------------------
     Product autocomplete search with stock fetching
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
      const response = await fetchProductStock(product._id);
      const stockData = response.data; // Backend returns { status: "success", data: {...} }
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

  // Debug validation
  useEffect(() => {
    console.log('Form Validation Debug:', {
      productId: form.productId,
      hasProductId: !!form.productId,
      type: form.type,
      hasType: !!form.type,
      typeNotEmpty: form.type !== "",
      quantity: form.quantity,
      hasQuantity: !!form.quantity,
      quantityValid: parseInt(form.quantity) >= 1,
      newQuantity,
      newQuantityValid: newQuantity >= 0,
      reasonLength: form.reason.length,
      reasonValid: form.reason.length <= 500,
      isValid
    });
  }, [form, newQuantity, isValid]);

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
        type: form.type,
        quantity: parseInt(form.quantity),
        reason: form.reason || undefined,
        reference: form.reference || undefined,
        referenceType: form.referenceType as any,
      });

      toast.success("Stock adjustment created successfully");

      // Backend returns { status: "success", data: { stock: {...}, adjustment: {...} } }
      const { data } = response;

      // Add new adjustment to the list
      setAdjustments((prev) => [
        {
          ...data.adjustment,
          stock: data.stock,
        },
        ...prev,
      ]);

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
      key: "product",
      label: "Product",
      render: (a: any) => (
        <div>
          <div className="font-medium">{a.stock?.product?.name || a.product?.name}</div>
          <div className="text-xs text-gray-500">{a.stock?.product?.sku || a.product?.sku}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (a: any) => {
        const change = a.stock?.change || (a.newQuantity - a.previousQuantity);
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
        const change = a.stock?.change || (a.newQuantity - a.previousQuantity);
        const previous = a.stock?.previousQuantity || a.previousQuantity;
        const newQty = a.stock?.newQuantity || a.newQuantity;

        return (
          <div>
            <div className={`font-bold ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? "+" : ""}
              {a.quantity}
            </div>
            <div className="text-xs text-gray-500">
              {previous} → {newQty}
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
      <PageHeader
        title="Stock Adjustments"
        description="Inventory adjustment audit trail"
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Total Adjustments</div>
          <div className="text-2xl font-bold">{adjustments.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 flex items-center gap-1">
            <TrendingUp size={14} /> Stock In
          </div>
          <div className="text-2xl font-bold text-green-700">
            {adjustments.filter((a) => {
              const change = a.stock?.change || (a.newQuantity - a.previousQuantity);
              return change > 0;
            }).length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 flex items-center gap-1">
            <TrendingDown size={14} /> Stock Out
          </div>
          <div className="text-2xl font-bold text-red-700">
            {adjustments.filter((a) => {
              const change = a.stock?.change || (a.newQuantity - a.previousQuantity);
              return change < 0;
            }).length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 flex items-center gap-1">
            <Calendar size={14} /> Today
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {adjustments.filter((a) => {
              const today = new Date().toDateString();
              return new Date(a.createdAt).toDateString() === today;
            }).length}
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAdjustments} disabled={loading} variant="danger">
            <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            New Adjustment
          </Button>
        </div>
      </div>

      <DataTable
        data={adjustments}
        columns={columns}
        emptyMessage="No stock adjustments found. Create one using the button above."
      />

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
                  <div className="text-sm text-blue-600 font-medium">Previous Quantity</div>
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
                {viewing.stock?.product?.name || viewing.product?.name}
              </div>
              <div className="text-xs text-gray-500">
                SKU: {viewing.stock?.product?.sku || viewing.product?.sku}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">Adjustment Type</div>
              <div className="flex items-center gap-2">
                {(viewing.stock?.change || (viewing.newQuantity - viewing.previousQuantity)) > 0 ? (
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
                  {viewing.stock?.previousQuantity || viewing.previousQuantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Change</div>
                <div className={`text-xl font-bold ${(viewing.stock?.change || (viewing.newQuantity - viewing.previousQuantity)) > 0
                  ? 'text-green-600'
                  : 'text-red-600'
                  }`}>
                  {(viewing.stock?.change || (viewing.newQuantity - viewing.previousQuantity)) > 0 ? '+' : ''}
                  {viewing.quantity}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">New</div>
                <div className="text-xl font-bold text-blue-600">
                  {viewing.stock?.newQuantity || viewing.newQuantity}
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
