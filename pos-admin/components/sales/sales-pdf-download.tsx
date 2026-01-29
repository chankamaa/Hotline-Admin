"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSales } from "@/lib/api/sale.api";
import { reportApi } from "@/lib/api/reportApi";
import { generateSalesReportPDF, generateSalesSummaryPDF } from "@/lib/pdf-utils";
import { useToast } from "@/providers/toast-provider";
import {
  Download,
  FileText,
  Loader2,
  Filter,
  Calendar,
  User,
  BarChart3,
  List,
} from "lucide-react";

type ReportType = "detailed" | "summary";
type PeriodType = "daily" | "weekly" | "monthly" | "yearly" | "custom";
type StatusType = "" | "COMPLETED" | "VOIDED";

interface SalesPDFDownloadProps {
  variant?: "button" | "panel";
}

export function SalesPDFDownload({ variant = "panel" }: SalesPDFDownloadProps) {
  const [reportType, setReportType] = useState<ReportType>("detailed");
  const [period, setPeriod] = useState<PeriodType>("daily");
  const [status, setStatus] = useState<StatusType>("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      if (reportType === "summary") {
        await downloadSummaryReport();
      } else {
        await downloadDetailedReport();
      }
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDetailedReport = async () => {
    // Build params based on filters
    const params: any = { limit: 1000 };
    
    if (status) params.status = status;
    
    if (period === "custom") {
      params.startDate = startDate;
      params.endDate = endDate;
    } else {
      // Calculate date range based on period
      const today = new Date();
      let start = new Date();
      
      switch (period) {
        case "daily":
          start = today;
          break;
        case "weekly":
          start.setDate(today.getDate() - 7);
          break;
        case "monthly":
          start.setMonth(today.getMonth() - 1);
          break;
        case "yearly":
          start.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      params.startDate = start.toISOString().split("T")[0];
      params.endDate = today.toISOString().split("T")[0];
    }

    const res = await getSales(params) as any;
    const sales = res.data?.sales || res.sales || [];

    if (sales.length === 0) {
      toast.warning("No sales found for the selected criteria");
      return;
    }

    const filters = {
      period: period === "custom" ? undefined : period,
      status: status || undefined,
      startDate: params.startDate,
      endDate: params.endDate,
    };

    generateSalesReportPDF(sales, filters);
    toast.success(`PDF downloaded with ${sales.length} sales`);
  };

  const downloadSummaryReport = async () => {
    const params: any = {};
    
    if (period === "custom") {
      params.startDate = startDate;
      params.endDate = endDate;
    } else {
      params.period = period;
    }

    // Fetch summary data
    const [summaryRes, categoryRes, topProductsRes] = await Promise.all([
      reportApi.getSalesSummary(params) as any,
      reportApi.getSalesByCategory(params).catch(() => null) as any,
      reportApi.getTopProducts({ ...params, limit: 10 }).catch(() => null) as any,
    ]);

    const summaryData = summaryRes.data || summaryRes;
    
    if (!summaryData || summaryData.totalSales === 0) {
      toast.warning("No sales data found for the selected period");
      return;
    }

    const categoryData = categoryRes?.data?.categories || [];
    const topProducts = topProductsRes?.data?.topProducts || [];

    generateSalesSummaryPDF(
      {
        period: period,
        periodLabel: summaryData.periodLabel || `${period} Report`,
        startDate: summaryData.startDate || params.startDate || startDate,
        endDate: summaryData.endDate || params.endDate || endDate,
        totalSales: summaryData.totalSales || 0,
        totalRevenue: summaryData.totalRevenue || 0,
        totalDiscount: summaryData.totalDiscount || 0,
        totalTax: summaryData.totalTax || 0,
        avgSaleValue: summaryData.avgSaleValue || 0,
        totalItems: summaryData.totalItems || 0,
        voidedSales: summaryData.voidedSales || 0,
        paymentBreakdown: summaryData.paymentBreakdown || [],
      },
      categoryData,
      topProducts
    );
    toast.success("Sales summary PDF downloaded");
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
          <h3 className="font-semibold text-gray-900">Download Sales Report</h3>
          <p className="text-sm text-gray-500">
            Generate a PDF report of sales data
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Report Type */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <BarChart3 className="w-4 h-4" />
            Report Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setReportType("detailed")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                reportType === "detailed"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
              Detailed
            </button>
            <button
              onClick={() => setReportType("summary")}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                reportType === "summary"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Summary
            </button>
          </div>
        </div>

        {/* Period Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Time Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="daily">Today</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {/* Custom Date Range */}
        {period === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Status Filter (only for detailed report) */}
        {reportType === "detailed" && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4" />
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="VOIDED">Voided</option>
            </select>
          </div>
        )}

        {/* Info text */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            {reportType === "detailed" ? (
              <>
                <strong>Detailed Report:</strong> Lists all individual sales
                transactions with customer info, items, and payment details.
              </>
            ) : (
              <>
                <strong>Summary Report:</strong> Shows aggregated data including
                revenue, payment breakdown, top products, and sales by category.
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
              Download {reportType === "detailed" ? "Sales Report" : "Sales Summary"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
