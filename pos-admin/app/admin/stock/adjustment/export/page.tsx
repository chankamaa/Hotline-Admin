"use client";

import { PageHeader } from "@/components/ui/page-header";
import { StockAdjustmentPDFDownload } from "@/components/stock/stock-adjustment-pdf-download";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExportStockAdjustmentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/stock/adjustment">
          <Button variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stock Adjustments
          </Button>
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
