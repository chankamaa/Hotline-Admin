'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { repairApi, RepairJob } from '@/lib/api/repairApi';
import { useToast } from '@/providers/toast-provider';
import { useAuth } from '@/providers/providers';
import { Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface RepairJobListProps {
  onEditJob: (jobId: string) => void;
}

type RepairStatus = 'all' | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' |  'READY' | 'COMPLETED' | 'CANCELLED';
type RepairPriority = 'all' | 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// Helper function to format job number as 5 digits
const formatJobNumber = (jobId: string): string => {
  // Extract RJ prefix and numeric part from job numbers like "RJ-20260209-0008" to "RJ-00008"
  const match = jobId.match(/^([A-Z]+).*-(\d+)$/);
  if (match) {
    const prefix = match[1]; // Just "RJ"
    const numericPart = match[2];
    return `${prefix}-${numericPart.padStart(5, '0')}`;
  }
  // Fallback: if pattern doesn't match, return original
  return jobId;
};

export default function RepairJobList({ onEditJob }: RepairJobListProps) {
  const toast = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<RepairPriority>('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = async () => {
    try {
      setLoading(true);

      // Check if user is a technician - use getMyJobs instead of getAll
      const isTechnician = user?.roles?.some((r: any) =>
        r.name?.toLowerCase() === 'technician' || r.roleName?.toLowerCase() === 'technician'
      ) || user?.primaryRole?.toLowerCase() === 'technician';

      let response;
      if (isTechnician) {
        // Technicians can only see their own jobs (VIEW_OWN_REPAIRS permission)
        response = await repairApi.getMyJobs();
      } else {
        // Admin/Manager see all jobs (VIEW_REPAIRS permission)
        response = await repairApi.getAll();
      }

      const allJobs = response.data.repairs || [];
      setJobs(allJobs);
    } catch (error: any) {
      console.error('Error loading repair jobs:', error);
      toast.error(error?.message || 'Failed to load repair jobs');
    } finally {
      setLoading(false);
    }
  };

  // Mock data - replace with actual API data
  // Removed mock data - now using real API data from loadJobs()

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.phone?.includes(searchTerm) ||
      job.device?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device?.imei?.includes(searchTerm);

    // Match status directly with backend format
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-orange-100 text-orange-700',
      RECEIVED: 'bg-gray-100 text-gray-700',
      ASSIGNED: 'bg-yellow-100 text-yellow-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
   
      READY: 'bg-green-100 text-green-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
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

  const getPriorityIcon = (priority: string) => {
    if (priority === 'URGENT') return <AlertTriangle className="w-3 h-3" />;
    return null;
  };

  const handleViewJob = (job: RepairJob) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to cancel this repair job? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancelling this job:');
    if (!reason || reason.trim() === '') {
      toast.info('Job cancellation aborted - reason is required');
      return;
    }

    try {
      await repairApi.cancel(jobId, { reason: reason.trim() });
      toast.success('Repair job cancelled successfully');
      loadJobs(); // Reload the jobs list
    } catch (error: any) {
      console.error('Error cancelling job:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel repair job');
    }
  };

  // Calculate stats based on actual backend status values
  const stats = {
    total: jobs.length,
    pending: jobs.filter((j) => j.status === 'PENDING').length,
    received: jobs.filter((j) => j.status === 'RECEIVED').length,
    assigned: jobs.filter((j) => j.status === 'ASSIGNED').length,
    inProgress: jobs.filter((j) => j.status === 'IN_PROGRESS').length,
  
    ready: jobs.filter((j) => j.status === 'READY').length,
    completed: jobs.filter((j) => j.status === 'COMPLETED').length,
    cancelled: jobs.filter((j) => j.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">Total Jobs</div>
          <div className="text-2xl font-bold text-gray-500">{stats.total}</div>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <div className="text-sm text-orange-600 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Pending
          </div>
          <div className="text-2xl font-bold text-orange-700">{stats.received}</div>
        </div>
       
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            In Progress
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600 mb-1 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Ready
          </div>
          <div className="text-2xl font-bold text-green-700">{stats.ready}</div>
        </div>
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-gray-700">{stats.completed}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white  rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
          <div className="md:col-span-1">
            <div className="relative  text-gray-800">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-00 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by job #, customer, phone, IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as RepairStatus)}
              className="w-full px-3 py-2 border  text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="RECEIVED">Received</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="READY">Ready</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as RepairPriority)}
              className="w-full px-3 py-2 border  text-gray-800 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{formatJobNumber(job.jobNumber)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{job.customer?.name}</div>
                    <div className="text-xs text-gray-500">{job.customer?.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{job.device?.brand} {job.device?.model}</div>
                    {job.device?.imei && (
                      <div className="text-xs text-gray-500 font-mono">{job.device.imei}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={job.problemDescription}>
                      {job.problemDescription}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        job.status
                      )}`}
                    >
                      {job.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${getPriorityBadge(
                        job.priority
                      )}`}
                    >
                      {getPriorityIcon(job.priority)}
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.expectedCompletionDate
                      ? new Date(job.expectedCompletionDate).toLocaleDateString()
                      : 'TBD'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewJob(job)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditJob(job._id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Cancel Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading jobs...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No repair jobs found</p>
            <p className="text-sm mt-1">Create a new repair job to get started</p>
          </div>
        )}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No repair jobs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={`Repair Job Details - ${selectedJob?.jobNumber ? formatJobNumber(selectedJob.jobNumber) : ''}`}
        size="xl"
      >
        {selectedJob && (
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Name</p>
                  <p className="text-gray-900">{selectedJob.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Phone</p>
                  <p className="text-gray-900">{selectedJob.customer?.phone}</p>
                </div>
                {selectedJob.customer?.email && (
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Email</p>
                    <p className="text-gray-900">{selectedJob.customer.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Device Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Brand</p>
                  <p className="text-gray-900">{selectedJob.device?.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Model</p>
                  <p className="text-gray-900">{selectedJob.device?.model}</p>
                </div>
                {selectedJob.device?.imei && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">IMEI</p>
                    <p className="text-gray-900 font-mono">{selectedJob.device.imei}</p>
                  </div>
                )}
                {selectedJob.device?.serialNumber && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Serial Number</p>
                    <p className="text-gray-900 font-mono">{selectedJob.device.serialNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Job Information */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Job Number</p>
                  <p className="text-gray-900 font-semibold">{formatJobNumber(selectedJob.jobNumber)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Status</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                      selectedJob.status
                    )}`}
                  >
                    {selectedJob.status?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Priority</p>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getPriorityBadge(
                      selectedJob.priority
                    )}`}
                  >
                    {selectedJob.priority}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Assigned To</p>
                  <p className="text-gray-900">{selectedJob.assignedTo?.username || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Created Date</p>
                  <p className="text-gray-900">
                    {new Date(selectedJob.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedJob.expectedCompletionDate && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Expected Completion</p>
                    <p className="text-gray-900">
                      {new Date(selectedJob.expectedCompletionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Problem Description */}
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{selectedJob.problemDescription}</p>
            </div>

            {/* Diagnosis Notes */}
            {selectedJob.diagnosisNotes && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Diagnosis Notes</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedJob.diagnosisNotes}</p>
              </div>
            )}

            {/* Repair Notes */}
            {selectedJob.repairNotes && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Repair Notes</h3>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedJob.repairNotes}</p>
              </div>
            )}

            {/* Parts Used */}
            {selectedJob.partsUsed && selectedJob.partsUsed.length > 0 && (
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Parts Used</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Part Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Unit Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedJob.partsUsed.map((part: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{part.productName || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{part.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {part.unitPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-semibold">
                            {((part.quantity * (part.unitPrice || 0)).toFixed(2))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cost Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cost Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-700 font-medium">Labor Cost:</span>
                  <span className="text-lg font-bold text-gray-900">{(selectedJob.laborCost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-700 font-medium">Parts Cost:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {(() => {
                      // Calculate inventory parts
                      let partsCost = selectedJob.partsUsed ? selectedJob.partsUsed.reduce((sum: number, part: any) => sum + (part.quantity * (part.unitPrice || 0)), 0) : 0;
                      
                      // Add manual parts from repair notes
                      if (selectedJob.repairNotes && typeof selectedJob.repairNotes === 'string') {
                        const manualPartsMatch = selectedJob.repairNotes.match(/\[Manual Parts Used\]([\s\S]*?)(?:\n\n|$)/);
                        if (manualPartsMatch) {
                          const manualPartsText = manualPartsMatch[1];
                          const totalMatches = manualPartsText.matchAll(/Total:\s*\$?(\d+\.?\d*)/g);
                          for (const match of totalMatches) {
                            partsCost += parseFloat(match[1]) || 0;
                          }
                        }
                      }
                      
                      return partsCost.toFixed(2);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-t pt-2">
                  <span className="text-gray-700 font-medium">Total Cost:</span>
                  <span className="text-xl font-bold text-blue-700">
                    {(() => {
                      // Calculate inventory parts
                      let partsCost = selectedJob.partsUsed ? selectedJob.partsUsed.reduce((sum: number, part: any) => sum + (part.quantity * (part.unitPrice || 0)), 0) : 0;
                      
                      // Add manual parts from repair notes
                      if (selectedJob.repairNotes && typeof selectedJob.repairNotes === 'string') {
                        const manualPartsMatch = selectedJob.repairNotes.match(/\[Manual Parts Used\]([\s\S]*?)(?:\n\n|$)/);
                        if (manualPartsMatch) {
                          const manualPartsText = manualPartsMatch[1];
                          const totalMatches = manualPartsText.matchAll(/Total:\s*\$?(\d+\.?\d*)/g);
                          for (const match of totalMatches) {
                            partsCost += parseFloat(match[1]) || 0;
                          }
                        }
                      }
                      
                      return ((selectedJob.laborCost || 0) + partsCost).toFixed(2);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-gray-700 font-medium">Advance Payment:</span>
                  <span className="text-lg font-bold text-green-700">-{(selectedJob.advancePayment || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t-2 border-blue-300">
                  <span className="text-gray-900 font-bold text-lg">Balance Due:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {(() => {
                      // Calculate inventory parts
                      let partsCost = selectedJob.partsUsed ? selectedJob.partsUsed.reduce((sum: number, part: any) => sum + (part.quantity * (part.unitPrice || 0)), 0) : 0;
                      
                      // Add manual parts from repair notes
                      if (selectedJob.repairNotes && typeof selectedJob.repairNotes === 'string') {
                        const manualPartsMatch = selectedJob.repairNotes.match(/\[Manual Parts Used\]([\s\S]*?)(?:\n\n|$)/);
                        if (manualPartsMatch) {
                          const manualPartsText = manualPartsMatch[1];
                          const totalMatches = manualPartsText.matchAll(/Total:\s*\$?(\d+\.?\d*)/g);
                          for (const match of totalMatches) {
                            partsCost += parseFloat(match[1]) || 0;
                          }
                        }
                      }
                      
                      const totalCost = (selectedJob.laborCost || 0) + partsCost;
                      const balanceDue = totalCost - (selectedJob.advancePayment || 0);
                      return balanceDue.toFixed(2);
                    })()}
                  </span>
                </div>
                {selectedJob.estimatedCost && (
                  <div className="flex justify-between items-center pt-2 text-sm">
                    <span className="text-gray-500 italic">Original Estimate:</span>
                    <span className="text-gray-500 italic">{selectedJob.estimatedCost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
