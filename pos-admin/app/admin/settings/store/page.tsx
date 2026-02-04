"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Store,
  MapPin,
  DollarSign,
  Receipt,
  Save,
  Plus,
  X,
  Edit,
  Percent
} from "lucide-react";

interface StoreLocation {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export default function StoreSettingsPage() {
  const [formData, setFormData] = useState({
    defaultCurrency: "USD",
    currencySymbol: "$",
    currencyPosition: "before",
    decimalPlaces: 2,
    thousandSeparator: ",",
    decimalSeparator: ".",
    taxSystem: "GST",
    defaultTaxRate: 18,
    taxInclusive: false,
    receiptHeader: "Thank you for shopping with us!",
    receiptFooter: "Please visit again. Have a great day!",
    showTaxOnReceipt: true,
    showDiscountOnReceipt: true,
    receiptPaperSize: "80mm"
  });

  const [storeLocations, setStoreLocations] = useState<StoreLocation[]>([
    {
      id: "LOC001",
      name: "Main Store",
      code: "MAIN",
      address: "123 Main Street, New York, NY 10001",
      phone: "+1 (555) 123-4567",
      isActive: true
    },
    {
      id: "LOC002",
      name: "Branch 1",
      code: "BR01",
      address: "456 Park Avenue, New York, NY 10002",
      phone: "+1 (555) 234-5678",
      isActive: true
    }
  ]);

  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    code: "",
    address: "",
    phone: ""
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving store settings:", formData);
    alert("Store settings saved successfully!");
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.code) {
      const location: StoreLocation = {
        id: `LOC${String(storeLocations.length + 1).padStart(3, '0')}`,
        ...newLocation,
        isActive: true
      };
      setStoreLocations([...storeLocations, location]);
      setNewLocation({ name: "", code: "", address: "", phone: "" });
      setShowAddLocation(false);
    }
  };

  const toggleLocationStatus = (id: string) => {
    setStoreLocations(locations =>
      locations.map(loc =>
        loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
      )
    );
  };

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" }
  ];

  const taxSystems = [
    { value: "GST", label: "GST (Goods and Services Tax)" },
    { value: "VAT", label: "VAT (Value Added Tax)" },
    { value: "Sales Tax", label: "Sales Tax" },
    { value: "None", label: "No Tax" }
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
          title="Store Settings"
          description="Configure store locations, currency, tax settings, and receipt customization"
        />
      </div>

      <div className="space-y-6">
        {/* Store Locations */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black flex items-center gap-2">
              <MapPin size={20} />
              Store Locations
            </h3>
            <Button size="sm" onClick={() => setShowAddLocation(true)}>
              <Plus size={16} className="mr-2" />
              Add Location
            </Button>
          </div>

          {showAddLocation && (
            <div className="mb-4 p-4 border border-blue-300 rounded-lg bg-blue-50">
              <h4 className="font-medium text-black mb-3">Add New Location</h4>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Store Name *"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                />
                <Input
                  placeholder="Store Code *"
                  value={newLocation.code}
                  onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                />
                <Input
                  placeholder="Address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                />
                <Input
                  placeholder="Phone"
                  value={newLocation.phone}
                  onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleAddLocation}>
                  Add Location
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddLocation(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {storeLocations.map(location => (
              <div key={location.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-black">{location.name}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {location.code}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        location.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {location.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={14} />
                        {location.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <Store size={14} />
                        {location.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleLocationStatus(location.id)}
                    >
                      {location.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Currency Configuration
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.defaultCurrency}
                onChange={(e) => {
                  const selected = currencies.find(c => c.code === e.target.value);
                  handleInputChange("defaultCurrency", e.target.value);
                  if (selected) {
                    handleInputChange("currencySymbol", selected.symbol);
                  }
                }}
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency Symbol
              </label>
              <Input
                value={formData.currencySymbol}
                onChange={(e) => handleInputChange("currencySymbol", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbol Position
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.currencyPosition}
                onChange={(e) => handleInputChange("currencyPosition", e.target.value)}
              >
                <option value="before">Before Amount ($100)</option>
                <option value="after">After Amount (100$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Places
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.decimalPlaces}
                onChange={(e) => handleInputChange("decimalPlaces", parseInt(e.target.value))}
              >
                <option value={0}>0 (100)</option>
                <option value={2}>2 (100.00)</option>
                <option value={3}>3 (100.000)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thousand Separator
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.thousandSeparator}
                onChange={(e) => handleInputChange("thousandSeparator", e.target.value)}
              >
                <option value=",">, (Comma)</option>
                <option value=".">. (Dot)</option>
                <option value=" "> (Space)</option>
                <option value="">None</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Decimal Separator
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.decimalSeparator}
                onChange={(e) => handleInputChange("decimalSeparator", e.target.value)}
              >
                <option value=".">. (Dot)</option>
                <option value=",">, (Comma)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Preview:</strong> {formData.currencyPosition === 'before' ? formData.currencySymbol : ''}
              1{formData.thousandSeparator}234{formData.decimalSeparator}{Array(formData.decimalPlaces).fill('0').join('')}
              {formData.currencyPosition === 'after' ? formData.currencySymbol : ''}
            </p>
          </div>
        </div>

        {/* Tax Configuration */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Percent size={20} />
            Tax Configuration
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax System *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.taxSystem}
                onChange={(e) => handleInputChange("taxSystem", e.target.value)}
              >
                {taxSystems.map(tax => (
                  <option key={tax.value} value={tax.value}>
                    {tax.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Tax Rate (%)
              </label>
              <Input
                type="number"
                value={formData.defaultTaxRate}
                onChange={(e) => handleInputChange("defaultTaxRate", parseFloat(e.target.value))}
                min={0}
                max={100}
                step={0.1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Calculation
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.taxInclusive ? "inclusive" : "exclusive"}
                onChange={(e) => handleInputChange("taxInclusive", e.target.value === "inclusive")}
              >
                <option value="exclusive">Tax Exclusive (add to price)</option>
                <option value="inclusive">Tax Inclusive (include in price)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Example:</strong> Product price $100 with {formData.defaultTaxRate}% {formData.taxSystem}
              {formData.taxInclusive ? " (inclusive)" : " (exclusive)"} = ${
                formData.taxInclusive
                  ? 100
                  : (100 + (100 * formData.defaultTaxRate / 100)).toFixed(2)
              } total
            </p>
          </div>
        </div>

        {/* Receipt Customization */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Receipt size={20} />
            Receipt Customization
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Header Message
              </label>
              <Input
                value={formData.receiptHeader}
                onChange={(e) => handleInputChange("receiptHeader", e.target.value)}
                placeholder="Thank you for shopping with us!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Footer Message
              </label>
              <Input
                value={formData.receiptFooter}
                onChange={(e) => handleInputChange("receiptFooter", e.target.value)}
                placeholder="Please visit again!"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Paper Size
                </label>
                <select
                  className="w-full border rounded-lg px-4 py-2 text-black"
                  value={formData.receiptPaperSize}
                  onChange={(e) => handleInputChange("receiptPaperSize", e.target.value)}
                >
                  <option value="58mm">58mm (Small)</option>
                  <option value="80mm">80mm (Standard)</option>
                  <option value="A4">A4 (Letter)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="showTax"
                  checked={formData.showTaxOnReceipt}
                  onChange={(e) => handleInputChange("showTaxOnReceipt", e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showTax" className="text-sm text-gray-700">
                  Show Tax Breakdown on Receipt
                </label>
              </div>

              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="showDiscount"
                  checked={formData.showDiscountOnReceipt}
                  onChange={(e) => handleInputChange("showDiscountOnReceipt", e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="showDiscount" className="text-sm text-gray-700">
                  Show Discount Details on Receipt
                </label>
              </div>
            </div>

            {/* Receipt Preview */}
            <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
              <h4 className="font-medium text-black mb-3">Receipt Preview</h4>
              <div className="bg-white p-4 border-2 border-dashed max-w-xs">
                <div className="text-center mb-3">
                  <p className="font-bold text-black">Hotline Electronics</p>
                  <p className="text-xs text-gray-600">123 Main Street</p>
                  <p className="text-xs text-gray-600">+1 (555) 123-4567</p>
                </div>
                <div className="border-t border-b border-gray-300 py-2 my-2 text-xs">
                  <p className="text-center">{formData.receiptHeader}</p>
                </div>
                <div className="text-xs space-y-1 my-2">
                  <div className="flex justify-between">
                    <span>Product 1</span>
                    <span>{formData.currencySymbol}100.00</span>
                  </div>
                  {formData.showTaxOnReceipt && (
                    <div className="flex justify-between text-gray-600">
                      <span>{formData.taxSystem} ({formData.defaultTaxRate}%)</span>
                      <span>{formData.currencySymbol}{(100 * formData.defaultTaxRate / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>Total</span>
                    <span>{formData.currencySymbol}{(100 + (100 * formData.defaultTaxRate / 100)).toFixed(2)}</span>
                  </div>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2 text-xs text-center">
                  <p>{formData.receiptFooter}</p>
                </div>
              </div>
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
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
