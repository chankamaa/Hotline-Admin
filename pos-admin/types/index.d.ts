/**
 * Global Type Definitions for POS Admin System
 */

// ============ CATEGORY TYPES ============
interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: string | Category | null;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories?: Category[]; // populated in tree view
  fullPath?: string; // returned by GET /:id
}

// ============ PRODUCT TYPES ============
interface Product {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: string | Category;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  unit: "piece" | "kg" | "g" | "liter" | "ml" | "meter" | "cm" | "box" | "pack" | "dozen";
  taxRate: number;
  warrantyDuration: number;
  warrantyType: "NONE" | "MANUFACTURER" | "SHOP" | "BOTH";
  warrantyDescription?: string;
  image?: string;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profitMargin?: number;
  sellingPriceWithTax?: number;
}

// ============ USER TYPES ============
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ ROLE TYPES ============
interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ REPAIR TYPES ============
interface RepairJob {
  _id: string;
  customerName: string;
  customerPhone: string;
  deviceType: string;
  deviceModel?: string;
  issue: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELIVERED" | "CANCELLED";
  estimatedCost?: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
}

// ============ API RESPONSE TYPES ============
interface ApiResponse<T = any> {
  status: "success" | "error" | "fail";
  data?: T;
  message?: string;
  results?: number;
}

// ============ FORM TYPES ============
interface SelectOption {
  value: string;
  label: string;
}
