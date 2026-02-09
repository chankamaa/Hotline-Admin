'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/providers/toast-provider';
import { repairApi } from '@/lib/api/repairApi';
import { RepairJob } from '@/lib/api/repairApi';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Smartphone,
  Package,
  Wrench,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  PlayCircle,
} from 'lucide-react';

export default function RepairDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const repairId = params.id as string;

  const [repair, setRepair] = useState<RepairJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRepairDetails();
  }, [repairId]);

  const loadRepairDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await repairApi.getById(repairId);
      setRepair(response.data.repair);
    } catch (err: any) {
      console.error('Error loading repair details:', err);
      const errorMessage = err?.response?.data?.message || 'Failed to load repair details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/admin/repairs?edit=${repairId}`);
  };

  const handleStartJob = async () => {
    if (!repair) return;
    
    try {
      await repairApi.start(repair._id);
      toast.success('Repair job started!');
      loadRepairDetails();
    } catch (error: any) {
      console.error('Error starting job:', error);
      toast.error(error?.response?.data?.message || 'Failed to start job');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; icon: any } } = {
      RECEIVED: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      IN_PROGRESS: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Wrench },
      READY: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
    };
    return badges[status] || badges.RECEIVED;
  };

  const getPriorityBadge = (priority: string) => {
    const badges: { [key: string]: string } = {
      URGENT: 'bg-red-100 text-red-700',
      HIGH: 'bg-orange-100 text-orange-700',
      NORMAL: 'bg-blue-100 text-blue-700',
      LOW: 'bg-gray-100 text-gray-700',
    };
    return badges[priority] || badges.NORMAL;
  };

  const calculateTotalCost = () => {
    if (!repair) return 0;
    const laborCost = repair.laborCost || 0;
    const partsCost = repair.partsUsed?.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0) || 0;
    return laborCost + partsCost;
  };

  const calculateBalanceDue = () => {
    const totalCost = calculateTotalCost();
    const advancePayment = repair?.advancePayment || 0;
    return totalCost - advancePayment;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading repair details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Repair</h3>
          <p className="text-red-700">{error || 'Repair not found'}</p>
          <Button onClick={() => router.push('/admin/repairs')} className="mt-4">
            Go to Repairs List
          </Button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(repair.status);
  const StatusIcon = statusBadge.icon;

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{repair.jobNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                <StatusIcon className="w-4 h-4" />
                {repair.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(repair.priority)}`}>
                {repair.priority}
              </span>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Created: {new Date(repair.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {repair.status !== 'COMPLETED' && repair.status !== 'CANCELLED' && (
              <>
                {repair.status === 'RECEIVED' && (
                  <Button onClick={handleStartJob} className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Start Job
                  </Button>
                )}
                <Button onClick={handleEdit} variant="secondary" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Estimated Cost</p>
            <p className="text-2xl font-bold text-blue-900">${repair.estimatedCost?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Advance Payment</p>
            <p className="text-2xl font-bold text-green-900">${repair.advancePayment?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-purple-900">${calculateTotalCost().toFixed(2)}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 mb-1">Balance Due</p>
            <p className="text-2xl font-bold text-orange-900">${calculateBalanceDue().toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Customer Information
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{repair.customer.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{repair.customer.phone}</p>
              </div>
            </div>
            {repair.customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{repair.customer.email}</p>
                </div>
              </div>
            )}
            {repair.customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{repair.customer.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Information */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            Device Information
          </h2>
          <div className="space-y-3">
            {repair.device.type && (
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium text-gray-900">{repair.device.type}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Brand & Model</p>
              <p className="font-medium text-gray-900">{repair.device.brand} {repair.device.model}</p>
            </div>
            {repair.device.imei && (
              <div>
                <p className="text-sm text-gray-500">IMEI</p>
                <p className="font-medium text-gray-900 font-mono">{repair.device.imei}</p>
              </div>
            )}
            {repair.device.serialNumber && (
              <div>
                <p className="text-sm text-gray-500">Serial Number</p>
                <p className="font-medium text-gray-900 font-mono">{repair.device.serialNumber}</p>
              </div>
            )}
            {repair.device.color && (
              <div>
                <p className="text-sm text-gray-500">Color</p>
                <p className="font-medium text-gray-900">{repair.device.color}</p>
              </div>
            )}
            {repair.device.accessories && repair.device.accessories.length > 0 && (
              <div>
                <p className="text-sm text-gray-500">Accessories</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {repair.device.accessories.map((accessory, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {accessory}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {repair.device.condition && (
              <div>
                <p className="text-sm text-gray-500">Condition</p>
                <p className="font-medium text-gray-900">{repair.device.condition}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem & Repair Details */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600" />
          Problem & Repair Details
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Problem Description</p>
            <p className="text-gray-900 bg-gray-50 rounded-lg p-3">{repair.problemDescription}</p>
          </div>
          {repair.diagnosisNotes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Diagnosis Notes</p>
              <p className="text-gray-900 bg-blue-50 rounded-lg p-3">{repair.diagnosisNotes}</p>
            </div>
          )}
          {repair.repairNotes && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Repair Notes</p>
              <p className="text-gray-900 bg-green-50 rounded-lg p-3">{repair.repairNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Parts Used */}
      {repair.partsUsed && repair.partsUsed.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Parts Used
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Part Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {repair.partsUsed.map((part, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <span className="text-gray-900">{part.productName}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-sm">{part.sku || 'N/A'}</td>
                    <td className="px-4 py-3 text-center text-gray-900">{part.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-900">${part.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {(part.quantity * part.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-right font-semibold text-gray-700">
                    Parts Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">
                    ${repair.partsUsed.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-blue-600" />
          Cost Breakdown
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Labor Cost:</span>
            <span className="font-semibold text-gray-900">${repair.laborCost?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Parts Cost:</span>
            <span className="font-semibold text-gray-900">
              ${repair.partsUsed?.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0).toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
            <span className="text-2xl font-bold text-blue-900">${calculateTotalCost().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Advance Payment:</span>
            <span className="font-semibold text-green-700">-${repair.advancePayment?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Balance Due:</span>
            <span className="text-2xl font-bold text-orange-600">${calculateBalanceDue().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {repair.assignedTo && (
            <div>
              <p className="text-gray-500">Assigned To</p>
              <p className="font-medium text-gray-900">{repair.assignedTo.username}</p>
            </div>
          )}
          {repair.createdBy && (
            <div>
              <p className="text-gray-500">Created By</p>
              <p className="font-medium text-gray-900">{repair.createdBy.username}</p>
            </div>
          )}
          {repair.expectedCompletionDate && (
            <div>
              <p className="text-gray-500">Expected Completion</p>
              <p className="font-medium text-gray-900">
                {new Date(repair.expectedCompletionDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {repair.actualCompletionDate && (
            <div>
              <p className="text-gray-500">Completed At</p>
              <p className="font-medium text-gray-900">{new Date(repair.actualCompletionDate).toLocaleString()}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-medium text-gray-900">{new Date(repair.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
