'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RepairJobDetails from '@/components/repairs/repair-job-details';
import { RepairJob } from '@/lib/types';
import { Search, Filter, Eye, Edit, Trash2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface RepairJobListProps {
  onEditJob: (jobId: string) => void;
}

type RepairStatus = 'all' | 'received' | 'in-progress' | 'waiting-parts' | 'ready' | 'delivered';
type RepairPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent';

export default function RepairJobList({ onEditJob }: RepairJobListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RepairStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<RepairPriority>('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data - replace with actual API data
  const [jobs] = useState<RepairJob[]>([
    {
      id: '1',
      jobNumber: 'REP-001',
      customer: {
        id: 'c1',
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        totalPurchases: 0,
        createdAt: new Date(),
      },
      device: 'iPhone 14 Pro',
      deviceType: 'Mobile Phone',
      brand: 'Apple',
      model: 'iPhone 14 Pro',
      imei: '123456789012345',
      issue: 'Cracked screen needs replacement',
      diagnosis: 'LCD intact, digitizer damaged',
      estimatedCost: 250,
      finalCost: 250,
      status: 'in-progress',
      priority: 'high',
      technicianId: 't1',
      technicianName: 'Mike Johnson',
      parts: [{ partId: 'p1', partName: 'iPhone 14 Pro Screen', quantity: 1, cost: 180 }],
      laborCost: 70,
      notes: 'Customer requested express service',
      createdAt: new Date('2026-01-03T10:00:00'),
      expectedCompletionDate: new Date('2026-01-05T18:00:00'),
    },
    {
      id: '2',
      jobNumber: 'REP-002',
      customer: {
        id: 'c2',
        name: 'Sarah Williams',
        phone: '+1234567891',
        email: 'sarah@example.com',
        totalPurchases: 0,
        createdAt: new Date(),
      },
      device: 'Samsung Galaxy S23',
      deviceType: 'Mobile Phone',
      brand: 'Samsung',
      model: 'Galaxy S23',
      imei: '987654321098765',
      issue: 'Battery draining quickly',
      diagnosis: 'Battery health at 60%, needs replacement',
      estimatedCost: 120,
      status: 'waiting-parts',
      priority: 'medium',
      technicianId: 't2',
      technicianName: 'Alex Chen',
      parts: [],
      laborCost: 40,
      notes: 'Waiting for battery shipment',
      createdAt: new Date('2026-01-04T14:30:00'),
      expectedCompletionDate: new Date('2026-01-08T16:00:00'),
    },
    {
      id: '3',
      jobNumber: 'REP-003',
      customer: {
        id: 'c3',
        name: 'Robert Brown',
        phone: '+1234567892',
        totalPurchases: 0,
        createdAt: new Date(),
      },
      device: 'MacBook Pro 2021',
      deviceType: 'Laptop',
      brand: 'Apple',
      model: 'MacBook Pro 16"',
      issue: 'Keyboard keys not responding',
      estimatedCost: 300,
      status: 'ready',
      priority: 'high',
      technicianId: 't1',
      technicianName: 'Mike Johnson',
      parts: [{ partId: 'p2', partName: 'MacBook Keyboard Assembly', quantity: 1, cost: 220 }],
      laborCost: 80,
      createdAt: new Date('2026-01-02T09:00:00'),
      expectedCompletionDate: new Date('2026-01-05T12:00:00'),
      completedAt: new Date('2026-01-05T11:30:00'),
    },
  ]);

  const technicians = [
    { id: 't1', name: 'Mike Johnson' },
    { id: 't2', name: 'Alex Chen' },
    { id: 't3', name: 'Emily Rodriguez' },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.phone.includes(searchTerm) ||
      job.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.imei?.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter;
    const matchesTechnician =
      technicianFilter === 'all' || job.technicianId === technicianFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesTechnician;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      received: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'waiting-parts': 'bg-orange-100 text-orange-700',
      ready: 'bg-green-100 text-green-700',
      delivered: 'bg-purple-100 text-purple-700',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return badges[priority as keyof typeof badges] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent') return <AlertTriangle className="w-3 h-3" />;
    return null;
  };

  const handleViewJob = (job: RepairJob) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this repair job?')) {
      // Implement delete logic
      console.log('Delete job:', jobId);
    }
  };

  const stats = {
    total: jobs.length,
    received: jobs.filter((j) => j.status === 'received').length,
    inProgress: jobs.filter((j) => j.status === 'in-progress').length,
    waitingParts: jobs.filter((j) => j.status === 'waiting-parts').length,
    ready: jobs.filter((j) => j.status === 'ready').length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">Total Jobs</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-600 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            In Progress
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.inProgress}</div>
        </div>
        <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
          <div className="text-sm text-orange-600 mb-1">Waiting Parts</div>
          <div className="text-2xl font-bold text-orange-700">{stats.waitingParts}</div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="text-sm text-green-600 mb-1 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Ready
          </div>
          <div className="text-2xl font-bold text-green-700">{stats.ready}</div>
        </div>
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="text-sm text-gray-600 mb-1">Received</div>
          <div className="text-2xl font-bold text-gray-700">{stats.received}</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="received">Received</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting-parts">Waiting Parts</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as RepairPriority)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <select
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
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
                  Technician
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
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600">{job.jobNumber}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{job.customer.name}</div>
                    <div className="text-xs text-gray-500">{job.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{job.device}</div>
                    {job.imei && (
                      <div className="text-xs text-gray-500 font-mono">{job.imei}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={job.issue}>
                      {job.issue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.technicianName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(
                        job.status
                      )}`}
                    >
                      {job.status.replace('-', ' ')}
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
                        onClick={() => onEditJob(job.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No repair jobs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showDetails && selectedJob && (
        <RepairJobDetails
          job={selectedJob}
          onClose={() => {
            setShowDetails(false);
            setSelectedJob(null);
          }}
          onEdit={() => {
            setShowDetails(false);
            onEditJob(selectedJob.id);
          }}
        />
      )}
    </div>
  );
}
