'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, Activity, Clock, CheckCircle, AlertTriangle, TrendingUp, Package, Wrench, PlayCircle, Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { repairApi, RepairJob } from '@/lib/api/repairApi';
import { searchProducts } from '@/lib/api/productApi';
import { useAuth } from '@/providers/providers';

interface PartUsed {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface ProductSearchResult {
  _id: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  sku?: string;
}

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<RepairJob | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    repairNotes: '',
    diagnosisNotes: '',
    laborCost: 0,
    advancePayment: 0,
    status: '',
    partsUsed: [] as PartUsed[],
  });
  const [saving, setSaving] = useState(false);
  
  // Part autocomplete states
  const [partSuggestions, setPartSuggestions] = useState<ProductSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);
  const [searchingParts, setSearchingParts] = useState(false);

  // Fetch technician's assigned jobs
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch all jobs including completed ones for statistics
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSuggestions !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.part-autocomplete')) {
          setShowSuggestions(null);
          setPartSuggestions([]);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  // Filter jobs by status
  const filteredJobs = statusFilter === 'all' 
    ? jobs 
    : jobs.filter(job => job.status === statusFilter);

  // Apply search filter on top of status filter
  const searchFilteredJobs = filteredJobs.filter((job) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search by job number
    if (job.jobNumber?.toLowerCase().includes(searchLower)) return true;
    
    // Search by customer name
    if (job.customer?.name?.toLowerCase().includes(searchLower)) return true;
    
    // Search by part names
    if (job.partsUsed && job.partsUsed.some(part => 
      part.productName?.toLowerCase().includes(searchLower)
    )) return true;
    
    return false;
  });

  // Calculate statistics
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'PENDING' || j.status === 'ASSIGNED').length,
    inProgress: jobs.filter(j => j.status === 'IN_PROGRESS').length,
    ready: jobs.filter(j => j.status === 'READY').length,
   
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

  const handleEditJob = (job: RepairJob) => {
    setSelectedJob(job);
    setEditForm({
      repairNotes: job.repairNotes || '',
      diagnosisNotes: job.diagnosisNotes || '',
      laborCost: job.laborCost || 0,
      advancePayment: job.advancePayment || 0,
      status: job.status,
      partsUsed: job.partsUsed?.map(part => ({
        productId: typeof part.product === 'string' ? part.product : part.product._id,
        productName: part.productName,
        quantity: part.quantity,
        unitPrice: part.unitPrice,
      })) || [],
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      repairNotes: '',
      diagnosisNotes: '',
      laborCost: 0,
      advancePayment: 0,
      status: '',
      partsUsed: [],
    });
    setShowSuggestions(null);
    setPartSuggestions([]);
  };

  const handleAddPart = () => {
    setEditForm(prev => ({
      ...prev,
      partsUsed: [...prev.partsUsed, { productId: '', productName: '', quantity: 1, unitPrice: 0 }],
    }));
  };

  const handleRemovePart = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.filter((_, i) => i !== index),
    }));
  };

  const handlePartChange = (index: number, field: keyof PartUsed, value: string | number) => {
    setEditForm(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.map((part, i) => 
        i === index ? { ...part, [field]: value } : part
      ),
    }));
  };

  // Search parts for autocomplete
  const handlePartNameSearch = async (index: number, searchQuery: string) => {
    handlePartChange(index, 'productName', searchQuery);
    
    if (searchQuery.length < 2) {
      setPartSuggestions([]);
      setShowSuggestions(null);
      return;
    }

    try {
      setSearchingParts(true);
      const response = await searchProducts(searchQuery);
      setPartSuggestions(response.data.products || []);
      setShowSuggestions(index);
    } catch (error) {
      console.error('Error searching parts:', error);
      setPartSuggestions([]);
    } finally {
      setSearchingParts(false);
    }
  };

  // Select a part from suggestions
  const handleSelectPart = (index: number, product: ProductSearchResult) => {
    setEditForm(prev => ({
      ...prev,
      partsUsed: prev.partsUsed.map((part, i) => 
        i === index ? {
          ...part,
          productId: product._id,
          productName: product.name,
          unitPrice: product.sellingPrice,
        } : part
      ),
    }));
    setShowSuggestions(null);
    setPartSuggestions([]);
  };

  // Calculate total cost dynamically
  const calculateTotalCost = () => {
    const partsCost = editForm.partsUsed.reduce((sum, part) => 
      sum + (part.quantity * part.unitPrice), 0
    );
    const totalCost = editForm.laborCost + partsCost;
    const balanceDue = totalCost - editForm.advancePayment;
    
    return {
      partsCost,
      totalCost,
      balanceDue,
    };
  };

  const handleSaveChanges = async () => {
    if (!selectedJob) return;

    try {
      setSaving(true);

      // If status is changing to READY or COMPLETED, use complete endpoint
      if ((editForm.status === 'READY' || editForm.status === 'COMPLETED') && 
          (selectedJob.status !== 'READY' && selectedJob.status !== 'COMPLETED')) {
        
        // Validate labor cost is provided when completing
        if (editForm.laborCost === 0) {
          alert('Please enter labor cost before marking job as ready/completed');
          setSaving(false);
          return;
        }

        const response = await repairApi.complete(selectedJob._id, {
          laborCost: editForm.laborCost,
          partsUsed: editForm.partsUsed
            .filter(p => p.productId && p.quantity > 0)
            .map(part => ({
              productId: part.productId,
              quantity: part.quantity,
              unitPrice: part.unitPrice || 0,
            })),
          diagnosisNotes: editForm.diagnosisNotes || undefined,
          repairNotes: editForm.repairNotes || undefined,
        });
        
        console.log('Job completed successfully:', response);
      } else {
        // For other updates, just update the notes
        const response = await repairApi.update(selectedJob._id, {
          repairNotes: editForm.repairNotes || undefined,
          diagnosisNotes: editForm.diagnosisNotes || undefined,
        });
        
        console.log('Job updated successfully:', response);
      }

      // Refresh jobs list
      const jobsResponse = await repairApi.getMyJobs();
      setJobs(jobsResponse.data.repairs || []);
      
      // Update selected job
      const updatedJob = jobsResponse.data.repairs.find((j: RepairJob) => j._id === selectedJob._id);
      if (updatedJob) {
        setSelectedJob(updatedJob);
      }

      setIsEditing(false);
      alert('✅ Job updated successfully!');
    } catch (err: any) {
      console.error('Error updating job:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update job. Please check your connection and try again.';
      alert('❌ Error: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (job: RepairJob) => {
    // Cancel the deletion action
    alert('🚫 Delete action cancelled');
    console.log('Delete action cancelled for job:', job.jobNumber);
    return;
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
        <h2 className="text-2xl font-bold mb-">Welcome back, {user?.username || 'Technician'}!</h2>
        <p className="text-blue-100">Here are your assigned repair jobs</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-gray-500">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-sm text-gray-00 mb-1 flex items-center gap-2">
            <Package className="w-4 h-4" />
            Total Jobs
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
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

      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Activity className="h-5 w-5 text-gray-800" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Job ID, Customer Name, or Part Name..."
            className="block w-full pl-10 pr-3 py-3 text-gray-800 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-800 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Found {searchFilteredJobs.length} job(s) matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All Jobs', value: 'all' },
          
            { label: 'Assigned', value: 'ASSIGNED' },
            { label: 'In Progress', value: 'IN_PROGRESS' },
            { label: 'Ready', value: 'READY' },
         
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
      {searchFilteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-cente texr">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Jobs Found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No jobs matching "${searchTerm}"${statusFilter !== 'all' ? ` with status "${statusFilter}"` : ''}`
              : statusFilter === 'all' 
                ? "You don't have any assigned jobs yet."
                : `No jobs with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {searchFilteredJobs.map((job) => (
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
                <p className="text-xs text-gray-700">{job.device.type}</p>
                {job.device.serialNumber && (
                  <p className="text-xs text-gray-700 mt-1">S/N: {job.device.serialNumber}</p>
                )}
              </div>

              {/* Problem Description */}
              <div className="mb-4">
                <p className="text-xs text-gray-700 font-semibold mb-1">Problem:</p>
                <p className="text-sm text-gray-800">{job.problemDescription}</p>
              </div>

              {/* Cost Info */}
              <div className="flex items-center justify-between mb-4 pt-3 border-t">
                <div>
                  <p className="text-xs text-gray-700">Total Cost</p>
                  <p className="text-lg font-bold text-gray-900">{job.totalCost || 0}</p>
                </div>
                {job.expectedCompletionDate && (
                  <div className="text-right">
                    <p className="text-xs text-gray-700">Expected</p>
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
            <h3 className="text-xl font-bold text-gray-800">Job Details: {selectedJob.jobNumber}</h3>
            <div className="flex items-center gap-2">
              {!isEditing && selectedJob.status !== 'COMPLETED' && selectedJob.status !== 'CANCELLED' && (
                <button
                  onClick={() => handleEditJob(selectedJob)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Job
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setIsEditing(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Customer Information</h4>
              <div className="space-y-2 text-sm text-gray-400">
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
              <div className="space-y-2 text-sm text-gray-400">
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

            {/* Problem Description */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-700 mb-3">Problem Description</h4>
              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">{selectedJob.problemDescription}</p>
            </div>

            {/* Editable Section */}
            {isEditing ? (
              <>
                {/* Diagnosis Notes - Editable */}
                <div className="md:col-span-2 text-gray-400">
                  <label className="block font-semibold text-gray-700 mb-2">Diagnosis Notes</label>
                  <textarea
                    value={editForm.diagnosisNotes}
                    onChange={(e) => setEditForm({ ...editForm, diagnosisNotes: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter diagnosis findings..."
                  />
                </div>

                {/* Repair Notes - Editable */}
                <div className="md:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-2">Repair Notes</label>
                  <textarea
                    value={editForm.repairNotes}
                    onChange={(e) => setEditForm({ ...editForm, repairNotes: e.target.value })}
                    className="w-full p-3 border semibold text-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter repair details and work performed..."
                  />
                </div>

                {/* Status - Editable */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Job Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                  >
                    
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="READY">Ready for Pickup</option>
                  
                  </select>
                </div>

                {/* Labor Cost - Editable */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Labor Cost ($)</label>
                  <input
                    type="number"
                    value={editForm.laborCost}
                    onChange={(e) => setEditForm({ ...editForm, laborCost: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                {/* Advance Payment - Editable */}
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Advance Payment ($)</label>
                  <input
                    type="number"
                    value={editForm.advancePayment}
                    onChange={(e) => setEditForm({ ...editForm, advancePayment: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    disabled
                  />
                </div>

                {/* Cost Summary - Live Calculation */}
                <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3 text-lg">Cost Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Labor Cost</p>
                      <p className="text-xl font-bold text-gray-900">${editForm.laborCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Parts Cost</p>
                      <p className="text-xl font-bold text-gray-900">${calculateTotalCost().partsCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Cost</p>
                      <p className="text-xl font-bold text-blue-700">${calculateTotalCost().totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Advance Payment</p>
                      <p className="text-xl font-bold text-green-700">-${editForm.advancePayment.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-blue-300">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold text-gray-700">Balance Due:</p>
                      <p className="text-2xl font-bold text-orange-600">${calculateTotalCost().balanceDue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Parts Used - Editable */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-semibold text-gray-700">Parts Used</label>
                    <button
                      onClick={handleAddPart}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Part
                    </button>
                  </div>
                  
                  {editForm.partsUsed.length === 0 ? (
                    <p className="text-sm text-gray-800 italic">No parts added yet. Click "Add Part" to add parts used.</p>
                  ) : (
                    <div className="space-y-3  text-gray-900">
                      {editForm.partsUsed.map((part, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-lg">
                          <div className="col-span-4">
                            <label className="block text-xs text-gray-600 mb-1">Part ID</label>
                            <input
                              type="text"
                              value={part.productId}
                              onChange={(e) => handlePartChange(index, 'productId', e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                              placeholder="Product ID"
                            />
                          </div>
                          <div className="col-span-3 relative part-autocomplete">
                            <label className="block text-xs text-gray-600 mb-1">Part Name</label>
                            <input
                              type="text"
                              value={part.productName}
                              onChange={(e) => handlePartNameSearch(index, e.target.value)}
                              onFocus={() => {
                                if (part.productName.length >= 2) {
                                  handlePartNameSearch(index, part.productName);
                                }
                              }}
                              className="w-full p-2 border rounded text-sm"
                              placeholder="Type to search..."
                              autoComplete="off"
                            />
                            {/* Autocomplete dropdown */}
                            {showSuggestions === index && partSuggestions.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {partSuggestions.map((product) => (
                                  <div
                                    key={product._id}
                                    onClick={() => handleSelectPart(index, product)}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                  >
                                    <div className="font-medium text-sm text-gray-900">{product.name}</div>
                                    <div className="text-xs text-gray-500 flex justify-between">
                                      <span>{product.sku || 'No SKU'}</span>
                                      <span className="font-semibold text-blue-600">${product.sellingPrice.toFixed(2)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {showSuggestions === index && searchingParts && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-center text-sm text-gray-500">
                                Searching...
                              </div>
                            )}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Quantity</label>
                            <input
                              type="number"
                              value={part.quantity}
                              onChange={(e) => handlePartChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              className="w-full p-2 border rounded text-sm"
                              min="1"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-600 mb-1">Price ($)</label>
                            <input
                              type="number"
                              value={part.unitPrice}
                              onChange={(e) => handlePartChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border rounded text-sm"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="col-span-1">
                            <button
                              onClick={() => handleRemovePart(index)}
                              className="w-full p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                              title="Remove part"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save/Cancel Buttons */}
                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Read-only view */}
                {selectedJob.diagnosisNotes && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-3">Diagnosis Notes</h4>
                    <p className="text-sm text-gray-800 bg-yellow-50 p-3 rounded">{selectedJob.diagnosisNotes}</p>
                  </div>
                )}

                {selectedJob.repairNotes && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-3">Repair Notes</h4>
                    <p className="text-sm text-gray-800 bg-blue-50 p-3 rounded">{selectedJob.repairNotes}</p>
                  </div>
                )}

                {/* Parts Used - Read-only */}
                {selectedJob.partsUsed && selectedJob.partsUsed.length > 0 && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-gray-700 mb-3">Parts Used</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm  text-gray-800">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 font-semibold">Part Name</th>
                            <th className="text-center p-2 font-semibold">Quantity</th>
                            <th className="text-right p-2 font-semibold">Unit Price</th>
                            <th className="text-right p-2 font-semibold">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedJob.partsUsed.map((part, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{part.productName}</td>
                              <td className="text-center p-2">{part.quantity}</td>
                              <td className="text-right p-2">${part.unitPrice.toFixed(2)}</td>
                              <td className="text-right p-2 font-semibold">${part.total.toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr className="border-t bg-gray-50 font-semibold">
                            <td colSpan={3} className="p-2 text-right">Parts Total:</td>
                            <td className="text-right p-2">${selectedJob.partsTotal?.toFixed(2) || '0.00'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Cost Breakdown - Always visible */}
            {!isEditing && (
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3">Cost Information</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Labor Cost</p>
                    <p className="text-lg font-bold text-gray-900">${selectedJob.laborCost || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Parts Total</p>
                    <p className="text-lg font-bold text-gray-900">${selectedJob.partsTotal || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Cost</p>
                    <p className="text-lg font-bold text-blue-700">${selectedJob.totalCost || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Advance Payment</p>
                    <p className="text-lg font-bold text-green-700">${selectedJob.advancePayment || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Balance Due</p>
                    <p className="text-lg font-bold text-orange-700">${selectedJob.balanceDue || 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-gray-700 mb-3">Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-gray-900">{new Date(selectedJob.createdAt).toLocaleString()}</span>
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
