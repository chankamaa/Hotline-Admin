"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Building2,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  Save,
  X
} from "lucide-react";

export default function CompanySettingsPage() {
  const [formData, setFormData] = useState({
    companyName: "Hotline Electronics",
    companyLogo: null as File | null,
    businessAddress: "123 Main Street, Tech Plaza, Floor 5",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
    email: "info@hotlineelectronics.com",
    website: "www.hotlineelectronics.com",
    taxIdNumber: "TAX-123456789",
    gstNumber: "GST-987654321",
    vatNumber: "VAT-456789123",
    businessHoursStart: "09:00",
    businessHoursEnd: "18:00",
    businessDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, companyLogo: file }));
    }
  };

  const handleSave = () => {
    console.log("Saving company settings:", formData);
    alert("Company settings saved successfully!");
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day: string) => {
    const currentDays = formData.businessDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];
    handleInputChange("businessDays", newDays);
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
          title="Company Information"
          description="Configure company details, business address, tax information, and business hours"
        />
      </div>

      <div className="space-y-6">
        {/* Company Details */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Building2 size={20} />
            Company Details
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleInputChange("companyName", e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="www.example.com"
              />
            </div>

            {/* Company Logo */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex items-start gap-4">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Upload size={32} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <label htmlFor="logo-upload">
                    <span className="cursor-pointer inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">
                      <Upload size={16} className="mr-2" />
                      Upload Logo
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended size: 500x500px. Max file size: 2MB. Formats: JPG, PNG, SVG
                  </p>
                  {logoPreview && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setLogoPreview(null);
                        setFormData(prev => ({ ...prev, companyLogo: null }));
                      }}
                    >
                      <X size={16} className="mr-2" />
                      Remove Logo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Address */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Business Address
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <Input
                value={formData.businessAddress}
                onChange={(e) => handleInputChange("businessAddress", e.target.value)}
                placeholder="Enter street address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province *
              </label>
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Enter state"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP/Postal Code *
              </label>
              <Input
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="Enter ZIP code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
              >
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Australia</option>
                <option>India</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Phone size={20} />
            Contact Information
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="info@company.com"
              />
            </div>
          </div>
        </div>

        {/* Tax Registration */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <FileText size={20} />
            Tax Registration Numbers
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID Number
              </label>
              <Input
                value={formData.taxIdNumber}
                onChange={(e) => handleInputChange("taxIdNumber", e.target.value)}
                placeholder="TAX-XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <Input
                value={formData.gstNumber}
                onChange={(e) => handleInputChange("gstNumber", e.target.value)}
                placeholder="GST-XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VAT Number
              </label>
              <Input
                value={formData.vatNumber}
                onChange={(e) => handleInputChange("vatNumber", e.target.value)}
                placeholder="VAT-XXXXXXXXX"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> These tax registration numbers will appear on invoices, receipts, and reports. Ensure they are accurate and up-to-date.
            </p>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Clock size={20} />
            Business Hours Configuration
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Time
              </label>
              <Input
                type="time"
                value={formData.businessHoursStart}
                onChange={(e) => handleInputChange("businessHoursStart", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closing Time
              </label>
              <Input
                type="time"
                value={formData.businessHoursEnd}
                onChange={(e) => handleInputChange("businessHoursEnd", e.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Operating Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      formData.businessDays.includes(day)
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
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
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
