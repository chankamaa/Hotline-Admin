/**
 * Technician Analytics Component
 * 
 * Shows individual technician's repair performance metrics including:
 * - Total repair income
 * - Parts cost
 * - Labor cost
 * - Total completed jobs
 */

"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import {
    DollarSign,
    Wrench,
    Package,
    CheckCircle,
    Calendar,
    RefreshCw,
    TrendingUp,
    Clock,
} from "lucide-react";
import { repairApi } from "@/lib/api/repairApi";

type TimeFilter = 'daily' | 'weekly' | 'monthly';

interface JobMetrics {
    totalIncome: number;
    partsTotal: number;
    laborCost: number;
    jobCount: number;
    avgJobValue: number;
    netProfit: number;
    partsPercentage: number;
    laborPercentage: number;
}

interface RecentJob {
    _id: string;
    jobNumber: string;
    device: {
        brand: string;
        model: string;
    };
    customer: {
        name: string;
    };
    partsTotal: number;
    laborCost: number;
    totalCost: number;
    actualCompletionDate?: string;
    status: string;
}

export default function TechnicianAnalytics() {
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('daily');
    const [metrics, setMetrics] = useState<JobMetrics>({
        totalIncome: 0,
        partsTotal: 0,
        laborCost: 0,
        jobCount: 0,
        avgJobValue: 0,
        netProfit: 0,
        partsPercentage: 0,
        laborPercentage: 0,
    });
    const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

    useEffect(() => {
        loadAnalytics();
    }, [timeFilter]);

    const getDateRange = () => {
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

        return { startDate, endDate: now };
    };

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch both READY and COMPLETED jobs
            const [readyRes, completedRes] = await Promise.allSettled([
                repairApi.getMyJobs({ status: 'READY', limit: 500 }),
                repairApi.getMyJobs({ status: 'COMPLETED', limit: 500 }),
            ]);

            const readyJobs = readyRes.status === 'fulfilled' ? (readyRes.value.data?.repairs || []) : [];
            const completedJobs = completedRes.status === 'fulfilled' ? (completedRes.value.data?.repairs || []) : [];

            // Combine and filter by date range
            const allJobs = [...readyJobs, ...completedJobs];
            const { startDate, endDate } = getDateRange();

            const filteredJobs = allJobs.filter((job: any) => {
                const completionDate = job.actualCompletionDate ? new Date(job.actualCompletionDate) : null;
                if (!completionDate) return false;
                return completionDate >= startDate && completionDate <= endDate;
            });

            // Calculate metrics
            let totalIncome = 0;
            let partsTotal = 0;
            let laborCost = 0;

            filteredJobs.forEach((job: any) => {
                totalIncome += job.totalCost || 0;
                partsTotal += job.partsTotal || 0;
                laborCost += job.laborCost || 0;
            });

            const jobCount = filteredJobs.length;
            const avgJobValue = jobCount > 0 ? totalIncome / jobCount : 0;
            const netProfit = totalIncome - partsTotal;
            const partsPercentage = totalIncome > 0 ? (partsTotal / totalIncome) * 100 : 0;
            const laborPercentage = totalIncome > 0 ? (laborCost / totalIncome) * 100 : 0;

            setMetrics({
                totalIncome,
                partsTotal,
                laborCost,
                jobCount,
                avgJobValue,
                netProfit,
                partsPercentage,
                laborPercentage,
            });

            // Get recent jobs (most recent 10)
            const sortedJobs = filteredJobs
                .sort((a: any, b: any) => {
                    const dateA = new Date(a.actualCompletionDate || 0);
                    const dateB = new Date(b.actualCompletionDate || 0);
                    return dateB.getTime() - dateA.getTime();
                })
                .slice(0, 10);

            setRecentJobs(sortedJobs);

        } catch (error) {
            console.error("Error loading analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilterLabel = () => {
        switch (timeFilter) {
            case 'daily': return "Today's";
            case 'weekly': return "This Week's";
            case 'monthly': return "This Month's";
            default: return '';
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        if (isToday) return 'Today';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="p-6">
            <PageHeader
                title="My Repair Analytics"
                description="Track your repair income, costs, and performance"
            />

            {/* Time Filter */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Period:</span>
                    <div className="flex gap-2">
                        {(['daily', 'weekly', 'monthly'] as TimeFilter[]).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeFilter === filter
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
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
                    title="Total Income"
                    value={`$${metrics.totalIncome.toFixed(2)}`}
                    icon={<DollarSign size={20} />}
                    change={`${getFilterLabel()} earnings`}
                    changeType="neutral"
                />
                <StatsCard
                    title="Parts Cost"
                    value={`$${metrics.partsTotal.toFixed(2)}`}
                    icon={<Package size={20} />}
                    change={`${metrics.partsPercentage.toFixed(1)}% of income`}
                    changeType="neutral"
                />
                <StatsCard
                    title="Labor Cost"
                    value={`$${metrics.laborCost.toFixed(2)}`}
                    icon={<Wrench size={20} />}
                    change={`${metrics.laborPercentage.toFixed(1)}% of income`}
                    changeType="neutral"
                />
                <StatsCard
                    title="Jobs Completed"
                    value={metrics.jobCount.toString()}
                    icon={<CheckCircle size={20} />}
                    change={`Avg. $${metrics.avgJobValue.toFixed(2)}/job`}
                    changeType="neutral"
                />
            </div>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Earnings Breakdown */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        Earnings Breakdown
                    </h3>

                    {metrics.totalIncome > 0 ? (
                        <>
                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex">
                                    <div
                                        className="bg-orange-500 h-full transition-all duration-500"
                                        style={{ width: `${metrics.partsPercentage}%` }}
                                    />
                                    <div
                                        className="bg-blue-500 h-full transition-all duration-500"
                                        style={{ width: `${metrics.laborPercentage}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                                    <span className="text-gray-600">Parts: {metrics.partsPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                    <span className="text-gray-600">Labor: {metrics.laborPercentage.toFixed(1)}%</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Net Profit (Income - Parts):</span>
                                    <span className="font-semibold text-green-600">${metrics.netProfit.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Average Job Value:</span>
                                    <span className="font-semibold text-gray-900">${metrics.avgJobValue.toFixed(2)}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <TrendingUp size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No earnings data for this period</p>
                        </div>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-lg border shadow-sm p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-blue-600" />
                        Performance Summary
                    </h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-700">Total Jobs Completed</span>
                            <span className="text-2xl font-bold text-gray-900">{metrics.jobCount}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <span className="text-gray-700">Average Job Value</span>
                            <span className="text-2xl font-bold text-blue-600">${metrics.avgJobValue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="text-gray-700">Net Profit</span>
                            <span className="text-2xl font-bold text-green-600">${metrics.netProfit.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Jobs Table */}
            <div className="bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-lg text-gray-900">
                        Recent Completed Jobs
                    </h3>
                    <p className="text-sm text-gray-500">
                        Your most recent repair completions
                    </p>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <RefreshCw className="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
                        <p className="text-gray-600">Loading jobs...</p>
                    </div>
                ) : recentJobs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Wrench className="mx-auto mb-2 opacity-50" size={32} />
                        <p>No completed jobs for this period</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Job #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Device
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Parts
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Labor
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentJobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-sm text-blue-600">{job.jobNumber}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {job.device?.brand} {job.device?.model}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{job.customer?.name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-gray-600">${(job.partsTotal || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm text-gray-600">${(job.laborCost || 0).toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-semibold text-gray-900">
                                                ${(job.totalCost || 0).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-sm text-gray-500">
                                                {formatDate(job.actualCompletionDate)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
