"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  fetchWarranties,
  type Warranty,
  type GetWarrantiesParams,
} from "@/lib/api/warrantyApi";
import {
  generateWarrantyReportPDF,
  generateWarrantyCertificatePDF,
  type WarrantyForPDF,
} from "@/lib/pdf-utils";
import { useToast } from "@/providers/toast-provider";
import { Download, FileText, Loader2, Filter, ShieldCheck } from "lucide-react";

interface WarrantyPDFDownloadProps {
  /** Show as a compact button or full panel */
  variant?: "button" | "panel";
  /** Initial status filter */
  initialStatus?: GetWarrantiesParams["status"];
  /** Initial warranty type filter */
  initialType?: GetWarrantiesParams["warrantyType"];
}

const WARRANTY_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CLAIMED", label: "Claimed" },
  { value: "VOID", label: "Void" },
];

const WARRANTY_TYPES = [
  { value: "", label: "All Types" },
  { value: "MANUFACTURER", label: "Manufacturer" },
  { value: "SHOP", label: "Shop" },
  { value: "EXTENDED", label: "Extended" },
  { value: "REPAIR", label: "Repair" },
];

export function WarrantyPDFDownload({
  variant = "panel",
  initialStatus,
  initialType,
}: WarrantyPDFDownloadProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialStatus || ""
  );
  const [selectedType, setSelectedType] = useState<string>(initialType || "");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const params: GetWarrantiesParams = {
        limit: 1000,
      };

      if (selectedStatus) {
        params.status = selectedStatus as GetWarrantiesParams["status"];
      }
      if (selectedType) {
        params.warrantyType =
          selectedType as GetWarrantiesParams["warrantyType"];
      }

      const res = await fetchWarranties(params);
      const warranties = res.data.warranties;

      if (warranties.length === 0) {
        toast.warning("No warranties found for the selected criteria");
        setIsLoading(false);
        return;
      }

      // Map to PDF format
      const pdfWarranties: WarrantyForPDF[] = warranties.map((w) => ({
        _id: w._id,
        warrantyNumber: w.warrantyNumber,
        productName: w.productName,
        serialNumber: w.serialNumber,
        customer: w.customer,
        warrantyType: w.warrantyType,
        durationMonths: w.durationMonths,
        startDate: w.startDate,
        endDate: w.endDate,
        status: w.status,
        claims: w.claims?.map((c) => ({
          claimNumber: c.claimNumber,
          issue: c.issue,
          resolution: c.resolution,
          claimDate: c.claimDate,
        })),
        notes: w.notes,
        createdAt: w.createdAt,
      }));

      // Build filter label
      const filterParts: string[] = [];
      if (selectedStatus) {
        filterParts.push(
          WARRANTY_STATUSES.find((s) => s.value === selectedStatus)?.label ||
            selectedStatus
        );
      }
      if (selectedType) {
        filterParts.push(
          WARRANTY_TYPES.find((t) => t.value === selectedType)?.label ||
            selectedType
        );
      }
      const filterLabel =
        filterParts.length > 0 ? filterParts.join(" - ") : undefined;

      generateWarrantyReportPDF(pdfWarranties, filterLabel);
      toast.success(`PDF downloaded with ${warranties.length} warranties`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compact button variant
  if (variant === "button") {
    return (
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant="secondary"
        size="md"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export PDF
      </Button>
    );
  }

  // Full panel variant
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            Download Warranties as PDF
          </h3>
          <p className="text-sm text-gray-500">
            Generate a PDF report of warranty records
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4" />
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border  text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {WARRANTY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <ShieldCheck className="w-4 h-4" />
            Filter by Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full  text-gray-500 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {WARRANTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info text */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            {selectedStatus || selectedType ? (
              <>
                Showing{" "}
                {selectedStatus && (
                  <span className="font-medium">
                    {WARRANTY_STATUSES.find((s) => s.value === selectedStatus)
                      ?.label || selectedStatus}
                  </span>
                )}
                {selectedStatus && selectedType && " "}
                {selectedType && (
                  <span className="font-medium">
                    {WARRANTY_TYPES.find((t) => t.value === selectedType)
                      ?.label || selectedType}
                  </span>
                )}{" "}
                warranties.
              </>
            ) : (
              <>All warranties will be included in the PDF.</>
            )}
          </p>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isLoading}
          variant="primary"
          size="lg"
          fullWidth
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Warranty Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Button to download a single warranty certificate
 */
interface WarrantyCertificateButtonProps {
  warranty: Warranty;
  variant?: "button" | "icon";
  companyInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
  };
}

export function WarrantyCertificateButton({
  warranty,
  variant = "button",
  companyInfo,
}: WarrantyCertificateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const pdfWarranty: WarrantyForPDF = {
        _id: warranty._id,
        warrantyNumber: warranty.warrantyNumber,
        productName: warranty.productName,
        serialNumber: warranty.serialNumber,
        customer: warranty.customer,
        warrantyType: warranty.warrantyType,
        durationMonths: warranty.durationMonths,
        startDate: warranty.startDate,
        endDate: warranty.endDate,
        status: warranty.status,
        claims: warranty.claims?.map((c) => ({
          claimNumber: c.claimNumber,
          issue: c.issue,
          resolution: c.resolution,
          claimDate: c.claimDate,
        })),
        notes: warranty.notes,
        createdAt: warranty.createdAt,
      };

      generateWarrantyCertificatePDF(pdfWarranty, companyInfo);
      toast.success("Warranty certificate downloaded");
    } catch (error) {
      console.error("Failed to generate certificate:", error);
      toast.error("Failed to generate certificate");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Download Certificate"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isLoading}
      variant="secondary"
      size="sm"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Download Certificate
    </Button>
  );
}
