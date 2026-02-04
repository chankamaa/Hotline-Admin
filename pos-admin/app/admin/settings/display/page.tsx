"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft,
  Globe,
  Calendar,
  Clock,
  Hash,
  Languages,
  Save
} from "lucide-react";

export default function DisplaySettingsPage() {
  const [formData, setFormData] = useState({
    // Date Format
    dateFormat: "DD/MM/YYYY",
    dateSeparator: "/",
    
    // Time Format
    timeFormat: "24-hour",
    showSeconds: false,
    
    // Number Format
    numberFormat: "1,234.56",
    thousandSeparator: ",",
    decimalSeparator: ".",
    
    // Language
    defaultLanguage: "en",
    enableMultiLanguage: true,
    secondaryLanguages: ["es", "fr"],
    
    // Regional Settings
    timezone: "America/New_York",
    firstDayOfWeek: "monday",
    
    // Display Preferences
    showCurrency: true,
    compactNumbers: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Saving display settings:", formData);
    alert("Display settings saved successfully!");
  };

  const dateFormats = [
    { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2026)", example: "31/12/2026" },
    { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2026)", example: "12/31/2026" },
    { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-12-31)", example: "2026-12-31" },
    { value: "DD-MMM-YYYY", label: "DD-MMM-YYYY (31-Dec-2026)", example: "31-Dec-2026" },
    { value: "MMMM DD, YYYY", label: "MMMM DD, YYYY (December 31, 2026)", example: "December 31, 2026" }
  ];

  const numberFormats = [
    { value: "1,234.56", label: "1,234.56 (Comma thousands, dot decimal)", thousand: ",", decimal: "." },
    { value: "1.234,56", label: "1.234,56 (Dot thousands, comma decimal)", thousand: ".", decimal: "," },
    { value: "1 234.56", label: "1 234.56 (Space thousands, dot decimal)", thousand: " ", decimal: "." },
    { value: "1234.56", label: "1234.56 (No separator)", thousand: "", decimal: "." }
  ];

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" }
  ];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Pacific/Auckland"
  ];

  const toggleSecondaryLanguage = (langCode: string) => {
    const current = formData.secondaryLanguages;
    const updated = current.includes(langCode)
      ? current.filter(l => l !== langCode)
      : [...current, langCode];
    handleInputChange("secondaryLanguages", updated);
  };

  // Preview date
  const previewDate = new Date(2026, 11, 31, 15, 45, 30);
  const getDatePreview = () => {
    const format = formData.dateFormat;
    const sep = formData.dateSeparator;
    return format.replace(/\//g, sep);
  };

  const getTimePreview = () => {
    if (formData.timeFormat === "24-hour") {
      return formData.showSeconds ? "15:45:30" : "15:45";
    } else {
      return formData.showSeconds ? "03:45:30 PM" : "03:45 PM";
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
          title="Display Settings"
          description="Configure date/time formats, number formatting, and language preferences"
        />
      </div>

      <div className="space-y-6">
        {/* Date Format Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Date Format
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.dateFormat}
                onChange={(e) => handleInputChange("dateFormat", e.target.value)}
              >
                {dateFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Separator
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.dateSeparator}
                onChange={(e) => handleInputChange("dateSeparator", e.target.value)}
              >
                <option value="/">/  (Slash)</option>
                <option value="-">-  (Dash)</option>
                <option value=".">. (Dot)</option>
                <option value=" "> (Space)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Preview:</strong> {getDatePreview()}
            </p>
          </div>
        </div>

        {/* Time Format Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Clock size={20} />
            Time Format
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Format *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.timeFormat}
                onChange={(e) => handleInputChange("timeFormat", e.target.value)}
              >
                <option value="12-hour">12-hour (01:00 PM)</option>
                <option value="24-hour">24-hour (13:00)</option>
              </select>
            </div>

            <div className="flex items-center pt-8">
              <input
                type="checkbox"
                id="showSeconds"
                checked={formData.showSeconds}
                onChange={(e) => handleInputChange("showSeconds", e.target.checked)}
                className="w-4 h-4 mr-2"
              />
              <label htmlFor="showSeconds" className="text-sm text-gray-700">
                Show Seconds
              </label>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Preview:</strong> {getTimePreview()}
            </p>
          </div>
        </div>

        {/* Number Format Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Hash size={20} />
            Number Format
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number Format *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.numberFormat}
                onChange={(e) => {
                  const selected = numberFormats.find(f => f.value === e.target.value);
                  handleInputChange("numberFormat", e.target.value);
                  if (selected) {
                    handleInputChange("thousandSeparator", selected.thousand);
                    handleInputChange("decimalSeparator", selected.decimal);
                  }
                }}
              >
                {numberFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="compactNumbers"
                  checked={formData.compactNumbers}
                  onChange={(e) => handleInputChange("compactNumbers", e.target.checked)}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor="compactNumbers" className="text-sm text-gray-700">
                  Use Compact Notation (1K, 1M, 1B)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCurrency"
                  checked={formData.showCurrency}
                  onChange={(e) => handleInputChange("showCurrency", e.target.checked)}
                  className="w-4 h-4 mr-2"
                />
                <label htmlFor="showCurrency" className="text-sm text-gray-700">
                  Always Show Currency Symbol
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Standard:</strong> {formData.numberFormat}
              </div>
              <div>
                <strong>Large Number:</strong>{" "}
                {formData.compactNumbers ? "1.5M" : `1${formData.thousandSeparator}500${formData.thousandSeparator}000`}
              </div>
              <div>
                <strong>Currency:</strong> {formData.showCurrency ? "$" : ""}
                {formData.numberFormat}
              </div>
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Languages size={20} />
            Language Selection
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.defaultLanguage}
                onChange={(e) => handleInputChange("defaultLanguage", e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="enableMultiLanguage"
                checked={formData.enableMultiLanguage}
                onChange={(e) => handleInputChange("enableMultiLanguage", e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="enableMultiLanguage" className="font-medium text-black">
                Enable Multi-Language Support
              </label>
            </div>

            {formData.enableMultiLanguage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Additional Languages
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {languages
                    .filter(lang => lang.code !== formData.defaultLanguage)
                    .map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => toggleSecondaryLanguage(lang.code)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          formData.secondaryLanguages.includes(lang.code)
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                        }`}
                      >
                        {lang.flag} {lang.name}
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Users can switch between enabled languages from the interface. All system messages, labels, and reports will be translated.
              </p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4 flex items-center gap-2">
            <Globe size={20} />
            Regional Settings
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone *
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.timezone}
                onChange={(e) => handleInputChange("timezone", e.target.value)}
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Day of Week
              </label>
              <select
                className="w-full border rounded-lg px-4 py-2 text-black"
                value={formData.firstDayOfWeek}
                onChange={(e) => handleInputChange("firstDayOfWeek", e.target.value)}
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="saturday">Saturday</option>
              </select>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Current Time in {formData.timezone}:</strong>{" "}
              {new Date().toLocaleString('en-US', { timeZone: formData.timezone })}
            </p>
          </div>
        </div>

        {/* Preview Summary */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold text-black mb-4">Format Preview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Date & Time</p>
              <p className="font-semibold text-black">
                {getDatePreview()} {getTimePreview()}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Number</p>
              <p className="font-semibold text-black">
                {formData.showCurrency ? "$" : ""}{formData.numberFormat}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Language</p>
              <p className="font-semibold text-black">
                {languages.find(l => l.code === formData.defaultLanguage)?.flag}{" "}
                {languages.find(l => l.code === formData.defaultLanguage)?.name}
                {formData.enableMultiLanguage && formData.secondaryLanguages.length > 0 && (
                  <span className="text-gray-500 text-sm ml-2">
                    +{formData.secondaryLanguages.length} more
                  </span>
                )}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Timezone</p>
              <p className="font-semibold text-black">
                {formData.timezone.replace(/_/g, " ")}
              </p>
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
