// src/lib/productApi.ts
import { api } from "./api";
import type { Product } from "../types";

/* ---------------------------------------------
   Backend response shapes
--------------------------------------------- */

type ProductListResponse = {
  status: string;
  results: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: {
    products: Product[];
  };
};

type SingleProductResponse = {
  status: string;
  data: {
    product: Product;
  };
};

/* ---------------------------------------------
   Fetch products (list + filters + pagination)
--------------------------------------------- */
export async function fetchProducts(params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
  includeInactive?: boolean;
}) {
  const query = new URLSearchParams();

  if (params?.search) query.set("search", params.search);
  if (params?.category) query.set("category", params.category);
  if (params?.minPrice !== undefined)
    query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined)
    query.set("maxPrice", String(params.maxPrice));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sort) query.set("sort", params.sort);
  if (params?.includeInactive) query.set("includeInactive", "true");

  return api<ProductListResponse>(
    `/api/v1/products?${query.toString()}`
  );
}

/* ---------------------------------------------
   Get single product by ID
--------------------------------------------- */
export async function fetchProductById(productId: string) {
  return api<SingleProductResponse>(
    `/api/v1/products/${productId}`
  );
}

/* ---------------------------------------------
   Create product
--------------------------------------------- */
export async function createProduct(payload: {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: string; // categoryId
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  unit?: string;
  taxRate?: number;
  image?: string;
  minStockLevel?: number;
}) {
  return api<SingleProductResponse>(
    "/api/v1/products",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

/* ---------------------------------------------
   Update product
--------------------------------------------- */
export async function updateProduct(
  productId: string,
  payload: Partial<{
    name: string;
    description: string;
    sku: string;
    barcode: string;
    category: string;
    costPrice: number;
    sellingPrice: number;
    wholesalePrice: number;
    unit: string;
    taxRate: number;
    image: string;
    minStockLevel: number;
    isActive: boolean;
  }>
) {
  return api<SingleProductResponse>(
    `/api/v1/products/${productId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

/* ---------------------------------------------
   Soft delete product
--------------------------------------------- */
export async function deleteProduct(productId: string) {
  return api<{
    status: string;
    message: string;
  }>(
    `/api/v1/products/${productId}`,
    { method: "DELETE" }
  );
}

/* ---------------------------------------------
   Search product by barcode (POS scan)
--------------------------------------------- */
export async function fetchProductByBarcode(barcode: string) {
  return api<SingleProductResponse>(
    `/api/v1/products/barcode/${barcode}`
  );
}

/* ---------------------------------------------
   Get products by category (simple list)
--------------------------------------------- */
export async function fetchProductsByCategory(categoryId: string) {
  return api<{
    status: string;
    results: number;
    data: {
      products: Product[];
    };
  }>(
    `/api/v1/products/category/${categoryId}`
  );
}
