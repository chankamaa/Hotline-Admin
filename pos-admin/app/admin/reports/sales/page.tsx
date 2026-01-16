"use client";

import { useState, use, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  TrendingUp,
  Percent,
  Download,
  Package,
  DollarSign
} from "lucide-react";
import { 
  getSalesReport, 
  getDailySalesSummary 
} from "@/lib/api/sale.api";

interface SalesSummary {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
  totalItems: number;
  cashTotal: number;
  cardTotal: number;
  voidedSales: number;
}

interface DailyBreakdown {
  _id: string;
  totalSales: number;
  totalRevenue: number;
  totalDiscount: number;
  totalTax: number;
}

interface ProductSales {
  id: string;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
}

interface DiscountUsage {
  id: string;
  discountCode: string;
  timesUsed: number;
  totalDiscount: number;
  avgDiscount: number;
  employeeName: string;
  impactOnProfit: number;
}

export default function SalesReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "summary" } = use(searchParams);
  const [activeTab, setActiveTab] = useState(tab);
  const [dateRange, setDateRange] = useState("this-month");
  const [loading, setLoading] = useState(false);
  
  // State for backend data
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdown[]>([]);
  const [reportTotals, setReportTotals] = useState<{
    totalSales: number;
    totalRevenue: number;
    totalDiscount: number;
    totalTax: number;
  } | null>(null);

  // Load daily summary
  const loadDailySummary = async () => {
    setLoading(true);
    try {
      const res = await getDailySalesSummary() as any;
      if (res.data?.data?.summary) {
        setSalesSummary(res.data.data.summary);
      }
    } catch (error) {
      console.error("Failed to load daily summary:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load sales report by date range
  const loadSalesReport = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const res = await getSalesReport(startDate, endDate) as any;
      if (res.data?.data) {
        setDailyBreakdown(res.data.data.dailyBreakdown || []);
        setReportTotals(res.data.data.totals || null);
      }
    } catch (error) {
      console.error("Failed to load sales report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate date ranges based on selection
  const getDateRange = (range: string) => {
    const today = new Date();
    let startDate = new Date();
    const endDate = new Date();

    switch (range) {
      case "today":
        startDate = new Date();
        break;
      case "this-week":
        startDate = new Date(today.setDate(today.getDate() - today.getDay()));
        break;
      case "this-month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case "last-month":
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate.setDate(0); // Last day of previous month
        break;
      case "this-year":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  // Load data on mount and when date range changes
  useEffect(() => {
    loadDailySummary();
    const { startDate, endDate } = getDateRange(dateRange);
    loadSalesReport(startDate, endDate);
  }, [dateRange]);

  // Mock data for product sales (keep for now until backend implements)
  const productSales: ProductSales[] = [
    { id: "1", productName: "iPhone 15 Pro 256GB", sku: "IP15P-256", quantitySold: 78, revenue: 93600, trend: "up", trendPercent: 15.5 },
    { id: "2", productName: "Samsung Galaxy S24 Ultra", sku: "SGS24U-512", quantitySold: 56, revenue: 72800, trend: "up", trendPercent: 8.3 },
    { id: "3", productName: "AirPods Pro 2nd Gen", sku: "APP2-USB", quantitySold: 145, revenue: 36250, trend: "stable", trendPercent: 0.5 },
    { id: "4", productName: "iPhone 14 128GB", sku: "IP14-128", quantitySold: 34, revenue: 27200, trend: "down", trendPercent: -12.4 },
    { id: "5", productName: "Phone Case Premium", sku: "CASE-PREM", quantitySold: 234, revenue: 11700, trend: "up", trendPercent: 22.1 },
  ];

  // Mock data for discount usage (keep for now until backend implements)
  const discountUsage: DiscountUsage[] = [
    { id: "1", discountCode: "NEWYEAR2026", timesUsed: 245, totalDiscount: 36750, avgDiscount: 150, employeeName: "Multiple", impactOnProfit: -15.2 },
    { id: "2", discountCode: "VIP20", timesUsed: 156, totalDiscount: 31200, avgDiscount: 200, employeeName: "Multiple", impactOnProfit: -12.8 },
    { id: "3", discountCode: "FIRSTBUY50", timesUsed: 87, totalDiscount: 4350, avgDiscount: 50, employeeName: "Multiple", impactOnProfit: -1.8 },
  ];

  const productColumns: DataTableColumn<ProductSales>[] = [
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.productName}</div>
          <div className="text-xs text-gray-500">{item.sku}</div>
        </div>
      )
    },
    {
      key: "quantity",
      label: "Quantity Sold",
      render: (item) => <div className="text-black font-semibold">{item.quantitySold}</div>
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (item) => <div className="text-black font-semibold">${item.revenue.toLocaleString()}</div>
    },
    {
      key: "trend",
      label: "Trend",
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.trend === "up" && <TrendingUp size={16} className="text-green-600" />}
          {item.trend === "down" && <TrendingUp size={16} className="text-red-600 rotate-180" />}
          <span className={`font-semibold ${
            item.trend === "up" ? "text-green-600" :
            item.trend === "down" ? "text-red-600" :
            "text-gray-600"
          }`}>
            {item.trend === "up" ? "+" : item.trend === "down" ? "-" : ""}{Math.abs(item.trendPercent)}%
          </span>
        </div>
      )
    },
  ];

  const discountColumns: DataTableColumn<DiscountUsage>[] = [
    {
      key: "code",
      label: "Discount Code",
      render: (item) => <div className="font-mono font-semibold text-black">{item.discountCode}</div>
    },
    {
      key: "usage",
      label: "Times Used",
      render: (item) => <div className="text-black">{item.timesUsed}</div>
    },
    {
      key: "total",
      label: "Total Discount",
      render: (item) => <div className="text-red-600 font-semibold">${item.totalDiscount.toLocaleString()}</div>
    },
    {
      key: "avg",
      label: "Avg Discount",
      render: (item) => <div className="text-black">${item.avgDiscount.toFixed(2)}</div>
    },
    {
      key: "employee",
      label: "Employee",
      render: (item) => <div className="text-black">{item.employeeName}</div>
    },
    {
      key: "impact",
      label: "Impact on Profit",
      render: (item) => (
        <div className="text-red-600 font-semibold">{item.impactOnProfit}%</div>
      )
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Sales Reports"
        description="Comprehensive sales analysis and insights"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "summary"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Sales Summary
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "products"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Product Analysis
        </button>
        <button
          onClick={() => setActiveTab("discounts")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "discounts"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Discount Analysis
        </button>
      </div>

      {/* SALES SUMMARY TAB */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <select 
              className="border rounded px-3 py-2 text-black"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-year">This Year</option>
            </select>
            <Button>
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">Total Revenue</div>
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-black">
                    Rs. {(reportTotals?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {reportTotals?.totalSales || 0} transactions
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">Today's Sales</div>
                    <ShoppingCart size={20} className="text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-black">
                    Rs. {(salesSummary?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {salesSummary?.totalSales || 0} transactions
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">Total Discount</div>
                    <Percent size={20} className="text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    Rs. {(reportTotals?.totalDiscount || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {reportTotals?.totalSales > 0 
                      ? ((reportTotals.totalDiscount / reportTotals.totalRevenue) * 100).toFixed(1)
                      : 0}% of revenue
                  </div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">Total Tax</div>
                    <TrendingUp size={20} className="text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-black">
                    Rs. {(reportTotals?.totalTax || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Tax collected</div>
                </div>
              </div>

              {/* Payment Method Distribution - Today's Data */}
              {salesSummary && (
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Today's Payment Method Distribution
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-black">Cash</span>
                        <span className="text-black font-semibold">
                          Rs. {salesSummary.cashTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full" 
                          style={{ 
                            width: `${salesSummary.totalRevenue > 0 
                              ? (salesSummary.cashTotal / salesSummary.totalRevenue) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {salesSummary.totalRevenue > 0 
                          ? ((salesSummary.cashTotal / salesSummary.totalRevenue) * 100).toFixed(1)
                          : 0}% of total
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-black">Card</span>
                        <span className="text-black font-semibold">
                          Rs. {salesSummary.cardTotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ 
                            width: `${salesSummary.totalRevenue > 0 
                              ? (salesSummary.cardTotal / salesSummary.totalRevenue) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {salesSummary.totalRevenue > 0 
                          ? ((salesSummary.cardTotal / salesSummary.totalRevenue) * 100).toFixed(1)
                          : 0}% of total
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Breakdown Table */}
              {dailyBreakdown.length > 0 && (
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-black mb-4">Daily Sales Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-black font-semibold">Date</th>
                          <th className="text-left py-3 px-4 text-black font-semibold">Transactions</th>
                          <th className="text-left py-3 px-4 text-black font-semibold">Revenue</th>
                          <th className="text-left py-3 px-4 text-black font-semibold">Discount</th>
                          <th className="text-left py-3 px-4 text-black font-semibold">Tax</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyBreakdown.map((day, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-black font-medium">
                              {new Date(day._id).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-black">{day.totalSales}</td>
                            <td className="py-3 px-4 text-black font-semibold">
                              Rs. {day.totalRevenue.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-red-600">
                              Rs. {day.totalDiscount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-black">
                              Rs. {day.totalTax.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {reportTotals && (
                        <tfoot>
                          <tr className="border-t-2 bg-gray-50 font-semibold">
                            <td className="py-3 px-4 text-black">TOTAL</td>
                            <td className="py-3 px-4 text-black">{reportTotals.totalSales}</td>
                            <td className="py-3 px-4 text-black">
                              Rs. {reportTotals.totalRevenue.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-red-600">
                              Rs. {reportTotals.totalDiscount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-black">
                              Rs. {reportTotals.totalTax.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}

              {salesSummary && salesSummary.voidedSales > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="font-semibold text-black mb-1">Voided Transactions</div>
                  <div className="text-sm text-black">
                    {salesSummary.voidedSales} transaction(s) were voided today.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* PRODUCT ANALYSIS TAB - Using Mock Data (Backend API not yet implemented) */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This tab currently uses mock data. Product-level sales analytics API will be implemented in the backend.
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Product Sales Analysis</h3>
              <Button>
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
            <DataTable
              data={productSales}
              columns={productColumns}
              searchPlaceholder="Search products..."
              onSearch={() => {}}
            />
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Top Performing Products</h3>
            <div className="space-y-3">
              {productSales.slice(0, 3).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-black">{product.productName}</div>
                    <div className="text-sm text-gray-500">{product.quantitySold} units sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">${product.revenue.toLocaleString()}</div>
                    <div className="text-xs text-green-600">+{product.trendPercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DISCOUNT ANALYSIS TAB - Using Mock Data (Backend API not yet implemented) */}
      {activeTab === "discounts" && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This tab currently uses mock data. Discount analytics API will be implemented in the backend.
            </p>
          </div>
          {/* Discount Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Discounts Given</div>
                <Percent size={20} className="text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                ${discountUsage.reduce((sum, d) => sum + d.totalDiscount, 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-2">Discount Codes Used</div>
              <div className="text-2xl font-bold text-black">{discountUsage.length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-2">Total Usage Count</div>
              <div className="text-2xl font-bold text-black">
                {discountUsage.reduce((sum, d) => sum + d.timesUsed, 0)}
              </div>
            </div>
          </div>

          {/* Discount Usage Table */}
          <div className="bg-white rounded-xl border p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Discount Usage Analysis</h3>
              <Button>
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
            <DataTable
              data={discountUsage}
              columns={discountColumns}
              searchPlaceholder="Search discount codes..."
              onSearch={() => {}}
            />
          </div>

          {/* Impact Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="font-semibold text-black mb-2">Profitability Impact</div>
            <div className="text-sm text-black">
              Total discounts given this period represent a {Math.abs(discountUsage.reduce((sum, d) => sum + d.impactOnProfit, 0) / discountUsage.length).toFixed(1)}% 
              average impact on profit margins. Monitor discount patterns to maintain healthy profit margins.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
