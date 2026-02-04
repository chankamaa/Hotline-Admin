"use client";

import { PageHeader } from "@/components/ui/page-header";
import { StockPDFDownload } from "@/components/stock/stock-pdf-download";
import { FileText, ArrowLeft, Package, MapPin, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";

export default function ExportStockPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Stock Inventory"
        description="Generate and download stock inventory reports as PDF files"
      />

      <div className="mb-4">
        <Link
          href="/admin/stock"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stock Overview
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PDF Download Panel */}
        <StockPDFDownload />

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
              <span>Item names, SKUs, and categories</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Current quantities and minimum stock levels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Warehouse locations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Stock status (In Stock, Low Stock, Out of Stock)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Last updated dates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Summary statistics</span>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                • Use status filters to focus on low stock or out-of-stock items
              </li>
              <li>
                • PDFs include color-coded status indicators for quick reference
              </li>
              <li>
                • Reports show variance between current stock and minimum levels
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">
            Stock Report Features
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          The stock inventory report provides comprehensive details for effective inventory management:
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Product Details</h4>
            </div>
            <p className="text-xs text-gray-500">
              Complete product information including names, SKUs, and categories
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Warehouse Locations</h4>
            </div>
            <p className="text-xs text-gray-500">
              Track where items are stored for efficient picking and restocking
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Stock Availability</h4>
            </div>
            <p className="text-xs text-gray-500">
              Real-time availability status with color-coded indicators
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
