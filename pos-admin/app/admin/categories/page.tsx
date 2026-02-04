"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/providers/toast-provider";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api/categoryApi";
import {
  ChevronRight,
  ChevronDown,
  FolderPlus,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  Folder,
  FolderOpen,
} from "lucide-react";

/* --------------------------------------------------
   Category Tree Item Component
-------------------------------------------------- */
interface CategoryTreeItemProps {
  category: Category;
  level: number;
  onEdit: (category: Category) => void;
  onDelete: (categoryId: string) => void;
  onAddSubcategory: (parentId: string) => void;
}

function CategoryTreeItem({
  category,
  level,
  onEdit,
  onDelete,
  onAddSubcategory,
}: CategoryTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  return (
    <div className="border-l-2 border-gray-200">
      <div
        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded group"
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <div className="flex items-center gap-2 flex-1">
          {/* Expand/Collapse Button */}
          {hasSubcategories ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={16} className="text-gray-600" />
              ) : (
                <ChevronRight size={16} className="text-gray-600" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Folder Icon */}
          {isExpanded ? (
            <FolderOpen size={18} className="text-yellow-600" />
          ) : (
            <Folder size={18} className="text-yellow-600" />
          )}

          {/* Category Name and Description */}
          <div className="flex-1">
            <div className="font-medium text-gray-900">{category.name}</div>
            {category.description && (
              <div className="text-xs text-gray-500">{category.description}</div>
            )}
          </div>

          {/* Subcategory Count Badge */}
          {hasSubcategories && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {category.subcategories!.length} sub
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <button
            onClick={() => onAddSubcategory(category._id)}
            className="p-2 hover:bg-green-100 text-green-600 rounded"
            title="Add Subcategory"
          >
            <FolderPlus size={16} />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-2 hover:bg-blue-100 text-blue-600 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(category._id)}
            className="p-2 hover:bg-red-100 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Subcategories */}
      {hasSubcategories && isExpanded && (
        <div className="ml-4">
          {category.subcategories!.map((subcategory) => (
            <CategoryTreeItem
              key={subcategory._id}
              category={subcategory}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------
   Main Categories Page Component
-------------------------------------------------- */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [subcategoryCount, setSubcategoryCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    image: "",
  });

  const toast = useToast();

  /* --------------------------------------------------
     Load Categories
  -------------------------------------------------- */
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Load tree structure for display
      const treeRes = await fetchCategories({ tree: true });
      setCategories(treeRes.data.categories);

      // Load flat list for parent selection dropdown
      const flatRes = await fetchCategories();
      setAllCategories(flatRes.data.categories);
    } catch (error: any) {
      toast.error(error.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------
     Modal Handlers
  -------------------------------------------------- */
  const handleAdd = () => {
    setCurrentCategory(null);
    setParentIdForNew(null);
    setFormData({
      name: "",
      description: "",
      parent: "",
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleAddSubcategory = (parentId: string) => {
    setCurrentCategory(null);
    setParentIdForNew(parentId);
    setFormData({
      name: "",
      description: "",
      parent: parentId,
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setParentIdForNew(null);
    setFormData({
      name: category.name,
      description: category.description || "",
      parent: typeof category.parent === "string" ? category.parent : category.parent?._id || "",
      image: category.image || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error("Category name is required");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parent: formData.parent || null,
        image: formData.image.trim() || undefined,
      };

      if (currentCategory) {
        // Update existing category
        await updateCategory(currentCategory._id, payload);
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await createCategory(payload);
        toast.success("Category created successfully");
      }

      setIsModalOpen(false);
      loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    }
  };

  /* --------------------------------------------------
     Count all subcategories recursively
  -------------------------------------------------- */
  const countAllSubcategories = (category: Category): number => {
    if (!category.subcategories || category.subcategories.length === 0) {
      return 0;
    }
    
    let count = category.subcategories.length;
    category.subcategories.forEach((sub) => {
      count += countAllSubcategories(sub);
    });
    
    return count;
  };

  /* --------------------------------------------------
     Find category in tree by ID
  -------------------------------------------------- */
  const findCategoryById = (cats: Category[], targetId: string): Category | null => {
    for (const cat of cats) {
      if (cat._id === targetId) return cat;
      if (cat.subcategories) {
        const found = findCategoryById(cat.subcategories, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  /* --------------------------------------------------
     Open delete confirmation modal
  -------------------------------------------------- */
  const handleDeleteClick = (categoryId: string) => {
    const category = findCategoryById(categories, categoryId);
    if (!category) {
      toast.error("Category not found");
      return;
    }

    const subCount = countAllSubcategories(category);
    setCategoryToDelete(category);
    setSubcategoryCount(subCount);
    setIsDeleteModalOpen(true);
  };

  /* --------------------------------------------------
     Confirm and execute delete
  -------------------------------------------------- */
  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory(categoryToDelete._id);
      toast.success(
        subcategoryCount > 0
          ? `Category and ${subcategoryCount} subcategory(ies) deleted successfully`
          : "Category deleted successfully"
      );
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setSubcategoryCount(0);
      loadCategories();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to delete category";
      
      // Check if error is about subcategories
      if (errorMessage.includes("subcategories") || errorMessage.includes("active")) {
        toast.error(
          `Cannot delete this category because it has active subcategories. Please delete or move the subcategories first.`
        );
      } else {
        toast.error(errorMessage);
      }
    }
  };

  /* --------------------------------------------------
     Get Parent Category Name
  -------------------------------------------------- */
  const getParentCategoryName = (parentId: string) => {
    const parent = allCategories.find((c) => c._id === parentId);
    return parent ? parent.name : "Unknown";
  };

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6 text-gray-800">
      <PageHeader
        title="Product Categories"
        description="Manage product categories and subcategories hierarchy"
      />

      <div className="flex justify-between mb-4">
        <Button onClick={handleAdd} variant="primary">
          <Plus size={16} className="mr-2" />
          Add Main Category
        </Button>

        <Button onClick={() => loadCategories()} disabled={loading} variant="danger">
          <RefreshCw size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <Folder size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No categories yet</p>
            <Button onClick={handleAdd} variant="primary">
              <Plus size={16} className="mr-2" />
              Create Your First Category
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((category) => (
              <CategoryTreeItem
                key={category._id}
                category={category}
                level={0}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAddSubcategory={handleAddSubcategory}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          currentCategory
            ? "Edit Category"
            : parentIdForNew
            ? `Add Subcategory under "${getParentCategoryName(parentIdForNew)}"`
            : "Add Main Category"
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentCategory ? "Update" : "Create"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            placeholder="Enter category name"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="Description (Optional)"
            value={formData.description}
            placeholder="Enter description"
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {!parentIdForNew && (
            <Input
              label="Parent Category (Optional)"
              type="select"
              value={formData.parent}
              placeholder="Select parent category"
              onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
              options={[
                { value: "", label: "-- None (Main Category) --" },
                ...allCategories
                  .filter((c) => c._id !== currentCategory?._id) // Don't allow selecting self
                  .map((c) => ({
                    value: c._id,
                    label: c.name,
                  })),
              ]}
            />
          )}

          <Input
            label="Image URL (Optional)"
            value={formData.image}
            placeholder="Enter image URL"
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />

          {formData.image && (
            <div className="border rounded p-2">
              <img
                src={formData.image}
                alt="Preview"
                className="max-w-full h-32 object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EInvalid%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
          setSubcategoryCount(0);
        }}
        title="Delete Category"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
                setSubcategoryCount(0);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete {subcategoryCount > 0 ? `All (${subcategoryCount + 1})` : ""}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Warning Icon */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Category Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {categoryToDelete?.name}
            </h3>
            {categoryToDelete?.description && (
              <p className="text-sm text-gray-600 mb-3">
                {categoryToDelete.description}
              </p>
            )}
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="shrink-0">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">
                  Warning: This action cannot be undone
                </h4>
                {subcategoryCount > 0 ? (
                  <div className="text-sm text-red-700 space-y-1">
                    <p>
                      This category has <strong>{subcategoryCount}</strong>{" "}
                      subcategory(ies).
                    </p>
                    <p>
                      Deleting this category will also delete all its subcategories
                      and their nested children.
                    </p>
                    <div className="mt-2 p-2 bg-red-100 rounded border border-red-300">
                      <p className="font-semibold">
                        Total items to be deleted: {subcategoryCount + 1}
                      </p>
                      <p className="text-xs mt-1">
                        (1 main category + {subcategoryCount} subcategory(ies))
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-700">
                    This will permanently delete the category. Any products assigned
                    to this category may be affected.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              <strong>Before deleting, please ensure:</strong>
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
              <li>No products are currently assigned to this category</li>
              <li>You have backed up any important data</li>
              {subcategoryCount > 0 && (
                <li>
                  All {subcategoryCount} subcategory(ies) can be safely removed
                </li>
              )}
            </ul>
          </div>

          {/* Additional Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              If you're unsure, consider editing the category instead of deleting it.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
