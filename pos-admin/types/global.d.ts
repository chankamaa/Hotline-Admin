/**
 * Global Type Definitions
 * These types are available throughout the application
 */

declare global {
  /* =====================================================
     Product Types
  ===================================================== */

  interface Product {
    _id: string;
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    category: string | Category;
    costPrice: number;
    sellingPrice: number;
    wholesalePrice?: number | null;
    unit: "piece" | "kg" | "g" | "liter" | "ml" | "meter" | "cm" | "box" | "pack" | "dozen";
    taxRate?: number;
    
    // Warranty information (default for this product)
    warrantyDuration: number; // Duration in MONTHS (0 = no warranty)
    warrantyType: "NONE" | "MANUFACTURER" | "SHOP" | "BOTH";
    warrantyDescription?: string;
    
    image?: string;
    minStockLevel?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    
    // Virtuals
    profitMargin?: number;
    sellingPriceWithTax?: number;
  }

  /* =====================================================
     Category Types
  ===================================================== */

  interface Category {
    _id: string;
    name: string;
    description?: string;
    parentCategory?: string | Category;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  /* =====================================================
     User Types
  ===================================================== */

  interface User {
    _id: string;
    username: string;
    email?: string;
    role?: string | Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Role {
    _id: string;
    name: string;
    description?: string;
    permissions: string[];
    isActive: boolean;
  }
}

export {};
