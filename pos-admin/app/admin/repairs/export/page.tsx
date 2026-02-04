"use client";

import { PageHeader } from "@/components/ui/page-header";
import { RepairPDFDownload } from "@/components/repairs/repair-pdf-download";
import { FileText, ArrowLeft, Wrench, User, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";

export default function ExportRepairsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Repair Records"
        description="Generate and download repair job reports as PDF files"
      />

      <div className="mb-4">
        <Link
          href="/admin/repairs"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Repair Jobs
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PDF Download Panel */}
        <RepairPDFDownload />

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
              <span>Job numbers and equipment details</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Customer name and contact information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Reported issues and repair actions taken</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Technician assignments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Cost breakdown (labor + parts)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Repair dates and current status</span>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                • Use status filters to generate reports for active or completed repairs
              </li>
              <li>
                • PDFs include color-coded status indicators for quick reference
              </li>
              <li>
                • Individual job details can be exported from the job details page
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Job Info Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">
            Repair Job Report Features
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Comprehensive repair records include all essential details for service tracking and customer communication:
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Equipment & Issues</h4>
            </div>
            <p className="text-xs text-gray-500">
              Complete device information with reported problems and repair actions
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Technician Details</h4>
            </div>
            <p className="text-xs text-gray-500">
              Track which technician handled each repair job
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-900 text-sm">Cost Breakdown</h4>
            </div>
            <p className="text-xs text-gray-500">
              Detailed labor and parts costs with total revenue tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
