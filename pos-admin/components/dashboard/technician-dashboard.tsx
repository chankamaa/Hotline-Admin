/**
 * Technician Dashboard Component
 * 
 * Repair-focused interface for technicians with job assignments and workflow.
 * Shows assigned repairs, pending work, and completed tasks.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  RefreshCw,
  Settings,
  Plus,
} from "lucide-react";
import { useToast } from "@/providers/toast-provider";
import { repairApi } from "@/lib/api/repairApi";

export default function TechnicianDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  type ChangeType = "increase" | "decrease" | "neutral";
  const [stats, setStats] = useState({
    assignedToMe: { value: "0", change: "Active jobs", changeType: "neutral" as ChangeType },
    inProgress: { value: "0", change: "In progress", changeType: "increase" as ChangeType },
    completedToday: { value: "0", change: "Finished today", changeType: "increase" as ChangeType },
    pending: { value: "0", change: "Awaiting assignment", changeType: "neutral" as ChangeType },
  });

  const [myRepairs, setMyRepairs] = useState<any[]>([]);
  const [pendingRepairs, setPendingRepairs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Use getMyJobs for technician's own repairs - this uses VIEW_OWN_REPAIRS permission
      const [inProgressRepairsRes, receivedRepairsRes] =
        await Promise.allSettled([
          repairApi.getMyJobs({ status: 'IN_PROGRESS', limit: 20 }),
          repairApi.getMyJobs({ status: 'RECEIVED', limit: 10 }),
        ]);

      // Process in-progress repairs (assigned to technician)
      let inProgressCount = 0;
      if (inProgressRepairsRes.status === "fulfilled") {
        const repairsData: any = inProgressRepairsRes.value;
        const repairs = repairsData.data?.repairs || [];
        inProgressCount = repairs.length;

        setMyRepairs(repairs.map((repair: any) => ({
          id: repair.jobNumber || repair._id,
          customer: repair.customer?.name || "Unknown",
          device: `${repair.device?.brand || ""} ${repair.device?.model || ""}`.trim() || "Unknown Device",
          issue: repair.problemDescription || "Not specified",
          priority: repair.priority || "normal",
          estimatedCost: repair.estimatedCost ? `$${repair.estimatedCost}` : "N/A",
          status: repair.status?.toLowerCase().replace(/_/g, "-") || "in-progress",
          createdAt: new Date(repair.createdAt).toLocaleDateString(),
        })));
      }

      // Process pending/received repairs
      let receivedCount = 0;
      if (receivedRepairsRes.status === "fulfilled") {
        const repairsData: any = receivedRepairsRes.value;
        const repairs = repairsData.data?.repairs || [];
        receivedCount = repairs.length;

        setPendingRepairs(repairs.slice(0, 5).map((repair: any) => ({
          id: repair.jobNumber || repair._id,
          customer: repair.customer?.name || "Unknown",
          device: `${repair.device?.brand || ""} ${repair.device?.model || ""}`.trim() || "Unknown Device",
          issue: repair.problemDescription || "Not specified",
          priority: repair.priority || "normal",
          createdAt: new Date(repair.createdAt).toLocaleDateString(),
        })));
      }

      // Update stats based on fetched data
      setStats({
        assignedToMe: {
          value: (inProgressCount + receivedCount).toString(),
          change: "Active jobs",
          changeType: "neutral",
        },
        inProgress: {
          value: inProgressCount.toString(),
          change: "Currently working",
          changeType: inProgressCount > 0 ? "increase" : "neutral",
        },
        completedToday: {
          value: "0", // Would need a separate API call with completedAt filter
          change: "Finished today",
          changeType: "neutral",
        },
        pending: {
          value: receivedCount.toString(),
          change: "Awaiting start",
          changeType: "neutral",
        },
      });

    } catch (error) {
      console.error("Error loading technician dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };


  if (loading && !myRepairs.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <RefreshCw className="inline-block animate-spin h-12 w-12 text-blue-600 mb-4" />
          <p className="text-gray-600">Loading technician dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Technician Dashboard"
          description="Your repair jobs and workflow"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/repairs?tab=create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span className="text-sm font-medium">Create Job</span>
          </button>
          <Button
            onClick={loadDashboardData}
            disabled={loading}
            variant="danger"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Assigned to Me"
          value={stats.assignedToMe.value}
          change={stats.assignedToMe.change}
          changeType={stats.assignedToMe.changeType}
          icon={<Wrench size={20} />}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress.value}
          change={stats.inProgress.change}
          changeType={stats.inProgress.changeType}
          icon={<Settings size={20} />}
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday.value}
          change={stats.completedToday.change}
          changeType={stats.completedToday.changeType}
          icon={<CheckCircle size={20} />}
        />
        <StatsCard
          title="Pending Assignment"
          value={stats.pending.value}
          change={stats.pending.change}
          changeType="neutral"
          icon={<Clock size={20} />}
        />
      </div>

      {/* My Active Repairs */}
      <div className="mb-6 bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">My Active Repairs</h3>
          </div>
          {myRepairs.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {myRepairs.length} jobs
            </span>
          )}
        </div>
        <div className="divide-y">
          {myRepairs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Wrench className="mx-auto mb-2 opacity-50" size={32} />
              <p>No active repairs assigned</p>
              <p className="text-xs mt-1">Check pending repairs below</p>
            </div>
          ) : (
            myRepairs.map((repair) => (
              <div key={repair.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-sm text-black">{repair.id}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${repair.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : repair.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                        }`}>
                        {repair.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{repair.customer}</div>
                    <div className="text-xs text-gray-500">{repair.device}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-black">{repair.estimatedCost}</div>
                    <div className="text-xs text-gray-500">{repair.createdAt}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Issue:</span> {repair.issue}
                </div>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Update Status
                  </button>
                  <button className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <a href="/admin/repairs" className="text-sm text-blue-600 hover:text-blue-700">
            View all my repairs →
          </a>
        </div>
      </div>

      {/* Pending Repairs - Awaiting Assignment */}
      <div className="mb-6 bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900">Pending Repairs - Awaiting Assignment</h3>
          </div>
          {pendingRepairs.length > 0 && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              {pendingRepairs.length} pending
            </span>
          )}
        </div>
        <div className="divide-y">
          {pendingRepairs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Clock className="mx-auto mb-2 opacity-50" size={32} />
              <p>No pending repairs</p>
              <p className="text-xs mt-1">All jobs are assigned</p>
            </div>
          ) : (
            pendingRepairs.map((repair) => (
              <div key={repair.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-medium text-sm text-black">{repair.id}</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${repair.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : repair.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                        }`}>
                        {repair.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">{repair.customer}</div>
                    <div className="text-xs text-gray-500 mb-2">{repair.device}</div>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Issue:</span> {repair.issue}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-2">{repair.createdAt}</div>
                    <button className="text-xs px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                      Take Job
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t">
          <a href="/admin/repairs" className="text-sm text-blue-600 hover:text-blue-700">
            View all pending repairs →
          </a>
        </div>
      </div>

      {/* Quick Actions & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Today's Progress</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {stats.completedToday.value} repairs completed
          </p>
          <p className="text-xs text-gray-500">Great job! Keep it up!</p>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package size={20} className="text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Parts Needed</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">3 jobs awaiting parts</p>
          <a href="/admin/stock" className="text-xs text-blue-600 hover:text-blue-700">
            Check inventory →
          </a>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <AlertCircle size={20} className="text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Urgent Jobs</h4>
          </div>
          <p className="text-sm text-gray-600 mb-2">2 urgent repairs pending</p>
          <p className="text-xs text-gray-500">Check priority queue</p>
        </div>
      </div>

      {/* Workflow Reminder */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Repair Workflow Reminder</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">1</div>
            <span>Receive Job</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">2</div>
            <span>Diagnose Issue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">3</div>
            <span>Get Approval</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">4</div>
            <span>Complete Repair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">5</div>
            <span>Quality Check</span>
          </div>
        </div>
      </div>
    </div>
  );
}
