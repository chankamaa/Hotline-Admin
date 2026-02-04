'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { repairApi } from '@/lib/api/repairApi';
import { Search, Phone, Smartphone, TrendingUp, DollarSign, AlertCircle, Calendar, Package, Wrench, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface RepairHistoryItem {
  _id: string;
  jobNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  device: {
    type: string;
    brand: string;
    model: string;
    imei?: string;
    serialNumber?: string;
  };
  problemDescription: string;
  repairNotes?: string;
  diagnosisNotes?: string;
  status: string;
  priority: string;
  laborCost?: number;
  advancePayment?: number;
  finalCost?: number;
  estimatedCost?: number;
  partsUsed?: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  createdAt: string;
  completedAt?: string;
  assignedTo?: {
    username: string;
  };
}

export default function RepairHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedRepairs, setExpandedRepairs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'device'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<'READY' | 'RECEIVED'>('READY');
  const [jobs, setJobs] = useState<RepairHistoryItem[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<RepairHistoryItem[]>([]);

  const loadJobs = async (status: 'READY' | 'RECEIVED') => {
    try {
      setLoading(true);
      setStatusFilter(status);
      
      const response = await repairApi.getAll({
        status: status
      });

      const jobList = response.data.repairs || [];
      setJobs(jobList);
      setFilteredJobs(jobList);
      setSearchTerm(''); // Clear search when switching status

    } catch (error: any) {
      console.error(`Error loading ${status.toLowerCase()} jobs:`, error);
      alert(error?.message || `Failed to load ${status.toLowerCase()} jobs`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const searchLower = value.toLowerCase().trim();
    
    const filtered = jobs.filter((job) => {
      const customerName = job.customer?.name?.toLowerCase() || '';
      const customerPhone = job.customer?.phone?.toLowerCase() || '';
      const jobNumber = job.jobNumber?.toLowerCase() || '';
      
      return (
        customerName.includes(searchLower) ||
        customerPhone.includes(searchLower) ||
        jobNumber.includes(searchLower)
      );
    });
    
    setFilteredJobs(filtered);
  };
  
  // Load jobs on component mount
  React.useEffect(() => {
    loadJobs('READY');
  }, []);

  const toggleRepairDetails = (repairId: string) => {
    const newExpanded = new Set(expandedRepairs);
    if (newExpanded.has(repairId)) {
      newExpanded.delete(repairId);
    } else {
      newExpanded.add(repairId);
    }
    setExpandedRepairs(newExpanded);
  };

  const getSortedRepairs = () => {
    const sorted = [...filteredJobs].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'cost':
          const costA = (a.laborCost || 0) + (a.partsUsed?.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) || 0);
          const costB = (b.laborCost || 0) + (b.partsUsed?.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) || 0);
          comparison = costA - costB;
          break;
        case 'device':
          comparison = `${a.device.brand} ${a.device.model}`.localeCompare(`${b.device.brand} ${b.device.model}`);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: string } = {
      READY: 'bg-green-100 text-green-700',
      RECEIVED: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-gray-100 text-gray-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link
          href="/admin/repairs"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Repair Jobs
        </Link>
      </div>
      
      <PageHeader
        title="Repair History"
        description="View and search Ready and Received repair jobs"
      />

      {/* Filter and Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => loadJobs('READY')}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                statusFilter === 'READY'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                Ready Jobs
                {statusFilter === 'READY' && <span className="bg-white text-green-600 px-2 py-0.5 rounded-full text-sm font-bold">{jobs.length}</span>}
              </div>
            </button>
            <button
              onClick={() => loadJobs('RECEIVED')}
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                statusFilter === 'RECEIVED'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wrench className="w-5 h-5" />
                Received Jobs
                {statusFilter === 'RECEIVED' && <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm font-bold">{jobs.length}</span>}
              </div>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by customer name, job number, or phone number..."
              className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          {/* Results Summary */}
          <div className={`border rounded-lg p-3 ${
            statusFilter === 'READY' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`font-medium ${
              statusFilter === 'READY' ? 'text-green-800' : 'text-blue-800'
            }`}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                  Loading...
                </span>
              ) : (
                <>
                  Showing {filteredJobs.length} of {jobs.length} {statusFilter.toLowerCase()} job{jobs.length !== 1 ? 's' : ''}
                  {searchTerm && ` matching "${searchTerm}"`}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {filteredJobs.length > 0 && (
        <div className="space-y-6">
          {/* Sorting Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {statusFilter === 'READY' ? 'Ready' : 'Received'} Jobs ({filteredJobs.length})
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'cost' | 'device')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Date</option>
                  <option value="cost">Cost</option>
                  <option value="device">Device</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>
              </div>
            </div>
          </div>

          {/* Repairs List */}
          <div className="space-y-4">
            {getSortedRepairs().map((repair) => {
              const isExpanded = expandedRepairs.has(repair._id);
              const totalCost = (repair.laborCost || 0) + 
                (repair.partsUsed?.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) || 0);
              const balanceDue = totalCost - (repair.advancePayment || 0);

              return (
                <div key={repair._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Repair Header */}
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleRepairDetails(repair._id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-blue-600">{repair.jobNumber}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(repair.status)}`}>
                            {repair.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500">Device:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {repair.device.brand} {repair.device.model}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">IMEI:</span>
                            <span className="ml-2 font-medium text-gray-900 font-mono">
                              {repair.device.imei || repair.device.serialNumber || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {new Date(repair.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">
                          <span className="font-medium">Issue:</span> {repair.problemDescription}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Cost</p>
                          <p className="text-xl font-bold text-gray-900">{totalCost.toFixed(2)}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Diagnosis & Repair Notes */}
                        <div className="space-y-3">
                          {repair.diagnosisNotes && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Diagnosis Notes</h5>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">{repair.diagnosisNotes}</p>
                            </div>
                          )}
                          {repair.repairNotes && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Repair Notes</h5>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">{repair.repairNotes}</p>
                            </div>
                          )}
                        </div>

                        {/* Parts Used */}
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Parts Replaced
                          </h5>
                          {repair.partsUsed && repair.partsUsed.length > 0 ? (
                            <div className="bg-white rounded-lg overflow-hidden">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="text-left p-2 font-semibold">Part</th>
                                    <th className="text-center p-2 font-semibold">Qty</th>
                                    <th className="text-right p-2 font-semibold">Price</th>
                                    <th className="text-right p-2 font-semibold">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {repair.partsUsed.map((part, index) => (
                                    <tr key={index}>
                                      <td className="p-2">{part.productName}</td>
                                      <td className="text-center p-2">{part.quantity}</td>
                                      <td className="text-right p-2">{part.unitPrice.toFixed(2)}</td>
                                      <td className="text-right p-2 font-semibold">
                                        {(part.quantity * part.unitPrice).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic bg-white p-3 rounded-lg">No parts replaced</p>
                          )}
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="bg-linear-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200">
                        <h5 className="text-sm font-semibold text-gray-900 mb-3">Cost Breakdown</h5>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Labor</p>
                            <p className="text-lg font-bold text-gray-900">{(repair.laborCost || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Parts</p>
                            <p className="text-lg font-bold text-gray-900">
                              {(repair.partsUsed?.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) || 0).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="text-lg font-bold text-blue-700">{totalCost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Advance</p>
                            <p className="text-lg font-bold text-green-700">-{(repair.advancePayment || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Balance Due</p>
                            <p className="text-xl font-bold text-orange-600">{balanceDue.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(repair.createdAt).toLocaleString()}</span>
                        </div>
                        {repair.completedAt && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Completed: {new Date(repair.completedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredJobs.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          {searchTerm ? (
            <>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
              <p className="text-gray-500">
                No jobs found matching "{searchTerm}"
              </p>
            </>
          ) : (
            <>
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No {statusFilter === 'READY' ? 'Ready' : 'Received'} Jobs
              </h3>
              <p className="text-gray-500">
                There are no {statusFilter.toLowerCase()} jobs at the moment
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
