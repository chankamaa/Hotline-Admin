/**
 * Global Type Definitions for POS Admin System
 */

// ============ CATEGORY TYPES ============
export interface Category {
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
export interface ProductSupplier {
  name?: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface ProductOffer {
  isActive: boolean;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: string | Category;
  subcategory?: string | Category | null;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  unit: "piece" | "kg" | "g" | "liter" | "ml" | "meter" | "cm" | "box" | "pack" | "dozen";
  taxRate: number;
  warrantyDuration: number;
  warrantyType: "NONE" | "MANUFACTURER" | "SHOP" | "BOTH";
  warrantyDescription?: string;
  supplier?: ProductSupplier;
  minStockLevel: number;
  image?: string;
  offer?: ProductOffer;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Stock fields (populated when includeStock=true)
  stock?: number;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  // Virtuals from backend
  profitMargin?: number;
  sellingPriceWithTax?: number;
  hasActiveOffer?: boolean;
  effectivePrice?: number;
  discountAmount?: number;
}

// ============ USER TYPES ============
export interface User {
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
export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ REPAIR TYPES ============
export interface RepairJob {
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

// ============ CUSTOMER TYPES ============
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  totalPurchases?: number;
  lastVisit?: Date;
  loyaltyPoints?: number;
  createdAt: Date;
  notes?: string;
}

// ============ SUPPLIER TYPES ============
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt: Date;
}

// ============ STOCK TYPES ============
export interface LowStockItem {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  minStockLevel: number;
  category?: { name: string };
  urgencyLevel?: "critical" | "warning" | "medium" | "low";
}

// ============ NOTIFICATION TYPES ============
export interface AppNotification {
  id: string;
  type: "info" | "warning" | "error" | "success" | "repair" | "low_stock" | "sale" | "stock" | "warranty" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ============ API RESPONSE TYPES ============
export interface ApiResponse<T = any> {
  status: "success" | "error" | "fail";
  data?: T;
  message?: string;
  results?: number;
}

// ============ FORM TYPES ============
export interface SelectOption {
  value: string;
  label: string;
}
