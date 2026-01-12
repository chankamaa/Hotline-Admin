"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft,
  Download,
  Database,
  CheckSquare,
  FileJson,
  FileSpreadsheet,
  FileText,
  Calendar,
  Clock,
  Play,
  Save
} from "lucide-react";

interface TableInfo {
  name: string;
  displayName: string;
  recordCount: number;
  size: string;
  selected: boolean;
}

export default function DataExportPage() {
  const [exportType, setExportType] = useState<"full" | "selective">("full");
  const [exportFormat, setExportFormat] = useState("sql");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState("weekly");
  const [scheduleTime, setScheduleTime] = useState("02:00");
  const [isExporting, setIsExporting] = useState(false);

  const [tables, setTables] = useState<TableInfo[]>([
    { name: "products", displayName: "Products", recordCount: 1250, size: "2.5 MB", selected: true },
    { name: "categories", displayName: "Categories", recordCount: 45, size: "12 KB", selected: true },
    { name: "suppliers", displayName: "Suppliers", recordCount: 120, size: "85 KB", selected: true },
    { name: "customers", displayName: "Customers", recordCount: 3400, size: "5.2 MB", selected: true },
    { name: "sales", displayName: "Sales Orders", recordCount: 8500, size: "18 MB", selected: true },
    { name: "sales_items", displayName: "Sales Items", recordCount: 22000, size: "12 MB", selected: true },
    { name: "payments", displayName: "Payments", recordCount: 8800, size: "3.1 MB", selected: true },
    { name: "stock_entries", displayName: "Stock Entries", recordCount: 2200, size: "4.5 MB", selected: true },
    { name: "stock_adjustments", displayName: "Stock Adjustments", recordCount: 450, size: "280 KB", selected: true },
    { name: "stock_transfers", displayName: "Stock Transfers", recordCount: 890, size: "1.2 MB", selected: true },
    { name: "stock_movements", displayName: "Stock Movements", recordCount: 15000, size: "8.5 MB", selected: true },
    { name: "attendance_records", displayName: "Attendance Records", recordCount: 6500, size: "2.8 MB", selected: true },
    { name: "employees", displayName: "Employees", recordCount: 85, size: "125 KB", selected: true },
    { name: "warranty_registrations", displayName: "Warranty Registrations", recordCount: 1800, size: "1.5 MB", selected: true },
    { name: "warranty_claims", displayName: "Warranty Claims", recordCount: 320, size: "450 KB", selected: true },
    { name: "audit_logs", displayName: "Audit Logs", recordCount: 45000, size: "25 MB", selected: false },
    { name: "system_logs", displayName: "System Logs", recordCount: 120000, size: "85 MB", selected: false }
  ]);

  const handleSelectAll = () => {
    setTables(tables.map(t => ({ ...t, selected: true })));
  };

  const handleDeselectAll = () => {
    setTables(tables.map(t => ({ ...t, selected: false })));
  };

  const handleToggleTable = (tableName: string) => {
    setTables(tables.map(t => 
      t.name === tableName ? { ...t, selected: !t.selected } : t
    ));
  };

  const handleStartExport = () => {
    const selectedTables = tables.filter(t => t.selected);
    if (selectedTables.length === 0) {
      alert("Please select at least one table to export");
      return;
    }

    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`Export completed! ${selectedTables.length} tables exported as ${exportFormat.toUpperCase()}`);
    }, 3000);
  };

  const handleSaveSchedule = () => {
    if (scheduleEnabled) {
      alert(`Export schedule saved: ${scheduleFrequency} at ${scheduleTime}`);
    } else {
      alert("Schedule disabled");
    }
  };

  const selectedCount = tables.filter(t => t.selected).length;
  const totalSize = tables
    .filter(t => t.selected)
    .reduce((sum, t) => {
      const size = parseFloat(t.size);
      const unit = t.size.includes("MB") ? 1 : 0.001;
      return sum + (size * unit);
    }, 0);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Link href="/admin/settings">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={16} className="mr-2" />
            Back to Settings
          </Button>
        </Link>
        <PageHeader
          title="Data Export"
          description="Export complete database or select specific tables with format options and scheduling"
        />
      </div>

      <div className="space-y-6">
        {/* Export Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{selectedCount}</div>
                <div className="text-sm text-gray-500">Tables Selected</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">
                  {tables.filter(t => t.selected).reduce((sum, t) => sum + t.recordCount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Records</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Download size={20} className="text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">{totalSize.toFixed(2)} MB</div>
                <div className="text-sm text-gray-500">Estimated Size</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-black">~{Math.ceil(totalSize / 10)} min</div>
                <div className="text-sm text-gray-500">Est. Duration</div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Type Selection */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">Export Type</h3>

          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setExportType("full")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportType === "full"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <Database size={24} className={exportType === "full" ? "text-blue-600" : "text-gray-600"} />
                <div>
                  <h4 className="font-semibold text-black mb-1">Export Complete Database</h4>
                  <p className="text-sm text-gray-600">
                    Export all tables and data from the entire database. Recommended for full backups.
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setExportType("selective")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportType === "selective"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <CheckSquare size={24} className={exportType === "selective" ? "text-blue-600" : "text-gray-600"} />
                <div>
                  <h4 className="font-semibold text-black mb-1">Select Tables for Export</h4>
                  <p className="text-sm text-gray-600">
                    Choose specific tables to export. Useful for partial exports or data analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Selection (Selective Mode) */}
        {exportType === "selective" && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-black">Select Tables</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {tables.map(table => (
                <div
                  key={table.name}
                  onClick={() => handleToggleTable(table.name)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    table.selected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={table.selected}
                      onChange={() => {}}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-black text-sm">{table.displayName}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {table.recordCount.toLocaleString()} records • {table.size}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Format */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">Export Format Selection</h3>

          <div className="grid grid-cols-4 gap-4">
            <div
              onClick={() => setExportFormat("sql")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportFormat === "sql"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <Database size={32} className={exportFormat === "sql" ? "text-blue-600" : "text-gray-600"} />
              <h4 className="font-semibold text-black mt-2 text-sm">SQL</h4>
              <p className="text-xs text-gray-600 mt-1">Full database dump with structure and data</p>
            </div>

            <div
              onClick={() => setExportFormat("json")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportFormat === "json"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <FileJson size={32} className={exportFormat === "json" ? "text-blue-600" : "text-gray-600"} />
              <h4 className="font-semibold text-black mt-2 text-sm">JSON</h4>
              <p className="text-xs text-gray-600 mt-1">Structured JSON format for APIs and applications</p>
            </div>

            <div
              onClick={() => setExportFormat("excel")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportFormat === "excel"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <FileSpreadsheet size={32} className={exportFormat === "excel" ? "text-blue-600" : "text-gray-600"} />
              <h4 className="font-semibold text-black mt-2 text-sm">Excel</h4>
              <p className="text-xs text-gray-600 mt-1">XLSX format for spreadsheet analysis</p>
            </div>

            <div
              onClick={() => setExportFormat("csv")}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportFormat === "csv"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <FileText size={32} className={exportFormat === "csv" ? "text-blue-600" : "text-gray-600"} />
              <h4 className="font-semibold text-black mt-2 text-sm">CSV</h4>
              <p className="text-xs text-gray-600 mt-1">Comma-separated values for data import</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected Format:</strong> {exportFormat.toUpperCase()} - 
              {exportFormat === "sql" && " Full database backup with table structures and all data"}
              {exportFormat === "json" && " Structured JSON files, one per table"}
              {exportFormat === "excel" && " Multiple sheets in a single Excel workbook"}
              {exportFormat === "csv" && " Separate CSV files for each table"}
            </p>
          </div>
        </div>

        {/* Scheduled Export */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Scheduled Export Setup
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scheduleEnabled"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="scheduleEnabled" className="font-medium text-black">
                Enable Automatic Scheduled Exports
              </label>
            </div>

            {scheduleEnabled && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Frequency
                  </label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    value={scheduleFrequency}
                    onChange={(e) => setScheduleFrequency(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Every Sunday)</option>
                    <option value="monthly">Monthly (1st of month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Time
                  </label>
                  <input
                    type="time"
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {scheduleEnabled && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSaveSchedule}>
                <Save size={18} className="mr-2" />
                Save Schedule
              </Button>
            </div>
          )}
        </div>

        {/* Export Actions */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">Start Export</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 mb-1">
                Ready to export {selectedCount} table(s) in {exportFormat.toUpperCase()} format
              </p>
              <p className="text-xs text-gray-500">
                Estimated size: {totalSize.toFixed(2)} MB • Duration: ~{Math.ceil(totalSize / 10)} minutes
              </p>
            </div>
            <Button onClick={handleStartExport} disabled={isExporting || selectedCount === 0}>
              {isExporting ? (
                <>
                  <Clock size={18} className="mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Play size={18} className="mr-2" />
                  Start Export Now
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Export History */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">Recent Exports</h3>
          <div className="space-y-2">
            {[
              { date: "2026-01-06 03:15 AM", tables: "All Tables", format: "SQL", size: "92 MB" },
              { date: "2026-01-05 02:30 PM", tables: "Sales & Products", format: "Excel", size: "15 MB" },
              { date: "2026-01-03 10:45 AM", tables: "Customers", format: "CSV", size: "5.2 MB" }
            ].map((exp, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-black">{exp.tables} - {exp.format}</div>
                    <div className="text-xs text-gray-500">{exp.date} • {exp.size}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Download size={14} className="mr-1" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/settings">
            <Button variant="outline">
              Back to Settings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
