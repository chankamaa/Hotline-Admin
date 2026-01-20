'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { repairApi } from '@/lib/api/repairApi';
import { Search, Phone, Smartphone, TrendingUp, DollarSign, AlertCircle, Calendar, Package, Wrench, ChevronDown, ChevronUp } from 'lucide-react';

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

interface CustomerSummary {
  customerName: string;
  customerPhone: string;
  totalRepairs: number;
  totalSpent: number;
  repairs: RepairHistoryItem[];
  deviceFrequency: { [key: string]: number };
  recurringIssues: { issue: string; count: number }[];
}

export default function RepairHistoryPage() {
  const [searchType, setSearchType] = useState<'phone' | 'imei'>('phone');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary | null>(null);
  const [expandedRepairs, setExpandedRepairs] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'device'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'search' | 'ready'>('search');
  const [readyJobs, setReadyJobs] = useState<RepairHistoryItem[]>([]);

  const handleLoadReadyJobs = async () => {
    try {
      setLoading(true);
      setViewMode('ready');
      
      const response = await repairApi.getAll({
        status: 'READY'
      });

      const jobs = response.data.repairs || [];
      setReadyJobs(jobs);
      setCustomerSummary(null);

    } catch (error: any) {
      console.error('Error loading ready jobs:', error);
      alert(error?.message || 'Failed to load ready jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      setViewMode('search');
      
      // Fetch all completed repairs
      const response = await repairApi.getAll({
        status: 'COMPLETED,CANCELLED'
      });

      const allRepairs = response.data.repairs || [];
      
      // Filter repairs based on search type
      let filteredRepairs: RepairHistoryItem[];
      
      if (searchType === 'phone') {
        filteredRepairs = allRepairs.filter((repair: RepairHistoryItem) => 
          repair.customer?.phone?.includes(searchTerm)
        );
      } else {
        filteredRepairs = allRepairs.filter((repair: RepairHistoryItem) => 
          repair.device?.imei?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repair.device?.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filteredRepairs.length === 0) {
        alert('No repair history found for this search');
        setCustomerSummary(null);
        return;
      }

      // Calculate summary
      const customerName = filteredRepairs[0].customer.name;
      const customerPhone = filteredRepairs[0].customer.phone;
      
      // Calculate device frequency
      const deviceFrequency: { [key: string]: number } = {};
      filteredRepairs.forEach(repair => {
        const deviceKey = repair.device.imei || repair.device.serialNumber || 
          `${repair.device.brand} ${repair.device.model}`;
        deviceFrequency[deviceKey] = (deviceFrequency[deviceKey] || 0) + 1;
      });

      // Identify recurring issues
      const issueMap: { [key: string]: number } = {};
      filteredRepairs.forEach(repair => {
        const issue = repair.problemDescription.toLowerCase().substring(0, 50);
        issueMap[issue] = (issueMap[issue] || 0) + 1;
      });
      
      const recurringIssues = Object.entries(issueMap)
        .filter(([_, count]) => count > 1)
        .map(([issue, count]) => ({ issue, count }))
        .sort((a, b) => b.count - a.count);

      // Calculate total spent
      const totalSpent = filteredRepairs.reduce((sum, repair) => {
        const laborCost = repair.laborCost || 0;
        const partsCost = repair.partsUsed?.reduce((partSum, part) => 
          partSum + (part.quantity * part.unitPrice), 0) || 0;
        return sum + laborCost + partsCost;
      }, 0);

      setCustomerSummary({
        customerName,
        customerPhone,
        totalRepairs: filteredRepairs.length,
        totalSpent,
        repairs: filteredRepairs,
        deviceFrequency,
        recurringIssues
      });

    } catch (error: any) {
      console.error('Error searching repair history:', error);
      alert(error?.message || 'Failed to search repair history');
    } finally {
      setLoading(false);
    }
  };

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
    if (!customerSummary && viewMode !== 'ready') return [];
    
    const repairsToSort = viewMode === 'ready' ? readyJobs : (customerSummary?.repairs || []);
    
    const sorted = [...repairsToSort].sort((a, b) => {
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
      COMPLETED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repair History"
        description="Search and view detailed repair history for customers and devices"
      />

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {/* View Mode Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setViewMode('search')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'search'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Search History
            </button>
            <button
              onClick={handleLoadReadyJobs}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                viewMode === 'ready'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ready Jobs ({readyJobs.length})
            </button>
          </div>

          {viewMode === 'search' && (
            <>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="search-phone"
                    checked={searchType === 'phone'}
                    onChange={() => setSearchType('phone')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="search-phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Customer Phone
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="search-imei"
                    checked={searchType === 'imei'}
                    onChange={() => setSearchType('imei')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="search-imei" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Device IMEI/Serial
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={
                      searchType === 'phone'
                        ? 'Enter customer phone number...'
                        : 'Enter device IMEI or Serial Number...'
                    }
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </>
          )}
          
          {viewMode === 'ready' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                Showing all jobs that are ready for pickup ({readyJobs.length} jobs)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {(customerSummary || (viewMode === 'ready' && readyJobs.length > 0)) && (
        <div className="space-y-6">
          {/* Customer Summary Cards - Only show for search results */}
          {customerSummary && viewMode === 'search' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Customer</h3>
              </div>
              <p className="text-xl font-bold text-blue-900">{customerSummary.customerName}</p>
              <p className="text-sm text-blue-700">{customerSummary.customerPhone}</p>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-medium text-purple-900">Total Repairs</h3>
              </div>
              <p className="text-3xl font-bold text-purple-900">{customerSummary.totalRepairs}</p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-sm font-medium text-green-900">Total Spent</h3>
              </div>
              <p className="text-3xl font-bold text-green-900">${customerSummary.totalSpent.toFixed(2)}</p>
            </div>

            <div className="bg-linear-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-medium text-orange-900">Avg Cost/Repair</h3>
              </div>
              <p className="text-3xl font-bold text-orange-900">
                ${(customerSummary.totalSpent / customerSummary.totalRepairs).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Device Frequency */}
          {Object.keys(customerSummary.deviceFrequency).length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600" />
                Device Repair Frequency
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(customerSummary.deviceFrequency).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm text-gray-700 font-medium">{device}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                      {count} {count === 1 ? 'repair' : 'repairs'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recurring Issues */}
          {customerSummary.recurringIssues.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Recurring Issues Detected
              </h3>
              <div className="space-y-2">
                {customerSummary.recurringIssues.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="text-sm text-gray-700">{item.issue}...</span>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                      {item.count} times
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}

          {/* Sorting Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {viewMode === 'ready' 
                  ? `Ready Jobs (${readyJobs.length})` 
                  : `Repair History (${customerSummary?.repairs.length || 0})`}
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
                          <p className="text-xl font-bold text-gray-900">${totalCost.toFixed(2)}</p>
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
                          {repair.assignedTo && (
                            <div>
                              <h5 className="text-sm font-semibold text-gray-700 mb-1">Technician</h5>
                              <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">{repair.assignedTo.username}</p>
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
                                      <td className="text-right p-2">${part.unitPrice.toFixed(2)}</td>
                                      <td className="text-right p-2 font-semibold">
                                        ${(part.quantity * part.unitPrice).toFixed(2)}
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
                            <p className="text-lg font-bold text-gray-900">${(repair.laborCost || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Parts</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${(repair.partsUsed?.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0) || 0).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="text-lg font-bold text-blue-700">${totalCost.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Advance</p>
                            <p className="text-lg font-bold text-green-700">-${(repair.advancePayment || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Balance Due</p>
                            <p className="text-xl font-bold text-orange-600">${balanceDue.toFixed(2)}</p>
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
      {!customerSummary && !loading && viewMode === 'search' && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Search Repair History</h3>
          <p className="text-gray-500">
            Enter a customer phone number or device IMEI to view repair history
          </p>
        </div>
      )}

      {/* Empty Ready Jobs State */}
      {viewMode === 'ready' && readyJobs.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Ready Jobs</h3>
          <p className="text-gray-500">
            There are no jobs currently ready for pickup
          </p>
        </div>
      )}
    </div>
  );
}
