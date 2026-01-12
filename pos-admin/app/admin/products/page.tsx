"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product, Category } from "@/lib/types";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/productApi";
import { fetchCategoryTree } from "@/lib/api/categoryApi";
import { Edit, Trash2, Eye, Package } from "lucide-react";

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */
const getCategoryName = (category: string | Category) =>
  typeof category === "string" ? "—" : category.name;

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

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetchProducts({ search: searchQuery });
    setProducts(res.data.products);
    setLoading(false);
  };

  const loadCategories = async () => {
    const res = await fetchCategoryTree();
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
      minStockLevel: product.minStockLevel ?? 0,
      isActive: product.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentProduct) {
        await updateProduct(currentProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error: any) {
      alert(error.message || "Failed to save product");
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
          <div className="font-semibold">
            ${p.sellingPrice.toFixed(2)}
          </div>
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
          <button onClick={() => handleEdit(p)}>
            <Edit size={16} />
          </button>
          <button onClick={() => handleDelete(p._id)}>
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
      <PageHeader
        title="Products"
        description="Manage your product catalog"
      />

      <DataTable
        data={products}
        columns={columns}
        onAdd={handleAdd}
        onSearch={(q) => {
          setSearchQuery(q);
          loadProducts();
        }}
        addButtonLabel="Add Product"
      />

      {/* Add/Edit Modal */}
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
          <Input name="name" label="Name" value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <Input name="sku" label="SKU" value={formData.sku}
            onChange={(e) =>
              setFormData({ ...formData, sku: e.target.value })
            }
          />
          <Input name="barcode" label="Barcode" value={formData.barcode}
            onChange={(e) =>
              setFormData({ ...formData, barcode: e.target.value })
            }
          />
          <Input
            name="category"
            label="Category"
            type="select"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            options={categories.map((c) => ({
              value: c._id,
              label: c.name,
            }))}
          />
          <Input
            name="sellingPrice"
            label="Selling Price"
            type="number"
            value={formData.sellingPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                sellingPrice: Number(e.target.value),
              })
            }
          />
          <Input
            name="costPrice"
            label="Cost Price"
            type="number"
            value={formData.costPrice}
            onChange={(e) =>
              setFormData({
                ...formData,
                costPrice: Number(e.target.value),
              })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
