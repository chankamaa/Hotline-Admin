/**
 * Warranty API Service
 * Fully aligned with backend warranty controller & router
 */

import { api } from "./api";

/* ----------------------------------
   Request Types
---------------------------------- */

export interface CreateWarrantyRequest {
  productId: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  warrantyType?: "MANUFACTURER" | "SHOP" | "EXTENDED" | "REPAIR";
  durationMonths?: number;
  serialNumber?: string;
  startDate?: string;
  notes?: string;
}

export interface CreateClaimRequest {
  issue: string;
  resolution?: "REPAIR" | "REPLACE" | "REFUND" | "REJECTED";
  repairJobId?: string;
  notes?: string;
}

export interface UpdateClaimRequest {
  resolution?: "REPAIR" | "REPLACE" | "REFUND" | "REJECTED";
  repairJobId?: string;
  notes?: string;
}

export interface VoidWarrantyRequest {
  reason: string;
}

export interface GetWarrantiesParams {
  status?: "ACTIVE" | "EXPIRED" | "CLAIMED" | "VOID";
  warrantyType?: "MANUFACTURER" | "SHOP" | "EXTENDED" | "REPAIR";
  phone?: string;
  productId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface GetWarrantyStatsParams {
  startDate?: string;
  endDate?: string;
}

/* ----------------------------------
   Response Types
---------------------------------- */

export interface WarrantyClaim {
  _id: string;
  claimNumber: string;
  claimDate: string;
  issue: string;
  resolution?: "REPAIR" | "REPLACE" | "REFUND" | "REJECTED";
  repairJob?: string | {
    _id: string;
    jobNumber: string;
  };
  resolvedDate?: string;
  notes?: string;
  processedBy: {
    _id: string;
    username: string;
  };
}

export interface Warranty {
  _id: string;
  warrantyNumber: string;
  sourceType: "SALE" | "REPAIR" | "MANUAL";
  sale?: string | {
    _id: string;
    saleNumber: string;
  };
  repairJob?: string | {
    _id: string;
    jobNumber: string;
  };
  
  product: string | {
    _id: string;
    name: string;
    sku?: string;
    image?: string;
  };
  productName: string;
  serialNumber?: string;
  
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  
  warrantyType: "MANUFACTURER" | "SHOP" | "EXTENDED" | "REPAIR";
  durationMonths: number;
  startDate: string;
  endDate: string;
  
  status: "ACTIVE" | "EXPIRED" | "CLAIMED" | "VOID";
  
  claims: WarrantyClaim[];
  totalClaims?: number;
  
  voidedBy?: {
    _id: string;
    username: string;
  };
  voidedAt?: string;
  voidReason?: string;
  
  notes?: string;
  
  createdBy: {
    _id: string;
    username: string;
  };
  
  createdAt: string;
  updatedAt: string;
  
  // Virtuals
  daysRemaining?: number;
  isValid?: boolean;
}

export interface WarrantyValidity {
  valid: boolean;
  reason?: string;
  daysRemaining?: number;
  endDate?: string;
  status?: string;
}

export interface WarrantyWithValidity extends Warranty {
  validity: WarrantyValidity;
}

export interface WarrantyStats {
  summary: {
    totalWarranties: number;
    activeWarranties: number;
    claimedWarranties: number;
    expiredWarranties: number;
    voidedWarranties: number;
    totalClaims: number;
  };
  byType: {
    MANUFACTURER?: number;
    SHOP?: number;
    EXTENDED?: number;
    REPAIR?: number;
  };
  expiredUpdated: number;
}

export interface WarrantyTypeInfo {
  key: string;
  value: string;
}

export interface WarrantyTypesData {
  warrantyTypes: WarrantyTypeInfo[];
  warrantyStatuses: WarrantyTypeInfo[];
  claimResolutions: WarrantyTypeInfo[];
}

/* ----------------------------------
   API Response Wrappers
---------------------------------- */

interface WarrantyListResponse {
  status: "success";
  results: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: {
    warranties: Warranty[];
  };
}

interface SingleWarrantyResponse {
  status: "success";
  data: {
    warranty: Warranty;
  };
}

interface WarrantyWithValidityResponse {
  status: "success";
  data: {
    warranty: Warranty;
    validity: WarrantyValidity;
  };
}

interface WarrantyStatusResponse {
  status: "success";
  data: {
    warrantyNumber: string;
    product: {
      _id: string;
      name: string;
      sku?: string;
    };
    customer: {
      name: string;
      phone: string;
      email?: string;
    };
    warrantyStatus: string;
    valid: boolean;
    reason?: string;
    daysRemaining?: number;
    startDate: string;
    endDate: string;
    totalClaims: number;
  };
}

interface CreateClaimResponse {
  status: "success";
  message: string;
  data: {
    warranty: Warranty;
    newClaim: WarrantyClaim;
  };
}

interface UpdateClaimResponse {
  status: "success";
  message: string;
  data: {
    warranty: Warranty;
  };
}

interface VoidWarrantyResponse {
  status: "success";
  message: string;
  data: {
    warranty: Warranty;
  };
}

interface WarrantiesWithValidityResponse {
  status: "success";
  results: number;
  data: {
    warranties: WarrantyWithValidity[];
  };
}

interface ExpiringWarrantiesResponse {
  status: "success";
  results: number;
  data: {
    expiringIn: string;
    warranties: Warranty[];
  };
}

interface WarrantyStatsResponse {
  status: "success";
  data: WarrantyStats;
}

interface WarrantyTypesResponse {
  status: "success";
  data: WarrantyTypesData;
}

/* =====================================================
   POST: Create new warranty (manual)
   POST /api/v1/warranties
===================================================== */

export async function createWarranty(payload: CreateWarrantyRequest) {
  return api<SingleWarrantyResponse>(
    "/api/v1/warranties",
    {
      method: "POST",
      body: payload as any,
    }
  );
}

/* =====================================================
   GET: All warranties with filters and pagination
   GET /api/v1/warranties
===================================================== */

export async function fetchWarranties(params?: GetWarrantiesParams) {
  const query = new URLSearchParams();

  if (params?.status) query.set("status", params.status);
  if (params?.warrantyType) query.set("warrantyType", params.warrantyType);
  if (params?.phone) query.set("phone", params.phone);
  if (params?.productId) query.set("productId", params.productId);
  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  return api<WarrantyListResponse>(
    `/api/v1/warranties?${query.toString()}`
  );
}

/* =====================================================
   GET: Single warranty by ID
   GET /api/v1/warranties/:id
===================================================== */

export async function fetchWarrantyById(warrantyId: string) {
  return api<SingleWarrantyResponse>(
    `/api/v1/warranties/${warrantyId}`
  );
}

/* =====================================================
   GET: Warranty by warranty number
   GET /api/v1/warranties/number/:warrantyNumber
===================================================== */

export async function fetchWarrantyByNumber(warrantyNumber: string) {
  return api<WarrantyWithValidityResponse>(
    `/api/v1/warranties/number/${warrantyNumber}`
  );
}

/* =====================================================
   GET: Search warranties by customer phone
   GET /api/v1/warranties/customer/:phone
===================================================== */

export async function searchWarrantiesByPhone(phone: string) {
  return api<WarrantiesWithValidityResponse>(
    `/api/v1/warranties/customer/${phone}`
  );
}

/* =====================================================
   GET: Check warranty status/validity
   GET /api/v1/warranties/:id/status
===================================================== */

export async function checkWarrantyStatus(warrantyId: string) {
  return api<WarrantyStatusResponse>(
    `/api/v1/warranties/${warrantyId}/status`
  );
}

/* =====================================================
   POST: Create warranty claim
   POST /api/v1/warranties/:id/claims
===================================================== */

export async function createClaim(
  warrantyId: string,
  payload: CreateClaimRequest
) {
  return api<CreateClaimResponse>(
    `/api/v1/warranties/${warrantyId}/claims`,
    {
      method: "POST",
      body: payload as any,
    }
  );
}

/* =====================================================
   PUT: Update warranty claim
   PUT /api/v1/warranties/:id/claims/:claimId
===================================================== */

export async function updateClaim(
  warrantyId: string,
  claimId: string,
  payload: UpdateClaimRequest
) {
  return api<UpdateClaimResponse>(
    `/api/v1/warranties/${warrantyId}/claims/${claimId}`,
    {
      method: "PUT",
      body: payload as any,
    }
  );
}

/* =====================================================
   POST: Void a warranty
   POST /api/v1/warranties/:id/void
===================================================== */

export async function voidWarranty(
  warrantyId: string,
  payload: VoidWarrantyRequest
) {
  return api<VoidWarrantyResponse>(
    `/api/v1/warranties/${warrantyId}/void`,
    {
      method: "POST",
      body: payload as any,
    }
  );
}

/* =====================================================
   GET: Warranties expiring soon
   GET /api/v1/warranties/expiring
===================================================== */

export async function fetchExpiringSoon(days: number = 30) {
  return api<ExpiringWarrantiesResponse>(
    `/api/v1/warranties/expiring?days=${days}`
  );
}

/* =====================================================
   GET: Warranty statistics
   GET /api/v1/warranties/stats
===================================================== */

export async function fetchWarrantyStats(params?: GetWarrantyStatsParams) {
  const query = new URLSearchParams();

  if (params?.startDate) query.set("startDate", params.startDate);
  if (params?.endDate) query.set("endDate", params.endDate);

  const queryString = query.toString();
  const url = queryString 
    ? `/api/v1/warranties/stats?${queryString}`
    : `/api/v1/warranties/stats`;

  return api<WarrantyStatsResponse>(url);
}

/* =====================================================
   GET: Warranty types and statuses (for dropdowns)
   GET /api/v1/warranties/types
===================================================== */

export async function fetchWarrantyTypes() {
  return api<WarrantyTypesResponse>(
    `/api/v1/warranties/types`
  );
}

/* =====================================================
   Helper Functions
===================================================== */

/**
 * Check if warranty is currently valid (active and not expired)
 */
export function isWarrantyValid(warranty: Warranty): boolean {
  if (warranty.status === "VOID") return false;
  if (warranty.status === "EXPIRED") return false;
  
  const now = new Date();
  const endDate = new Date(warranty.endDate);
  
  return now <= endDate;
}

/**
 * Calculate days remaining for a warranty
 */
export function calculateDaysRemaining(warranty: Warranty): number {
  if (warranty.status === "VOID") return 0;
  
  const now = new Date();
  const endDate = new Date(warranty.endDate);
  const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diff);
}

/**
 * Format warranty number for display
 */
export function formatWarrantyNumber(warrantyNumber: string): string {
  return warrantyNumber;
}

/**
 * Get warranty status display color
 */
export function getWarrantyStatusColor(status: Warranty["status"]): string {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "CLAIMED":
      return "yellow";
    case "EXPIRED":
      return "gray";
    case "VOID":
      return "red";
    default:
      return "gray";
  }
}

/**
 * Get warranty type display label
 */
export function getWarrantyTypeLabel(type: Warranty["warrantyType"]): string {
  switch (type) {
    case "MANUFACTURER":
      return "Manufacturer Warranty";
    case "SHOP":
      return "Shop Warranty";
    case "EXTENDED":
      return "Extended Warranty";
    case "REPAIR":
      return "Repair Warranty";
    default:
      return type;
  }
}

/**
 * Get claim resolution display label
 */
export function getClaimResolutionLabel(resolution?: WarrantyClaim["resolution"]): string {
  if (!resolution) return "Pending";
  
  switch (resolution) {
    case "REPAIR":
      return "Repaired";
    case "REPLACE":
      return "Replaced";
    case "REFUND":
      return "Refunded";
    case "REJECTED":
      return "Rejected";
    default:
      return resolution;
  }
}

/**
 * Check if warranty can have a new claim
 */
export function canCreateClaim(warranty: Warranty): { can: boolean; reason?: string } {
  if (warranty.status === "VOID") {
    return { can: false, reason: "Warranty has been voided" };
  }
  
  if (warranty.status === "EXPIRED") {
    return { can: false, reason: "Warranty has expired" };
  }
  
  const now = new Date();
  const endDate = new Date(warranty.endDate);
  
  if (now > endDate) {
    return { can: false, reason: "Warranty has expired" };
  }
  
  return { can: true };
}

/**
 * Format warranty duration for display
 */
export function formatWarrantyDuration(months: number): string {
  if (months === 0) return "No warranty";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }
  
  return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
}
