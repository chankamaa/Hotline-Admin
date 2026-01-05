"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tags, Factory, Pencil, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
};

type Brand = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
};

const seedCategories: Category[] = [
  { id: "c1", name: "Electronics", description: "Electronic devices and gadgets", status: "active" },
  { id: "c2", name: "Beverages", description: "Beverages", status: "active" },
  { id: "c3", name: "Cakes", description: "Cakes and pastries", status: "active" },
];

const seedBrands: Brand[] = [
  { id: "b1", name: "Apple", description: "Premium smartphones and accessories", status: "active" },
  { id: "b2", name: "Samsung", description: "Android smartphones and electronics", status: "active" },
  { id: "b3", name: "Xiaomi", description: "Value smartphones and accessories", status: "active" },
  { id: "b4", name: "Anker", description: "Charging and power solutions", status: "active" },
  { id: "b5", name: "Spigen", description: "Phone cases and protection", status: "active" },
  { id: "b6", name: "Belkin", description: "Premium accessories", status: "active" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [brands, setBrands] = useState<Brand[]>(seedBrands);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const [brandForm, setBrandForm] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
  });

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", status: "active" });
    setEditingCategory(null);
  };

  const resetBrandForm = () => {
    setBrandForm({ name: "", description: "", status: "active" });
    setEditingBrand(null);
  };

  const openNewCategory = () => {
    resetCategoryForm();
    setCategoryModalOpen(true);
  };

  const openNewBrand = () => {
    resetBrandForm();
    setBrandModalOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || "",
      status: category.status,
    });
    setCategoryModalOpen(true);
  };

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name,
      description: brand.description || "",
      status: brand.status,
    });
    setBrandModalOpen(true);
  };

  const handleSaveCategory = () => {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...categoryForm } : c))
      );
    } else {
      setCategories((prev) => [
        ...prev,
        { id: `c${Date.now()}`, ...categoryForm },
      ]);
    }
    setCategoryModalOpen(false);
    resetCategoryForm();
  };

  const handleSaveBrand = () => {
    if (editingBrand) {
      setBrands((prev) =>
        prev.map((b) => (b.id === editingBrand.id ? { ...b, ...brandForm } : b))
      );
    } else {
      setBrands((prev) => [
        ...prev,
        { id: `b${Date.now()}`, ...brandForm },
      ]);
    }
    setBrandModalOpen(false);
    resetBrandForm();
  };

  const statusPill = (status: "active" | "inactive") => (
    <span
      className={
        status === "active"
          ? "px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"
          : "px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600"
      }
    >
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Categories & Brands"
        description="Manage product categories and brand information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Categories */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tags size={18} className="text-gray-600" />
              <div>
                <div className="font-semibold">Categories</div>
                <div className="text-xs text-gray-500">List and maintain categories</div>
              </div>
            </div>
            <Button onClick={openNewCategory}>Add Category</Button>
          </div>

          <div className="divide-y border rounded-lg">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3 py-3">
                <div>
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.description || "No description"}</div>
                </div>
                <div className="flex items-center gap-3">
                  {statusPill(c.status)}
                  <button
                    onClick={() => openEditCategory(c)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Edit category"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setCategories((prev) => prev.filter((x) => x.id !== c.id))}
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                    aria-label="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500">No categories yet</div>
            )}
          </div>
        </div>

        {/* Brands */}
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory size={18} className="text-gray-600" />
              <div>
                <div className="font-semibold">Brands</div>
                <div className="text-xs text-gray-500">Manage product brands</div>
              </div>
            </div>
            <Button onClick={openNewBrand}>Add Brand</Button>
          </div>

          <div className="divide-y border rounded-lg">
            {brands.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-3">
                <div>
                  <div className="font-medium text-gray-900">{b.name}</div>
                  <div className="text-xs text-gray-500">{b.description || "No description"}</div>
                </div>
                <div className="flex items-center gap-3">
                  {statusPill(b.status)}
                  <button
                    onClick={() => openEditBrand(b)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Edit brand"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setBrands((prev) => prev.filter((x) => x.id !== b.id))}
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                    aria-label="Delete brand"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {brands.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500">No brands yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <Input
          label="Name"
          name="name"
          value={categoryForm.name}
          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
          required
        />
        <Input
          label="Description"
          name="description"
          type="textarea"
          value={categoryForm.description}
          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
          rows={3}
        />
        <Input
          label="Status"
          name="status"
          type="select"
          value={categoryForm.status}
          onChange={(e) =>
            setCategoryForm({ ...categoryForm, status: e.target.value as "active" | "inactive" })
          }
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setCategoryModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveCategory}>Save</Button>
        </div>
      </Modal>

      {/* Brand Modal */}
      <Modal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        title={editingBrand ? "Edit Brand" : "Add Brand"}
        size="md"
      >
        <Input
          label="Name"
          name="name"
          value={brandForm.name}
          onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
          required
        />
        <Input
          label="Description"
          name="description"
          type="textarea"
          value={brandForm.description}
          onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
          rows={3}
        />
        <Input
          label="Status"
          name="status"
          type="select"
          value={brandForm.status}
          onChange={(e) => setBrandForm({ ...brandForm, status: e.target.value as "active" | "inactive" })}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => setBrandModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveBrand}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
