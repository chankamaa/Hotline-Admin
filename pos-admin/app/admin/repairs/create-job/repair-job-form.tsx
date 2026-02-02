'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X, Plus, Trash2, User, Smartphone, Package as PackageIcon } from 'lucide-react';
import { repairApi } from '@/lib/api/repairApi';
import { fetchProducts } from '@/lib/api/productApi';
import { userApi } from '@/lib/api/userApi';
import { useToast } from '@/providers/toast-provider';
import { getMe } from '@/lib/auth';

interface RepairJobFormProps {
  jobId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface PartItem {
  productId: string;
  productName: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
}

interface Product {
  _id: string;
  name: string;
  sku?: string;
  sellingPrice: number;
}

const DEVICE_TYPES = ['MOBILE_PHONE', 'TABLET', 'LAPTOP', 'SMARTWATCH', 'OTHER'];
const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const REPAIR_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  READY: 'READY',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export default function RepairJobForm({ jobId, onSuccess, onCancel }: RepairJobFormProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState<any[]>([]);
  const [technicianSearchTerm, setTechnicianSearchTerm] = useState('');
  const [showTechnicianSuggestions, setShowTechnicianSuggestions] = useState(false);
  const technicianRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    // Customer Info
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    
    // Device Info
    deviceType: 'MOBILE_PHONE',
    brand: '',
    model: '',
    serialNumber: '',
    imei: '',
    color: '',
    accessories: '',
    condition: '',
    
    // Issue Info
    problemDescription: '',
    diagnosisNotes: '',
    repairNotes: '',
    
    // Assignment
    assignedTo: '',
    priority: 'NORMAL',
    expectedCompletionDate: '',
    status: 'PENDING',
    
    // Cost
    laborCost: '',
    estimatedCost: '',
    advancePayment: '',
  });

  const [parts, setParts] = useState<PartItem[]>([]);
  const [newPart, setNewPart] = useState({ 
    productName: '', 
    quantity: 1, 
    unitPrice: 0,
    productId: ''
  });
  
  // Product autocomplete state
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const suggestionRef = useRef<HTMLDivElement>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load current user
  useEffect(() => {
    loadCurrentUser();
  }, []);
  
  // Auto-assign to technician if they're creating a new job
  useEffect(() => {
    if (currentUser && !jobId) {
      const userRole = currentUser.role?.toLowerCase() || currentUser.roles?.[0]?.name?.toLowerCase();
      if (userRole === 'technician') {
        setFormData(prev => ({
          ...prev,
          assignedTo: currentUser.id,
          status: 'ASSIGNED',
        }));
      }
    }
  }, [currentUser, jobId]);

  // Load technicians and existing job data
  useEffect(() => {
    // Only load technicians if user is admin/manager (not technician)
    if (currentUser) {
      const userRole = currentUser.role?.toLowerCase() || currentUser.roles?.[0]?.name?.toLowerCase();
      if (userRole !== 'technician') {
        loadTechnicians();
      }
    }
    
    if (jobId) {
      loadJobData(jobId);
    }
  }, [jobId, currentUser]);

  // Handle click outside for autocomplete
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (technicianRef.current && !technicianRef.current.contains(event.target as Node)) {
        setShowTechnicianSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getMe();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadTechnicians = async () => {
    try {
      // Fetch all users from User Management system
      const response = await userApi.getAll();
      let allUsers = response.data.users || [];
      
      // Filter to show only users with 'TECHNICIAN' role and 'Active' status
      const techList = allUsers.filter((user: any) => {
        // Check if user has TECHNICIAN role (case-insensitive match)
        const hasTechnicianRole = user.roles?.some((role: any) => 
          role.name?.toUpperCase() === 'TECHNICIAN'
        );
        
        // Check if user is active
        const isActive = user.isActive === true;
        
        return hasTechnicianRole && isActive;
      });
      
      // Calculate active jobs count for each technician (if available from backend)
      // This would require a separate API call or be included in the user data
      const enrichedTechList = await Promise.all(
        techList.map(async (tech: any) => {
          try {
            // Try to get active jobs count for this technician
            const jobsResponse = await repairApi.getAll();
            const activeJobs = jobsResponse.data.repairs?.filter(
              (job: any) => 
                job.assignedTo?._id === tech._id && 
                ['PENDING', 'ASSIGNED', 'IN_PROGRESS'].includes(job.status)
            ).length || 0;
            
            return { ...tech, activeJobs };
          } catch (error) {
            // If error, return technician without active jobs count
            return { ...tech, activeJobs: 0 };
          }
        })
      );
      
      // Sort by active jobs (least busy first) and then by username
      enrichedTechList.sort((a: any, b: any) => {
        if (a.activeJobs !== b.activeJobs) {
          return (a.activeJobs || 0) - (b.activeJobs || 0);
        }
        return (a.username || '').localeCompare(b.username || '');
      });
      
      setTechnicians(enrichedTechList);
      setFilteredTechnicians(enrichedTechList);
    } catch (error) {
      console.error('Error loading technicians:', error);
      toast.error('Failed to load technicians from User Management');
    }
  };

  const loadJobData = async (id: string) => {
    try {
      setLoading(true);
      const response = await repairApi.getById(id);
      const job = response.data.repair;
      
      setFormData({
        customerName: job.customer.name,
        customerPhone: job.customer.phone,
        customerEmail: job.customer.email || '',
        customerAddress: job.customer.address || '',
        deviceType: job.device.type,
        brand: job.device.brand,
        model: job.device.model,
        serialNumber: job.device.serialNumber || '',
        imei: job.device.imei || '',
        color: job.device.color || '',
        accessories: job.device.accessories?.join(', ') || '',
        condition: job.device.condition || '',
        problemDescription: job.problemDescription,
        diagnosisNotes: job.diagnosisNotes || '',
        repairNotes: job.repairNotes || '',
        assignedTo: job.assignedTo?._id || '',
        priority: job.priority,
        expectedCompletionDate: job.expectedCompletionDate || '',
        status: job.status || 'PENDING',
        laborCost: job.laborCost.toString(),
        estimatedCost: job.estimatedCost.toString(),
        advancePayment: job.advancePayment.toString(),
      });
      
      if (job.partsUsed && job.partsUsed.length > 0) {
        setParts(job.partsUsed.map((part: any) => ({
          productId: typeof part.product === 'string' ? part.product : part.product._id,
          productName: part.productName,
          sku: part.sku,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
        })));
      }
    } catch (error: any) {
      console.error('Error loading job:', error);
      toast.error(error?.message || 'Failed to load repair job');
    } finally {
      setLoading(false);
    }
  };

  // Search products for autocomplete
  const searchProducts = async (query: string) => {
    if (query.length < 2) {
      setProductSuggestions([]);
      return;
    }
    
    try {
      const response = await fetchProducts({ search: query, limit: 10 });
      setProductSuggestions(response.data.products || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleProductSearch = (value: string) => {
    setSearchTerm(value);
    setNewPart({ ...newPart, productName: value, productId: '' });
    searchProducts(value);
  };

  const handleSelectProduct = (product: Product) => {
    setNewPart({
      ...newPart,
      productId: product._id,
      productName: product.name,
      unitPrice: product.sellingPrice || 0
    });
    setSearchTerm(product.name);
    setShowSuggestions(false);
  };

  // Search technicians for autocomplete
  const handleTechnicianSearch = (value: string) => {
    setTechnicianSearchTerm(value);
    if (value.length < 1) {
      // If input is cleared, also clear assignment and hide suggestions
      setFormData((prev) => ({ ...prev, assignedTo: '' }));
      setFilteredTechnicians(technicians);
      setShowTechnicianSuggestions(false);
      return;
    }
    const searchLower = value.toLowerCase();
    const filtered = technicians.filter((tech: any) => {
      const matchesSearch = 
        tech.username?.toLowerCase().includes(searchLower) ||
        tech._id?.toLowerCase().includes(searchLower); // User ID from User Management
      // Only show active technicians (using isActive boolean from User Management)
      const isActive = tech.isActive === true;
      return matchesSearch && isActive;
    });
    setFilteredTechnicians(filtered);
    setShowTechnicianSuggestions(true);
  };

  const handleSelectTechnician = (technician: any) => {
    setFormData({ ...formData, assignedTo: technician._id });
    setTechnicianSearchTerm(technician.username);
    setShowTechnicianSuggestions(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        // No return value here
        return newErrors;
      });
    }
  };

  const handleAddPart = () => {
    if (!newPart.productName || !newPart.productId) {
      toast.error('Please select a product from the suggestions');
      return;
    }
    if (newPart.unitPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setParts([
      ...parts,
      {
        productId: newPart.productId,
        productName: newPart.productName,
        sku: productSuggestions.find(p => p._id === newPart.productId)?.sku,
        quantity: newPart.quantity,
        unitPrice: newPart.unitPrice,
      },
    ]);

    setNewPart({ productName: '', quantity: 1, unitPrice: 0, productId: '' });
    setSearchTerm('');
    setProductSuggestions([]);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  // Check if current user is a technician
  const isTechnician = () => {
    const userRole = currentUser?.role?.toLowerCase() || currentUser?.roles?.[0]?.name?.toLowerCase();
    return userRole === 'technician';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (!formData.customerPhone.trim()) newErrors.customerPhone = 'Customer phone is required';
    if (!formData.brand.trim()) newErrors.brand = 'Device brand is required';
    if (!formData.model.trim()) newErrors.model = 'Device model is required';
    if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Problem description is required';

    // Validation for COMPLETED status - require labor cost and parts
    if (formData.status === 'COMPLETED') {
      if (!formData.laborCost || parseFloat(formData.laborCost) <= 0) {
        newErrors.laborCost = 'Labor cost is required before completing the job';
      }
      if (parts.length === 0) {
        newErrors.parts = 'At least one part must be added before completing the job';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // If completing the job, use the complete endpoint with labor cost and parts
      if (jobId && formData.status === 'COMPLETED') {
        const completePayload = {
          laborCost: parseFloat(formData.laborCost),
          partsUsed: parts.map(part => ({
            productId: part.productId,
            quantity: part.quantity,
            unitPrice: part.unitPrice,
          })),
          diagnosisNotes: formData.diagnosisNotes || undefined,
          repairNotes: formData.repairNotes || undefined,
        };
        
        await repairApi.complete(jobId, completePayload);
        toast.success('Repair job completed successfully!');
        onSuccess();
        setLoading(false);
        return;
      }

      const payload = {
        customer: {
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail || undefined,
          address: formData.customerAddress || undefined,
        },
        device: {
          type: formData.deviceType,
          brand: formData.brand,
          model: formData.model,
          serialNumber: formData.serialNumber || undefined,
          imei: formData.imei || undefined,
          color: formData.color || undefined,
          accessories: formData.accessories ? formData.accessories.split(',').map(a => a.trim()) : undefined,
          condition: formData.condition || undefined,
        },
        problemDescription: formData.problemDescription,
        priority: formData.priority as any,
        estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
        advancePayment: formData.advancePayment ? parseFloat(formData.advancePayment) : undefined,
        expectedCompletionDate: formData.expectedCompletionDate || undefined,
        assignedTo: formData.assignedTo || undefined,
      };

      if (jobId) {
        await repairApi.update(jobId, payload);
        toast.success('Repair job updated successfully!');
      } else {
        await repairApi.create(payload);
        toast.success('Repair job created successfully!');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving repair job:', error);
      toast.error(error?.message || 'Failed to save repair job');
    } finally {
      setLoading(false);
    }
  };

  const partsCost = parts.reduce((sum, part) => sum + part.unitPrice * part.quantity, 0);
  const totalEstimate = partsCost + (parseFloat(formData.laborCost) || 0);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border  text-gray-500">
      <div className="p-6 space-y-6">
        
        {/* Customer Information */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <User className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Customer Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className={errors.customerPhone ? 'border-red-500' : ''}
              />
              {errors.customerPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                name="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={handleInputChange}
                placeholder="customer@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleInputChange}
                placeholder="Enter address"
              />
            </div>
          </div>
        </div>

        {/* Device Information */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-700">Device Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Type
              </label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
              >
                {DEVICE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="e.g., Apple, Samsung"
                className={errors.brand ? 'border-red-500' : ''}
              />
              {errors.brand && (
                <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <Input
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="e.g., iPhone 14 Pro"
                className={errors.model ? 'border-red-500' : ''}
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number
              </label>
              <Input
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                placeholder="Enter serial number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IMEI
              </label>
              <Input
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                placeholder="Enter IMEI number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <Input
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Enter device color"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accessories (comma-separated)
              </label>
              <Input
                name="accessories"
                value={formData.accessories}
                onChange={handleInputChange}
                placeholder="e.g., Charger, Case, Earphones"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Condition
              </label>
              <textarea
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                placeholder="Describe the physical condition of the device"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Issue Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Issue Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleInputChange}
                placeholder="Describe the issue reported by the customer"
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.problemDescription ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.problemDescription && (
                <p className="text-red-500 text-sm mt-1">{errors.problemDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Notes
              </label>
              <textarea
                name="diagnosisNotes"
                value={formData.diagnosisNotes}
                onChange={handleInputChange}
                placeholder="Technical diagnosis and findings"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Repair Notes
              </label>
              <textarea
                name="repairNotes"
                value={formData.repairNotes}
                onChange={handleInputChange}
                placeholder="Notes about the repair process"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Parts Used */}
        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <PackageIcon className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Parts Used</h3>
          </div>
          {errors.parts && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{errors.parts}</p>
            </div>
          )}

          <div className="mb-4 relative" ref={suggestionRef}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              <div className="md:col-span-5 relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  placeholder="Search product name..."
                  onFocus={() => setShowSuggestions(true)}
                />
                {showSuggestions && productSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {productSuggestions.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="font-medium">{product.name}</div>
                        {product.sku && (
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        )}
                        <div className="text-sm text-gray-600">
                          Price: ${product.sellingPrice?.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="md:col-span-2">
                <Input
                  type="number"
                  value={newPart.quantity}
                  onChange={(e) =>
                    setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })
                  }
                  placeholder="Qty"
                  min="1"
                />
              </div>
              <div className="md:col-span-3">
                <Input
                  type="number"
                  value={newPart.unitPrice || ''}
                  onChange={(e) =>
                    setNewPart({ ...newPart, unitPrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Unit Price"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  type="button"
                  onClick={handleAddPart}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {parts.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Part Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                      Unit Price
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                      Total
                    </th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parts.map((part, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{part.productName}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{part.sku || '-'}</td>
                      <td className="px-4 py-2 text-sm text-center">{part.quantity}</td>
                      <td className="px-4 py-2 text-sm text-right">
                        ${part.unitPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium">
                        ${(part.quantity * part.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePart(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assignment & Priority */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Assignment & Priority</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Only show technician assignment field for admin/manager */}
            {!isTechnician() && (
              <div className="relative" ref={technicianRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Technician
                </label>
                <Input
                  value={technicianSearchTerm || technicians.find(t => t._id === formData.assignedTo)?.username || ''}
                  onChange={(e) => handleTechnicianSearch(e.target.value)}
                  onFocus={() => {
                    setShowTechnicianSuggestions(true);
                    setFilteredTechnicians(technicians);
                  }}
                  placeholder="Search active technicians..."
                />
                {showTechnicianSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredTechnicians.length > 0 ? (
                      filteredTechnicians.map((tech) => (
                        <button
                          key={tech._id}
                          type="button"
                          onClick={() => handleSelectTechnician(tech)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{tech.username}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p className="text-sm font-medium">No active technicians found</p>
                        <p className="text-xs mt-1">Add technicians in User Management with TECHNICIAN role</p>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {technicians.length > 0 
                    ? `${technicians.length} active technician${technicians.length !== 1 ? 's' : ''} from User Management`
                    : 'No active technicians with TECHNICIAN role found'
                  }
                </p>
              </div>
            )}
            
            {/* Show auto-assignment info for technicians */}
            {isTechnician() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <div className="px-3 py-2 border border-gray-200 rounded-md bg-green-50">
                  <p className="text-sm text-gray-700">✓ Auto-assigned to you</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(REPAIR_STATUS).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Completion
              </label>
              <Input
                type="datetime-local"
                name="expectedCompletionDate"
                value={formData.expectedCompletionDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Cost Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labor Cost ($)
              </label>
              <Input
                type="number"
                name="laborCost"
                value={formData.laborCost}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.laborCost && (
                <p className="text-red-500 text-sm mt-1">{errors.laborCost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Total Cost ($)
              </label>
              <Input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advance Payment ($)
              </label>
              <Input
                type="number"
                name="advancePayment"
                value={formData.advancePayment}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Parts Cost:</span>
              <span className="font-medium">${partsCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-2">
              <span className="text-gray-600">Labor Cost:</span>
              <span className="font-medium">
                ${(parseFloat(formData.laborCost) || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
              <span>Total Estimate:</span>
              <span className="text-blue-600">${totalEstimate.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-1" />
          {loading ? 'Saving...' : jobId ? 'Update Job' : 'Create Job'}
        </Button>
      </div>
    </form>
  );
}
