"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fetchStock } from "@/lib/api/inventoryApi";
import {
  generateStockReportPDF,
  type StockItemForPDF,
} from "@/lib/pdf-utils";
import { useToast } from "@/providers/toast-provider";
import { Download, FileText, Loader2, Filter, Package } from "lucide-react";

interface StockPDFDownloadProps {
  /** Show as a compact button or full panel */
  variant?: "button" | "panel";
  /** Initial status filter */
  initialStatus?: "all" | "in-stock" | "low-stock" | "out-of-stock";
}

const STOCK_STATUS_FILTERS = [
  { value: "all", label: "All Products" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export function StockPDFDownload({
  variant = "panel",
  initialStatus = "all",
}: StockPDFDownloadProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const getStockStatus = (item: any): "In Stock" | "Low Stock" | "Out of Stock" => {
    if (item.quantity === 0) return "Out of Stock";
    if (item.isLowStock || item.quantity <= item.product.minStockLevel) {
      return "Low Stock";
    }
    return "In Stock";
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const params: any = { limit: 1000 };

      if (selectedStatus === "low-stock") {
        params.lowStock = true;
      }

      const res = await fetchStock(params) as any;
      let stockItems = res.data?.stock || res.data?.items || [];

      if (stockItems.length === 0) {
        toast.warning("No stock items found");
        setIsLoading(false);
        return;
      }

      // Filter by status if needed
      if (selectedStatus === "out-of-stock") {
        stockItems = stockItems.filter((item: any) => item.quantity === 0);
      } else if (selectedStatus === "in-stock") {
        stockItems = stockItems.filter(
          (item: any) =>
            item.quantity > 0 &&
            !item.isLowStock &&
            item.quantity > item.product.minStockLevel
        );
      }

      if (stockItems.length === 0) {
        toast.warning("No stock items found for the selected criteria");
        setIsLoading(false);
        return;
      }

      // Map to PDF format
      const pdfStockItems: StockItemForPDF[] = stockItems.map((item: any) => ({
        _id: item._id,
        productName: item.product?.name || "Unknown Product",
        sku: item.product?.sku,
        category:
          typeof item.product?.category === "object"
            ? item.product?.category?.name
            : undefined,
        currentQuantity: item.quantity || 0,
        minStockLevel: item.product?.minStockLevel || 0,
        warehouseLocation: item.warehouseLocation || item.location,
        lastStockIn: item.lastStockIn,
        lastStockOut: item.lastStockOut,
        lastUpdated: item.lastUpdated,
        isLowStock: item.isLowStock || false,
        status: getStockStatus(item),
      }));

      // Build filter label
      const filterLabel =
        STOCK_STATUS_FILTERS.find((s) => s.value === selectedStatus)?.label ||
        undefined;

      generateStockReportPDF(pdfStockItems, filterLabel);
      toast.success(`PDF downloaded with ${pdfStockItems.length} items`);
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
            Download Stock Report as PDF
          </h3>
          <p className="text-sm text-gray-500">
            Generate a PDF report of inventory stock levels
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
            className="w-full px-3  text-gray-500 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {STOCK_STATUS_FILTERS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info text */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            {selectedStatus === "all" ? (
              <>All stock items will be included in the PDF report.</>
            ) : (
              <>
                Showing only{" "}
                <span className="font-medium">
                  {STOCK_STATUS_FILTERS.find((s) => s.value === selectedStatus)
                    ?.label || selectedStatus}
                </span>{" "}
                items.
              </>
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
              Download Stock Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
