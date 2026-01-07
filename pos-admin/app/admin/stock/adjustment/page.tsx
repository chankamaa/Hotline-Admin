"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { 
  Plus,
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  Download,
  AlertCircle,
  FileText,
  Calendar,
  User
} from "lucide-react";

interface StockAdjustment {
  id: string;
  adjustmentDate: Date;
  productName: string;
  productCode: string;
  adjustmentType: "Increase" | "Decrease";
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  location: string;
  adjustedBy: string;
  approvedBy?: string;
  notes?: string;
  referenceDoc?: string;
}

export default function StockAdjustmentPage() {
  const [isAddingAdjustment, setIsAddingAdjustment] = useState(false);
  const [isViewingAdjustment, setIsViewingAdjustment] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reasonFilter, setReasonFilter] = useState("all");

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    currentQuantity: "",
    adjustmentType: "Increase" as "Increase" | "Decrease",
    quantity: "",
    reason: "",
    location: "",
    notes: "",
    referenceDoc: ""
  });

  const reasonOptions = [
    "Damage",
    "Theft",
    "Return to Supplier",
    "Count Correction",
    "Expired Items",
    "Quality Issues",
    "Lost in Transit",
    "Found Stock",
    "System Error",
    "Other"
  ];

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([
    {
      id: "1",
      adjustmentDate: new Date("2026-01-05T10:30:00"),
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      adjustmentType: "Decrease",
      quantity: 2,
      previousQuantity: 50,
      newQuantity: 48,
      reason: "Damage",
      location: "Main Warehouse",
      adjustedBy: "John Doe",
      approvedBy: "Manager Smith",
      notes: "Screen damage during unboxing"
    },
    {
      id: "2",
      adjustmentDate: new Date("2026-01-06T14:15:00"),
      productName: "Samsung Galaxy S24",
      productCode: "SAM-S24-128",
      adjustmentType: "Increase",
      quantity: 5,
      previousQuantity: 30,
      newQuantity: 35,
      reason: "Count Correction",
      location: "Main Warehouse",
      adjustedBy: "Jane Smith",
      approvedBy: "Manager Smith",
      notes: "Physical count revealed additional stock"
    },
    {
      id: "3",
      adjustmentDate: new Date("2026-01-07T09:00:00"),
      productName: "Phone Case Universal",
      productCode: "ACC-CASE-001",
      adjustmentType: "Decrease",
      quantity: 10,
      previousQuantity: 200,
      newQuantity: 190,
      reason: "Return to Supplier",
      location: "Branch 1",
      adjustedBy: "Mike Johnson",
      notes: "Quality issues - defective cases",
      referenceDoc: "RTS-2026-001"
    },
    {
      id: "4",
      adjustmentDate: new Date("2026-01-06T16:45:00"),
      productName: "USB-C Cable",
      productCode: "ACC-CABLE-002",
      adjustmentType: "Decrease",
      quantity: 3,
      previousQuantity: 150,
      newQuantity: 147,
      reason: "Theft",
      location: "Branch 1",
      adjustedBy: "Sarah Williams",
      approvedBy: "Manager Smith",
      notes: "Security review conducted"
    }
  ]);

  const handleAddAdjustment = () => {
    const previousQty = Number(formData.currentQuantity);
    const adjustQty = Number(formData.quantity);
    const newQty = formData.adjustmentType === "Increase" 
      ? previousQty + adjustQty 
      : previousQty - adjustQty;

    const newAdjustment: StockAdjustment = {
      id: String(adjustments.length + 1),
      adjustmentDate: new Date(),
      productName: formData.productName,
      productCode: formData.productCode,
      adjustmentType: formData.adjustmentType,
      quantity: adjustQty,
      previousQuantity: previousQty,
      newQuantity: newQty,
      reason: formData.reason,
      location: formData.location,
      adjustedBy: "Current User",
      notes: formData.notes,
      referenceDoc: formData.referenceDoc || undefined
    };
    
    setAdjustments([newAdjustment, ...adjustments]);
    setIsAddingAdjustment(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productCode: "",
      productName: "",
      currentQuantity: "",
      adjustmentType: "Increase",
      quantity: "",
      reason: "",
      location: "",
      notes: "",
      referenceDoc: ""
    });
  };

  const handleViewAdjustment = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setIsViewingAdjustment(true);
  };

  const filteredAdjustments = adjustments.filter(adj => {
    const matchesSearch = adj.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         adj.adjustedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || adj.adjustmentType === typeFilter;
    const matchesReason = reasonFilter === "all" || adj.reason === reasonFilter;
    return matchesSearch && matchesType && matchesReason;
  });

  const columns = [
    {
      key: "date",
      label: "Date & Time",
      render: (adj: StockAdjustment) => (
        <div className="text-sm">
          <div className="font-medium text-black">{new Date(adj.adjustmentDate).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(adj.adjustmentDate).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: "product",
      label: "Product",
      render: (adj: StockAdjustment) => (
        <div>
          <div className="font-medium text-black">{adj.productName}</div>
          <div className="text-sm text-gray-500">{adj.productCode}</div>
        </div>
      )
    },
    {
      key: "type",
      label: "Type",
      render: (adj: StockAdjustment) => (
        <div className="flex items-center gap-2">
          {adj.adjustmentType === "Increase" ? (
            <TrendingUp size={18} className="text-green-600" />
          ) : (
            <TrendingDown size={18} className="text-red-600" />
          )}
          <span className={`font-semibold ${
            adj.adjustmentType === "Increase" ? "text-green-600" : "text-red-600"
          }`}>
            {adj.adjustmentType}
          </span>
        </div>
      )
    },
    {
      key: "quantity",
      label: "Quantity Change",
      render: (adj: StockAdjustment) => (
        <div className="text-sm">
          <div className={`font-bold ${
            adj.adjustmentType === "Increase" ? "text-green-600" : "text-red-600"
          }`}>
            {adj.adjustmentType === "Increase" ? "+" : "-"}{adj.quantity}
          </div>
          <div className="text-xs text-gray-500">
            {adj.previousQuantity} → {adj.newQuantity}
          </div>
        </div>
      )
    },
    {
      key: "reason",
      label: "Reason",
      render: (adj: StockAdjustment) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium">
          {adj.reason}
        </span>
      )
    },
    {
      key: "location",
      label: "Location",
      render: (adj: StockAdjustment) => (
        <div className="text-sm text-black">{adj.location}</div>
      )
    },
    {
      key: "adjustedBy",
      label: "Adjusted By",
      render: (adj: StockAdjustment) => (
        <div className="text-sm">
          <div className="text-black font-medium">{adj.adjustedBy}</div>
          {adj.approvedBy && (
            <div className="text-xs text-green-600">✓ {adj.approvedBy}</div>
          )}
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (adj: StockAdjustment) => (
        <Button size="sm" variant="outline" onClick={() => handleViewAdjustment(adj)}>
          <Eye size={14} />
        </Button>
      )
    }
  ];

  const totalIncrease = adjustments
    .filter(a => a.adjustmentType === "Increase")
    .reduce((sum, a) => sum + a.quantity, 0);
  
  const totalDecrease = adjustments
    .filter(a => a.adjustmentType === "Decrease")
    .reduce((sum, a) => sum + a.quantity, 0);

  const byReason = reasonOptions.map(reason => ({
    reason,
    count: adjustments.filter(a => a.reason === reason).length
  })).filter(r => r.count > 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Stock Adjustment"
        description="Increase or decrease stock quantities with full audit trail"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{adjustments.length}</div>
              <div className="text-sm text-gray-500">Total Adjustments</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+{totalIncrease}</div>
              <div className="text-sm text-gray-500">Stock Increased</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">-{totalDecrease}</div>
              <div className="text-sm text-gray-500">Stock Decreased</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{byReason.length}</div>
              <div className="text-sm text-gray-500">Unique Reasons</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Filters and Search */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by product, code, or user..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <select
                className="border rounded-lg px-4 py-2 text-black"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Increase">Increase</option>
                <option value="Decrease">Decrease</option>
              </select>

              <select
                className="border rounded-lg px-4 py-2 text-black"
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
              >
                <option value="all">All Reasons</option>
                {reasonOptions.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>

              <Button variant="outline">
                <Download size={18} className="mr-2" />
                Export
              </Button>

              <Button onClick={() => setIsAddingAdjustment(true)}>
                <Plus size={18} className="mr-2" />
                New Adjustment
              </Button>
            </div>
          </div>
        </div>

        {/* Adjustment Reasons Summary */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-black mb-3">Adjustments by Reason</h3>
          <div className="space-y-2">
            {byReason.slice(0, 5).map(({ reason, count }) => (
              <div key={reason} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{reason}</span>
                <span className="font-semibold text-black bg-gray-100 px-2 py-1 rounded">
                  {count}
                </span>
              </div>
            ))}
            {byReason.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                No adjustments yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-black flex items-center gap-2">
            <FileText size={18} />
            Adjustment Audit Trail
          </h3>
        </div>
        <DataTable columns={columns} data={filteredAdjustments} />
      </div>

      {/* Add Adjustment Modal */}
      <Modal
        isOpen={isAddingAdjustment}
        onClose={() => {
          setIsAddingAdjustment(false);
          resetForm();
        }}
        title="Create Stock Adjustment"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => {
              setIsAddingAdjustment(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddAdjustment}>
              Create Adjustment
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
            <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Stock adjustments will be recorded in the audit trail. Ensure all information is accurate.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Code"
              value={formData.productCode}
              onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
              placeholder="IPH15P-256"
              required
            />
            <Input
              label="Product Name"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              placeholder="iPhone 15 Pro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Current Quantity"
              type="number"
              value={formData.currentQuantity}
              onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
              placeholder="50"
              required
            />
            <Input
              label="Storage Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Main Warehouse"
              required
            />
          </div>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-black mb-2">
              Adjustment Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
                  formData.adjustmentType === "Increase"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
                onClick={() => setFormData({ ...formData, adjustmentType: "Increase" })}
              >
                <TrendingUp size={24} className={formData.adjustmentType === "Increase" ? "text-green-600" : "text-gray-400"} />
                <div className="text-left">
                  <div className="font-semibold text-black">Increase Stock</div>
                  <div className="text-xs text-gray-500">Add to inventory</div>
                </div>
              </button>
              <button
                type="button"
                className={`p-4 border-2 rounded-lg flex items-center gap-3 ${
                  formData.adjustmentType === "Decrease"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200"
                }`}
                onClick={() => setFormData({ ...formData, adjustmentType: "Decrease" })}
              >
                <TrendingDown size={24} className={formData.adjustmentType === "Decrease" ? "text-red-600" : "text-gray-400"} />
                <div className="text-left">
                  <div className="font-semibold text-black">Decrease Stock</div>
                  <div className="text-xs text-gray-500">Remove from inventory</div>
                </div>
              </button>
            </div>
          </div>

          <Input
            label="Adjustment Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="5"
            required
          />

          {formData.currentQuantity && formData.quantity && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-700">
                New Quantity: <span className="font-bold text-black">
                  {formData.adjustmentType === "Increase"
                    ? Number(formData.currentQuantity) + Number(formData.quantity)
                    : Number(formData.currentQuantity) - Number(formData.quantity)
                  } units
                </span>
                <span className="text-gray-500 ml-2">
                  ({formData.currentQuantity} {formData.adjustmentType === "Increase" ? "+" : "-"} {formData.quantity})
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Reason for Adjustment *
            </label>
            <select
              className="w-full border rounded-lg px-4 py-2 text-black"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            >
              <option value="">Select a reason</option>
              {reasonOptions.map(reason => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          <Input
            label="Reference Document (Optional)"
            value={formData.referenceDoc}
            onChange={(e) => setFormData({ ...formData, referenceDoc: e.target.value })}
            placeholder="RTS-2026-001, Incident Report #123, etc."
          />

          <Input
            label="Additional Notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Provide details about this adjustment..."
            rows={3}
            required
          />
        </div>
      </Modal>

      {/* View Adjustment Details Modal */}
      {selectedAdjustment && (
        <Modal
          isOpen={isViewingAdjustment}
          onClose={() => {
            setIsViewingAdjustment(false);
            setSelectedAdjustment(null);
          }}
          title="Adjustment Details"
          size="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsViewingAdjustment(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Download size={16} className="mr-2" />
                Export Record
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border-2 ${
              selectedAdjustment.adjustmentType === "Increase"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center gap-3">
                {selectedAdjustment.adjustmentType === "Increase" ? (
                  <TrendingUp size={32} className="text-green-600" />
                ) : (
                  <TrendingDown size={32} className="text-red-600" />
                )}
                <div>
                  <div className={`text-2xl font-bold ${
                    selectedAdjustment.adjustmentType === "Increase" ? "text-green-600" : "text-red-600"
                  }`}>
                    {selectedAdjustment.adjustmentType === "Increase" ? "+" : "-"}
                    {selectedAdjustment.quantity} units
                  </div>
                  <div className="text-sm text-gray-700">
                    {selectedAdjustment.previousQuantity} → {selectedAdjustment.newQuantity}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Adjustment Date</div>
                <div className="text-black font-medium">
                  {new Date(selectedAdjustment.adjustmentDate).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Adjustment ID</div>
                <div className="text-black font-medium">ADJ-{selectedAdjustment.id.padStart(6, '0')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Name</div>
                <div className="text-black font-medium">{selectedAdjustment.productName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Code</div>
                <div className="text-black font-medium">{selectedAdjustment.productCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="text-black font-medium">{selectedAdjustment.location}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Reason</div>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm font-semibold">
                  {selectedAdjustment.reason}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Adjusted By</div>
                <div className="text-black font-medium flex items-center gap-1">
                  <User size={14} />
                  {selectedAdjustment.adjustedBy}
                </div>
              </div>
              {selectedAdjustment.approvedBy && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Approved By</div>
                  <div className="text-green-600 font-medium flex items-center gap-1">
                    ✓ {selectedAdjustment.approvedBy}
                  </div>
                </div>
              )}
              {selectedAdjustment.referenceDoc && (
                <div className="col-span-2">
                  <div className="text-sm text-gray-500 mb-1">Reference Document</div>
                  <div className="text-black font-medium">{selectedAdjustment.referenceDoc}</div>
                </div>
              )}
            </div>

            {selectedAdjustment.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Notes</div>
                <div className="text-black bg-gray-50 p-3 rounded-lg">
                  {selectedAdjustment.notes}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-500 mb-2">Audit Trail</div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Calendar size={14} className="text-gray-400 mt-0.5" />
                  <div className="text-gray-700">
                    Created on {new Date(selectedAdjustment.adjustmentDate).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <User size={14} className="text-gray-400 mt-0.5" />
                  <div className="text-gray-700">
                    Adjusted by {selectedAdjustment.adjustedBy}
                  </div>
                </div>
                {selectedAdjustment.approvedBy && (
                  <div className="flex items-start gap-2 text-sm">
                    <User size={14} className="text-green-600 mt-0.5" />
                    <div className="text-green-600">
                      Approved by {selectedAdjustment.approvedBy}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
