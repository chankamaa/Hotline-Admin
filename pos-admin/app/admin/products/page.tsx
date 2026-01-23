"use client";

import { useEffect, useState } from "react";
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
import { Edit, Trash2, Package, RefreshCw } from "lucide-react";

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

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    unit: "piece",
    taxRate: "",
    image: "",
    minStockLevel: "",
    warrantyDuration: "0",
    warrantyType: "NONE",
    warrantyDescription: "",
    isActive: true,
  });

  const toast = useToast();

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
      sku: "",
      barcode: "",
      category: "",
      costPrice: "",
      sellingPrice: "",
      wholesalePrice: "",
      unit: "piece",
      taxRate: "",
      image: "",
      minStockLevel: "",
      warrantyDuration: "0",
      warrantyType: "NONE",
      warrantyDescription: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || "",
      barcode: product.barcode || "",
      category:
        typeof product.category === "string"
          ? product.category
          : product.category._id,
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
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sellingPrice || !formData.costPrice) return;
    setLoading(true);
    const payload = {
      ...formData,
      sellingPrice: formData.sellingPrice === "" ? 0 : +formData.sellingPrice,
      costPrice: formData.costPrice === "" ? 0 : +formData.costPrice,
      wholesalePrice: formData.wholesalePrice === "" ? 0 : +formData.wholesalePrice,
      taxRate: formData.taxRate === "" ? 0 : +formData.taxRate,
      minStockLevel: formData.minStockLevel === "" ? 0 : +formData.minStockLevel,
      warrantyDuration: formData.warrantyDuration === "" ? 0 : +formData.warrantyDuration,
      warrantyType: formData.warrantyType,
      warrantyDescription: formData.warrantyDescription || undefined,
    };
    try {
      if (currentProduct) {
        await updateProduct(currentProduct._id, payload);
        // Optionally show update toast here
      } else {
        await createProduct(payload);
        toast.success("Product added successfully!");
      }
      await loadProducts();
      setIsModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this product?")) return;
    await deleteProduct(id);
    loadProducts();
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
          <div className="font-semibold">${p.sellingPrice.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Cost: ${p.costPrice.toFixed(2)}
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
            onClick={() => handleEdit(p)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(p._id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
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
    <div className="p-6 text-gray-800">
      <PageHeader title={`Products (${products.length})`} description="Manage your product catalog" />

      <div className="flex justify-end mb-4">
        <Button onClick={() => loadProducts()} disabled={loading} variant="secondary">
          <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
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


          <Input label="SKU (optional)" value={formData.sku}
            placeholder="Stock keeping unit (optional)"
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />


          <Input label="Barcode (optional)" value={formData.barcode}
            placeholder="Barcode (optional)"
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />

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
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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

          {/* Warranty Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Warranty Information</h3>
            
            <Input 
              label="Warranty Type" 
              type="select" 
              value={formData.warrantyType}
              onChange={(e) => setFormData({ ...formData, warrantyType: e.target.value })}
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
              helperText={formData.warrantyDuration && +formData.warrantyDuration > 0 
                ? `${Math.floor(+formData.warrantyDuration / 12)} year(s) ${+formData.warrantyDuration % 12} month(s)`
                : "0 = No warranty"}
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

          {/* ENTERED DETAILS */}
          <div className="border rounded-lg p-4 bg-gray-50 text-sm space-y-1">
            <div className="font-semibold">Entered Details</div>
            {Object.entries(formData).map(
              ([key, value]) =>
                value !== "" && value !== 0 && (
                  <div key={key}>
                    {key}: {String(value)}
                  </div>
                )
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
