'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, X, Plus, Trash2, User, Smartphone, Package as PackageIcon, ScanLine, QrCode, CheckCircle2, AlertTriangle } from 'lucide-react';
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

  // Barcode Scanner States
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanningField, setScanningField] = useState<'serialNumber' | 'imei' | null>(null);
  
  // Scanner References
  const usbInputRef = useRef<HTMLInputElement>(null);

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

  // Block minus key on number inputs
  const blockNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault();
    }
  };

  // IMEI Validation with Luhn Algorithm
  const validateIMEI = (imei: string): boolean => {
    // Remove any non-digit characters
    const cleanIMEI = imei.replace(/\D/g, '');
    
    // IMEI must be exactly 15 digits
    if (cleanIMEI.length !== 15) return false;
    
    // Apply Luhn algorithm for checksum validation
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(cleanIMEI[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(cleanIMEI[14]);
  };

  // Serial Number Validation
  const validateSerialNumber = (serial: string): boolean => {
    // Must be alphanumeric and at least 4 characters
    const cleanSerial = serial.trim();
    return /^[A-Z0-9]{4,}$/i.test(cleanSerial);
  };

  // Format IMEI for display (add spaces for readability)
  const formatIMEI = (imei: string): string => {
    const cleanIMEI = imei.replace(/\D/g, '');
    return cleanIMEI.replace(/(\d{2})(\d{6})(\d{6})(\d)/, '$1 $2 $3 $4');
  };

  // Handle USB Scanner Input (Keyboard Wedge)
  const handleUSBScannerInput = (value: string) => {
    if (!scanningField || !value.trim()) return;
    
    const cleanValue = value.trim();
    let isValid = true;
    let errorMsg = '';
    
    // Validate based on field type
    if (scanningField === 'imei') {
      isValid = validateIMEI(cleanValue);
      errorMsg = 'Invalid IMEI format or checksum. Must be 15 digits.';
    } else {
      isValid = validateSerialNumber(cleanValue);
      errorMsg = 'Invalid serial number. Must be alphanumeric, min 4 characters.';
    }
    
    if (isValid) {
      setFormData(prev => ({ ...prev, [scanningField]: cleanValue }));
      toast.success(`${scanningField === 'imei' ? 'IMEI' : 'Serial Number'} scanned successfully!`);
      closeScannerModal();
    } else {
      toast.error(errorMsg);
    }
  };

  // Open Scanner Modal
  const openScannerModal = (field: 'serialNumber' | 'imei') => {
    setScanningField(field);
    setShowScannerModal(true);
    
    // Focus USB input after modal opens
    setTimeout(() => {
      usbInputRef.current?.focus();
    }, 300);
  };

  // Close Scanner Modal
  const closeScannerModal = () => {
    setShowScannerModal(false);
    setScanningField(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    // Phone number validation - only allow numeric input, max 10 digits
    if (name === 'customerPhone') {
      if (value !== '' && (!/^\d*$/.test(value) || value.length > 10)) {
        return;
      }
    }
    
    // Advance payment validation - only allow numeric input, max 6 digits
    if (name === 'advancePayment') {
      if (value !== '' && (!/^\d*$/.test(value) || value.length > 6)) {
        return;
      }
    }
    
    // Prevent negative values for number fields
    if (type === 'number' && value !== '' && parseFloat(value) < 0) {
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
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

    // Customer name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Enter customer name';
    }
    
    // Phone number validation - must be exactly 10 digits
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.customerPhone.trim())) {
      newErrors.customerPhone = 'Phone number must be 10 digits only';
    }
    
    // Advance payment validation - must be exactly 6 digits
    if (formData.advancePayment && formData.advancePayment.trim()) {
      if (!/^\d{6}$/.test(formData.advancePayment.trim())) {
        newErrors.advancePayment = 'Advance payment must be 6 digits only';
      }
    }
    
    if (!formData.brand.trim()) newErrors.brand = 'Device brand is required';
    if (!formData.model.trim()) newErrors.model = 'Device model is required';
    if (!formData.problemDescription.trim()) newErrors.problemDescription = 'Problem description is required';

    // Enhanced Device Identification Validation
    if (formData.serialNumber.trim() && !validateSerialNumber(formData.serialNumber)) {
      newErrors.serialNumber = 'Invalid serial number format';
    }
    
    if (formData.imei.trim() && !validateIMEI(formData.imei)) {
      newErrors.imei = 'Invalid IMEI format or checksum';
    }

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
            productName: part.productName,
            sku: part.sku,
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
    <>
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
                error={errors.customerName}
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
                type="number"
                value={formData.customerPhone}
                onChange={handleInputChange}
                placeholder="Enter 10 digit phone number"
                maxLength={10}
                error={errors.customerPhone}
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
                error={errors.brand}
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
                error={errors.model}
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model}</p>
              )}
            </div>

            {/* Enhanced Device Identification Section */}
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-4">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h4 className="text-md font-semibold text-gray-800">Device Identification</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Scannable</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Serial Number with Barcode Scanning */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Serial Number
                    </label>
                    <span className="text-xs text-gray-500">Min 4 chars, alphanumeric</span>
                  </div>
                  
                  <div className="relative">
                    <Input
                      name="serialNumber"
                      value={formData.serialNumber}
                      onChange={handleInputChange}
                      placeholder="Enter or scan serial number"
                    />
                    
                    {/* Scan Button */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => openScannerModal('serialNumber')}
                        className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded hover:bg-green-100"
                        title="USB/Barcode Scanner"
                      >
                        <ScanLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Validation Feedback */}
                  {formData.serialNumber && (
                    <div className="flex items-center gap-2 text-xs">
                      {validateSerialNumber(formData.serialNumber) ? (
                        <><CheckCircle2 className="w-3 h-3 text-green-600" /><span className="text-green-600">Valid format</span></>
                      ) : (
                        <><AlertTriangle className="w-3 h-3 text-orange-600" /><span className="text-orange-600">Invalid format - check length/characters</span></>
                      )}
                    </div>
                  )}
                </div>

                {/* IMEI with Advanced Validation */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      IMEI Number
                    </label>
                    <span className="text-xs text-gray-500">15 digits with checksum</span>
                  </div>
                  
                  <div className="relative">
                    <Input
                      name="imei"
                      value={formData.imei}
                      onChange={handleInputChange}
                      placeholder="Enter or scan IMEI"
                      maxLength={15}
                    />
                    
                    {/* Scan Button */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => openScannerModal('imei')}
                        className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded hover:bg-green-100"
                        title="USB/Barcode Scanner"
                      >
                        <ScanLine className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* IMEI Validation with Checksum */}
                  {formData.imei && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {validateIMEI(formData.imei) ? (
                          <><CheckCircle2 className="w-3 h-3 text-green-600" /><span className="text-green-600">Valid IMEI checksum ✓</span></>
                        ) : (
                          <><AlertTriangle className="w-3 h-3 text-red-600" /><span className="text-red-600">Invalid IMEI or checksum ✗</span></>
                        )}
                      </div>
                      {formData.imei.length === 15 && validateIMEI(formData.imei) && (
                        <div className="text-xs text-gray-500 font-mono">
                          Formatted: {formatIMEI(formData.imei)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Color Field */}
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
                <input
                  type="text"
                  value={technicianSearchTerm || technicians.find(t => t._id === formData.assignedTo)?.username || ''}
                  onChange={(e) => handleTechnicianSearch(e.target.value)}
                  onFocus={() => {
                    setShowTechnicianSuggestions(true);
                    setFilteredTechnicians(technicians);
                  }}
                  placeholder="Search active technicians..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Advance Payment 
              </label>
              <input
               
                type="number"
                name="advancePayment"
                value={formData.advancePayment}
                onChange={handleInputChange}
                placeholder="00.00"
                maxLength={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.advancePayment ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.advancePayment && (
                <p className="text-red-500 text-sm mt-1">{errors.advancePayment}</p>
              )}
            </div>
          </div>

     
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
          className='hover:bg-red-500'
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

    {/* Advanced Barcode Scanner Modal */}
    {showScannerModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <QrCode className="w-6 h-6 text-blue-600" />
                Barcode Scanner
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Scanning {scanningField === 'serialNumber' ? 'Serial Number' : 'IMEI Number'}
                {scanningField === 'imei' && ' (15-digit with checksum validation)'}
              </p>
            </div>
            <button
              onClick={closeScannerModal}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>



          {/* USB Scanner Interface */}
          <div className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ScanLine className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">USB Barcode Scanner</h4>
                <p className="text-gray-600 mb-4">
                  Connect your USB barcode scanner and scan the {scanningField === 'serialNumber' ? 'serial number' : 'IMEI'} barcode.
                </p>
              </div>

              {/* USB Scanner Input Field */}
              <div className="space-y-3 text-gray-500">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  {scanningField === 'serialNumber' ? 'Serial Number' : 'IMEI Number'} Input
                </label>
                <input
                  ref={usbInputRef}
                  type="text"
                  placeholder={`Scan ${scanningField === 'serialNumber' ? 'serial number' : 'IMEI'} here...`}
                  className="w-full p-4 text-center text-lg font-mono border-2 border-dashed border-green-300 rounded-lg focus:border-green-500 focus:outline-none bg-green-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleUSBScannerInput(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  autoFocus
                />
                
                <div className="text-center space-y-2">
                  <div className="text-xs text-gray-500">
                    🔍 Most USB scanners automatically press Enter after scanning
                  </div>
                  <button
                    onClick={() => {
                      const value = usbInputRef.current?.value;
                      if (value) handleUSBScannerInput(value);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Manual Submit
                  </button>
                </div>
              </div>

              {/* Scanner Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">How to use USB Scanner:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Connect your USB barcode scanner</li>
                  <li>• Point scanner at the barcode</li>
                  <li>• Press the scanner trigger</li>
                  <li>• Data will auto-populate and validate</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Auto-validation enabled</span>
              </div>
              <button
                onClick={closeScannerModal}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
