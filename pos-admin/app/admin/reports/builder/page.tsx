"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Download,
  Save,
  Calendar,
  Mail,
  FileText
} from "lucide-react";

interface ReportField {
  id: string;
  name: string;
  category: string;
  dataType: string;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  lastRun?: Date;
  schedule?: string;
}

export default function ReportBuilderPage() {
  const [reportName, setReportName] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [filters, setFilters] = useState<Array<{field: string, operator: string, value: string}>>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("daily");
  const [emailRecipients, setEmailRecipients] = useState("");

  const availableFields: ReportField[] = [
    // Sales Fields
    { id: "sale_id", name: "Sale ID", category: "Sales", dataType: "Text" },
    { id: "sale_date", name: "Sale Date", category: "Sales", dataType: "Date" },
    { id: "sale_amount", name: "Sale Amount", category: "Sales", dataType: "Number" },
    { id: "customer_name", name: "Customer Name", category: "Sales", dataType: "Text" },
    { id: "payment_method", name: "Payment Method", category: "Sales", dataType: "Text" },
    
    // Product Fields
    { id: "product_name", name: "Product Name", category: "Products", dataType: "Text" },
    { id: "product_sku", name: "Product SKU", category: "Products", dataType: "Text" },
    { id: "product_category", name: "Category", category: "Products", dataType: "Text" },
    { id: "product_price", name: "Price", category: "Products", dataType: "Number" },
    { id: "stock_quantity", name: "Stock Quantity", category: "Products", dataType: "Number" },
    
    // Employee Fields
    { id: "employee_name", name: "Employee Name", category: "Employees", dataType: "Text" },
    { id: "employee_sales", name: "Employee Sales", category: "Employees", dataType: "Number" },
    { id: "employee_transactions", name: "Transactions Count", category: "Employees", dataType: "Number" },
    
    // Financial Fields
    { id: "revenue", name: "Revenue", category: "Financial", dataType: "Number" },
    { id: "cogs", name: "Cost of Goods Sold", category: "Financial", dataType: "Number" },
    { id: "profit", name: "Profit", category: "Financial", dataType: "Number" },
    { id: "discount_amount", name: "Discount Amount", category: "Financial", dataType: "Number" },
  ];

  const savedReports: SavedReport[] = [
    {
      id: "1",
      name: "Daily Sales Summary",
      description: "Complete daily sales with customer and payment details",
      createdAt: new Date("2026-01-05"),
      lastRun: new Date("2026-01-07"),
      schedule: "Daily at 8:00 AM"
    },
    {
      id: "2",
      name: "Monthly Product Performance",
      description: "Product-wise sales analysis with trends",
      createdAt: new Date("2025-12-20"),
      lastRun: new Date("2026-01-01"),
      schedule: "Monthly on 1st"
    },
    {
      id: "3",
      name: "Employee Performance Report",
      description: "Sales and transaction metrics by employee",
      createdAt: new Date("2025-12-15"),
      lastRun: new Date("2026-01-07"),
      schedule: "Weekly on Monday"
    },
  ];

  const categories = [...new Set(availableFields.map(f => f.category))];

  const handleFieldToggle = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
    } else {
      setSelectedFields([...selectedFields, fieldId]);
    }
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: "", operator: "equals", value: "" }]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleGenerateReport = () => {
    alert(`Generating report with ${selectedFields.length} fields`);
  };

  const handleSaveTemplate = () => {
    if (!reportName) {
      alert("Please enter a report name");
      return;
    }
    alert(`Template "${reportName}" saved successfully`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Custom Report Builder"
        description="Create custom reports with flexible data selection and filtering"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Name */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Report Configuration</h3>
            <Input
              label="Report Name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Monthly Sales by Category"
            />
          </div>

          {/* Field Selection */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Select Data Fields</h3>
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category}>
                  <div className="text-sm font-semibold text-black mb-2 bg-gray-50 p-2 rounded">
                    {category}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pl-4">
                    {availableFields
                      .filter(f => f.category === category)
                      .map(field => (
                        <label key={field.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFields.includes(field.id)}
                            onChange={() => handleFieldToggle(field.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-black">{field.name}</span>
                          <span className="text-xs text-gray-400">({field.dataType})</span>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters & Conditions */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Filters & Conditions</h3>
              <Button size="sm" variant="ghost" onClick={handleAddFilter}>
                <Plus size={14} className="mr-1" />
                Add Filter
              </Button>
            </div>
            <div className="space-y-3">
              {filters.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No filters added. Click "Add Filter" to add conditions.
                </div>
              ) : (
                filters.map((filter, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <select className="w-full border rounded px-3 py-2 text-sm text-black">
                        <option value="">Select Field</option>
                        {selectedFields.map(fieldId => {
                          const field = availableFields.find(f => f.id === fieldId);
                          return field ? (
                            <option key={field.id} value={field.id}>{field.name}</option>
                          ) : null;
                        })}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <select className="w-full border rounded px-3 py-2 text-sm text-black">
                        <option value="equals">Equals</option>
                        <option value="not_equals">Not Equals</option>
                        <option value="greater_than">Greater Than</option>
                        <option value="less_than">Less Than</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={filter.value || ""}
                        onChange={(e) => {
                          const newFilters = [...filters];
                          newFilters[index].value = e.target.value;
                          setFilters(newFilters);
                        }}
                        placeholder="Value"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRemoveFilter(index)}
                        className="w-full"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Grouping & Sorting */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Grouping & Sorting</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Group By</label>
                <select 
                  className="w-full border rounded px-3 py-2 text-black"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="">No Grouping</option>
                  {selectedFields.map(fieldId => {
                    const field = availableFields.find(f => f.id === fieldId);
                    return field ? (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ) : null;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Sort By</label>
                <select 
                  className="w-full border rounded px-3 py-2 text-black"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="">Default Order</option>
                  {selectedFields.map(fieldId => {
                    const field = availableFields.find(f => f.id === fieldId);
                    return field ? (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ) : null;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Schedule & Export */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Schedule & Export</h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-black">Schedule Automatic Generation</span>
              </label>

              {scheduleEnabled && (
                <div className="space-y-3 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Frequency</label>
                    <select 
                      className="w-full border rounded px-3 py-2 text-black"
                      value={scheduleFrequency}
                      onChange={(e) => setScheduleFrequency(e.target.value)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  
                  <Input
                    label="Email Recipients (comma-separated)"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                    placeholder="admin@example.com, manager@example.com"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-black mb-2">Export Format</label>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1">
                    <FileText size={16} className="mr-2" />
                    Excel (.xlsx)
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    <FileText size={16} className="mr-2" />
                    PDF
                  </Button>
                  <Button variant="ghost" className="flex-1">
                    <FileText size={16} className="mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleGenerateReport} className="flex-1">
              <Download size={16} className="mr-2" />
              Generate Report
            </Button>
            <Button onClick={handleSaveTemplate} variant="ghost" className="flex-1">
              <Save size={16} className="mr-2" />
              Save as Template
            </Button>
          </div>
        </div>

        {/* Saved Reports Sidebar */}
        <div className="space-y-6">
          {/* Preview Summary */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Report Summary</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Selected Fields</div>
                <div className="text-2xl font-bold text-black">{selectedFields.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Active Filters</div>
                <div className="text-2xl font-bold text-black">{filters.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Grouping</div>
                <div className="text-sm font-semibold text-black">
                  {groupBy ? availableFields.find(f => f.id === groupBy)?.name : "None"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Scheduled</div>
                <div className="text-sm font-semibold text-black">
                  {scheduleEnabled ? scheduleFrequency.charAt(0).toUpperCase() + scheduleFrequency.slice(1) : "No"}
                </div>
              </div>
            </div>
          </div>

          {/* Saved Templates */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Saved Templates</h3>
            <div className="space-y-3">
              {savedReports.map(report => (
                <div key={report.id} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-black text-sm">{report.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                  {report.schedule && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                      <Calendar size={12} />
                      {report.schedule}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="ghost" className="flex-1 text-xs">
                      Load
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1 text-xs">
                      Run
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
