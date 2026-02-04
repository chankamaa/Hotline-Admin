"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Cloud,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Upload,
  Download,
  RefreshCw,
  HardDrive,
  Zap
} from "lucide-react";

export default function CloudStoragePage() {
  const [testResult, setTestResult] = useState<"success" | "failed" | null>(null);
  const [cloudConfig, setCloudConfig] = useState({
    enabled: true,
    provider: "aws-s3",
    accessKey: "",
    secretKey: "",
    bucketName: "hotline-backups",
    region: "us-east-1",
    autoSync: true,
    syncFrequency: "daily",
    syncTime: "02:00",
    retentionDays: 30,
    encryptData: true,
    compressBackups: true,
    syncTypes: ["database", "images", "documents"],
    maxStorageGB: 100
  });

  const [syncStats, setSyncStats] = useState({
    lastSync: "2026-01-07 02:30 AM",
    nextSync: "2026-01-08 02:00 AM",
    totalFiles: 15234,
    totalSizeGB: 45.7,
    failedUploads: 3,
    successRate: 99.8
  });

  const handleInputChange = (field: string, value: any) => {
    setCloudConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTest = () => {
    console.log("Testing cloud connection...");
    setTestResult(null);
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setTestResult(success ? "success" : "failed");
      alert(`Cloud storage test ${success ? "passed" : "failed"}!`);
    }, 1500);
  };

  const handleSyncNow = () => {
    alert("Manual sync started! This may take several minutes.");
  };

  const handleSave = () => {
    console.log("Saving cloud storage settings:", cloudConfig);
    alert("Cloud storage settings saved successfully!");
  };

  const providers = [
    { value: "aws-s3", label: "Amazon S3", icon: "☁️" },
    { value: "google-cloud", label: "Google Cloud Storage", icon: "🔷" },
    { value: "azure", label: "Microsoft Azure", icon: "🔵" },
    { value: "dropbox", label: "Dropbox Business", icon: "📦" },
    { value: "backblaze", label: "Backblaze B2", icon: "⚡" },
    { value: "wasabi", label: "Wasabi", icon: "🌶️" }
  ];

  const regions = {
    "aws-s3": [
      { value: "us-east-1", label: "US East (N. Virginia)" },
      { value: "us-west-2", label: "US West (Oregon)" },
      { value: "eu-west-1", label: "EU (Ireland)" },
      { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
      { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" }
    ],
    "google-cloud": [
      { value: "us-central1", label: "US Central (Iowa)" },
      { value: "europe-west1", label: "Europe West (Belgium)" },
      { value: "asia-east1", label: "Asia East (Taiwan)" }
    ],
    "azure": [
      { value: "eastus", label: "East US" },
      { value: "westeurope", label: "West Europe" },
      { value: "southeastasia", label: "Southeast Asia" }
    ]
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
          title="Cloud Storage Sync Settings"
          description="Configure automated cloud backup and data synchronization"
        />
      </div>

      <div className="space-y-6">
        {/* Sync Status Dashboard */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <Cloud size={20} />
              Sync Status
            </h3>
            {testResult === "success" && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {testResult === "failed" && (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Upload size={16} className="text-blue-600" />
                <span className="text-sm text-gray-600">Last Sync</span>
              </div>
              <div className="font-bold text-black">{syncStats.lastSync}</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw size={16} className="text-green-600" />
                <span className="text-sm text-gray-600">Next Sync</span>
              </div>
              <div className="font-bold text-black">{syncStats.nextSync}</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive size={16} className="text-purple-600" />
                <span className="text-sm text-gray-600">Storage Used</span>
              </div>
              <div className="font-bold text-black">{syncStats.totalSizeGB} GB</div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-orange-600" />
                <span className="text-sm text-gray-600">Success Rate</span>
              </div>
              <div className="font-bold text-black">{syncStats.successRate}%</div>
            </div>
          </div>

          <Button className="mt-4" onClick={handleSyncNow}>
            <RefreshCw size={16} className="mr-2" />
            Sync Now
          </Button>
        </div>

        {/* Cloud Storage Configuration */}
        <div className="bg-white rounded-xl border p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cloudEnabled"
                checked={cloudConfig.enabled}
                onChange={(e) => handleInputChange("enabled", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="cloudEnabled" className="font-medium text-black">
                Enable Cloud Storage Synchronization
              </label>
            </div>

            {cloudConfig.enabled && (
              <>
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cloud Provider *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {providers.map(provider => (
                      <div
                        key={provider.value}
                        onClick={() => handleInputChange("provider", provider.value)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          cloudConfig.provider === provider.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-2xl mb-2">{provider.icon}</div>
                        <div className="font-semibold text-black text-sm">{provider.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Connection Details */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-black mb-3">Connection Credentials</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Access Key / Client ID *
                      </label>
                      <Input
                        type="password"
                        value={cloudConfig.accessKey}
                        onChange={(e) => handleInputChange("accessKey", e.target.value)}
                        placeholder="AKIA..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key / Client Secret *
                      </label>
                      <Input
                        type="password"
                        value={cloudConfig.secretKey}
                        onChange={(e) => handleInputChange("secretKey", e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bucket Name / Container *
                      </label>
                      <Input
                        value={cloudConfig.bucketName}
                        onChange={(e) => handleInputChange("bucketName", e.target.value)}
                        placeholder="hotline-backups"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Region *
                      </label>
                      <select
                        className="w-full border rounded-lg px-4 py-2 text-black"
                        value={cloudConfig.region}
                        onChange={(e) => handleInputChange("region", e.target.value)}
                      >
                        {(regions[cloudConfig.provider as keyof typeof regions] || regions["aws-s3"]).map(region => (
                          <option key={region.value} value={region.value}>
                            {region.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button variant="ghost" className="mt-4" onClick={handleTest}>
                    <TestTube size={16} className="mr-2" />
                    Test Connection
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {cloudConfig.enabled && (
          <>
            {/* Sync Configuration */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Synchronization Settings</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sync Frequency *
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={cloudConfig.syncFrequency}
                      onChange={(e) => handleInputChange("syncFrequency", e.target.value)}
                    >
                      <option value="realtime">Real-time (Continuous)</option>
                      <option value="hourly">Every Hour</option>
                      <option value="every-6-hours">Every 6 Hours</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="manual">Manual Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sync Time (for scheduled)
                    </label>
                    <Input
                      type="time"
                      value={cloudConfig.syncTime}
                      onChange={(e) => handleInputChange("syncTime", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Retention (days)
                    </label>
                    <Input
                      type="number"
                      value={cloudConfig.retentionDays}
                      onChange={(e) => handleInputChange("retentionDays", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={cloudConfig.autoSync}
                    onChange={(e) => handleInputChange("autoSync", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoSync" className="text-sm text-gray-700">
                    Enable automatic synchronization
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Types to Sync
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["database", "images", "documents", "reports", "logs", "settings"].map(type => (
                      <div key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={type}
                          checked={cloudConfig.syncTypes.includes(type)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange("syncTypes", [...cloudConfig.syncTypes, type]);
                            } else {
                              handleInputChange("syncTypes", cloudConfig.syncTypes.filter(t => t !== type));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor={type} className="text-sm text-gray-700 capitalize">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Performance */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Security & Performance</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="encryptData"
                      checked={cloudConfig.encryptData}
                      onChange={(e) => handleInputChange("encryptData", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="encryptData" className="text-sm text-gray-700">
                      Encrypt data before uploading (AES-256)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="compressBackups"
                      checked={cloudConfig.compressBackups}
                      onChange={(e) => handleInputChange("compressBackups", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="compressBackups" className="text-sm text-gray-700">
                      Compress backups to save storage space
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Storage Limit (GB)
                  </label>
                  <Input
                    type="number"
                    value={cloudConfig.maxStorageGB}
                    onChange={(e) => handleInputChange("maxStorageGB", parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when storage usage exceeds this limit
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Encryption and compression are highly recommended for security and cost savings. 
                    Compressed backups use ~60% less storage space.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Sync Activity */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Recent Sync Activity</h3>

              <div className="space-y-2">
                {[
                  { time: "2026-01-07 02:30 AM", type: "Database Backup", size: "245 MB", status: "success" },
                  { time: "2026-01-07 02:31 AM", type: "Product Images", size: "1.2 GB", status: "success" },
                  { time: "2026-01-07 02:35 AM", type: "Documents", size: "89 MB", status: "success" },
                  { time: "2026-01-07 02:37 AM", type: "System Logs", size: "12 MB", status: "failed" },
                  { time: "2026-01-06 02:30 AM", type: "Full Backup", size: "4.5 GB", status: "success" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {activity.status === "success" ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <XCircle size={16} className="text-red-600" />
                      )}
                      <div>
                        <div className="font-medium text-black text-sm">{activity.type}</div>
                        <div className="text-xs text-gray-500">{activity.time}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{activity.size}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Estimated Monthly Cost</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Storage Cost</div>
                  <div className="text-2xl font-bold text-black">1.38</div>
                  <div className="text-xs text-gray-500 mt-1">{syncStats.totalSizeGB} GB @ 0.023/GB</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Data Transfer</div>
                  <div className="text-2xl font-bold text-black">3.25</div>
                  <div className="text-xs text-gray-500 mt-1">~130 GB monthly</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Estimated</div>
                  <div className="text-2xl font-bold text-black">4.63</div>
                  <div className="text-xs text-gray-500 mt-1">per month</div>
                </div>
              </div>
            </div>
          </>
        )}

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
