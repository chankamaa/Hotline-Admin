import { api } from "./api";


/* =====================================================
   Response Types (match backend responses)
===================================================== */

type CategoryListResponse = {
  status: "success";
  results?: number;
  data: {
    categories: Category[];
  };
};

type SingleCategoryResponse = {
  status: "success";
  data: {
    category: Category & {
      fullPath?: string; // only returned by GET /:id
    };
  };
};

type DeleteCategoryResponse = {
  status: "success";
  message: string;
};

/* =====================================================
   GET: Categories (tree / flat / by parent)
   GET /api/v1/categories
===================================================== */

/**
 * Fetch categories
 * @param options.tree - return hierarchical tree
 * @param options.parent - fetch children of a parent
 * @param options.includeInactive - include inactive categories
 */
export async function fetchCategories(options?: {
  tree?: boolean;
  parent?: string;
  includeInactive?: boolean;
}) {
  const params = new URLSearchParams();

  if (options?.tree) params.set("tree", "true");
  if (options?.parent) params.set("parent", options.parent);
  if (options?.includeInactive) params.set("includeInactive", "true");

  return api<CategoryListResponse>(
    `/api/v1/categories?${params.toString()}`
  );
}

/* =====================================================
   GET: Single category by ID
   GET /api/v1/categories/:id
===================================================== */

export async function fetchCategoryById(categoryId: string) {
  return api<SingleCategoryResponse>(
    `/api/v1/categories/${categoryId}`
  );
}

/* =====================================================
   POST: Create category
   POST /api/v1/categories
===================================================== */

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
      body: payload,
    }
  );
}

/* =====================================================
   PUT: Update category
   PUT /api/v1/categories/:id
===================================================== */

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
      body: payload,
    }
  );
}

/* =====================================================
   DELETE: Soft delete category
   DELETE /api/v1/categories/:id
===================================================== */

export async function deleteCategory(categoryId: string) {
  return api<DeleteCategoryResponse>(
    `/api/v1/categories/${categoryId}`,
    {
      method: "DELETE",
    }
  );
}
