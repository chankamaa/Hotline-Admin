"use client";

import { PageHeader } from "@/components/ui/page-header";
import { StockAdjustmentPDFDownload } from "@/components/stock/stock-adjustment-pdf-download";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ExportStockAdjustmentsPage() {
  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          href="/admin/stock/adjustment"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock Adjustments
        </Link>
      </div>

      <PageHeader
        title="Export Stock Adjustments"
        description="Download stock adjustment history as a PDF report"
      />

      <div className="mt-6 max-w-xl">
        <StockAdjustmentPDFDownload variant="panel" />
      </div>
    </div>
  );
}
