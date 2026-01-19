'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { repairApi } from '@/lib/api/repairApi';
import { useToast } from '@/providers/toast-provider';
import { getMe } from '@/lib/auth';
import { Clock, DollarSign, CheckCircle, Calendar } from 'lucide-react';

interface RepairHistoryItem {
  _id: string;
  jobNumber: string;
  customer: {
    name: string;
    phone: string;
  };
  device: {
    brand: string;
    model: string;
    imei?: string;
  };
  problemDescription: string;
  status: string;
  priority: string;
  assignedTo?: {
    username: string;
  };
  finalCost?: number;
  laborCost?: number;
  completedAt?: string;
  createdAt: string;
}

export default function RepairHistoryPage() {
  const toast = useToast();
  const [history, setHistory] = useState<RepairHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTechnician, setIsTechnician] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const user = await getMe();
      const techRole = user.role?.name?.toLowerCase() === 'technician';
      setIsTechnician(techRole);
      loadHistory(techRole);
    } catch (error) {
      console.error('Error checking user role:', error);
      toast.error('Failed to load user information');
    }
  };

  const loadHistory = async (isTech: boolean) => {
    try {
      setLoading(true);
      let response;
      
      if (isTech) {
        // Technicians see only their completed jobs
        response = await repairApi.getMyJobs({ 
          status: 'COMPLETED,CANCELLED'
        });
      } else {
        // Admin/Manager see all completed/cancelled jobs
        response = await repairApi.getAll({
          status: 'COMPLETED,CANCELLED'
        });
      }
      
      const completedJobs = response.data.repairs || [];
      setHistory(completedJobs);
    } catch (error: any) {
      console.error('Error loading repair history:', error);
      toast.error(error?.message || 'Failed to load repair history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((job) => {
    const matchesSearch =
      job.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.phone?.includes(searchTerm) ||
      job.device?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.device?.model?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return `$${amount.toFixed(2)}`;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading repair history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repair History"
        description={
          isTechnician
            ? "View your completed repair jobs"
            : "View all completed and cancelled repair jobs"
        }
      />

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <input
          type="text"
          placeholder="Search by job number, customer, device..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredHistory.filter(j => j.status === 'COMPLETED').length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredHistory
                    .filter(j => j.status === 'COMPLETED')
                    .reduce((sum, j) => sum + (j.finalCost || 0), 0)
                )}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Cancelled Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredHistory.filter(j => j.status === 'CANCELLED').length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-gray-500" />
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Problem
                </th>
                {!isTechnician && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technician
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={isTechnician ? 7 : 8} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Calendar className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-lg font-medium">No repair history found</p>
                      <p className="text-sm mt-1">
                        {isTechnician
                          ? "You haven't completed any repair jobs yet"
                          : "No completed or cancelled jobs to display"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {job.jobNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{job.customer?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {job.device?.brand} {job.device?.model}
                      </div>
                      {job.device?.imei && (
                        <div className="text-sm text-gray-500">IMEI: {job.device.imei}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {job.problemDescription || 'No description'}
                      </div>
                    </td>
                    {!isTechnician && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.assignedTo?.username || 'Unassigned'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          job.status
                        )}`}
                      >
                        {job.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(job.finalCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.completedAt || job.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
