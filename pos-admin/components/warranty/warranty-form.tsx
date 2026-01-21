"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/providers/toast-provider";
import {
  createWarranty,
  fetchWarrantyTypes,
  type CreateWarrantyRequest,
  type WarrantyTypesData,
  formatWarrantyDuration,
} from "@/lib/api/warrantyApi";
import { searchProducts } from "@/lib/api/productApi";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

interface WarrantyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  prefilledProductId?: string;
  prefilledCustomer?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export function WarrantyForm({
  isOpen,
  onClose,
  onSuccess,
  prefilledProductId,
  prefilledCustomer,
}: WarrantyFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [warrantyTypes, setWarrantyTypes] = useState<WarrantyTypesData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  const [formData, setFormData] = useState<CreateWarrantyRequest>({
    productId: prefilledProductId || "",
    customer: prefilledCustomer || {
      name: "",
      phone: "",
      email: "",
    },
    warrantyType: undefined,
    durationMonths: undefined,
    serialNumber: "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Load warranty types on mount
  useEffect(() => {
    loadWarrantyTypes();
  }, []);

  // Load product if prefilled
  useEffect(() => {
    if (prefilledProductId) {
      loadProductById(prefilledProductId);
    }
  }, [prefilledProductId]);

  // Update customer if prefilled
  useEffect(() => {
    if (prefilledCustomer) {
      setFormData((prev) => ({ ...prev, customer: prefilledCustomer }));
    }
  }, [prefilledCustomer]);

  const loadWarrantyTypes = async () => {
    try {
      const res = await fetchWarrantyTypes();
      setWarrantyTypes(res.data);
    } catch (error) {
      console.error("Failed to load warranty types:", error);
    }
  };

  const loadProductById = async (productId: string) => {
    setLoadingProduct(true);
    try {
      // In a real implementation, you'd have fetchProductById
      // For now, search and filter
      const results = await searchProducts("");
      const product = results.data.products.find((p) => p._id === productId);
      if (product) {
        handleProductSelect(product);
      }
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleProductSearch = async (query: string) => {
    setProductSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await searchProducts(query);
      setSearchResults(res.data.products.slice(0, 10));
    } catch (error) {
      console.error("Product search failed:", error);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      productId: product._id,
      // Auto-fill warranty type and duration from product defaults
      warrantyType:
        product.warrantyType === "NONE" 
          ? undefined 
          : product.warrantyType === "BOTH"
          ? "SHOP" // Default to shop if both
          : (product.warrantyType as CreateWarrantyRequest["warrantyType"]),
      durationMonths:
        product.warrantyDuration > 0 ? product.warrantyDuration : undefined,
    }));
    setProductSearch("");
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }
    if (!formData.customer.name || !formData.customer.phone) {
      toast.error("Customer name and phone are required");
      return;
    }

    setLoading(true);
    try {
      const res = await createWarranty(formData);
      toast.success(
        `Warranty created successfully! Number: ${res.data.warranty.warrantyNumber}`
      );
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create warranty");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      productId: "",
      customer: { name: "", phone: "", email: "" },
      warrantyType: undefined,
      durationMonths: undefined,
      serialNumber: "",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setSelectedProduct(null);
    setProductSearch("");
    setSearchResults([]);
    onClose();
  };

  const calculateEndDate = () => {
    if (!formData.startDate || !formData.durationMonths) return null;
    const start = new Date(formData.startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + formData.durationMonths);
    return end.toLocaleDateString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Manual Warranty"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <ShieldCheck size={16} className="mr-2" />
                Create Warranty
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product <span className="text-red-500">*</span>
          </label>
          {selectedProduct ? (
            <div className="border rounded-lg p-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">
                    {selectedProduct.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    SKU: {selectedProduct.sku || "N/A"}
                  </div>
                  {selectedProduct.warrantyDuration > 0 && (
                    <div className="text-sm text-blue-600 mt-1">
                      <ShieldCheck size={14} className="inline mr-1" />
                      Default warranty: {formatWarrantyDuration(selectedProduct.warrantyDuration)} ({selectedProduct.warrantyType})
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSelectedProduct(null);
                    setFormData((prev) => ({ ...prev, productId: "" }));
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Input
                label=""
                name="productSearch"
                value={productSearch}
                onChange={(e) => handleProductSearch(e.target.value)}
                placeholder="Search by product name or SKU..."
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleProductSelect(product)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        SKU: {product.sku || "N/A"} | Price: ${product.sellingPrice.toFixed(2)}
                      </div>
                      {product.warrantyDuration > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Default: {formatWarrantyDuration(product.warrantyDuration)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              name="customerName"
              value={formData.customer.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customer: { ...formData.customer, name: e.target.value },
                })
              }
              placeholder="John Doe"
              required
            />
            <Input
              label="Customer Phone"
              name="customerPhone"
              value={formData.customer.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  customer: { ...formData.customer, phone: e.target.value },
                })
              }
              placeholder="+1234567890"
              required
            />
          </div>

          <Input
            label="Customer Email (Optional)"
            name="customerEmail"
            value={formData.customer.email || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                customer: { ...formData.customer, email: e.target.value },
              })
            }
            placeholder="john@example.com"
          />
        </div>

        {/* Warranty Details */}
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Warranty Details</h3>

          <Input
            label="Warranty Type"
            name="warrantyType"
            type="select"
            value={formData.warrantyType || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                warrantyType: e.target.value as CreateWarrantyRequest["warrantyType"],
              })
            }
            options={
              warrantyTypes?.warrantyTypes.map((t) => ({
                value: t.value,
                label: t.value,
              })) || []
            }
          />

          <Input
            label="Duration (Months)"
            name="durationMonths"
            type="number"
            value={formData.durationMonths?.toString() || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                durationMonths: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="e.g. 12 for 1 year"
          />
          {formData.durationMonths && (
            <div className="text-sm text-gray-600 -mt-2">
              {formatWarrantyDuration(formData.durationMonths)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate || ""}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="px-3 py-2 border rounded-lg bg-gray-50 text-gray-700">
                {calculateEndDate() || "—"}
              </div>
            </div>
          </div>

          <Input
            label="Serial Number / IMEI (Optional)"
            name="serialNumber"
            value={formData.serialNumber || ""}
            onChange={(e) =>
              setFormData({ ...formData, serialNumber: e.target.value })
            }
            placeholder="Device serial or IMEI"
          />

          <Input
            label="Notes (Optional)"
            name="notes"
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes..."
          />
        </div>

        {/* Info Box */}
        {selectedProduct && selectedProduct.warrantyDuration > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
            <AlertCircle size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-gray-700">
              <strong>Product Default Warranty:</strong> This product has a default warranty of{" "}
              {formatWarrantyDuration(selectedProduct.warrantyDuration)} ({selectedProduct.warrantyType}).
              The form has been pre-filled with these values, but you can override them if needed.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
