// Shared types for the POS system
export type Product = {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  barcode?: string;
  category: string | Category;          // ObjectId
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  unit?: string;
  taxRate?: number;
  image?: string;
  minStockLevel?: number;
  isActive: boolean;

  // backend virtuals (optional)
  profitMargin?: number;
  sellingPriceWithTax?: number;
};

export type Category = {
  _id: string;
  name: string;
  description?: string;
  parent?: string | null;
  image?: string;
  isActive: boolean;
  subcategories?: Category[];
};



export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
  totalPurchases: number;
  lastVisit?: Date;
  loyaltyPoints?: number;
  createdAt: Date;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customer?: Customer;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mobile' | 'bank';
  paymentStatus: 'paid' | 'partial' | 'pending';
  status: 'completed' | 'pending' | 'cancelled';
  employeeId: string;
  employeeName: string;
  notes?: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  imei?: string;
}

export interface Return {
  id: string;
  saleId: string;
  invoiceNumber: string;
  customer?: Customer;
  items: ReturnItem[];
  reason: string;
  refundAmount: number;
  refundMethod: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
  processedAt?: Date;
}

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  condition: 'new' | 'used' | 'damaged';
}

export interface RepairJob {
  id: string;
  jobNumber: string;
  customer: Customer;
  device: string;
  deviceType?: string;
  brand?: string;
  model?: string;
  imei?: string;
  issue: string;
  diagnosis?: string;
  estimatedCost: number;
  finalCost?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'waiting-parts' | 'ready' | 'received' | 'delivered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  technicianId?: string;
  technicianName?: string;
  parts: RepairPart[];
  laborCost?: number;
  notes?: string;
  createdAt: Date;
  expectedCompletionDate?: Date;
  completedAt?: Date;
}

export interface RepairPart {
  partId: string;
  partName: string;
  quantity: number;
  cost: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  paymentTerms?: string;
  notes?: string;
  createdAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: Supplier;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  cost: number;
  total: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  reference?: string;
  employeeId: string;
  employeeName: string;
  createdAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'sales' | 'technician' | 'cashier';
  permissions: string[];
  salary?: number;
  hireDate: Date;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface Warranty {
  id: string;
  registrationNumber: string;
  productId: string;
  productName: string;
  customer: Customer;
  saleId: string;
  startDate: Date;
  endDate: Date;
  duration: number; // months
  status: 'active' | 'expired' | 'claimed';
  terms?: string;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  claimNumber: string;
  customer: Customer;
  product: string;
  issue: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  claimDate: Date;
  resolution?: string;
  cost?: number;
}



export interface Brand {
  id: string;
  name: string;
  logo?: string;
  productCount: number;
}

export interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  minPurchase?: number;
  validFrom: Date;
  validTo: Date;
  applicableProducts?: string[];
  applicableCategories?: string[];
  status: 'active' | 'inactive';
}
