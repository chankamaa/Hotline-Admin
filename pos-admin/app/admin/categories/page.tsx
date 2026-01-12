"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tags, Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/lib/types";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categoryApi";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  /* --------------------------------------------------
     Load categories from backend
  -------------------------------------------------- */
  const loadCategories = async () => {
    setLoading(true);
    const res = await fetchCategories();
    setCategories(res.data.categories);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /* --------------------------------------------------
     Modal helpers
  -------------------------------------------------- */
  const openNew = () => {
    setEditingCategory(null);
    setForm({ name: "", description: "", isActive: true });
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setModalOpen(true);
  };

  /* --------------------------------------------------
     Save (create / update)
  -------------------------------------------------- */
  const handleSave = async () => {
    if (!form.name.trim()) return alert("Category name is required");

    if (editingCategory) {
      await updateCategory(editingCategory._id, form);
    } else {
      await createCategory(form);
    }

    setModalOpen(false);
    loadCategories();
  };

  /* --------------------------------------------------
     Delete (soft delete)
  -------------------------------------------------- */
  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this category?")) return;
    await deleteCategory(id);
    loadCategories();
  };

  /* --------------------------------------------------
     Status pill
  -------------------------------------------------- */
  const statusPill = (active: boolean) => (
    <span
      className={`px-2 py-1 rounded-full text-xs ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Categories"
        description="Manage product categories"
      />

      <div className="bg-white border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tags size={18} className="text-gray-600" />
            <div>
              <div className="font-semibold">Categories</div>
              <div className="text-xs text-gray-500">
                List and maintain categories
              </div>
            </div>
          </div>
          <Button onClick={openNew}>Add Category</Button>
        </div>

        <div className="divide-y border rounded-lg">
          {loading && (
            <div className="px-3 py-4 text-sm text-gray-500">
              Loading categories...
            </div>
          )}

          {!loading &&
            categories.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between px-3 py-3"
              >
                <div>
                  <div className="font-medium text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.description || "No description"}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {statusPill(c.isActive)}
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    aria-label="Edit category"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-red-600"
                    aria-label="Delete category"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}

          {!loading && categories.length === 0 && (
            <div className="px-3 py-4 text-sm text-gray-500">
              No categories yet
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add Category"}
        size="md"
      >
        <Input
          name="name"
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />

        <Input
          name="description"
          label="Description"
          type="textarea"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          rows={3}
        />

        <Input
          name="isActive"
          label="Status"
          type="select"
          value={form.isActive ? "active" : "inactive"}
          onChange={(e) =>
            setForm({ ...form, isActive: e.target.value === "active" })
          }
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
