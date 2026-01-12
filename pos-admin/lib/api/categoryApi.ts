// src/lib/categoryApi.ts
import { api } from "./api";
import type { Category } from "../types";

/* ---------------------------------------------
   Backend response shapes
--------------------------------------------- */

type CategoryListResponse = {
  status: string;
  results?: number;
  data: {
    categories: Category[];
  };
};

type SingleCategoryResponse = {
  status: string;
  data: {
    category: Category;
  };
};

/* ---------------------------------------------
   Get category tree (for sidebar, dropdowns)
   GET /api/v1/categories?tree=true
--------------------------------------------- */
export async function fetchCategoryTree(includeInactive = false) {
  const query = new URLSearchParams();
  query.set("tree", "true");
  if (includeInactive) query.set("includeInactive", "true");

  return api<CategoryListResponse>(
    `/api/v1/categories?${query.toString()}`
  );
}

/* ---------------------------------------------
   Get flat category list
   GET /api/v1/categories
--------------------------------------------- */
export async function fetchCategories(params?: {
  parent?: string;
  includeInactive?: boolean;
}) {
  const query = new URLSearchParams();

  if (params?.parent) query.set("parent", params.parent);
  if (params?.includeInactive) query.set("includeInactive", "true");

  return api<CategoryListResponse>(
    `/api/v1/categories?${query.toString()}`
  );
}

/* ---------------------------------------------
   Get single category by ID
   GET /api/v1/categories/:id
--------------------------------------------- */
export async function fetchCategoryById(categoryId: string) {
  return api<SingleCategoryResponse>(
    `/api/v1/categories/${categoryId}`
  );
}

/* ---------------------------------------------
   Create category
   POST /api/v1/categories
--------------------------------------------- */
export async function createCategory(payload: {
  name: string;
  description?: string;
  parent?: string | null;
  image?: string;
}) {
  return api<SingleCategoryResponse>(
    "/api/v1/categories",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

/* ---------------------------------------------
   Update category
   PUT /api/v1/categories/:id
--------------------------------------------- */
export async function updateCategory(
  categoryId: string,
  payload: Partial<{
    name: string;
    description: string;
    parent: string | null;
    image: string;
    isActive: boolean;
  }>
) {
  return api<SingleCategoryResponse>(
    `/api/v1/categories/${categoryId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

/* ---------------------------------------------
   Soft delete (deactivate) category
   DELETE /api/v1/categories/:id
--------------------------------------------- */
export async function deleteCategory(categoryId: string) {
  return api<{
    status: string;
    message: string;
  }>(
    `/api/v1/categories/${categoryId}`,
    {
      method: "DELETE",
    }
  );
}
