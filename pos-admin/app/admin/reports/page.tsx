'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/stats-card';
import {
  reportApi,
  SalesSummaryData,
  ProfitData,
  CategorySalesData,
  CashierSalesData,
  TopProductData,
  ReturnAnalyticsData
} from '@/lib/api/reportApi';
import { useToast } from '@/providers/toast-provider';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  PieChart,
  RefreshCw,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Filter
} from 'lucide-react';

type ReportType = 'summary' | 'profit' | 'category' | 'cashier' | 'products' | 'returns';
type DatePeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export default function ReportsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<ReportType>('summary');
  const [period, setPeriod] = useState<DatePeriod>('month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });

  // Report data states
  const [salesSummary, setSalesSummary] = useState<SalesSummaryData | null>(null);
  const [profitData, setProfitData] = useState<ProfitData | null>(null);
  const [categoryData, setCategoryData] = useState<CategorySalesData | null>(null);
  const [cashierData, setCashierData] = useState<CashierSalesData | null>(null);
  const [productsData, setProductsData] = useState<TopProductData | null>(null);
  const [returnsData, setReturnsData] = useState<ReturnAnalyticsData | null>(null);

  useEffect(() => {
    loadReport(activeReport);
  }, [activeReport, period]);

  const getDateParams = () => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        return {
          startDate: customDates.start,
          endDate: customDates.end
        };
      default:
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    };
  };

  const loadReport = async (type: ReportType) => {
    setLoading(true);
    const params = getDateParams();

    try {
      switch (type) {
        case 'summary':
          const summaryRes = await reportApi.getSalesSummary(params);
          setSalesSummary(summaryRes.data);
          break;
        case 'profit':
          const profitRes = await reportApi.getProfitReport(params);
          setProfitData(profitRes.data);
          break;
        case 'category':
          const catRes = await reportApi.getSalesByCategory(params);
          setCategoryData(catRes.data);
          break;
        case 'cashier':
          const cashRes = await reportApi.getSalesByCashier(params);
          setCashierData(cashRes.data);
          break;
        case 'products':
          const prodRes = await reportApi.getTopProducts({ ...params, limit: 10 });
          setProductsData(prodRes.data);
          break;
        case 'returns':
          const retRes = await reportApi.getReturnAnalytics(params);
          setReturnsData(retRes.data);
          break;
      }
    } catch (error: any) {
      console.error('Error loading report:', error);
      toast.error(error?.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const reportTabs = [
    { id: 'summary' as ReportType, label: 'Sales Summary', icon: DollarSign },
    { id: 'profit' as ReportType, label: 'Profit Analysis', icon: TrendingUp },
    { id: 'category' as ReportType, label: 'By Category', icon: PieChart },
    { id: 'cashier' as ReportType, label: 'By Cashier', icon: Users },
    { id: 'products' as ReportType, label: 'Top Products', icon: Package },
    { id: 'returns' as ReportType, label: 'Returns', icon: RotateCcw },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const formatPercent = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  // CSV Export functionality
  const exportToCSV = () => {
    let csvContent = '';
    let filename = '';
    const dateStr = new Date().toISOString().split('T')[0];

    switch (activeReport) {
      case 'summary':
        if (salesSummary) {
          filename = `sales_summary_${dateStr}.csv`;
          csvContent = 'Metric,Value\n';
          csvContent += `Total Sales,${salesSummary.totalSales}\n`;
          csvContent += `Total Revenue,${salesSummary.totalRevenue}\n`;
          csvContent += `Average Order Value,${salesSummary.averageOrderValue}\n`;
          csvContent += `Total Items Sold,${salesSummary.totalItemsSold}\n`;
          csvContent += '\nPayment Method,Count,Total\n';
          salesSummary.byPaymentMethod?.forEach(pm => {
            csvContent += `${pm.method},${pm.count},${pm.total}\n`;
          });
        }
        break;

      case 'profit':
        if (profitData) {
          filename = `profit_report_${dateStr}.csv`;
          csvContent = 'Metric,Value\n';
          csvContent += `Gross Revenue,${profitData.grossRevenue}\n`;
          csvContent += `Total Cost,${profitData.totalCost}\n`;
          csvContent += `Gross Profit,${profitData.grossProfit}\n`;
          csvContent += `Profit Margin,${profitData.profitMargin}%\n`;
          csvContent += '\nCategory,Revenue,Cost,Profit,Margin\n';
          profitData.byCategory?.forEach(cat => {
            csvContent += `${cat.category},${cat.revenue},${cat.cost},${cat.profit},${cat.margin}%\n`;
          });
        }
        break;

      case 'category':
        if (categoryData) {
          filename = `sales_by_category_${dateStr}.csv`;
          csvContent = 'Category,Sales Count,Revenue,Items Sold,Percentage\n';
          categoryData.categories?.forEach(cat => {
            csvContent += `${cat.categoryName},${cat.salesCount},${cat.totalRevenue},${cat.itemsSold},${cat.percentage}%\n`;
          });
        }
        break;

      case 'cashier':
        if (cashierData) {
          filename = `sales_by_cashier_${dateStr}.csv`;
          csvContent = 'Cashier,Sales Count,Revenue,Avg Order Value,Items Sold\n';
          cashierData.cashiers?.forEach(c => {
            csvContent += `${c.username},${c.salesCount},${c.totalRevenue},${c.averageOrderValue},${c.itemsSold}\n`;
          });
        }
        break;

      case 'products':
        if (productsData) {
          filename = `top_products_${dateStr}.csv`;
          csvContent = 'Product,SKU,Quantity Sold,Revenue,Profit\n';
          productsData.products?.forEach(p => {
            csvContent += `"${p.productName}",${p.sku},${p.quantitySold},${p.revenue},${p.profit}\n`;
          });
        }
        break;

      case 'returns':
        if (returnsData) {
          filename = `return_analytics_${dateStr}.csv`;
          csvContent = 'Metric,Value\n';
          csvContent += `Total Returns,${returnsData.totalReturns}\n`;
          csvContent += `Total Refund Amount,${returnsData.totalRefundAmount}\n`;
          csvContent += `Refund Count,${returnsData.refundCount}\n`;
          csvContent += `Exchange Count,${returnsData.exchangeCount}\n`;
          csvContent += '\nReason,Count,Total\n';
          returnsData.byReason?.forEach(r => {
            csvContent += `${r.reason},${r.count},${r.total}\n`;
          });
        }
        break;
    }

    if (csvContent) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast.success(`Exported ${filename}`);
    } else {
      toast.error('No data to export');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Reports & Analytics"
          description="Comprehensive business insights powered by real-time data"
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => loadReport(activeReport)}
            disabled={loading}
            variant="secondary"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="secondary" onClick={exportToCSV} disabled={loading}>
            <Download size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Period:</span>
          </div>
          <div className="flex gap-2">
            {(['today', 'week', 'month', 'year'] as DatePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          {period === 'custom' && (
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={customDates.start}
                onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                className="px-3 py-2 rounded-lg border text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customDates.end}
                onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                className="px-3 py-2 rounded-lg border text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeReport === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl border p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Sales Summary Report */}
            {activeReport === 'summary' && salesSummary && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Total Revenue</div>
                    <div className="text-2xl font-bold">{formatCurrency(salesSummary.totalRevenue)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Total Sales</div>
                    <div className="text-2xl font-bold">{salesSummary.totalSales}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Avg Order Value</div>
                    <div className="text-2xl font-bold">{formatCurrency(salesSummary.averageOrderValue)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Items Sold</div>
                    <div className="text-2xl font-bold">{salesSummary.totalItemsSold}</div>
                  </div>
                </div>

                {/* Payment Methods */}
                {salesSummary.byPaymentMethod && salesSummary.byPaymentMethod.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-800 mb-3">By Payment Method</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {salesSummary.byPaymentMethod.map((pm, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="text-sm text-gray-500 capitalize">{pm.method}</div>
                          <div className="text-xl font-bold text-gray-900">{formatCurrency(pm.total)}</div>
                          <div className="text-sm text-gray-500">{pm.count} transactions</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily Breakdown */}
                {salesSummary.dailyBreakdown && salesSummary.dailyBreakdown.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3">Daily Breakdown</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Date</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Sales</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesSummary.dailyBreakdown.slice(0, 10).map((day, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-3 text-gray-900">{new Date(day.date).toLocaleDateString()}</td>
                              <td className="py-2 px-3 text-right text-gray-900">{day.sales}</td>
                              <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(day.revenue)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profit Report */}
            {activeReport === 'profit' && profitData && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profit Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Gross Revenue</div>
                    <div className="text-2xl font-bold">{formatCurrency(profitData.grossRevenue)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Total Cost</div>
                    <div className="text-2xl font-bold">{formatCurrency(profitData.totalCost)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Gross Profit</div>
                    <div className="text-2xl font-bold">{formatCurrency(profitData.grossProfit)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Profit Margin</div>
                    <div className="text-2xl font-bold">{formatPercent(profitData.profitMargin)}</div>
                  </div>
                </div>

                {/* Profit by Category */}
                {profitData.byCategory && profitData.byCategory.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-gray-800 mb-3">By Category</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 font-medium text-gray-600">Category</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Revenue</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Cost</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Profit</th>
                            <th className="text-right py-2 px-3 font-medium text-gray-600">Margin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profitData.byCategory.map((cat, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-3 text-gray-900 font-medium">{cat.category}</td>
                              <td className="py-2 px-3 text-right text-gray-900">{formatCurrency(cat.revenue)}</td>
                              <td className="py-2 px-3 text-right text-red-600">{formatCurrency(cat.cost)}</td>
                              <td className="py-2 px-3 text-right text-green-600">{formatCurrency(cat.profit)}</td>
                              <td className="py-2 px-3 text-right">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${cat.margin >= 30 ? 'bg-green-100 text-green-700' :
                                  cat.margin >= 15 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {formatPercent(cat.margin)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Category Report */}
            {activeReport === 'category' && categoryData && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h2>
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <div className="text-sm text-blue-600">Total Revenue</div>
                  <div className="text-2xl font-bold text-blue-900">{formatCurrency(categoryData.total)}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryData.categories?.map((cat, idx) => (
                    <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{cat.categoryName}</h4>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {formatPercent(cat.percentage)}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(cat.totalRevenue)}</div>
                      <div className="text-sm text-gray-500">
                        {cat.salesCount} sales • {cat.itemsSold} items
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cashier Report */}
            {activeReport === 'cashier' && cashierData && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales by Cashier</h2>
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <div className="text-sm text-green-600">Total Revenue</div>
                  <div className="text-2xl font-bold text-green-900">{formatCurrency(cashierData.total)}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-3 font-medium text-gray-600">Cashier</th>
                        <th className="text-right py-3 px-3 font-medium text-gray-600">Sales</th>
                        <th className="text-right py-3 px-3 font-medium text-gray-600">Revenue</th>
                        <th className="text-right py-3 px-3 font-medium text-gray-600">Avg Order</th>
                        <th className="text-right py-3 px-3 font-medium text-gray-600">Items Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cashierData.cashiers?.map((cashier, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users size={14} className="text-gray-600" />
                              </div>
                              <span className="font-medium text-gray-900">{cashier.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-gray-900">{cashier.salesCount}</td>
                          <td className="py-3 px-3 text-right font-medium text-gray-900">{formatCurrency(cashier.totalRevenue)}</td>
                          <td className="py-3 px-3 text-right text-gray-600">{formatCurrency(cashier.averageOrderValue)}</td>
                          <td className="py-3 px-3 text-right text-gray-600">{cashier.itemsSold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Top Products Report */}
            {activeReport === 'products' && productsData && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
                <div className="space-y-3">
                  {productsData.products?.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-blue-600">#{idx + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{product.productName}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{product.quantitySold} sold</div>
                        <div className="text-sm text-gray-500">{formatCurrency(product.revenue)} revenue</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-600 font-medium">{formatCurrency(product.profit)}</div>
                        <div className="text-xs text-gray-500">profit</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Returns Report */}
            {activeReport === 'returns' && returnsData && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Return Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Total Returns</div>
                    <div className="text-2xl font-bold">{returnsData.totalReturns}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Total Refunded</div>
                    <div className="text-2xl font-bold">{formatCurrency(returnsData.totalRefundAmount)}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Refunds</div>
                    <div className="text-2xl font-bold">{returnsData.refundCount}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="text-sm opacity-80">Exchanges</div>
                    <div className="text-2xl font-bold">{returnsData.exchangeCount}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* By Reason */}
                  {returnsData.byReason && returnsData.byReason.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-3">By Reason</h3>
                      <div className="space-y-2">
                        {returnsData.byReason.map((reason, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 border rounded">
                            <span className="text-gray-900 capitalize">{reason.reason}</span>
                            <div className="text-right">
                              <span className="font-medium text-gray-900">{reason.count}</span>
                              <span className="text-sm text-gray-500 ml-2">({formatCurrency(reason.total)})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Returned Products */}
                  {returnsData.topReturnedProducts && returnsData.topReturnedProducts.length > 0 && (
                    <div>
                      <h3 className="text-md font-semibold text-gray-800 mb-3">Top Returned Products</h3>
                      <div className="space-y-2">
                        {returnsData.topReturnedProducts.map((product, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 border rounded">
                            <span className="text-gray-900 truncate max-w-[200px]">{product.productName}</span>
                            <div className="text-right">
                              <span className="font-medium text-red-600">{product.returnCount} returns</span>
                              <div className="text-xs text-gray-500">{formatCurrency(product.totalRefunded)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !salesSummary && !profitData && !categoryData && !cashierData && !productsData && !returnsData && (
              <div className="text-center py-12">
                <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-500">Try selecting a different date range or report type</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
