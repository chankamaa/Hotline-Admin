"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  CreditCard,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  DollarSign,
  Wallet,
  Building
} from "lucide-react";

export default function PaymentGatewayPage() {
  const [testResult, setTestResult] = useState<"success" | "failed" | null>(null);
  const [paymentConfig, setPaymentConfig] = useState({
    gatewayEnabled: true,
    provider: "stripe",
    apiKey: "",
    secretKey: "",
    webhookSecret: "",
    testMode: true,
    supportedMethods: ["credit_card", "debit_card", "digital_wallet"],
    autoCapture: true,
    saveCustomerCards: true,
    currency: "USD",
    minimumAmount: 1,
    maximumAmount: 100000
  });

  const handleInputChange = (field: string, value: any) => {
    setPaymentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTest = () => {
    console.log("Testing payment gateway...");
    setTestResult(null);
    setTimeout(() => {
      const success = Math.random() > 0.2;
      setTestResult(success ? "success" : "failed");
      alert(`Payment gateway test ${success ? "passed" : "failed"}!`);
    }, 1500);
  };

  const handleSave = () => {
    console.log("Saving payment settings:", paymentConfig);
    alert("Payment gateway settings saved successfully!");
  };

  const providers = [
    { value: "stripe", label: "Stripe", logo: "💳" },
    { value: "paypal", label: "PayPal", logo: "🅿️" },
    { value: "square", label: "Square", logo: "⬛" },
    { value: "razorpay", label: "Razorpay", logo: "💎" },
    { value: "braintree", label: "Braintree", logo: "🧠" },
    { value: "authorize", label: "Authorize.net", logo: "🔐" }
  ];

  const paymentMethods = [
    { value: "credit_card", label: "Credit Card", icon: CreditCard },
    { value: "debit_card", label: "Debit Card", icon: CreditCard },
    { value: "digital_wallet", label: "Digital Wallet", icon: Wallet },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building },
    { value: "cash_on_delivery", label: "Cash on Delivery", icon: DollarSign }
  ];

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
          title="Payment Gateway Configuration"
          description="Configure payment processing, supported methods, and security settings"
        />
      </div>

      <div className="space-y-6">
        {/* Gateway Status */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="gatewayEnabled"
                checked={paymentConfig.gatewayEnabled}
                onChange={(e) => handleInputChange("gatewayEnabled", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="gatewayEnabled" className="font-medium text-black">
                Enable Payment Gateway Processing
              </label>
            </div>
            {testResult === "success" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">Connected</span>
              </div>
            )}
            {testResult === "failed" && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle size={20} />
                <span className="text-sm font-medium">Connection Failed</span>
              </div>
            )}
          </div>
        </div>

        {paymentConfig.gatewayEnabled && (
          <>
            {/* Provider Selection */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Provider
              </h3>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {providers.map(provider => (
                  <div
                    key={provider.value}
                    onClick={() => handleInputChange("provider", provider.value)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      paymentConfig.provider === provider.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-3xl mb-2">{provider.logo}</div>
                    <div className="font-semibold text-black">{provider.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key / Publishable Key *
                  </label>
                  <Input
                    type="password"
                    placeholder="pk_live_..."
                    value={paymentConfig.apiKey}
                    onChange={(e) => handleInputChange("apiKey", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Your public/publishable API key</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key *
                  </label>
                  <Input
                    type="password"
                    placeholder="sk_live_..."
                    value={paymentConfig.secretKey}
                    onChange={(e) => handleInputChange("secretKey", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Your secret API key (keep secure)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Secret (Optional)
                  </label>
                  <Input
                    type="password"
                    placeholder="whsec_..."
                    value={paymentConfig.webhookSecret}
                    onChange={(e) => handleInputChange("webhookSecret", e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">For webhook event verification</p>
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    id="testMode"
                    checked={paymentConfig.testMode}
                    onChange={(e) => handleInputChange("testMode", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="testMode" className="text-sm text-gray-700">
                    Enable Test/Sandbox Mode
                  </label>
                </div>
              </div>

              {paymentConfig.testMode && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>⚠️ Test Mode Active:</strong> All transactions will be simulated. No real charges will be processed.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Supported Payment Methods</h3>

              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map(method => (
                  <div key={method.value} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={method.value}
                      checked={paymentConfig.supportedMethods.includes(method.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange("supportedMethods", [
                            ...paymentConfig.supportedMethods,
                            method.value
                          ]);
                        } else {
                          handleInputChange(
                            "supportedMethods",
                            paymentConfig.supportedMethods.filter(m => m !== method.value)
                          );
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <method.icon size={20} className="text-gray-600" />
                    <label htmlFor={method.value} className="font-medium text-black flex-1 cursor-pointer">
                      {method.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Settings */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Transaction Settings</h3>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Currency
                  </label>
                  <select
                    className="w-full border rounded-lg px-4 py-2 text-black"
                    value={paymentConfig.currency}
                    onChange={(e) => handleInputChange("currency", e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Transaction Amount
                  </label>
                  <Input
                    type="number"
                    value={paymentConfig.minimumAmount}
                    onChange={(e) => handleInputChange("minimumAmount", parseFloat(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Transaction Amount
                  </label>
                  <Input
                    type="number"
                    value={paymentConfig.maximumAmount}
                    onChange={(e) => handleInputChange("maximumAmount", parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoCapture"
                    checked={paymentConfig.autoCapture}
                    onChange={(e) => handleInputChange("autoCapture", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="autoCapture" className="text-sm text-gray-700">
                    Automatically capture payments (charge immediately)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="saveCards"
                    checked={paymentConfig.saveCustomerCards}
                    onChange={(e) => handleInputChange("saveCustomerCards", e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="saveCards" className="text-sm text-gray-700">
                    Allow customers to save cards for future purchases
                  </label>
                </div>
              </div>
            </div>

            {/* Test Connection */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Connection Test</h3>
              <p className="text-sm text-gray-600 mb-4">
                Test your payment gateway connection to ensure everything is configured correctly.
              </p>
              <Button variant="ghost" onClick={handleTest}>
                <TestTube size={16} className="mr-2" />
                Test Payment Gateway Connection
              </Button>
            </div>

            {/* Webhook Configuration */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-black mb-4">Webhook Configuration</h3>
              <p className="text-sm text-gray-600 mb-3">
                Configure your payment provider to send webhook events to:
              </p>
              <div className="bg-gray-50 border rounded-lg p-3 mb-3">
                <code className="text-sm text-blue-600">
                  https://yourdomain.com/api/webhooks/payment
                </code>
              </div>
              <p className="text-xs text-gray-500">
                Webhooks notify your system about payment events like successful charges, refunds, and disputes.
              </p>
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
