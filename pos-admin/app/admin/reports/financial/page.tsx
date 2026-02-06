"use client";

import { useState, use } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  CreditCard,
  Repeat,
  Receipt
} from "lucide-react";

interface DailyTransaction {
  id: string;
  type: string;
  amount: number;
  count: number;
}

export default function FinancialReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "daily" } = use(searchParams);
  const [activeTab, setActiveTab] = useState(tab);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Daily Report Data
  const dailyReportData = {
    openingCash: 5000.00,
    closingCash: 12450.00,
    totalCashSales: 8500.00,
    totalCardPayments: 15500.00,
    totalDigitalPayments: 2450.00,
    repairRevenue: 3200.00,
    returnsRefunds: -850.00,
    discountsGiven: -1350.00,
    netRevenue: 27450.00,
    cashDifference: 0.00
  };

  const paymentModeBreakdown: DailyTransaction[] = [
    { id: "1", type: "Cash", amount: 8500.00, count: 45 },
    { id: "2", type: "Credit Card", amount: 12000.00, count: 67 },
    { id: "3", type: "Debit Card", amount: 3500.00, count: 28 },
    { id: "4", type: "Digital Wallet", amount: 2450.00, count: 16 },
  ];

  // Weekly/Monthly Data
  const weeklyData = [
    { week: "Week 1", revenue: 65000, sales: 234, growth: 12.5 },
    { week: "Week 2", revenue: 72000, sales: 267, growth: 10.8 },
    { week: "Week 3", revenue: 68500, sales: 245, growth: -4.9 },
    { week: "Week 4", revenue: 78000, sales: 289, growth: 13.9 },
  ];

  // P&L Data
  const profitLossData = {
    totalSalesRevenue: 283500.00,
    costOfGoodsSold: 170100.00,
    grossProfit: 113400.00,
    operatingExpenses: {
      salaries: 45000.00,
      rent: 8000.00,
      utilities: 2500.00,
      marketing: 5000.00,
      other: 3500.00,
      total: 64000.00
    },
    netProfit: 49400.00,
    grossProfitMargin: 40.0,
    netProfitMargin: 17.4
  };

  const categoryProfitability = [
    { category: "Smartphones", revenue: 185000, cogs: 111000, profit: 74000, margin: 40.0 },
    { category: "Accessories", revenue: 45500, cogs: 22750, profit: 22750, margin: 50.0 },
    { category: "Repairs", revenue: 35000, cogs: 17500, profit: 17500, margin: 50.0 },
    { category: "Parts", revenue: 18000, cogs: 10800, profit: 7200, margin: 40.0 },
  ];

  const dailyColumns: DataTableColumn<DailyTransaction>[] = [
    {
      key: "type",
      label: "Payment Method",
      render: (item) => <div className="font-medium text-black">{item.type}</div>
    },
    {
      key: "count",
      label: "Transactions",
      render: (item) => <div className="text-black">{item.count}</div>
    },
    {
      key: "amount",
      label: "Amount",
      render: (item) => <div className="text-black font-semibold">{item.amount.toFixed(2)}</div>
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Financial Reports"
        description="Comprehensive financial reporting and analysis"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "daily"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Daily Reports
        </button>
        <button
          onClick={() => setActiveTab("weekly")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "weekly"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Weekly/Monthly
        </button>
        <button
          onClick={() => setActiveTab("profit")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "profit"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Profit & Loss
        </button>
      </div>

      {/* DAILY REPORT TAB */}
      {activeTab === "daily" && (
        <div className="space-y-6">
          {/* Date Selector */}
          <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar size={20} className="text-gray-400" />
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <Button>
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>

          {/* Cash Flow Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Cash Flow Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Opening Cash</div>
                <div className="text-xl font-bold text-black">{dailyReportData.openingCash.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Closing Cash</div>
                <div className="text-xl font-bold text-black">{dailyReportData.closingCash.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Net Revenue</div>
                <div className="text-xl font-bold text-black">{dailyReportData.netRevenue.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Cash Difference</div>
                <div className={`text-xl font-bold ${dailyReportData.cashDifference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dailyReportData.cashDifference.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Revenue Sources</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-black">Cash Sales</span>
                  <span className="font-semibold text-black">{dailyReportData.totalCashSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Card Payments</span>
                  <span className="font-semibold text-black">{dailyReportData.totalCardPayments.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Digital Payments</span>
                  <span className="font-semibold text-black">{dailyReportData.totalDigitalPayments.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Repair Revenue</span>
                  <span className="font-semibold text-black">{dailyReportData.repairRevenue.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-black font-semibold">Total Revenue</span>
                  <span className="font-bold text-black text-lg">
                    {(dailyReportData.totalCashSales + dailyReportData.totalCardPayments + 
                       dailyReportData.totalDigitalPayments + dailyReportData.repairRevenue).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Deductions</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-black">Returns & Refunds</span>
                  <span className="font-semibold text-red-600">{Math.abs(dailyReportData.returnsRefunds).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Discounts Given</span>
                  <span className="font-semibold text-red-600">{Math.abs(dailyReportData.discountsGiven).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-black font-semibold">Total Deductions</span>
                  <span className="font-bold text-red-600 text-lg">
                    {Math.abs(dailyReportData.returnsRefunds + dailyReportData.discountsGiven).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between items-center bg-green-50 p-3 rounded">
                  <span className="text-black font-semibold">Net Revenue</span>
                  <span className="font-bold text-green-600 text-xl">{dailyReportData.netRevenue.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Mode Breakdown */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-lg font-semibold text-black mb-4">Payment Mode Breakdown</h3>
            <DataTable
              data={paymentModeBreakdown}
              columns={dailyColumns}
              searchPlaceholder="Search payment methods..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* WEEKLY/MONTHLY TAB */}
      {activeTab === "weekly" && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select className="border rounded px-3 py-2 text-black">
                <option>This Month</option>
                <option>Last Month</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
            </div>
            <Button>
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>

          {/* Weekly Performance Table */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Weekly Revenue Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-black font-semibold">Period</th>
                    <th className="text-left py-3 px-4 text-black font-semibold">Revenue</th>
                    <th className="text-left py-3 px-4 text-black font-semibold">Sales Count</th>
                    <th className="text-left py-3 px-4 text-black font-semibold">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyData.map((week, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-black">{week.week}</td>
                      <td className="py-3 px-4 text-black font-semibold">{week.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-black">{week.sales}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {week.growth > 0 ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : (
                            <TrendingDown size={16} className="text-red-600" />
                          )}
                          <span className={week.growth > 0 ? "text-green-600" : "text-red-600"}>
                            {week.growth > 0 ? '+' : ''}{week.growth}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparison Chart */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Sales Trend Comparison</h3>
            <div className="space-y-4">
              {weeklyData.map((week, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-black">{week.week}</span>
                    <span className="text-sm font-semibold text-black">{week.revenue.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full" 
                      style={{ width: `${(week.revenue / 80000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PROFIT & LOSS TAB */}
      {activeTab === "profit" && (
        <div className="space-y-6">
          {/* Period Selector */}
          <div className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select className="border rounded px-3 py-2 text-black">
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>
            <Button>
              <Download size={16} className="mr-2" />
              Export P&L Statement
            </Button>
          </div>

          {/* P&L Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-black">{profitLossData.totalSalesRevenue.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Gross Profit</div>
              <div className="text-2xl font-bold text-green-600">{profitLossData.grossProfit.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{profitLossData.grossProfitMargin}% margin</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Operating Expenses</div>
              <div className="text-2xl font-bold text-red-600">{profitLossData.operatingExpenses.total.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-sm text-gray-600 mb-1">Net Profit</div>
              <div className="text-2xl font-bold text-blue-600">{profitLossData.netProfit.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{profitLossData.netProfitMargin}% margin</div>
            </div>
          </div>

          {/* Detailed P&L Statement */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Profit & Loss Statement</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2">
                <span className="text-black font-semibold">Total Sales Revenue</span>
                <span className="text-black font-bold text-lg">{profitLossData.totalSalesRevenue.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-black">Less: Cost of Goods Sold (COGS)</span>
                <span className="text-red-600">-{profitLossData.costOfGoodsSold.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 bg-green-50 p-3 rounded">
                <span className="text-black font-semibold">Gross Profit</span>
                <span className="text-green-600 font-bold">{profitLossData.grossProfit.toLocaleString()}</span>
              </div>
              
              <div className="pl-4 space-y-2 border-l-2 border-gray-200">
                <div className="font-medium text-black mb-2">Operating Expenses:</div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Salaries & Wages</span>
                  <span className="text-black">{profitLossData.operatingExpenses.salaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Rent</span>
                  <span className="text-black">{profitLossData.operatingExpenses.rent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Utilities</span>
                  <span className="text-black">{profitLossData.operatingExpenses.utilities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Marketing</span>
                  <span className="text-black">{profitLossData.operatingExpenses.marketing.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Other</span>
                  <span className="text-black">{profitLossData.operatingExpenses.other.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-black font-medium">Total Operating Expenses</span>
                  <span className="text-red-600 font-semibold">-{profitLossData.operatingExpenses.total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 bg-blue-50 p-4 rounded-lg">
                <span className="text-black font-bold text-lg">Net Profit/Loss</span>
                <span className="text-blue-600 font-bold text-xl">{profitLossData.netProfit.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Category-wise Profitability */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Category-wise Profitability</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-black font-semibold">Category</th>
                    <th className="text-left py-3 px-4 text-black font-semibold">Revenue</th>
                    <th className="text-left py-3 px-4 text-black font-semibold">COGS</th>
                    <th className="text-left py-3 px-4 text-black font-semibold">Profit</th>
                    <th className="text-left py-3 px-4 text-black font-semibold">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryProfitability.map((cat, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-black font-medium">{cat.category}</td>
                      <td className="py-3 px-4 text-black">{cat.revenue.toLocaleString()}</td>
                      <td className="py-3 px-4 text-red-600">{cat.cogs.toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">{cat.profit.toLocaleString()}</td>
                      <td className="py-3 px-4 text-black">{cat.margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
