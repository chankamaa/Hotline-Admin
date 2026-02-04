"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Printer,
  Barcode,
  Tag,
  DollarSign,
  Mail,
  MessageSquare,
  Cloud,
  CreditCard,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";

export default function HardwareIntegrationsPage() {
  const [printerConfig, setPrinterConfig] = useState({
    enabled: true,
    connectionType: "network",
    ipAddress: "192.168.1.100",
    port: "9100",
    usbPort: "",
    paperWidth: "80mm",
    autoCut: true,
    printCopies: 1
  });

  const [barcodeConfig, setBarcodeConfig] = useState({
    enabled: true,
    scannerType: "usb",
    autoFocus: true,
    beepOnScan: true,
    scanPrefix: "",
    scanSuffix: ""
  });

  const [paymentConfig, setPaymentConfig] = useState({
    gatewayEnabled: true,
    provider: "stripe",
    apiKey: "",
    secretKey: "",
    testMode: true,
    supportedMethods: ["credit_card", "debit_card", "digital_wallet"]
  });

  const [emailConfig, setEmailConfig] = useState({
    provider: "smtp",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "noreply@hotlineelectronics.com",
    smtpPassword: "",
    senderName: "Hotline Electronics",
    useSSL: true
  });

  const [smsConfig, setSmsConfig] = useState({
    enabled: true,
    provider: "twilio",
    accountSid: "",
    authToken: "",
    fromNumber: "+1234567890"
  });

  const [cloudConfig, setCloudConfig] = useState({
    enabled: true,
    provider: "aws-s3",
    accessKey: "",
    secretKey: "",
    bucketName: "hotline-backups",
    region: "us-east-1",
    autoSync: true,
    syncFrequency: "daily"
  });

  const [testResults, setTestResults] = useState<Record<string, "success" | "failed" | null>>({
    printer: null,
    barcode: null,
    payment: null,
    email: null,
    sms: null,
    cloud: null
  });

  const handleTest = (device: string) => {
    console.log(`Testing ${device}...`);
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      setTestResults(prev => ({ ...prev, [device]: success ? "success" : "failed" }));
      alert(`${device} test ${success ? "passed" : "failed"}!`);
    }, 1500);
  };

  const handleSaveAll = () => {
    alert("All hardware and integration settings saved successfully!");
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
          title="Hardware & Integration Configuration"
          description="Configure receipt printers, barcode scanners, payment gateways, and third-party services"
        />
      </div>

      <div className="space-y-6">
        {/* Receipt Printer */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <Printer size={20} />
              Receipt Printer Settings
            </h3>
            {testResults.printer === "success" && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {testResults.printer === "failed" && (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="printerEnabled"
                checked={printerConfig.enabled}
                onChange={(e) => setPrinterConfig({ ...printerConfig, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="printerEnabled" className="font-medium text-black">
                Enable Receipt Printer
              </label>
            </div>

            {printerConfig.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Connection Type *
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={printerConfig.connectionType}
                      onChange={(e) => setPrinterConfig({ ...printerConfig, connectionType: e.target.value })}
                    >
                      <option value="network">Network (IP Address)</option>
                      <option value="usb">USB Connection</option>
                      <option value="bluetooth">Bluetooth</option>
                    </select>
                  </div>

                  {printerConfig.connectionType === "network" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IP Address *
                        </label>
                        <Input
                          value={printerConfig.ipAddress}
                          onChange={(e) => setPrinterConfig({ ...printerConfig, ipAddress: e.target.value })}
                          placeholder="192.168.1.100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Port
                        </label>
                        <Input
                          value={printerConfig.port}
                          onChange={(e) => setPrinterConfig({ ...printerConfig, port: e.target.value })}
                          placeholder="9100"
                        />
                      </div>
                    </>
                  )}

                  {printerConfig.connectionType === "usb" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        USB Port
                      </label>
                      <select className="w-full border rounded-lg px-4 py-2 text-black">
                        <option>Auto-detect</option>
                        <option>COM1</option>
                        <option>COM2</option>
                        <option>COM3</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paper Width
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={printerConfig.paperWidth}
                      onChange={(e) => setPrinterConfig({ ...printerConfig, paperWidth: e.target.value })}
                    >
                      <option value="58mm">58mm (Small)</option>
                      <option value="80mm">80mm (Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Print Copies
                    </label>
                    <Input
                      type="number"
                      value={printerConfig.printCopies}
                      onChange={(e) => setPrinterConfig({ ...printerConfig, printCopies: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoCut"
                    checked={printerConfig.autoCut}
                    onChange={(e) => setPrinterConfig({ ...printerConfig, autoCut: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoCut" className="text-sm text-gray-700">
                    Auto-cut paper after printing
                  </label>
                </div>

                <Button variant="ghost" onClick={() => handleTest("printer")}>
                  <TestTube size={16} className="mr-2" />
                  Test Printer Connection
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Barcode Scanner */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <Barcode size={20} />
              Barcode Scanner Configuration
            </h3>
            {testResults.barcode === "success" && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {testResults.barcode === "failed" && (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="barcodeEnabled"
                checked={barcodeConfig.enabled}
                onChange={(e) => setBarcodeConfig({ ...barcodeConfig, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="barcodeEnabled" className="font-medium text-black">
                Enable Barcode Scanner
              </label>
            </div>

            {barcodeConfig.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scanner Type
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={barcodeConfig.scannerType}
                      onChange={(e) => setBarcodeConfig({ ...barcodeConfig, scannerType: e.target.value })}
                    >
                      <option value="usb">USB Scanner</option>
                      <option value="bluetooth">Bluetooth Scanner</option>
                      <option value="webcam">Webcam/Camera</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scan Prefix (Optional)
                    </label>
                    <Input
                      value={barcodeConfig.scanPrefix}
                      onChange={(e) => setBarcodeConfig({ ...barcodeConfig, scanPrefix: e.target.value })}
                      placeholder="e.g., SKU-"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scan Suffix (Optional)
                    </label>
                    <Input
                      value={barcodeConfig.scanSuffix}
                      onChange={(e) => setBarcodeConfig({ ...barcodeConfig, scanSuffix: e.target.value })}
                      placeholder="e.g., -END"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="autoFocus"
                      checked={barcodeConfig.autoFocus}
                      onChange={(e) => setBarcodeConfig({ ...barcodeConfig, autoFocus: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="autoFocus" className="text-sm text-gray-700">
                      Auto-focus after successful scan
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="beepOnScan"
                      checked={barcodeConfig.beepOnScan}
                      onChange={(e) => setBarcodeConfig({ ...barcodeConfig, beepOnScan: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="beepOnScan" className="text-sm text-gray-700">
                      Beep sound on successful scan
                    </label>
                  </div>
                </div>

                <Button variant="ghost" onClick={() => handleTest("barcode")}>
                  <TestTube size={16} className="mr-2" />
                  Test Scanner
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Label Printer & Cash Drawer */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <Tag size={20} />
              Label Printer Setup
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure label printer for product labels and barcodes
            </p>
            <Button variant="ghost">
              <Settings size={16} className="mr-2" />
              Configure Label Printer
            </Button>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Cash Drawer Settings
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure automatic cash drawer opening
            </p>
            <Button variant="ghost">
              <Settings size={16} className="mr-2" />
              Configure Cash Drawer
            </Button>
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <CreditCard size={20} />
              Payment Gateway Configuration
            </h3>
            {testResults.payment === "success" && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {testResults.payment === "failed" && (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="paymentEnabled"
                checked={paymentConfig.gatewayEnabled}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, gatewayEnabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="paymentEnabled" className="font-medium text-black">
                Enable Payment Gateway
              </label>
            </div>

            {paymentConfig.gatewayEnabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Provider *
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={paymentConfig.provider}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, provider: e.target.value })}
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="square">Square</option>
                      <option value="razorpay">Razorpay</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-8">
                    <input
                      type="checkbox"
                      id="testMode"
                      checked={paymentConfig.testMode}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, testMode: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="testMode" className="text-sm text-gray-700">
                      Enable Test Mode
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key / Public Key *
                    </label>
                    <Input
                      type="password"
                      placeholder="pk_test_..."
                      value={paymentConfig.apiKey}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, apiKey: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key *
                    </label>
                    <Input
                      type="password"
                      placeholder="sk_test_..."
                      value={paymentConfig.secretKey}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, secretKey: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supported Payment Methods
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["credit_card", "debit_card", "digital_wallet", "bank_transfer", "cash_on_delivery"].map(method => (
                      <div key={method} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={method}
                          checked={paymentConfig.supportedMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPaymentConfig({
                                ...paymentConfig,
                                supportedMethods: [...paymentConfig.supportedMethods, method]
                              });
                            } else {
                              setPaymentConfig({
                                ...paymentConfig,
                                supportedMethods: paymentConfig.supportedMethods.filter(m => m !== method)
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor={method} className="text-sm text-gray-700 capitalize">
                          {method.replace("_", " ")}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="ghost" onClick={() => handleTest("payment")}>
                  <TestTube size={16} className="mr-2" />
                  Test Payment Gateway
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Email Service */}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Provider
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={emailConfig.provider}
                onChange={(e) => setEmailConfig({ ...emailConfig, provider: e.target.value })}
              >
                <option value="smtp">SMTP (Custom)</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
                <option value="ses">AWS SES</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host
              </label>
              <Input
                value={emailConfig.smtpHost}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Port
              </label>
              <Input
                type="number"
                value={emailConfig.smtpPort}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <Input
                value={emailConfig.senderName}
                onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Username
              </label>
              <Input
                value={emailConfig.smtpUser}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Password
              </label>
              <Input
                type="password"
                value={emailConfig.smtpPassword}
                onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="useSSL"
              checked={emailConfig.useSSL}
              onChange={(e) => setEmailConfig({ ...emailConfig, useSSL: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="useSSL" className="text-sm text-gray-700">
              Use SSL/TLS encryption
            </label>
          </div>

          <Button variant="ghost" className="mt-4" onClick={() => handleTest("email")}>
            <TestTube size={16} className="mr-2" />
            Send Test Email
          </Button>
        </div>

        {/* SMS Gateway */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <MessageSquare size={20} />
              SMS Gateway for Notifications
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
                      SMS Provider
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
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Number
                    </label>
                    <Input
                      value={smsConfig.fromNumber}
                      onChange={(e) => setSmsConfig({ ...smsConfig, fromNumber: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account SID / API Key
                    </label>
                    <Input
                      type="password"
                      value={smsConfig.accountSid}
                      onChange={(e) => setSmsConfig({ ...smsConfig, accountSid: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auth Token / Secret
                    </label>
                    <Input
                      type="password"
                      value={smsConfig.authToken}
                      onChange={(e) => setSmsConfig({ ...smsConfig, authToken: e.target.value })}
                    />
                  </div>
                </div>

                <Button variant="ghost" onClick={() => handleTest("sms")}>
                  <TestTube size={16} className="mr-2" />
                  Send Test SMS
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Cloud Storage */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <Cloud size={20} />
              Cloud Storage Sync Settings
            </h3>
            {testResults.cloud === "success" && (
              <CheckCircle size={20} className="text-green-600" />
            )}
            {testResults.cloud === "failed" && (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cloudEnabled"
                checked={cloudConfig.enabled}
                onChange={(e) => setCloudConfig({ ...cloudConfig, enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <label htmlFor="cloudEnabled" className="font-medium text-black">
                Enable Cloud Storage Sync
              </label>
            </div>

            {cloudConfig.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cloud Provider
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={cloudConfig.provider}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, provider: e.target.value })}
                    >
                      <option value="aws-s3">Amazon S3</option>
                      <option value="google-cloud">Google Cloud Storage</option>
                      <option value="azure">Microsoft Azure</option>
                      <option value="dropbox">Dropbox</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={cloudConfig.region}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, region: e.target.value })}
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Key
                    </label>
                    <Input
                      type="password"
                      value={cloudConfig.accessKey}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, accessKey: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key
                    </label>
                    <Input
                      type="password"
                      value={cloudConfig.secretKey}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, secretKey: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bucket Name
                    </label>
                    <Input
                      value={cloudConfig.bucketName}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, bucketName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sync Frequency
                    </label>
                    <select
                      className="w-full border rounded-lg px-4 py-2 text-black"
                      value={cloudConfig.syncFrequency}
                      onChange={(e) => setCloudConfig({ ...cloudConfig, syncFrequency: e.target.value })}
                    >
                      <option value="realtime">Real-time</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={cloudConfig.autoSync}
                    onChange={(e) => setCloudConfig({ ...cloudConfig, autoSync: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoSync" className="text-sm text-gray-700">
                    Enable automatic synchronization
                  </label>
                </div>

                <Button variant="ghost" onClick={() => handleTest("cloud")}>
                  <TestTube size={16} className="mr-2" />
                  Test Connection
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/settings">
            <Button variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSaveAll}>
            <Save size={18} className="mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
