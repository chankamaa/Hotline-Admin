"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { repairApi, type RepairJob } from "@/lib/api/repairApi";
import {
  generateRepairRecordsReportPDF,
  generateSingleRepairJobPDF,
  type RepairRecordForPDF,
} from "@/lib/pdf-utils";
import { useToast } from "@/providers/toast-provider";
import { Download, FileText, Loader2, Filter, Wrench } from "lucide-react";

interface RepairPDFDownloadProps {
  /** Show as a compact button or full panel */
  variant?: "button" | "panel";
  /** Initial status filter */
  initialStatus?: string;
}

const REPAIR_STATUS_FILTERS = [
  { value: "", label: "All Statuses" },
  { value: "RECEIVED", label: "Received" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "READY", label: "Ready for Pickup" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

// Helper function to format job number as 5 digits
const formatJobNumber = (jobId: string): string => {
  // Extract RJ prefix and numeric part from job numbers like "RJ-20260209-0008" to "RJ-00008"
  const match = jobId.match(/^([A-Z]+).*-(\d+)$/);
  if (match) {
    const prefix = match[1]; // Just "RJ"
    const numericPart = match[2];
    return `${prefix}-${numericPart.padStart(5, '0')}`;
  }
  // Fallback: if pattern doesn't match, return original
  return jobId;
};

export function RepairPDFDownload({
  variant = "panel",
  initialStatus,
}: RepairPDFDownloadProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(
    initialStatus || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const mapRepairToPDF = (repair: RepairJob): RepairRecordForPDF => {
    const equipmentParts = [repair.device.brand, repair.device.model].filter(
      Boolean
    );
    const equipmentName =
      equipmentParts.length > 0 ? equipmentParts.join(" ") : repair.device.type;

    return {
      _id: repair._id,
      jobNumber: repair.jobNumber,
      equipmentName,
      brand: repair.device.brand,
      model: repair.device.model,
      customerName: repair.customer.name,
      customerPhone: repair.customer.phone,
      reportedIssue: repair.problemDescription,
      diagnosisNotes: repair.diagnosisNotes,
      repairActions: repair.repairNotes,
      status: repair.status,
      priority: repair.priority,
      technicianName:
        typeof repair.assignedTo === "object"
          ? repair.assignedTo?.username
          : undefined,
      laborCost: repair.laborCost || 0,
      partsTotal: repair.partsTotal || 0,
      totalCost: repair.totalCost || 0,
      receivedAt: repair.receivedAt,
      completedAt: repair.actualCompletionDate,
      createdAt: repair.createdAt,
    };
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 1000 };

      if (selectedStatus) {
        params.status = selectedStatus;
      }

      const res = await repairApi.getAll(params);
      const repairs = res.data?.repairs || [];

      if (repairs.length === 0) {
        toast.warning("No repair records found for the selected criteria");
        setIsLoading(false);
        return;
      }

      // Map to PDF format
      const pdfRepairs: RepairRecordForPDF[] = repairs.map(mapRepairToPDF);

      // Build filter label
      const filterStatus = selectedStatus
        ? REPAIR_STATUS_FILTERS.find((s) => s.value === selectedStatus)?.label
        : undefined;

      generateRepairRecordsReportPDF(pdfRepairs, {
        status: filterStatus,
      });

      toast.success(`PDF downloaded with ${pdfRepairs.length} repair records`);
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
            Download Repair Records as PDF
          </h3>
          <p className="text-sm text-gray-500">
            Generate a PDF report of repair job records
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
            className="w-full px-3 py-2 border text-gray-600 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {REPAIR_STATUS_FILTERS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info text */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            {selectedStatus ? (
              <>
                Showing only{" "}
                <span className="font-medium">
                  {REPAIR_STATUS_FILTERS.find((s) => s.value === selectedStatus)
                    ?.label || selectedStatus}
                </span>{" "}
                repair records.
              </>
            ) : (
              <>All repair records will be included in the PDF report.</>
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
              Download Repair Records
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Button to download a single repair job PDF
 */
interface SingleRepairJobPDFButtonProps {
  repairId: string;
  jobNumber?: string;
  variant?: "button" | "icon";
}

export function SingleRepairJobPDFButton({
  repairId,
  jobNumber,
  variant = "button",
}: SingleRepairJobPDFButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const res = await repairApi.getById(repairId);
      const repair = res.data?.repair;

      if (!repair) {
        throw new Error("Repair job not found");
      }

      const equipmentParts = [repair.device.brand, repair.device.model].filter(
        Boolean
      );
      const equipmentName =
        equipmentParts.length > 0
          ? equipmentParts.join(" ")
          : repair.device.type;

      const pdfRepair = {
        _id: repair._id,
        jobNumber: repair.jobNumber,
        equipmentName,
        brand: repair.device.brand,
        model: repair.device.model,
        serialNumber: repair.device.serialNumber,
        imei: repair.device.imei,
        color: repair.device.color,
        accessories: repair.device.accessories,
        condition: repair.device.condition,
        customerName: repair.customer.name,
        customerPhone: repair.customer.phone,
        reportedIssue: repair.problemDescription,
        diagnosisNotes: repair.diagnosisNotes,
        repairActions: repair.repairNotes,
        status: repair.status,
        priority: repair.priority,
        technicianName:
          typeof repair.assignedTo === "object"
            ? repair.assignedTo?.username
            : undefined,
        laborCost: repair.laborCost || 0,
        partsTotal: repair.partsTotal || 0,
        totalCost: repair.totalCost || 0,
        advancePayment: repair.advancePayment || 0,
        balanceDue: repair.balanceDue || 0,
        paymentStatus: repair.paymentStatus,
        receivedAt: repair.receivedAt,
        completedAt: repair.actualCompletionDate,
        createdAt: repair.createdAt,
        partsUsed: repair.partsUsed?.map((part) => ({
          productName: part.productName,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          total: part.total,
        })),
      };

      generateSingleRepairJobPDF(pdfRepair);
      toast.success("Repair job PDF downloaded");
    } catch (error) {
      console.error("Failed to generate repair PDF:", error);
      toast.error("Failed to generate repair PDF");
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
        title="Download Job PDF"
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
      {jobNumber ? `Download ${formatJobNumber(jobNumber)}` : "Download PDF"}
    </Button>
  );
}
