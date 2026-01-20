'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import RequirePerm from '@/components/RequirePerm';
import { PERMISSIONS } from '@/components/sidebar-config';
import { repairApi, RepairJob, Technician } from '@/lib/api/repairApi';
import { Users, Package, Clock, CheckCircle, AlertTriangle, TrendingUp, RefreshCw, Search, X } from 'lucide-react';

export default function RepairWorkloadPage() {
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobsResponse, techsResponse] = await Promise.all([
        repairApi.getAll({ limit: 500 }),
        repairApi.getTechnicians()
      ]);
      
      setJobs(jobsResponse.data?.repairs || []);
      setTechnicians(techsResponse.data?.technicians || []);
    } catch (error) {
      console.error('Failed to load workload data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group jobs by technician
  const jobsByTechnician = jobs.reduce((acc, job) => {
    const techId = typeof job.assignedTo === 'object' && job.assignedTo ? job.assignedTo._id : job.assignedTo as string;
    const techName = typeof job.assignedTo === 'object' && job.assignedTo ? job.assignedTo.username : 'Unassigned';
    
    if (!techId) {
      if (!acc['unassigned']) {
        acc['unassigned'] = { name: 'Unassigned', jobs: [] };
      }
      acc['unassigned'].jobs.push(job);
    } else {
      if (!acc[techId]) {
        acc[techId] = { name: techName, jobs: [] };
      }
      acc[techId].jobs.push(job);
    }
    return acc;
  }, {} as Record<string, { name: string; jobs: RepairJob[] }>);

  // Filter by search term
  const filteredTechnicians = Object.entries(jobsByTechnician).filter(([techId, data]) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return data.name.toLowerCase().includes(searchLower) ||
           data.jobs.some(job => 
             job.jobNumber?.toLowerCase().includes(searchLower) ||
             job.customer?.name?.toLowerCase().includes(searchLower)
           );
  });

  // Apply technician filter
  const displayedTechnicians = selectedTechnician === 'all' 
    ? filteredTechnicians 
    : filteredTechnicians.filter(([techId]) => techId === selectedTechnician);

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

  const getJobsByStatus = (jobs: RepairJob[], status: string) => {
    return jobs.filter(job => job.status === status);
  };

  // Calculate overall statistics
  const stats = {
    totalTechnicians: Object.keys(jobsByTechnician).length,
    totalJobs: jobs.length,
    assigned: jobs.filter(j => j.status === 'ASSIGNED').length,
    inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
    ready: jobs.filter(j => j.status === 'READY').length,
  };

  return (
    <RequirePerm perm={PERMISSIONS.REPAIR_READ}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Technician Workload"
          description="Monitor all technicians and their assigned repair jobs"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total Technicians</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalTechnicians}</div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-sm text-gray-500 mb-1">Total Jobs</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalJobs}</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 mb-1">Assigned</div>
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 mb-1">Ready</div>
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border rounded-lg p-4 space-y-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by technician name, job number, or customer..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Technician Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTechnician('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTechnician === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Technicians ({Object.keys(jobsByTechnician).length})
            </button>
            {Object.entries(jobsByTechnician).map(([techId, data]) => (
              <button
                key={techId}
                onClick={() => setSelectedTechnician(techId)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTechnician === techId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {data.name} ({data.jobs.length})
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12 bg-white rounded-lg border">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading workload data...</span>
          </div>
        ) : (
          <>
            {/* Technician Cards */}
            {displayedTechnicians.length === 0 ? (
              <div className="bg-white rounded-lg border p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? `No technicians or jobs matching "${searchTerm}"`
                    : 'No technicians with assigned jobs'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {displayedTechnicians.map(([techId, data]) => {
                  const assignedJobs = getJobsByStatus(data.jobs, 'ASSIGNED');
                  const inProgressJobs = getJobsByStatus(data.jobs, 'IN_PROGRESS');
                  const readyJobs = getJobsByStatus(data.jobs, 'READY');

                  return (
                    <div key={techId} className="bg-white border rounded-lg overflow-hidden">
                      {/* Technician Header */}
                      <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users className="h-8 w-8" />
                            <div>
                              <h3 className="text-xl font-bold">{data.name}</h3>
                              <p className="text-blue-100 text-sm">
                                {data.jobs.length} Total Job{data.jobs.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-6 text-sm">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{assignedJobs.length}</div>
                              <div className="text-blue-100">Assigned</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{inProgressJobs.length}</div>
                              <div className="text-blue-100">In Progress</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{readyJobs.length}</div>
                              <div className="text-blue-100">Ready</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Jobs Grid */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Assigned Jobs */}
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Clock className="h-5 w-5 text-blue-600" />
                              Assigned ({assignedJobs.length})
                            </h4>
                            <div className="space-y-3">
                              {assignedJobs.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No assigned jobs</p>
                              ) : (
                                assignedJobs.map(job => (
                                  <div key={job._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="font-semibold text-sm">{job.jobNumber}</span>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(job.status)}`}>
                                        {job.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">{job.customer.name}</p>
                                    <p className="text-xs text-gray-500">{job.device.brand} {job.device.model}</p>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{job.problemDescription}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* In Progress Jobs */}
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-purple-600" />
                              In Progress ({inProgressJobs.length})
                            </h4>
                            <div className="space-y-3">
                              {inProgressJobs.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No jobs in progress</p>
                              ) : (
                                inProgressJobs.map(job => (
                                  <div key={job._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="font-semibold text-sm">{job.jobNumber}</span>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(job.status)}`}>
                                        {job.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">{job.customer.name}</p>
                                    <p className="text-xs text-gray-500">{job.device.brand} {job.device.model}</p>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{job.problemDescription}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Ready Jobs */}
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              Ready ({readyJobs.length})
                            </h4>
                            <div className="space-y-3">
                              {readyJobs.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No ready jobs</p>
                              ) : (
                                readyJobs.map(job => (
                                  <div key={job._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-2">
                                      <span className="font-semibold text-sm">{job.jobNumber}</span>
                                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(job.status)}`}>
                                        {job.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">{job.customer.name}</p>
                                    <p className="text-xs text-gray-500">{job.device.brand} {job.device.model}</p>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{job.problemDescription}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </RequirePerm>
  );
}
