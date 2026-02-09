"use client";

import { PageHeader } from "@/components/ui/page-header";
import { WarrantyPDFDownload } from "@/components/warranty/warranty-pdf-download";
import { FileText, ArrowLeft, ShieldCheck, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";

export default function ExportWarrantyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Warranty Records"
        description="Generate and download warranty reports and certificates as PDF files"
      />

      <div className="mb-4">
        <Link
          href="/admin/warranty"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Warranty Management
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PDF Download Panel */}
        <WarrantyPDFDownload />

        {/* Info Panel */}
        <div className="bg-white rounded-xl border border-blue-600 p-6 shadow-sm">
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
              <span>Warranty numbers and product details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Customer name and contact information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Warranty type and duration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Start and expiration dates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Current warranty status</span>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                • Use status filters to generate reports for active or expired warranties
              </li>
              <li>
                • Filter by warranty type to focus on specific coverage categories
              </li>
              <li>
                • Individual warranty certificates can be downloaded from the warranty details page
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Certificate Info Section */}
      <div className="bg-white rounded-xl border border-blue-600 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">
            Warranty Certificate Details
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Individual warranty certificates include additional details for customer reference:
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Terms & Conditions</h4>
            </div>
            <p className="text-xs text-gray-500">
              Coverage details, exclusions, and warranty claim procedures
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Validity Period</h4>
            </div>
            <p className="text-xs text-gray-500">
              Clear start and end dates with remaining days calculation
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Customer Support</h4>
            </div>
            <p className="text-xs text-gray-500">
              Contact information for warranty claims and support inquiries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
