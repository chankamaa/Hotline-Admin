"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/productApi";

import { fetchCategories } from "@/lib/api/categoryApi";
import { Edit, Trash2, Package } from "lucide-react";

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
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    unit: "piece",
    taxRate: 0,
    image: "",
    minStockLevel: 0,
    isActive: true,
  });

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
    const res = await fetchCategories();
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
      costPrice: 0,
      sellingPrice: 0,
      wholesalePrice: 0,
      unit: "piece",
      taxRate: 0,
      image: "",
      minStockLevel: 0,
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
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      wholesalePrice: product.wholesalePrice ?? 0,
      unit: product.unit ?? "piece",
      taxRate: product.taxRate ?? 0,
      image: product.image ?? "",
      minStockLevel: product.minStockLevel ?? 0,
      isActive: product.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      sku: formData.sku || undefined,
      barcode: formData.barcode || undefined,
      image: formData.image || undefined,
    };

    if (currentProduct) {
      await updateProduct(currentProduct._id, payload);
    } else {
      await createProduct(payload);
    }

    setIsModalOpen(false);
    loadProducts();
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
      <PageHeader title="Products" description="Manage your product catalog" />

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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

          <Input label="SKU (optional)" value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />

          <Input label="Barcode (optional)" value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />

          <Input label="Category" type="select" value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={categories.map((c) => ({ value: c._id, label: c.name }))} required />

          <Input label="Selling Price" type="number" value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: +e.target.value })} required />

          <Input label="Cost Price" type="number" value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: +e.target.value })} required />

          <Input label="Wholesale Price (optional)" type="number" value={formData.wholesalePrice}
            onChange={(e) => setFormData({ ...formData, wholesalePrice: +e.target.value })} />

          <Input label="Unit" type="select" value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            options={UNITS.map((u) => ({ value: u, label: u }))} />

          <Input label="Tax Rate (%)" type="number" value={formData.taxRate}
            onChange={(e) => setFormData({ ...formData, taxRate: +e.target.value })} />

          <Input label="Image URL (optional)" value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })} />

          <Input label="Minimum Stock Level" type="number" value={formData.minStockLevel}
            onChange={(e) => setFormData({ ...formData, minStockLevel: +e.target.value })} />

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
