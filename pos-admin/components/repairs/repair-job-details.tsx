'use client';

import { RepairJob } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import {
  X,
  User,
  Phone,
  Mail,
  Smartphone,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Wrench,
  Package,
} from 'lucide-react';

interface RepairJobDetailsProps {
  job: RepairJob;
  onClose: () => void;
  onEdit: () => void;
}

export default function RepairJobDetails({ job, onClose, onEdit }: RepairJobDetailsProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      received: 'text-gray-700 bg-gray-100',
      'in-progress': 'text-blue-700 bg-blue-100',
      'waiting-parts': 'text-orange-700 bg-orange-100',
      ready: 'text-green-700 bg-green-100',
      delivered: 'text-purple-700 bg-purple-100',
    };
    return colors[status as keyof typeof colors] || 'text-gray-700 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const statusHistory = [
    { status: 'Received', timestamp: job.createdAt, description: 'Job created and logged' },
    { status: 'In Progress', timestamp: new Date(), description: 'Technician started work' },
  ];

  const communications = [
    {
      id: '1',
      type: 'SMS',
      message: 'Your device has been received and diagnosis is in progress',
      timestamp: job.createdAt,
    },
  ];

  const totalCost = (job.finalCost || job.estimatedCost) + (job.laborCost || 0);

  return (
    <Modal isOpen={true} onClose={onClose} title={`Repair Job Details`} size="xl">
      <div className="space-y-6">
        {/* Header with Job Number and Status */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
          <div>
            <h3 className="text-2xl font-bold">{job.jobNumber}</h3>
            <p className="text-blue-100 text-sm mt-1">
              Created: {new Date(job.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                job.status
              )}`}
            >
              {job.status.replace('-', ' ').toUpperCase()}
            </span>
            <div className="mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                  job.priority
                )}`}
              >
                {job.priority.toUpperCase()} PRIORITY
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Customer Information
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{job.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone
              </p>
              <p className="font-medium">{job.customer.phone}</p>
            </div>
            {job.customer.email && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="font-medium">{job.customer.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            Device Details
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Device</p>
              <p className="font-medium">{job.device}</p>
            </div>
            {job.brand && (
              <div>
                <p className="text-sm text-gray-600">Brand</p>
                <p className="font-medium">{job.brand}</p>
              </div>
            )}
            {job.model && (
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-medium">{job.model}</p>
              </div>
            )}
            {job.imei && (
              <div>
                <p className="text-sm text-gray-600">IMEI/Serial</p>
                <p className="font-medium font-mono text-sm">{job.imei}</p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Issue Description</p>
              <p className="font-medium">{job.issue}</p>
            </div>
            {job.diagnosis && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Diagnosis</p>
                <p className="font-medium">{job.diagnosis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Cost Breakdown
          </h4>
          <div className="space-y-3">
            {job.parts && job.parts.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                  <Package className="w-3 h-3" /> Parts Required
                </p>
                <div className="space-y-1 ml-4">
                  {job.parts.map((part, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {part.partName} (x{part.quantity})
                      </span>
                      <span className="font-medium">${(part.cost * part.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {job.laborCost && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Labor Charges</span>
                <span className="font-medium">${job.laborCost.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-300">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Cost</span>
                <span className="font-medium">${job.estimatedCost.toFixed(2)}</span>
              </div>
              {job.finalCost && (
                <div className="flex justify-between mt-1">
                  <span className="text-sm text-gray-600">Final Cost</span>
                  <span className="font-medium">${job.finalCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between mt-2 pt-2 border-t border-gray-300">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technician & Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              Assigned Technician
            </h4>
            <p className="font-medium">{job.technicianName || 'Not assigned'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Expected Completion
            </h4>
            <p className="font-medium">
              {job.expectedCompletionDate
                ? new Date(job.expectedCompletionDate).toLocaleString()
                : 'Not set'}
            </p>
          </div>
        </div>

        {/* Status History Timeline */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Status History Timeline
          </h4>
          <div className="space-y-3">
            {statusHistory.map((entry, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  {index < statusHistory.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-300 mt-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium">{entry.status}</p>
                  <p className="text-sm text-gray-600">{entry.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Communications Log */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold mb-3">Customer Communications Log</h4>
          <div className="space-y-2">
            {communications.map((comm) => (
              <div key={comm.id} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-medium text-blue-600">{comm.type}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comm.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{comm.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {job.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Notes
            </h4>
            <p className="text-sm">{job.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onEdit}>Edit Job</Button>
          <Button variant="secondary" onClick={() => alert('Print receiving slip')}>
            Print Slip
          </Button>
        </div>
      </div>
    </Modal>
  );
}
