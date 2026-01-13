import { api } from "./api";


/* =====================================================
   Response Types (match backend exactly)
===================================================== */

type ProductListResponse = {
  status: "success";
  results: number;
  pagination?: {
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
  status: "success";
  data: {
    product: Product;
  };
};

type DeleteProductResponse = {
  status: "success";
  message: string;
};

/* =====================================================
   GET: Products (list + filters + pagination)
   GET /api/v1/products
===================================================== */

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}) {
  const query = new URLSearchParams();

  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);
  if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params?.isActive !== undefined) query.set("isActive", String(params.isActive));
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.sort) query.set("sort", params.sort);

  return api<ProductListResponse>(
    `/api/v1/products?${query.toString()}`
  );
}

/* =====================================================
   GET: Single product by ID
   GET /api/v1/products/:id
===================================================== */

export async function fetchProductById(productId: string) {
  return api<SingleProductResponse>(
    `/api/v1/products/${productId}`
  );
}

/* =====================================================
   GET: Product by barcode (POS)
   GET /api/v1/products/barcode/:barcode
===================================================== */

export async function fetchProductByBarcode(barcode: string) {
  return api<SingleProductResponse>(
    `/api/v1/products/barcode/${barcode}`
  );
}

/* =====================================================
   GET: Products by category
   GET /api/v1/products/category/:categoryId
===================================================== */

export async function fetchProductsByCategory(categoryId: string) {
  return api<ProductListResponse>(
    `/api/v1/products/category/${categoryId}`
  );
}

/* =====================================================
   GET: Quick search (POS)
   GET /api/v1/products/search?q=...
===================================================== */

export async function searchProducts(query: string) {
  return api<ProductListResponse>(
    `/api/v1/products/search?q=${encodeURIComponent(query)}`
  );
}

/* =====================================================
   POST: Create product
   POST /api/v1/products
===================================================== */

export async function createProduct(payload: {
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number | null;
  unit?: Product["unit"];
  taxRate?: number;
  image?: string;
  minStockLevel?: number;
}) {
  return api<SingleProductResponse>(
    "/api/v1/products",
    {
      method: "POST",
      body: payload,
    }
  );
}

/* =====================================================
   PUT: Update product
   PUT /api/v1/products/:id
===================================================== */

export async function updateProduct(
  productId: string,
  payload: Partial<{
    name: string;
    description: string;
    sku: string;
    barcode: string | null;
    category: string;
    costPrice: number;
    sellingPrice: number;
    wholesalePrice: number | null;
    unit: Product["unit"];
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
      body: payload,
    }
  );
}

/* =====================================================
   DELETE: Soft delete product
   DELETE /api/v1/products/:id
===================================================== */

export async function deleteProduct(productId: string) {
  return api<DeleteProductResponse>(
    `/api/v1/products/${productId}`,
    {
      method: "DELETE",
    }
  );
}
