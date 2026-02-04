"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import { CategorySelector } from "@/components/categories/category-selector";

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/productApi";

import { fetchCategories } from "@/lib/api/categoryApi";
import { Edit, Trash2, Package, RefreshCw, Barcode, Eye, Download } from "lucide-react";
import Link from "next/link";

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */
const getCategoryName = (category: string | Category) =>
  typeof category === "string" ? "—" : category.name;

const UNITS = [
  "piece",
  "kg",
  "g",
  "liter",
  "ml",
  "meter",
  "cm",
  "box",
  "pack",
  "dozen",
];

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    barcode: "",
    category: "",
    subcategory: "",
    costPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    unit: "piece" as Product["unit"],
    taxRate: "",
    image: "",
    minStockLevel: "",
    warrantyDuration: "0",
    warrantyType: "NONE" as "NONE" | "MANUFACTURER" | "SHOP" | "BOTH",
    warrantyDescription: "",
    // Supplier info
    supplierName: "",
    supplierContact: "",
    supplierPhone: "",
    supplierEmail: "",
    // Offer info
    offerIsActive: false,
    offerType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    offerValue: "",
    offerStartDate: "",
    offerEndDate: "",
    offerDescription: "",
    isActive: true,
  });

  const toast = useToast();

  // Barcode scanner detection refs
  const barcodeBufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Barcode scanner detection - listens for rapid keystrokes followed by Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only detect when modal is open
      if (!isModalOpen) return;

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Clear buffer if too much time has passed (normal typing)
      if (timeSinceLastKey > 100 && barcodeBufferRef.current.length > 0) {
        barcodeBufferRef.current = "";
      }

      // Handle Enter key - check if we have a scanned barcode
      if (e.key === "Enter" && barcodeBufferRef.current.length >= 4) {
        const scannedBarcode = barcodeBufferRef.current;
        barcodeBufferRef.current = "";

        // Auto-fill the barcode field
        setFormData(prev => ({ ...prev, barcode: scannedBarcode }));
        e.preventDefault();
        return;
      }

      // Accumulate alphanumeric characters for potential barcode
      if (/^[a-zA-Z0-9]$/.test(e.key) && timeSinceLastKey < 100) {
        barcodeBufferRef.current += e.key;

        // Clear after timeout if no Enter is pressed
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
        scanTimeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = "";
        }, 200);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [isModalOpen, toast]);

  /* --------------------------------------------------
     Load products + categories
  -------------------------------------------------- */
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async (search?: string) => {
    setLoading(true);
    const res = await fetchProducts({
      search: search ?? searchQuery,
    });
    setProducts(res.data.products);
    setLoading(false);
  };

  const loadCategories = async () => {
    // Load tree structure for hierarchical display
    const res = await fetchCategories({ tree: true });
    setCategories(res.data.categories);
  };

  /* --------------------------------------------------
     CRUD handlers
  -------------------------------------------------- */
  const handleAdd = () => {
    setCurrentProduct(null);
    setFormData({
      name: "",
      description: "",
      sku: "",
      barcode: "",
      category: "",
      subcategory: "",
      costPrice: "",
      sellingPrice: "",
      wholesalePrice: "",
      unit: "piece" as Product["unit"],
      taxRate: "",
      image: "",
      minStockLevel: "",
      warrantyDuration: "0",
      warrantyType: "NONE" as "NONE" | "MANUFACTURER" | "SHOP" | "BOTH",
      warrantyDescription: "",
      supplierName: "",
      supplierContact: "",
      supplierPhone: "",
      supplierEmail: "",
      offerIsActive: false,
      offerType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
      offerValue: "",
      offerStartDate: "",
      offerEndDate: "",
      offerDescription: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      category:
        typeof product.category === "string"
          ? product.category
          : product.category._id,
      subcategory: product.subcategory
        ? typeof product.subcategory === "string"
          ? product.subcategory
          : product.subcategory._id
        : "",
      costPrice: product.costPrice?.toString() ?? "",
      sellingPrice: product.sellingPrice?.toString() ?? "",
      wholesalePrice: product.wholesalePrice?.toString() ?? "",
      unit: product.unit,
      taxRate: product.taxRate?.toString() ?? "",
      image: product.image || "",
      minStockLevel: product.minStockLevel?.toString() ?? "",
      warrantyDuration: product.warrantyDuration?.toString() ?? "0",
      warrantyType: product.warrantyType ?? "NONE",
      warrantyDescription: product.warrantyDescription || "",
      supplierName: product.supplier?.name || "",
      supplierContact: product.supplier?.contact || "",
      supplierPhone: product.supplier?.phone || "",
      supplierEmail: product.supplier?.email || "",
      offerIsActive: product.offer?.isActive || false,
      offerType: product.offer?.type || "PERCENTAGE",
      offerValue: product.offer?.value?.toString() || "",
      offerStartDate: product.offer?.startDate?.split("T")[0] || "",
      offerEndDate: product.offer?.endDate?.split("T")[0] || "",
      offerDescription: product.offer?.description || "",
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sellingPrice || !formData.costPrice) return;
    setLoading(true);

    // Build payload with nested objects for supplier and offer
    const payload = {
      name: formData.name,
      description: formData.description || undefined,
      sku: formData.sku || undefined,
      barcode: formData.barcode || undefined,
      category: formData.category,
      subcategory: formData.subcategory || null,
      costPrice: +formData.costPrice,
      sellingPrice: +formData.sellingPrice,
      wholesalePrice: formData.wholesalePrice ? +formData.wholesalePrice : null,
      unit: formData.unit,
      taxRate: formData.taxRate ? +formData.taxRate : 0,
      image: formData.image || undefined,
      minStockLevel: formData.minStockLevel ? +formData.minStockLevel : 0,
      warrantyDuration: +formData.warrantyDuration || 0,
      warrantyType: formData.warrantyType,
      warrantyDescription: formData.warrantyDescription || undefined,
      supplier: {
        name: formData.supplierName || undefined,
        contact: formData.supplierContact || undefined,
        phone: formData.supplierPhone || undefined,
        email: formData.supplierEmail || undefined,
      },
      offer: {
        isActive: formData.offerIsActive,
        type: formData.offerType,
        value: formData.offerValue ? +formData.offerValue : 0,
        startDate: formData.offerStartDate || undefined,
        endDate: formData.offerEndDate || undefined,
        description: formData.offerDescription || undefined,
      },
      isActive: formData.isActive,
    };

    try {
      if (currentProduct) {
        await updateProduct(currentProduct._id, payload);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(payload);
        toast.success("Product added successfully!");
      }
      await loadProducts();
      setIsModalOpen(false);
    } catch (error: unknown) {
      // Display the error message from the backend
      const errorMessage = error instanceof Error ? error.message : "Failed to save product";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deactivated successfully!");
      await loadProducts();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to deactivate product";
      toast.error(errorMessage);
    }
  };

  /* --------------------------------------------------
     Table columns
  -------------------------------------------------- */
  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      label: "Product",
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-gray-500">{p.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (p) => getCategoryName(p.category),
    },
    {
      key: "sellingPrice",
      label: "Price",
      render: (p) => (
        <div>
          <div className="font-semibold">{p.sellingPrice.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Cost: {p.costPrice.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (p) => (
        <div className="flex gap-2">
          <button
            onClick={() => setViewProduct(p)}
            className="p-1 hover:bg-blue-100 text-blue-600 rounded"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(p)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(p._id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6">
      <PageHeader title={`Products (${products.length})`} description="Manage your product catalog" />

      <div className="flex justify-end gap-2 mb-4">
        <Link href="/admin/products/export">
          <Button variant="secondary">
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
        </Link>
        <Button onClick={() => loadProducts()} disabled={loading} variant="danger">
          <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""} `} />
          Refresh
        </Button>
      </div>

      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        onAdd={handleAdd}
        onSearch={(q) => {
          setSearchQuery(q);
          loadProducts(q);
        }}
        addButtonLabel="Add Product"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduct ? "Edit Product" : "Add Product"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentProduct ? "Update" : "Create"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">

          <Input label="Name" value={formData.name}
            placeholder="Enter product name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

          <Input label="Description (optional)" value={formData.description}
            placeholder="Product description"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} />

          <Input label="SKU (optional)" value={formData.sku}
            placeholder="Stock keeping unit (optional)"
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />



          {/* Barcode field with scanner indicator */}
          <div className="relative">
            <Input label="Barcode (optional)" value={formData.barcode}
              placeholder="Scan barcode or enter manually"
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
            <div className="flex items-center gap-1 text-xs text-gray-500 -mt-2 mb-2">
              <Barcode size={12} />
              <span>USB barcode scanner supported - just scan when this form is open</span>
            </div>
          </div>

          {/* Hierarchical Category Selector */}
          <CategorySelector
            label="Category"
            value={formData.category}
            onChange={(categoryId) => setFormData({ ...formData, category: categoryId })}
            categories={categories}
            placeholder="Select a category"
            required
            showFullPath
          />

          {/* Subcategory Selector */}
          <CategorySelector
            label="Subcategory (optional)"
            value={formData.subcategory}
            onChange={(categoryId) => setFormData({ ...formData, subcategory: categoryId })}
            categories={categories}
            placeholder="Select a subcategory (optional)"
            showFullPath
          />

          <Input label="Selling Price" type="number" value={formData.sellingPrice}
            placeholder="Enter selling price"
            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })} required />


          <Input label="Cost Price" type="number" value={formData.costPrice}
            placeholder="Enter cost price"
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })} required />


          <Input label="Wholesale Price (optional)" type="number" value={formData.wholesalePrice}
            placeholder="Wholesale price (optional)"
            onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })} />


          <Input label="Unit" type="select" value={formData.unit}
            placeholder="Select unit"
            onChange={(e) => setFormData({ ...formData, unit: e.target.value as Product["unit"] })}
            options={UNITS.map((u) => ({ value: u, label: u }))} />


          <Input label="Tax Rate (%)" type="number" value={formData.taxRate}
            placeholder="e.g. 18 for 18%"
            onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })} />


          <Input label="Image URL (optional)" value={formData.image}
            placeholder="Paste image URL (optional)"
            onChange={(e) => setFormData({ ...formData, image: e.target.value })} />


          <Input label="Minimum Stock Level" type="number" value={formData.minStockLevel}
            placeholder="e.g. 10"
            onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })} />

          {/* Supplier Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Supplier Information (optional)</h3>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Supplier Name" value={formData.supplierName}
                placeholder="e.g. ABC Distributors"
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })} />

              <Input label="Contact Person" value={formData.supplierContact}
                placeholder="e.g. John Doe"
                onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })} />

              <Input label="Phone" value={formData.supplierPhone}
                placeholder="e.g. +91 9876543210"
                onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })} />

              <Input label="Email" value={formData.supplierEmail}
                placeholder="e.g. supplier@email.com"
                onChange={(e) => setFormData({ ...formData, supplierEmail: e.target.value })} />
            </div>
          </div>

          {/* Warranty Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Warranty Information</h3>

            <Input
              label="Warranty Type"
              type="select"
              value={formData.warrantyType}
              onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value as "NONE" | "MANUFACTURER" | "SHOP" | "BOTH" })}
              options={[
                { value: "NONE", label: "No Warranty" },
                { value: "MANUFACTURER", label: "Manufacturer Warranty" },
                { value: "SHOP", label: "Shop Warranty" },
                { value: "BOTH", label: "Both (Manufacturer + Shop)" }
              ]}
            />

            <Input
              label="Warranty Duration (Months)"
              type="number"
              value={formData.warrantyDuration}
              placeholder="e.g. 12 for 1 year"
              onChange={(e) => setFormData({ ...formData, warrantyDuration: e.target.value })}
            />

            {formData.warrantyType !== "NONE" && (
              <Input
                label="Warranty Description"
                value={formData.warrantyDescription}
                placeholder="e.g. Covers manufacturing defects only"
                onChange={(e) => setFormData({ ...formData, warrantyDescription: e.target.value })}
              />
            )}

            {formData.warrantyType !== "NONE" && +formData.warrantyDuration > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-gray-700">
                <strong>Note:</strong> This warranty will be automatically applied when this product is sold.
              </div>
            )}
          </div>

          {/* Product Offer Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Product Offer/Discount</h3>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="offerIsActive"
                checked={formData.offerIsActive}
                onChange={(e) => setFormData({ ...formData, offerIsActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="offerIsActive" className="text-sm font-medium text-gray-700">
                Enable product-level discount
              </label>
            </div>

            {formData.offerIsActive && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Discount Type"
                    type="select"
                    value={formData.offerType}
                    onChange={(e) => setFormData({ ...formData, offerType: e.target.value as "PERCENTAGE" | "FIXED" })}
                    options={[
                      { value: "PERCENTAGE", label: "Percentage (%)" },
                      { value: "FIXED", label: "Fixed Amount" }
                    ]}
                  />

                  <Input
                    label={formData.offerType === "PERCENTAGE" ? "Discount (%)" : "Discount Amount"}
                    type="number"
                    value={formData.offerValue}
                    placeholder={formData.offerType === "PERCENTAGE" ? "e.g. 10 for 10%" : "e.g. 50"}
                    onChange={(e) => setFormData({ ...formData, offerValue: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Start Date (optional)"
                    type="date"
                    value={formData.offerStartDate}
                    onChange={(e) => setFormData({ ...formData, offerStartDate: e.target.value })}
                  />

                  <Input
                    label="End Date (optional)"
                    type="date"
                    value={formData.offerEndDate}
                    onChange={(e) => setFormData({ ...formData, offerEndDate: e.target.value })}
                  />
                </div>

                <Input
                  label="Offer Description"
                  value={formData.offerDescription}
                  placeholder="e.g. Summer Sale - Limited time offer"
                  onChange={(e) => setFormData({ ...formData, offerDescription: e.target.value })}
                />

                {formData.offerValue && +formData.sellingPrice > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 text-sm text-gray-700">
                    <strong>Effective Price:</strong>{" "}
                    {formData.offerType === "PERCENTAGE"
                      ? `${(+formData.sellingPrice * (1 - +formData.offerValue / 100)).toFixed(2)}`
                      : `${Math.max(0, +formData.sellingPrice - +formData.offerValue).toFixed(2)}`
                    }
                    {" "}(saving: {formData.offerType === "PERCENTAGE" ? `${formData.offerValue}%` : `${formData.offerValue}`})
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ENTERED DETAILS - simplified */}
          <div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-1">
            <div className="font-semibold">Summary</div>
            <div>Name: {formData.name || "—"}</div>
            <div>Category: {formData.category || "—"}</div>
            <div>Price: ${formData.sellingPrice || "0"} (Cost: ${formData.costPrice || "0"})</div>
            {formData.warrantyType !== "NONE" && <div>Warranty: {formData.warrantyDuration} months</div>}
            {formData.offerIsActive && <div>Discount: {formData.offerValue}{formData.offerType === "PERCENTAGE" ? "%" : " fixed"}</div>}
          </div>
        </div>
      </Modal>

      {/* View Product Modal */}
      <Modal
        isOpen={!!viewProduct}
        onClose={() => setViewProduct(null)}
        title={`Product Details: ${viewProduct?.name || ""}`}
      >
        {viewProduct && (
          <div className="space-y-4 text-sm">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500">Name</div>
                <div className="font-medium">{viewProduct.name}</div>
              </div>
              <div>
                <div className="text-gray-500">Category</div>
                <div className="font-medium">{getCategoryName(viewProduct.category)}</div>
              </div>
              {viewProduct.sku && (
                <div>
                  <div className="text-gray-500">SKU</div>
                  <div className="font-medium">{viewProduct.sku}</div>
                </div>
              )}
              {viewProduct.barcode && (
                <div>
                  <div className="text-gray-500">Barcode</div>
                  <div className="font-medium">{viewProduct.barcode}</div>
                </div>
              )}
            </div>

            {viewProduct.description && (
              <div>
                <div className="text-gray-500">Description</div>
                <div className="font-medium">{viewProduct.description}</div>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Pricing</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-500">Selling Price</div>
                  <div className="font-medium text-green-600">${viewProduct.sellingPrice}</div>
                </div>
                <div>
                  <div className="text-gray-500">Cost Price</div>
                  <div className="font-medium">${viewProduct.costPrice}</div>
                </div>
                {viewProduct.wholesalePrice && (
                  <div>
                    <div className="text-gray-500">Wholesale</div>
                    <div className="font-medium">${viewProduct.wholesalePrice}</div>
                  </div>
                )}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500">Unit</div>
                  <div className="font-medium">{viewProduct.unit}</div>
                </div>
                <div>
                  <div className="text-gray-500">Tax Rate</div>
                  <div className="font-medium">{viewProduct.taxRate}%</div>
                </div>
              </div>
            </div>

            {/* Stock */}
            {viewProduct.stock !== undefined && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Stock</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-gray-500">Current Stock</div>
                    <div className="font-medium">{viewProduct.stock}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Min Level</div>
                    <div className="font-medium">{viewProduct.minStockLevel}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Status</div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${viewProduct.stockStatus === "OUT_OF_STOCK" ? "bg-red-100 text-red-700" :
                        viewProduct.stockStatus === "LOW_STOCK" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                      }`}>
                      {viewProduct.stockStatus?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Warranty */}
            {viewProduct.warrantyType !== "NONE" && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Warranty</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500">Type</div>
                    <div className="font-medium">{viewProduct.warrantyType}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Duration</div>
                    <div className="font-medium">{viewProduct.warrantyDuration} months</div>
                  </div>
                </div>
                {viewProduct.warrantyDescription && (
                  <div className="mt-2">
                    <div className="text-gray-500">Description</div>
                    <div className="font-medium">{viewProduct.warrantyDescription}</div>
                  </div>
                )}
              </div>
            )}

            {/* Supplier */}
            {viewProduct.supplier?.name && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Supplier</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500">Name</div>
                    <div className="font-medium">{viewProduct.supplier.name}</div>
                  </div>
                  {viewProduct.supplier.contact && (
                    <div>
                      <div className="text-gray-500">Contact</div>
                      <div className="font-medium">{viewProduct.supplier.contact}</div>
                    </div>
                  )}
                  {viewProduct.supplier.phone && (
                    <div>
                      <div className="text-gray-500">Phone</div>
                      <div className="font-medium">{viewProduct.supplier.phone}</div>
                    </div>
                  )}
                  {viewProduct.supplier.email && (
                    <div>
                      <div className="text-gray-500">Email</div>
                      <div className="font-medium">{viewProduct.supplier.email}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Offer */}
            {viewProduct.offer?.isActive && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Active Offer</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-500">Discount</div>
                    <div className="font-medium text-green-600">
                      {viewProduct.offer.type === "PERCENTAGE"
                        ? `${viewProduct.offer.value}%`
                        : `$${viewProduct.offer.value}`}
                    </div>
                  </div>
                  {viewProduct.effectivePrice && (
                    <div>
                      <div className="text-gray-500">Effective Price</div>
                      <div className="font-medium text-green-600">${viewProduct.effectivePrice}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-4 text-xs text-gray-500">
              <div>Created: {new Date(viewProduct.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(viewProduct.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
