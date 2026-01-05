'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateJobNumber } from '@/lib/repair-utils';
import { Save, X, Plus, Trash2, User, Smartphone } from 'lucide-react';

interface RepairJobFormProps {
  jobId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface PartItem {
  partId: string;
  partName: string;
  quantity: number;
  cost: number;
}

export default function RepairJobForm({ jobId, onSuccess, onCancel }: RepairJobFormProps) {
  const [formData, setFormData] = useState({
    // Customer Info
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    
    // Device Info
    deviceType: 'Mobile Phone',
    brand: '',
    model: '',
    imei: '',
    
    // Issue Info
    issue: '',
    diagnosis: '',
    
    // Assignment
    technicianId: '',
    priority: 'medium',
    expectedCompletionDate: '',
    
    // Cost
    laborCost: 0,
    
    // Notes
    notes: '',
  });

  const [parts, setParts] = useState<PartItem[]>([]);
  const [newPart, setNewPart] = useState({ partName: '', quantity: 1, cost: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock technicians - replace with actual API data
  const technicians = [
    { id: '', name: 'Auto-assign' },
    { id: 't1', name: 'Mike Johnson' },
    { id: 't2', name: 'Alex Chen' },
    { id: 't3', name: 'Emily Rodriguez' },
  ];

  useEffect(() => {
    if (jobId) {
      // Load existing job data for editing
      // This would fetch from API in production
      console.log('Loading job:', jobId);
    }
  }, [jobId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddPart = () => {
    if (!newPart.partName || newPart.cost <= 0) {
      alert('Please enter part name and cost');
      return;
    }

    setParts([
      ...parts,
      {
        partId: `part-${Date.now()}`,
        partName: newPart.partName,
        quantity: newPart.quantity,
        cost: newPart.cost,
      },
    ]);

    setNewPart({ partName: '', quantity: 1, cost: 0 });
  };

  const handleRemovePart = (partId: string) => {
    setParts(parts.filter((p) => p.partId !== partId));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Customer phone is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Device brand is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Device model is required';
    }
    if (!formData.issue.trim()) {
      newErrors.issue = 'Issue description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const partsCost = parts.reduce((sum, part) => sum + part.cost * part.quantity, 0);
    const totalCost = partsCost + Number(formData.laborCost);

    const jobData = {
      ...formData,
      jobNumber: jobId || generateJobNumber(),
      parts,
      estimatedCost: totalCost,
      status: 'received',
      createdAt: new Date().toISOString(),
    };

    console.log('Submitting job:', jobData);

    // In production, this would call an API
    // await createRepairJob(jobData) or updateRepairJob(jobId, jobData)

    alert(`Repair job ${jobId ? 'updated' : 'created'} successfully!`);
    onSuccess();
  };

  const estimatedCost = parts.reduce((sum, part) => sum + part.cost * part.quantity, 0) + Number(formData.laborCost);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border">
      <div className="p-6 space-y-6">
        {/* Customer Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Customer Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerPhone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1234567890"
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* Device Details */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            Device Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Type <span className="text-red-500">*</span>
              </label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Mobile Phone">Mobile Phone</option>
                <option value="Tablet">Tablet</option>
                <option value="Laptop">Laptop</option>
                <option value="Desktop">Desktop</option>
                <option value="Smartwatch">Smartwatch</option>
                <option value="Gaming Console">Gaming Console</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.brand ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Apple, Samsung"
              />
              {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.model ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., iPhone 14 Pro"
              />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMEI/Serial Number (Optional)
              </label>
              <input
                type="text"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="15-digit IMEI"
              />
            </div>
          </div>
        </div>

        {/* Issue Description */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Issue & Diagnosis</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="issue"
                value={formData.issue}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.issue ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the issue reported by customer..."
              />
              {errors.issue && <p className="text-red-500 text-xs mt-1">{errors.issue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis (Optional)
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Technical diagnosis of the problem..."
              />
            </div>
          </div>
        </div>

        {/* Parts Required */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-4">Parts Required</h3>
          
          {/* Parts List */}
          {parts.length > 0 && (
            <div className="mb-4 space-y-2">
              {parts.map((part) => (
                <div
                  key={part.partId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex-1">
                    <span className="font-medium">{part.partName}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      (Qty: {part.quantity} × ${part.cost.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      ${(part.quantity * part.cost).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePart(part.partId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Part */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={newPart.partName}
                onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Part name"
              />
            </div>
            <div>
              <input
                type="number"
                value={newPart.quantity}
                onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Qty"
                min="1"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                value={newPart.cost}
                onChange={(e) => setNewPart({ ...newPart, cost: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cost"
                step="0.01"
                min="0"
              />
              <Button type="button" onClick={handleAddPart} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Assignment & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Technician
            </label>
            <select
              name="technicianId"
              value={formData.technicianId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority Level
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Completion
            </label>
            <input
              type="datetime-local"
              name="expectedCompletionDate"
              value={formData.expectedCompletionDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labor Cost ($)
              </label>
              <input
                type="number"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex flex-col justify-end">
              <div className="bg-white rounded p-3 border-2 border-blue-300">
                <div className="text-sm text-gray-600">Estimated Total Cost</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${estimatedCost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Internal Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes or special instructions..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          {jobId ? 'Update' : 'Create'} Repair Job
        </Button>
      </div>
    </form>
  );
}
