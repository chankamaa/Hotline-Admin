"use client";

import { PageHeader } from "@/components/ui/page-header";
import { ProductPDFDownload } from "@/components/products/product-pdf-download";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ExportProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Products"
        description="Generate and download product catalogs as PDF files"
      />

      <div className="mb-4">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PDF Download Panel */}
        <ProductPDFDownload />

        {/* Info Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">
              What&apos;s Included
            </h3>
          </div>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Product names, SKUs, and barcodes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Category information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Cost and selling prices</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Current stock levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Product status (Active/Inactive)</span>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                • Use category filters to create focused catalogs for specific
                product lines
              </li>
              <li>
                • PDFs are generated with the current date for easy tracking
              </li>
              <li>
                • Large catalogs may take a few seconds to generate
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
