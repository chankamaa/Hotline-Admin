'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, Clock, CheckCircle, AlertTriangle, TrendingUp, Package, Wrench, PlayCircle } from 'lucide-react';
import { repairApi, RepairJob } from '@/lib/api/repairApi';
import { useAuth } from '@/providers/providers';

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch technician's assigned jobs
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await repairApi.getMyJobs();
        setJobs(response.data.repairs || []);
      } catch (err: any) {
        console.error('Error fetching jobs:', err);
        setError(err.message || 'Failed to load your assigned jobs');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyJobs();
    }
  }, [user]);

  // Filter jobs by status
  const filteredJobs = statusFilter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === statusFilter);

  // Calculate statistics
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'PENDING' || j.status === 'ASSIGNED').length,
    inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
    ready: jobs.filter(j => j.status === 'READY').length,
    completed: jobs.filter(j => j.status === 'COMPLETED').length,
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      ASSIGNED: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      READY: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      LOW: 'bg-gray-100 text-gray-600',
      NORMAL: 'bg-blue-100 text-blue-600',
      HIGH: 'bg-orange-100 text-orange-600',
      URGENT: 'bg-red-100 text-red-600',
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-600';
  };

  const handleStartJob = async (jobId: string) => {
    try {
      await repairApi.start(jobId);
      // Refresh jobs
      const response = await repairApi.getMyJobs();
      setJobs(response.data.repairs || []);
    } catch (err: any) {
      console.error('Error starting job:', err);
      alert(err.message || 'Failed to start job');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading your assigned jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error Loading Jobs</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.username || 'Technician'}!</h2>
        <p className="text-blue-100">Here are your assigned repair jobs</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Total Jobs
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>

        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <div className="text-sm text-yellow-600 mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
          </div>
          <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        </div>

        <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
          <div className="text-sm text-purple-600 mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            In Progress
          </div>
          <div className="text-2xl font-bold text-purple-700">{stats.inProgress}</div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600 mb-1 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Ready
          </div>
          <div className="text-2xl font-bold text-green-700">{stats.ready}</div>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Completed
          </div>
          <div className="text-2xl font-bold text-gray-700">{stats.completed}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All Jobs', value: 'all' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Assigned', value: 'ASSIGNED' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Ready', value: 'READY' },
            { label: 'Completed', value: 'COMPLETED' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Jobs Found</h3>
          <p className="text-gray-500">
            {statusFilter === 'all' 
              ? "You don't have any assigned jobs yet."
              : `No jobs with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedJob?._id === job._id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedJob(job)}
            >
              {/* Job Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    {job.jobNumber}
                  </h3>
                  <p className="text-sm text-gray-600">{job.customer.name}</p>
                  <p className="text-xs text-gray-500">{job.customer.phone}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(job.priority)}`}>
                    {job.priority}
                  </span>
                </div>
              </div>

              {/* Device Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {job.device.brand} {job.device.model}
                </p>
                <p className="text-xs text-gray-600">{job.device.type}</p>
                {job.device.serialNumber && (
                  <p className="text-xs text-gray-500 mt-1">S/N: {job.device.serialNumber}</p>
                )}
              </div>

              {/* Problem Description */}
              <div className="mb-4">
                <p className="text-xs text-gray-600 font-semibold mb-1">Problem:</p>
                <p className="text-sm text-gray-800">{job.problemDescription}</p>
              </div>

              {/* Cost Info */}
              <div className="flex items-center justify-between mb-4 pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-600">Estimated Cost</p>
                  <p className="text-lg font-bold text-gray-900">${job.estimatedCost || 0}</p>
                </div>
                {job.expectedCompletionDate && (
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Expected</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(job.expectedCompletionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {(job.status === 'ASSIGNED' || job.status === 'PENDING') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartJob(job._id);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Start Working
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Job Detail View */}
      {selectedJob && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Job Details: {selectedJob.jobNumber}</h3>
            <button
              onClick={() => setSelectedJob(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{selectedJob.customer.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <span className="ml-2 font-medium">{selectedJob.customer.phone}</span>
                </div>
                {selectedJob.customer.email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedJob.customer.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Device Info */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Device Information</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{selectedJob.device.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <span className="ml-2 font-medium">{selectedJob.device.brand}</span>
                </div>
                <div>
                  <span className="text-gray-600">Model:</span>
                  <span className="ml-2 font-medium">{selectedJob.device.model}</span>
                </div>
                {selectedJob.device.serialNumber && (
                  <div>
                    <span className="text-gray-600">Serial:</span>
                    <span className="ml-2 font-medium">{selectedJob.device.serialNumber}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Problem & Notes */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-700 mb-3">Problem Description</h4>
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">{selectedJob.problemDescription}</p>
              
              {selectedJob.diagnosisNotes && (
                <>
                  <h4 className="font-semibold text-gray-700 mb-3 mt-4">Diagnosis Notes</h4>
                  <p className="text-sm text-gray-800 bg-yellow-50 p-3 rounded">{selectedJob.diagnosisNotes}</p>
                </>
              )}

              {selectedJob.repairNotes && (
                <>
                  <h4 className="font-semibold text-gray-700 mb-3 mt-4">Repair Notes</h4>
                  <p className="text-sm text-gray-800 bg-blue-50 p-3 rounded">{selectedJob.repairNotes}</p>
                </>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3">Cost Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Estimated Cost</p>
                  <p className="text-lg font-bold text-gray-900">${selectedJob.estimatedCost || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Advance Payment</p>
                  <p className="text-lg font-bold text-green-700">${selectedJob.advancePayment || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Balance Due</p>
                  <p className="text-lg font-bold text-orange-700">${selectedJob.balanceDue || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Payment Status</p>
                  <p className={`text-sm font-semibold ${
                    selectedJob.paymentStatus === 'PAID' ? 'text-green-600' :
                    selectedJob.paymentStatus === 'PARTIAL' ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {selectedJob.paymentStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-700 mb-3">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(selectedJob.createdAt).toLocaleString()}</span>
                </div>
                {selectedJob.assignedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assigned:</span>
                    <span className="font-medium">{new Date(selectedJob.assignedAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedJob.expectedCompletionDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Completion:</span>
                    <span className="font-medium">{new Date(selectedJob.expectedCompletionDate).toLocaleString()}</span>
                  </div>
                )}
                {selectedJob.actualCompletionDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-green-600">{new Date(selectedJob.actualCompletionDate).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
