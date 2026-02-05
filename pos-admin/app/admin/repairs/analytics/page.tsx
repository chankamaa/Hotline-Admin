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

type TimeFilter = 'daily' | 'weekly' | 'monthly';

interface TechnicianStats {
  technician: {
    _id: string;
    username: string;
    email?: string;
  };
  jobCount: number;
  totalRevenue: number;
  avgJobValue: number;
}

export default function RepairAnalyticsPage() {
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily');
  const [activeTab, setActiveTab] = useState<'repairs' | 'service'>('repairs');

  const [stats, setStats] = useState({
    repairIncome: 0,
    repairCost: 0,
    laborCost: 0,
    totalJobs: 0,
  });

  const [technicianStats, setTechnicianStats] = useState<TechnicianStats[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [timeFilter, activeTab]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range based on filter
      const now = new Date();
      let startDate = new Date();
      
      if (timeFilter === 'daily') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === 'weekly') {
        startDate.setDate(now.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
      } else if (timeFilter === 'monthly') {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      // Fetch repair data using the correct API method
      const response = await repairApi.getAll({
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
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
        // Calculate metrics for jobs with 'READY' status (repair completed, awaiting payment/pickup)
        if (repair.status === 'READY') {
          const income = repair.totalCost || 0;
          const parts = repair.partsTotal || 0;
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
                avgJobValue: 0,
              });
            }

            const techStats = technicianMap.get(techId)!;
            techStats.jobCount += 1;
            techStats.totalRevenue += income;
          }
        }
      });

      // Calculate averages for technicians
      technicianMap.forEach((stats) => {
        stats.avgJobValue = stats.jobCount > 0 ? stats.totalRevenue / stats.jobCount : 0;
      });

      setStats({
        repairIncome: totalIncome,
        repairCost: totalCost,
        laborCost: totalLabor,
        totalJobs: readyJobsCount,
      });

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
      default: return '';
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Repair & Service Analytics"
        description="Track repair income, costs, and technician performance"
      />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('repairs')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'repairs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Wrench className="inline-block w-4 h-4 mr-2" />
          Repairs
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'service'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="inline-block w-4 h-4 mr-2" />
          Service
        </button>
      </div>

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
          </div>
        </div>
        <Button onClick={loadAnalytics} disabled={loading} variant="secondary">
          <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title={`${activeTab === 'repairs' ? 'Repair' : 'Service'} Income`}
          value={stats.repairIncome.toFixed(2)}
          icon={<DollarSign size={20} />}
        />
        <StatsCard
          title="Parts Cost"
          value={stats.repairCost.toFixed(2)}
          icon={<TrendingUp size={20} />}
        />
        <StatsCard
          title="Labor Cost"
          value={stats.laborCost.toFixed(2)}
          icon={<Wrench size={20} />}
        />
        <StatsCard
          title="Total Jobs"
          value={stats.totalJobs.toString()}
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
            {activeTab === 'repairs' ? 'Repair jobs' : 'Service jobs'} completed by each technician
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
                    Avg. Job Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Salary
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {technicianStats.map((tech) => {
                  // Calculate estimated salary (e.g., 30% of labor cost or 15% of total revenue)
                  const estimatedSalary = stats.laborCost > 0 
                    ? (tech.totalRevenue / stats.repairIncome) * stats.laborCost
                    : tech.totalRevenue * 0.15;

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
                        <div className="text-sm text-gray-900 font-semibold">{tech.jobCount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {tech.totalRevenue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tech.avgJobValue.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 font-semibold">
                          {estimatedSalary.toFixed(2)}
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
                    {technicianStats.reduce((sum, tech) => sum + tech.jobCount, 0)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {technicianStats.reduce((sum, tech) => sum + tech.totalRevenue, 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-900">-</td>
                  <td className="px-6 py-4 text-green-600">
                    {stats.laborCost.toFixed(2)}
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
