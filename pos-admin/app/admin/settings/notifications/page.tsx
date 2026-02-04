"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Bell,
  Mail,
  AlertTriangle,
  Package,
  FileText,
  Clock,
  Save
} from "lucide-react";

export default function NotificationSettingsPage() {
  const [formData, setFormData] = useState({
    // Email Notification Preferences
    emailEnabled: true,
    emailAddress: "admin@hotlineelectronics.com",
    notifyNewOrders: true,
    notifyLowStock: true,
    notifyPayments: true,
    notifyReturns: true,
    notifyWarrantyExpiry: true,
    notifySystemAlerts: true,
    
    // Low Stock Alert Settings
    lowStockEnabled: true,
    defaultLowStockThreshold: 10,
    criticalStockThreshold: 5,
    lowStockEmailFrequency: "daily",
    
    // Daily Report Settings
    dailyReportEnabled: true,
    dailyReportTime: "18:00",
    dailyReportRecipients: "admin@hotlineelectronics.com, manager@hotlineelectronics.com",
    includeSalesReport: true,
    includeInventoryReport: true,
    includePaymentReport: true,
    
    // Warranty Expiry Alerts
    warrantyAlertEnabled: true,
    warrantyAlertDaysBefore: 30,
    warrantyAlertFrequency: "weekly",
    
    // System Notifications
    notifyBackupCompletion: true,
    notifyBackupFailure: true,
    notifySystemErrors: true,
    notifySecurityAlerts: true
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving notification settings:", formData);
    alert("Notification settings saved successfully!");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </Link>
      </div>
      
      <div className="mb-6">
        <PageHeader
          title="Notification Settings"
          description="Configure email alerts, low stock notifications, reports, and warranty expiry alerts"
        />
      </div>

      <div className="space-y-6">
        {/* Email Configuration */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Mail size={20} />
            Email Notification Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailEnabled"
                  checked={formData.emailEnabled}
                  onChange={(e) => handleInputChange("emailEnabled", e.target.checked)}
                  className="w-5 h-5"
                />
                <label htmlFor="emailEnabled" className="font-medium text-black">
                  Enable Email Notifications
                </label>
              </div>
            </div>

            {formData.emailEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                    placeholder="admin@company.com"
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Notification Types</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "notifyNewOrders", label: "New Orders", icon: Package },
                      { id: "notifyLowStock", label: "Low Stock Alerts", icon: AlertTriangle },
                      { id: "notifyPayments", label: "Payment Confirmations", icon: Bell },
                      { id: "notifyReturns", label: "Returns & Refunds", icon: FileText },
                      { id: "notifyWarrantyExpiry", label: "Warranty Expiry", icon: Clock },
                      { id: "notifySystemAlerts", label: "System Alerts", icon: Bell }
                    ].map(item => (
                      <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          id={item.id}
                          checked={formData[item.id as keyof typeof formData] as boolean}
                          onChange={(e) => handleInputChange(item.id, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <item.icon size={16} className="text-gray-600" />
                        <label htmlFor={item.id} className="text-sm text-gray-700">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Low Stock Alert Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <AlertTriangle size={20} />
            Low Stock Alert Threshold
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="lowStockEnabled"
                checked={formData.lowStockEnabled}
                onChange={(e) => handleInputChange("lowStockEnabled", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="lowStockEnabled" className="font-medium text-black">
                Enable Low Stock Alerts
              </label>
            </div>

            {formData.lowStockEnabled && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Low Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={formData.defaultLowStockThreshold}
                    onChange={(e) => handleInputChange("defaultLowStockThreshold", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Critical Stock Threshold
                  </label>
                  <Input
                    type="number"
                    value={formData.criticalStockThreshold}
                    onChange={(e) => handleInputChange("criticalStockThreshold", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Urgent alert threshold</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Frequency
                  </label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    value={formData.lowStockEmailFrequency}
                    onChange={(e) => handleInputChange("lowStockEmailFrequency", e.target.value)}
                  >
                    <option value="realtime">Real-time (Immediate)</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Summary</option>
                    <option value="weekly">Weekly Report</option>
                  </select>
                </div>
              </div>
            )}

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Individual products can have custom thresholds. This setting applies to products without a specific threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Daily Report Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <FileText size={20} />
            Daily Report Email Schedule
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="dailyReportEnabled"
                checked={formData.dailyReportEnabled}
                onChange={(e) => handleInputChange("dailyReportEnabled", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="dailyReportEnabled" className="font-medium text-black">
                Enable Daily Reports
              </label>
            </div>

            {formData.dailyReportEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report Send Time
                    </label>
                    <Input
                      type="time"
                      value={formData.dailyReportTime}
                      onChange={(e) => handleInputChange("dailyReportTime", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients (comma-separated)
                    </label>
                    <Input
                      type="text"
                      value={formData.dailyReportRecipients}
                      onChange={(e) => handleInputChange("dailyReportRecipients", e.target.value)}
                      placeholder="email1@company.com, email2@company.com"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Report Content</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeSalesReport"
                        checked={formData.includeSalesReport}
                        onChange={(e) => handleInputChange("includeSalesReport", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="includeSalesReport" className="text-sm text-gray-700">
                        Sales Summary (daily transactions, revenue, top products)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includeInventoryReport"
                        checked={formData.includeInventoryReport}
                        onChange={(e) => handleInputChange("includeInventoryReport", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="includeInventoryReport" className="text-sm text-gray-700">
                        Inventory Status (stock levels, low stock items, movements)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="includePaymentReport"
                        checked={formData.includePaymentReport}
                        onChange={(e) => handleInputChange("includePaymentReport", e.target.checked)}
                        className="w-4 h-4"
                      />
                      <label htmlFor="includePaymentReport" className="text-sm text-gray-700">
                        Payment Report (payment methods, pending payments, refunds)
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Warranty Expiry Alerts */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Clock size={20} />
            Warranty Expiry Alert Timing
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="warrantyAlertEnabled"
                checked={formData.warrantyAlertEnabled}
                onChange={(e) => handleInputChange("warrantyAlertEnabled", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="warrantyAlertEnabled" className="font-medium text-black">
                Enable Warranty Expiry Alerts
              </label>
            </div>

            {formData.warrantyAlertEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Days Before Expiry
                  </label>
                  <Input
                    type="number"
                    value={formData.warrantyAlertDaysBefore}
                    onChange={(e) => handleInputChange("warrantyAlertDaysBefore", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">Send alert this many days before warranty expires</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alert Frequency
                  </label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    value={formData.warrantyAlertFrequency}
                    onChange={(e) => handleInputChange("warrantyAlertFrequency", e.target.value)}
                  >
                    <option value="daily">Daily Check</option>
                    <option value="weekly">Weekly Summary</option>
                    <option value="monthly">Monthly Report</option>
                  </select>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> With {formData.warrantyAlertDaysBefore} days notice, you'll be alerted about warranties expiring on{" "}
                {new Date(Date.now() + formData.warrantyAlertDaysBefore * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* System Notifications */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Bell size={20} />
            System Notifications
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="notifyBackupCompletion" className="text-sm font-medium text-black block">
                  Backup Completion
                </label>
                <p className="text-xs text-gray-500">Notify when scheduled backups complete successfully</p>
              </div>
              <input
                type="checkbox"
                id="notifyBackupCompletion"
                checked={formData.notifyBackupCompletion}
                onChange={(e) => handleInputChange("notifyBackupCompletion", e.target.checked)}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="notifyBackupFailure" className="text-sm font-medium text-black block">
                  Backup Failures
                </label>
                <p className="text-xs text-gray-500">Notify immediately when backup fails</p>
              </div>
              <input
                type="checkbox"
                id="notifyBackupFailure"
                checked={formData.notifyBackupFailure}
                onChange={(e) => handleInputChange("notifyBackupFailure", e.target.checked)}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="notifySystemErrors" className="text-sm font-medium text-black block">
                  System Errors
                </label>
                <p className="text-xs text-gray-500">Notify about critical system errors and exceptions</p>
              </div>
              <input
                type="checkbox"
                id="notifySystemErrors"
                checked={formData.notifySystemErrors}
                onChange={(e) => handleInputChange("notifySystemErrors", e.target.checked)}
                className="w-5 h-5"
              />
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="notifySecurityAlerts" className="text-sm font-medium text-black block">
                  Security Alerts
                </label>
                <p className="text-xs text-gray-500">Notify about login attempts, permission changes, etc.</p>
              </div>
              <input
                type="checkbox"
                id="notifySecurityAlerts"
                checked={formData.notifySecurityAlerts}
                onChange={(e) => handleInputChange("notifySecurityAlerts", e.target.checked)}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Test Email Section */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-3">Test Email Configuration</h3>
          <p className="text-sm text-gray-600 mb-4">Send a test email to verify your notification settings</p>
          <Button variant="ghost">
            <Mail size={16} className="mr-2" />
            Send Test Email
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/settings">
            <Button variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSave}>
            <Save size={18} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
