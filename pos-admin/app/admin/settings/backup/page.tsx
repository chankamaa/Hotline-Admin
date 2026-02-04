"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Database,
  Clock,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Play,
  Calendar,
  HardDrive,
  Save
} from "lucide-react";

interface BackupHistory {
  id: string;
  timestamp: string;
  size: string;
  status: "Success" | "Failed";
  type: "Automated" | "Manual";
  duration: string;
}

export default function BackupConfigurationPage() {
  const [formData, setFormData] = useState({
    automaticBackupEnabled: true,
    backupSchedule: "daily",
    backupTime: "02:00",
    retentionPeriod: 730, // days (2 years)
    backupLocation: "local",
    cloudBackupEnabled: false,
    cloudProvider: "aws-s3",
    cloudAccessKey: "",
    cloudSecretKey: "",
    cloudBucketName: "",
    compressBackups: true,
    encryptBackups: true,
    notifyOnCompletion: true,
    notifyOnFailure: true
  });

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  const backupHistory: BackupHistory[] = [
    {
      id: "BKP-2026-01-07-001",
      timestamp: "2026-01-07 02:30 AM",
      size: "1.2 GB",
      status: "Success",
      type: "Automated",
      duration: "8 min 45 sec"
    },
    {
      id: "BKP-2026-01-06-001",
      timestamp: "2026-01-06 02:30 AM",
      size: "1.18 GB",
      status: "Success",
      type: "Automated",
      duration: "8 min 12 sec"
    },
    {
      id: "BKP-2026-01-05-002",
      timestamp: "2026-01-05 04:15 PM",
      size: "1.17 GB",
      status: "Success",
      type: "Manual",
      duration: "7 min 58 sec"
    },
    {
      id: "BKP-2026-01-05-001",
      timestamp: "2026-01-05 02:30 AM",
      size: "1.16 GB",
      status: "Success",
      type: "Automated",
      duration: "8 min 22 sec"
    },
    {
      id: "BKP-2026-01-04-001",
      timestamp: "2026-01-04 02:30 AM",
      size: "1.15 GB",
      status: "Failed",
      type: "Automated",
      duration: "2 min 10 sec"
    }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving backup configuration:", formData);
    alert("Backup configuration saved successfully!");
  };

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      alert("Manual backup completed successfully!");
    }, 3000);
  };

  const handleDownloadBackup = (backupId: string) => {
    console.log("Downloading backup:", backupId);
    alert(`Downloading backup ${backupId}...`);
  };

  const handleRestoreBackup = (backupId: string) => {
    if (confirm(`Are you sure you want to restore from backup ${backupId}? This will overwrite current data.`)) {
      console.log("Restoring backup:", backupId);
      alert("Restore initiated. This may take several minutes.");
    }
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
          title="Backup Configuration"
          description="Configure automated backups, retention policies, and restore options"
        />
      </div>

      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Last Backup</p>
                <p className="font-semibold text-black">2026-01-07 02:30 AM</p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Next Backup</p>
                <p className="font-semibold text-black">2026-01-08 02:00 AM</p>
              </div>
              <Clock className="text-blue-600" size={24} />
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Backups</p>
                <p className="font-semibold text-black">45 (62.5 GB)</p>
              </div>
              <HardDrive className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        {/* Automated Backup Schedule */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Automated Backup Schedule
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="automaticBackupEnabled"
                checked={formData.automaticBackupEnabled}
                onChange={(e) => handleInputChange("automaticBackupEnabled", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="automaticBackupEnabled" className="font-medium text-black">
                Enable Automated Backups
              </label>
            </div>

            {formData.automaticBackupEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Frequency *
                  </label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    value={formData.backupSchedule}
                    onChange={(e) => handleInputChange("backupSchedule", e.target.value)}
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly (Every Sunday)</option>
                    <option value="monthly">Monthly (1st of month)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Time
                  </label>
                  <Input
                    type="time"
                    value={formData.backupTime}
                    onChange={(e) => handleInputChange("backupTime", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Choose a time when system usage is low</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Backup Retention */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Clock size={20} />
            Backup Retention Period
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keep Backups For (Days) *
              </label>
              <Input
                type="number"
                value={formData.retentionPeriod}
                onChange={(e) => handleInputChange("retentionPeriod", parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Backups older than {formData.retentionPeriod} days ({Math.floor(formData.retentionPeriod / 365)} years) will be automatically deleted
              </p>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2">
                <AlertCircle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Ensure you have sufficient storage space. Current retention policy requires approximately {Math.round((1.2 * formData.retentionPeriod) / 30)} GB of storage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backup Location & Options */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <HardDrive size={20} />
            Backup Location & Options
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Backup Location *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.backupLocation}
                onChange={(e) => handleInputChange("backupLocation", e.target.value)}
              >
                <option value="local">Local Server (/var/backups/pos-admin)</option>
                <option value="network">Network Storage (NAS)</option>
                <option value="external">External Drive</option>
              </select>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="compressBackups" className="text-sm font-medium text-black block">
                    Compress Backups
                  </label>
                  <p className="text-xs text-gray-500">Reduce backup file size using compression (Recommended)</p>
                </div>
                <input
                  type="checkbox"
                  id="compressBackups"
                  checked={formData.compressBackups}
                  onChange={(e) => handleInputChange("compressBackups", e.target.checked)}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="encryptBackups" className="text-sm font-medium text-black block">
                    Encrypt Backups
                  </label>
                  <p className="text-xs text-gray-500">Add password protection and encryption for security</p>
                </div>
                <input
                  type="checkbox"
                  id="encryptBackups"
                  checked={formData.encryptBackups}
                  onChange={(e) => handleInputChange("encryptBackups", e.target.checked)}
                  className="w-5 h-5"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Backup */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Upload size={20} />
            Cloud Backup Integration
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cloudBackupEnabled"
                checked={formData.cloudBackupEnabled}
                onChange={(e) => handleInputChange("cloudBackupEnabled", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="cloudBackupEnabled" className="font-medium text-black">
                Enable Cloud Backup (Offsite Storage)
              </label>
            </div>

            {formData.cloudBackupEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cloud Provider *
                  </label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    value={formData.cloudProvider}
                    onChange={(e) => handleInputChange("cloudProvider", e.target.value)}
                  >
                    <option value="aws-s3">Amazon S3</option>
                    <option value="google-cloud">Google Cloud Storage</option>
                    <option value="azure">Microsoft Azure Blob</option>
                    <option value="dropbox">Dropbox Business</option>
                    <option value="backblaze">Backblaze B2</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input 
                    placeholder="Access Key / API Key" 
                    value={formData.cloudAccessKey}
                    onChange={(e) => handleInputChange("cloudAccessKey", e.target.value)}
                  />
                  <Input 
                    type="password" 
                    placeholder="Secret Key" 
                    value={formData.cloudSecretKey}
                    onChange={(e) => handleInputChange("cloudSecretKey", e.target.value)}
                  />
                </div>

                <div>
                  <Input 
                    placeholder="Bucket Name / Container Name" 
                    value={formData.cloudBucketName}
                    onChange={(e) => handleInputChange("cloudBucketName", e.target.value)}
                  />
                </div>

                <Button variant="ghost" size="sm">
                  Test Connection
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-3">Backup Notifications</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <label htmlFor="notifyOnCompletion" className="text-sm text-gray-700">
                Notify on successful backup completion
              </label>
              <input
                type="checkbox"
                id="notifyOnCompletion"
                checked={formData.notifyOnCompletion}
                onChange={(e) => handleInputChange("notifyOnCompletion", e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <label htmlFor="notifyOnFailure" className="text-sm text-gray-700">
                Notify immediately on backup failure
              </label>
              <input
                type="checkbox"
                id="notifyOnFailure"
                checked={formData.notifyOnFailure}
                onChange={(e) => handleInputChange("notifyOnFailure", e.target.checked)}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Manual Backup */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-3">Manual Backup</h3>
          <p className="text-sm text-gray-600 mb-4">
            Create an immediate backup of your entire database. This will not affect the automated backup schedule.
          </p>
          <Button onClick={handleManualBackup} disabled={isBackingUp}>
            {isBackingUp ? (
              <>
                <Clock size={18} className="mr-2 animate-spin" />
                Backing Up...
              </>
            ) : (
              <>
                <Play size={18} className="mr-2" />
                Start Manual Backup
              </>
            )}
          </Button>
        </div>

        {/* Backup History */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <Database size={20} />
              Backup History
            </h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Backup ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Size</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backupHistory.map(backup => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-black">{backup.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{backup.timestamp}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        backup.type === "Automated"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {backup.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{backup.size}</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{backup.duration}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        backup.status === "Success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {backup.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadBackup(backup.id)}
                          disabled={backup.status === "Failed"}
                        >
                          <Download size={14} className="mr-1" />
                          Download
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRestoreBackup(backup.id)}
                          disabled={backup.status === "Failed"}
                        >
                          <Upload size={14} className="mr-1" />
                          Restore
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
