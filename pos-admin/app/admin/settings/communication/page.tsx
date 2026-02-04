"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Mail,
  MessageSquare,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Send
} from "lucide-react";

export default function CommunicationSettingsPage() {
  const [testResults, setTestResults] = useState<Record<string, "success" | "failed" | null>>({
    email: null,
    sms: null
  });

  const [emailConfig, setEmailConfig] = useState({
    enabled: true,
    provider: "smtp",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "noreply@hotlineelectronics.com",
    smtpPassword: "",
    senderName: "Hotline Electronics",
    senderEmail: "noreply@hotlineelectronics.com",
    replyToEmail: "support@hotlineelectronics.com",
    useSSL: true,
    useTLS: true
  });

  const [smsConfig, setSmsConfig] = useState({
    enabled: true,
    provider: "twilio",
    accountSid: "",
    authToken: "",
    apiKey: "",
    fromNumber: "+1234567890",
    senderId: "HOTLINE",
    enableDeliveryReports: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: {
      orderConfirmation: true,
      lowStock: true,
      warrantyExpiry: true,
      dailyReport: true
    },
    smsNotifications: {
      orderStatus: true,
      repairUpdates: true,
      promotions: false
    }
  });

  const handleTest = (type: "email" | "sms") => {
    console.log(`Testing ${type}...`);
    setTestResults(prev => ({ ...prev, [type]: null }));
    
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setTestResults(prev => ({ ...prev, [type]: success ? "success" : "failed" }));
      alert(`${type.toUpperCase()} test ${success ? "passed" : "failed"}!`);
    }, 1500);
  };

  const handleSave = () => {
    console.log("Saving communication settings:", { emailConfig, smsConfig, notificationSettings });
    alert("Communication settings saved successfully!");
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
          title="Email & SMS Configuration"
          description="Configure email service and SMS gateway for customer communications and notifications"
        />
      </div>

      <div className="space-y-6">
        {/* Email Service Configuration */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <Mail size={20} />
              Email Service Configuration
            </h3>
            {testResults.email === "success" && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {testResults.email === "failed" && (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={emailConfig.enabled}
                onChange={(e) => setEmailConfig({ ...emailConfig, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="emailEnabled" className="font-medium text-black">
                Enable Email Service
              </label>
            </div>

            {emailConfig.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Provider *
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={emailConfig.provider}
                      onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
                    >
                      <option value="smtp">SMTP (Custom Server)</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="mailgun">Mailgun</option>
                      <option value="ses">AWS SES</option>
                      <option value="postmark">Postmark</option>
                      <option value="sparkpost">SparkPost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Name *
                    </label>
                    <Input
                      value={emailConfig.senderName}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                      placeholder="Hotline Electronics"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sender Email Address *
                    </label>
                    <Input
                      type="email"
                      value={emailConfig.senderEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                      placeholder="noreply@hotlineelectronics.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reply-To Email Address
                    </label>
                    <Input
                      type="email"
                      value={emailConfig.replyToEmail}
                      onChange={(e) => setEmailConfig({ ...emailConfig, replyToEmail: e.target.value })}
                      placeholder="support@hotlineelectronics.com"
                    />
                  </div>
                </div>

                {emailConfig.provider === "smtp" && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-black mb-3">SMTP Server Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Host *
                          </label>
                          <Input
                            value={emailConfig.smtpHost}
                            onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                            placeholder="smtp.gmail.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Port *
                          </label>
                          <Input
                            type="number"
                            value={emailConfig.smtpPort}
                            onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) })}
                            placeholder="587"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Username *
                          </label>
                          <Input
                            value={emailConfig.smtpUser}
                            onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                            placeholder="your-email@gmail.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SMTP Password *
                          </label>
                          <Input
                            type="password"
                            value={emailConfig.smtpPassword}
                            onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="useSSL"
                            checked={emailConfig.useSSL}
                            onChange={(e) => setEmailConfig({ ...emailConfig, useSSL: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label htmlFor="useSSL" className="text-sm text-gray-700">
                            Use SSL Encryption
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="useTLS"
                            checked={emailConfig.useTLS}
                            onChange={(e) => setEmailConfig({ ...emailConfig, useTLS: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label htmlFor="useTLS" className="text-sm text-gray-700">
                            Use TLS/STARTTLS
                          </label>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-black mb-3">Email Notifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(notificationSettings.emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`email-${key}`}
                          checked={value}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            emailNotifications: {
                              ...notificationSettings.emailNotifications,
                              [key]: e.target.checked
                            }
                          })}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`email-${key}`} className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={() => handleTest("email")}>
                  <TestTube size={16} className="mr-2" />
                  Send Test Email
                </Button>
              </>
            )}
          </div>
        </div>

        {/* SMS Gateway Configuration */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <MessageSquare size={20} />
              SMS Gateway Configuration
            </h3>
            {testResults.sms === "success" && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {testResults.sms === "failed" && (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="smsEnabled"
                checked={smsConfig.enabled}
                onChange={(e) => setSmsConfig({ ...smsConfig, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="smsEnabled" className="font-medium text-black">
                Enable SMS Notifications
              </label>
            </div>

            {smsConfig.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SMS Provider *
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={smsConfig.provider}
                      onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                    >
                      <option value="twilio">Twilio</option>
                      <option value="nexmo">Vonage (Nexmo)</option>
                      <option value="aws-sns">AWS SNS</option>
                      <option value="msg91">MSG91</option>
                      <option value="plivo">Plivo</option>
                      <option value="sinch">Sinch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Number / Sender ID *
                    </label>
                    <Input
                      value={smsConfig.fromNumber}
                      onChange={(e) => setSmsConfig({ ...smsConfig, fromNumber: e.target.value })}
                      placeholder="+1234567890 or HOTLINE"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account SID / API Key *
                    </label>
                    <Input
                      type="password"
                      value={smsConfig.accountSid}
                      onChange={(e) => setSmsConfig({ ...smsConfig, accountSid: e.target.value })}
                      placeholder="AC..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auth Token / Secret Key *
                    </label>
                    <Input
                      type="password"
                      value={smsConfig.authToken}
                      onChange={(e) => setSmsConfig({ ...smsConfig, authToken: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="deliveryReports"
                    checked={smsConfig.enableDeliveryReports}
                    onChange={(e) => setSmsConfig({ ...smsConfig, enableDeliveryReports: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="deliveryReports" className="text-sm text-gray-700">
                    Enable delivery status reports
                  </label>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-black mb-3">SMS Notifications</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(notificationSettings.smsNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`sms-${key}`}
                          checked={value}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            smsNotifications: {
                              ...notificationSettings.smsNotifications,
                              [key]: e.target.checked
                            }
                          })}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`sms-${key}`} className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" onClick={() => handleTest("sms")}>
                  <TestTube size={16} className="mr-2" />
                  Send Test SMS
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Cost Estimation */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">Usage & Cost Estimation</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Emails This Month</div>
              <div className="text-2xl font-bold text-black">2,847</div>
              <div className="text-xs text-gray-500 mt-1">~$14.24 estimated cost</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">SMS This Month</div>
              <div className="text-2xl font-bold text-black">1,234</div>
              <div className="text-xs text-gray-500 mt-1">~$86.38 estimated cost</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Delivery Rate</div>
              <div className="text-2xl font-bold text-black">98.4%</div>
              <div className="text-xs text-gray-500 mt-1">Email & SMS combined</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/settings">
            <Button variant="outline">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSave}>
            <Save size={18} className="mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
