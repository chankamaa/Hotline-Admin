"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Wrench,
  Users,
  Calendar,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { repairApi } from "@/lib/api/repairApi";
import { useToast } from "@/providers/toast-provider";

type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'custom';

interface TechnicianStats {
  technician: {
    _id: string;
    username: string;
    email?: string;
  };
  jobCount: number;
  totalRevenue: number;
  partsCost: number;
  laborCost: number;
}

export default function RepairAnalyticsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [stats, setStats] = useState({
    repairIncome: 0,
    repairCost: 0,
    laborCost: 0,
    totalJobs: 0,
  });

  const [technicianStats, setTechnicianStats] = useState<TechnicianStats[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeFilter]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range based on filter
      const now = new Date();
      let startDate = new Date();
      
      if (timeFilter === 'custom') {
        if (!customStartDate || !customEndDate) {
          setLoading(false);
          return;
        }
        startDate = new Date(customStartDate);
        startDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === 'daily') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === 'weekly') {
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === 'monthly') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      // Determine end date based on filter type
      const endDate = timeFilter === 'custom' && customEndDate 
        ? new Date(customEndDate + 'T23:59:59')
        : now;

      // Fetch repair data using the correct API method
      const response = await repairApi.getAll({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000, // Get all repairs in the period
      });

      const repairs = response.data?.repairs || [];

      // Calculate stats
      let totalIncome = 0;
      let totalCost = 0;
      let totalLabor = 0;
      let readyJobsCount = 0;
      const technicianMap = new Map<string, TechnicianStats>();

      repairs.forEach((repair: any) => {
        // Calculate metrics for completed/delivered repairs (READY, COMPLETED, or DELIVERED)
        const isCompletedJob = ['READY', 'COMPLETED', 'DELIVERED'].includes(repair.status);
        
        if (isCompletedJob) {
          const income = repair.totalCost || 0;
          let parts = repair.partsTotal || 0;
          
          // Parse manual parts from repair notes if they exist
          if (repair.repairNotes && typeof repair.repairNotes === 'string') {
            const manualPartsMatch = repair.repairNotes.match(/\[Manual Parts Used\]([\s\S]*?)(?:\n\n|$)/);
            if (manualPartsMatch) {
              const manualPartsText = manualPartsMatch[1];
              // Extract total values from lines like: - Part Name (Qty: 1, Price: 10.00, Total: 10.00)
              const totalMatches = manualPartsText.matchAll(/Total:\s*\$?(\d+\.?\d*)/g);
              for (const match of totalMatches) {
                const manualPartTotal = parseFloat(match[1]) || 0;
                parts += manualPartTotal;
              }
            }
          }
          
          const labor = repair.laborCost || 0;

          totalIncome += income;
          totalCost += parts;
          totalLabor += labor;
          readyJobsCount++;

          // Track technician stats
          if (repair.assignedTo) {
            const techId = typeof repair.assignedTo === 'string' ? repair.assignedTo : repair.assignedTo._id;
            const techName = typeof repair.assignedTo === 'string' ? 'Unknown' : (repair.assignedTo.username || 'Unknown');
            const techEmail = typeof repair.assignedTo === 'string' ? '' : (repair.assignedTo.email || '');

            if (!technicianMap.has(techId)) {
              technicianMap.set(techId, {
                technician: {
                  _id: techId,
                  username: techName,
                  email: techEmail,
                },
                jobCount: 0,
                totalRevenue: 0,
                partsCost: 0,
                laborCost: 0,
              });
            }

            const techStats = technicianMap.get(techId)!;
            techStats.jobCount += 1;
            techStats.totalRevenue += income;
            techStats.partsCost += parts;
            techStats.laborCost += labor;
          }
        }
      });

      setStats({
        repairIncome: totalIncome,
        repairCost: totalCost,
        laborCost: totalLabor,
        totalJobs: readyJobsCount,
      });

      // Debug: Log the calculated stats
      console.log('=== REPAIR ANALYTICS STATS ===');
      console.log('Repair Income:', totalIncome);
      console.log('Parts Cost (repairCost):', totalCost);
      console.log('Labor Cost:', totalLabor);
      console.log('Total Jobs:', readyJobsCount);
      console.log('Net Profit:', totalIncome - totalCost - totalLabor);
      console.log('==============================');

      setTechnicianStats(Array.from(technicianMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue));

    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilterLabel = () => {
    switch (timeFilter) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'custom': 
        if (customStartDate && customEndDate) {
          return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
        }
        return 'Custom Range';
      default: return '';
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Repair Analytics"
        description="Track repair income, costs, and technician performance"
      />

      {/* Time Filter Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">Period:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeFilter('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeFilter('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeFilter('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Custom
            </button>
          </div>
        </div>
        <Button onClick={loadAnalytics} disabled={loading} variant="danger">
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Custom Date Range Inputs */}
      {timeFilter === 'custom' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                max={customEndDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="pt-6">
              <Button
                onClick={loadAnalytics}
                disabled={loading || !customStartDate || !customEndDate}
              >
                Apply
              </Button>
            </div>
          </div>
          {(!customStartDate || !customEndDate) && (
            <p className="text-sm text-gray-600 mt-2">
              Please select both start and end dates to view analytics
            </p>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Repair Income"
<<<<<<< HEAD
          value={stats.repairIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
=======
          value={stats.repairIncome.toFixed(2)}
>>>>>>> fdacb623a8a3b437853f1628bb034837d9c929dc
          icon={<DollarSign size={20} />}
        />
        <StatsCard
          title="Parts Cost"
<<<<<<< HEAD
          value={stats.repairCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
=======
          value={stats.repairCost.toFixed(2)}
>>>>>>> fdacb623a8a3b437853f1628bb034837d9c929dc
          icon={<TrendingUp size={20} />}
        />
        <StatsCard
          title="Labor Cost"
<<<<<<< HEAD
          value={stats.laborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          icon={<Wrench size={20} />}
        />
        <StatsCard
=======
          value={stats.laborCost.toFixed(2)}
          icon={<Wrench size={20} />}
        />
        <StatsCard
          title="Net Profit"
          value={(stats.repairIncome - stats.repairCost - stats.laborCost).toFixed(2)}
          icon={<DollarSign size={20} className="text-green-600" />}
        />
        <StatsCard
>>>>>>> fdacb623a8a3b437853f1628bb034837d9c929dc
          title="Total Jobs"
          value={stats.totalJobs.toLocaleString('en-US')}
          icon={<Users size={20} />}
        />
      </div>

      {/* Technician Performance Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-lg text-gray-900">
            Technician Performance - {getFilterLabel()}
          </h3>
          <p className="text-sm text-gray-500">
            Completed repair jobs by each technician
          </p>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
            <p className="text-gray-600">Loading technician stats...</p>
          </div>
        ) : technicianStats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="mx-auto mb-2 opacity-50" size={32} />
            <p>No technician data for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technician
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jobs Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parts Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Labor Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {technicianStats.map((tech) => {
                  return (
                    <tr key={tech.technician._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{tech.technician.username}</div>
                          {tech.technician.email && (
                            <div className="text-sm text-gray-500">{tech.technician.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">{tech.jobCount.toLocaleString('en-US')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {tech.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tech.partsCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tech.laborCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t font-semibold">
                <tr>
                  <td className="px-6 py-4 text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 text-gray-900">
                    {technicianStats.reduce((sum, tech) => sum + tech.jobCount, 0).toLocaleString('en-US')}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {technicianStats.reduce((sum, tech) => sum + tech.totalRevenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {technicianStats.reduce((sum, tech) => sum + tech.partsCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {technicianStats.reduce((sum, tech) => sum + tech.laborCost, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
