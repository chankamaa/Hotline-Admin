"use client";

import { PageHeader } from "@/components/ui/page-header";
import { SalesPDFDownload } from "@/components/sales/sales-pdf-download";
import {
  FileText,
  ArrowLeft,

  ShoppingCart,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

export default function ExportSalesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Sales"
        description="Generate and download sales reports as PDF files"
      />

      <div className="mb-4">
        <Link
          href="/admin/sales"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sales
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PDF Download Panel */}
        <SalesPDFDownload />

        {/* Info Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Report Contents</h3>
          </div>

          {/* Detailed Report Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Detailed Report
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Sale numbers and dates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Customer information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Items count and subtotals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Discounts and totals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Cashier who made the sale</span>
              </li>
            </ul>
          </div>

          {/* Summary Report Info */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Summary Report
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Total revenue and sales count</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Average sale value</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Payment method breakdown</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Top selling products</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Sales by category</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Methods Tracked
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                CASH
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                CARD
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                MOBILE
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                OTHER
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                • Use custom date range for specific period reports
              </li>
              <li>
                • Summary reports are great for management review
              </li>
              <li>
                • Detailed reports help with transaction auditing
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
