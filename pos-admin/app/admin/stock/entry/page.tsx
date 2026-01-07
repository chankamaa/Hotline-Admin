"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { 
  Plus,
  Package,
  Search,
  Calendar,
  FileText,
  Truck,
  Hash,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Download
} from "lucide-react";

interface StockEntry {
  id: string;
  entryDate: Date;
  productName: string;
  productCode: string;
  quantity: number;
  supplier: string;
  invoiceNumber: string;
  invoiceDate: Date;
  batchNumber?: string;
  expiryDate?: Date;
  unitCost: number;
  totalCost: number;
  location: string;
  receivedBy: string;
  status: "Pending" | "Received" | "Verified";
  notes?: string;
}

export default function StockEntryPage() {
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isViewingEntry, setIsViewingEntry] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StockEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    quantity: "",
    supplier: "",
    invoiceNumber: "",
    invoiceDate: "",
    batchNumber: "",
    expiryDate: "",
    unitCost: "",
    location: "",
    notes: "",
    hasBatch: false,
    hasExpiry: false
  });

  const [stockEntries, setStockEntries] = useState<StockEntry[]>([
    {
      id: "1",
      entryDate: new Date("2026-01-05"),
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      quantity: 50,
      supplier: "Apple Distributor Inc.",
      invoiceNumber: "INV-2026-001",
      invoiceDate: new Date("2026-01-05"),
      batchNumber: "BATCH-2026-Q1-001",
      unitCost: 999,
      totalCost: 49950,
      location: "Main Warehouse",
      receivedBy: "John Doe",
      status: "Verified",
      notes: "New stock for Q1"
    },
    {
      id: "2",
      entryDate: new Date("2026-01-06"),
      productName: "Samsung Galaxy S24",
      productCode: "SAM-S24-128",
      quantity: 30,
      supplier: "Samsung Electronics",
      invoiceNumber: "INV-2026-002",
      invoiceDate: new Date("2026-01-06"),
      batchNumber: "BATCH-2026-Q1-002",
      unitCost: 799,
      totalCost: 23970,
      location: "Main Warehouse",
      receivedBy: "Jane Smith",
      status: "Received",
      notes: ""
    },
    {
      id: "3",
      entryDate: new Date("2026-01-07"),
      productName: "Phone Case Universal",
      productCode: "ACC-CASE-001",
      quantity: 200,
      supplier: "Accessories Ltd.",
      invoiceNumber: "INV-2026-003",
      invoiceDate: new Date("2026-01-07"),
      expiryDate: new Date("2027-01-07"),
      unitCost: 5,
      totalCost: 1000,
      location: "Branch 1",
      receivedBy: "Mike Johnson",
      status: "Pending",
      notes: "Quality check pending"
    }
  ]);

  const handleAddEntry = () => {
    const newEntry: StockEntry = {
      id: String(stockEntries.length + 1),
      entryDate: new Date(),
      productName: formData.productName,
      productCode: formData.productCode,
      quantity: Number(formData.quantity),
      supplier: formData.supplier,
      invoiceNumber: formData.invoiceNumber,
      invoiceDate: new Date(formData.invoiceDate),
      batchNumber: formData.hasBatch ? formData.batchNumber : undefined,
      expiryDate: formData.hasExpiry ? new Date(formData.expiryDate) : undefined,
      unitCost: Number(formData.unitCost),
      totalCost: Number(formData.quantity) * Number(formData.unitCost),
      location: formData.location,
      receivedBy: "Current User",
      status: "Pending",
      notes: formData.notes
    };
    setStockEntries([newEntry, ...stockEntries]);
    setIsAddingEntry(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      productCode: "",
      productName: "",
      quantity: "",
      supplier: "",
      invoiceNumber: "",
      invoiceDate: "",
      batchNumber: "",
      expiryDate: "",
      unitCost: "",
      location: "",
      notes: "",
      hasBatch: false,
      hasExpiry: false
    });
  };

  const handleViewEntry = (entry: StockEntry) => {
    setSelectedEntry(entry);
    setIsViewingEntry(true);
  };

  const handleVerifyEntry = (id: string) => {
    setStockEntries(stockEntries.map(entry => 
      entry.id === id ? { ...entry, status: "Verified" as const } : entry
    ));
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("Are you sure you want to delete this stock entry?")) {
      setStockEntries(stockEntries.filter(entry => entry.id !== id));
    }
  };

  const filteredEntries = stockEntries.filter(entry => {
    const matchesSearch = entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "entryDate",
      label: "Entry Date",
      render: (entry: StockEntry) => (
        <div className="text-sm">
          <div className="font-medium text-black">{new Date(entry.entryDate).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(entry.entryDate).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: "product",
      label: "Product",
      render: (entry: StockEntry) => (
        <div>
          <div className="font-medium text-black">{entry.productName}</div>
          <div className="text-sm text-gray-500">{entry.productCode}</div>
        </div>
      )
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (entry: StockEntry) => (
        <div className="font-semibold text-black">{entry.quantity} units</div>
      )
    },
    {
      key: "supplier",
      label: "Supplier & Invoice",
      render: (entry: StockEntry) => (
        <div className="text-sm">
          <div className="text-black">{entry.supplier}</div>
          <div className="text-gray-500">{entry.invoiceNumber}</div>
        </div>
      )
    },
    {
      key: "batch",
      label: "Batch/Expiry",
      render: (entry: StockEntry) => (
        <div className="text-sm">
          {entry.batchNumber && (
            <div className="text-black flex items-center gap-1">
              <Hash size={12} />
              {entry.batchNumber}
            </div>
          )}
          {entry.expiryDate && (
            <div className="text-orange-600 flex items-center gap-1">
              <Calendar size={12} />
              Exp: {new Date(entry.expiryDate).toLocaleDateString()}
            </div>
          )}
          {!entry.batchNumber && !entry.expiryDate && (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      )
    },
    {
      key: "cost",
      label: "Total Cost",
      render: (entry: StockEntry) => (
        <div className="text-right">
          <div className="font-semibold text-black">${entry.totalCost.toLocaleString()}</div>
          <div className="text-xs text-gray-500">${entry.unitCost}/unit</div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (entry: StockEntry) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          entry.status === "Verified" ? "bg-green-100 text-green-700" :
          entry.status === "Received" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {entry.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (entry: StockEntry) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => handleViewEntry(entry)}>
            <Eye size={14} />
          </Button>
          {entry.status === "Pending" && (
            <Button size="sm" variant="outline" onClick={() => handleVerifyEntry(entry.id)}>
              Verify
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => handleDeleteEntry(entry.id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  const totalQuantity = filteredEntries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalCost = filteredEntries.reduce((sum, entry) => sum + entry.totalCost, 0);
  const pendingCount = stockEntries.filter(e => e.status === "Pending").length;
  const receivedCount = stockEntries.filter(e => e.status === "Received").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Stock Entry"
        description="Record new stock arrivals with batch and expiry tracking"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{filteredEntries.length}</div>
              <div className="text-sm text-gray-500">Total Entries</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{totalQuantity}</div>
              <div className="text-sm text-gray-500">Total Units</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">${totalCost.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-yellow-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{pendingCount}</div>
              <div className="text-sm text-gray-500">Pending Verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by product, code, or invoice..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
            <option value="Verified">Verified</option>
          </select>

          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-black"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            placeholder="From Date"
          />

          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-black"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            placeholder="To Date"
          />

          <Button variant="outline">
            <Download size={18} className="mr-2" />
            Export
          </Button>

          <Button onClick={() => setIsAddingEntry(true)}>
            <Plus size={18} className="mr-2" />
            New Stock Entry
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border">
        <DataTable columns={columns} data={filteredEntries} />
      </div>

      {/* Add/Edit Stock Entry Modal */}
      <Modal
        isOpen={isAddingEntry}
        onClose={() => {
          setIsAddingEntry(false);
          resetForm();
        }}
        title="Record New Stock Entry"
        size="xl"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => {
              setIsAddingEntry(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddEntry}>
              Record Entry
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Product Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
              <Package size={18} />
              Product Information
            </h4>
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
              <Input
                label="Quantity Received"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="50"
                required
              />
              <Input
                label="Unit Cost ($)"
                type="number"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                placeholder="999.00"
                required
              />
            </div>
            {formData.quantity && formData.unitCost && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700">
                  Total Cost: <span className="font-bold text-black">${(Number(formData.quantity) * Number(formData.unitCost)).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Supplier & Invoice Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
              <Truck size={18} />
              Supplier & Invoice Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Supplier Name"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Apple Distributor Inc."
                required
              />
              <Input
                label="Invoice Number"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="INV-2026-001"
                required
              />
              <Input
                label="Invoice Date"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
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
          </div>

          {/* Batch & Expiry Information */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
              <Hash size={18} />
              Batch & Expiry Information
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasBatch}
                  onChange={(e) => setFormData({ ...formData, hasBatch: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-black">This product has a batch number</span>
              </label>

              {formData.hasBatch && (
                <Input
                  label="Batch Number"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="BATCH-2026-Q1-001"
                />
              )}

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.hasExpiry}
                  onChange={(e) => setFormData({ ...formData, hasExpiry: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-black">This product has an expiry date</span>
              </label>

              {formData.hasExpiry && (
                <Input
                  label="Expiry Date"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Input
              label="Notes (Optional)"
              type="textarea"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this stock entry..."
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* View Entry Details Modal */}
      {selectedEntry && (
        <Modal
          isOpen={isViewingEntry}
          onClose={() => {
            setIsViewingEntry(false);
            setSelectedEntry(null);
          }}
          title="Stock Entry Details"
          size="lg"
          footer={
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setIsViewingEntry(false)}>
                Close
              </Button>
              {selectedEntry.status === "Pending" && (
                <Button onClick={() => {
                  handleVerifyEntry(selectedEntry.id);
                  setIsViewingEntry(false);
                }}>
                  Verify Entry
                </Button>
              )}
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Entry Date</div>
                <div className="text-black font-medium">{new Date(selectedEntry.entryDate).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedEntry.status === "Verified" ? "bg-green-100 text-green-700" :
                  selectedEntry.status === "Received" ? "bg-blue-100 text-blue-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {selectedEntry.status}
                </span>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Name</div>
                <div className="text-black font-medium">{selectedEntry.productName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Product Code</div>
                <div className="text-black font-medium">{selectedEntry.productCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Quantity</div>
                <div className="text-black font-bold">{selectedEntry.quantity} units</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="text-black font-medium">{selectedEntry.location}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Supplier</div>
                <div className="text-black font-medium">{selectedEntry.supplier}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Invoice Number</div>
                <div className="text-black font-medium">{selectedEntry.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Invoice Date</div>
                <div className="text-black font-medium">{new Date(selectedEntry.invoiceDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Received By</div>
                <div className="text-black font-medium">{selectedEntry.receivedBy}</div>
              </div>
              {selectedEntry.batchNumber && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Batch Number</div>
                  <div className="text-black font-medium">{selectedEntry.batchNumber}</div>
                </div>
              )}
              {selectedEntry.expiryDate && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Expiry Date</div>
                  <div className="text-orange-600 font-medium">{new Date(selectedEntry.expiryDate).toLocaleDateString()}</div>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 mb-1">Unit Cost</div>
                <div className="text-black font-medium">${selectedEntry.unitCost}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Total Cost</div>
                <div className="text-black font-bold">${selectedEntry.totalCost.toLocaleString()}</div>
              </div>
            </div>
            {selectedEntry.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-1">Notes</div>
                <div className="text-black">{selectedEntry.notes}</div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
