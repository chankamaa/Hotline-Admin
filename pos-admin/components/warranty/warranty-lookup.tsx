"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/providers/toast-provider";
import {
  searchWarrantiesByPhone,
  fetchWarrantyByNumber,
  type Warranty,
  formatWarrantyDuration,
  calculateDaysRemaining,
  getWarrantyStatusColor,
} from "@/lib/api/warrantyApi";
import { Search, ShieldCheck, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface WarrantyLookupProps {
  onWarrantySelect?: (warranty: Warranty) => void;
  className?: string;
}

export function WarrantyLookup({ onWarrantySelect, className = "" }: WarrantyLookupProps) {
  const toast = useToast();
  const [searchType, setSearchType] = useState<"phone" | "number">("phone");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Warranty[]>([]);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      toast.error("Please enter at least 3 characters");
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedWarranty(null);

    try {
      if (searchType === "phone") {
        const res = await searchWarrantiesByPhone(searchQuery);
        setResults(res.data.warranties);
        if (res.results === 0) {
          toast.info("No warranties found for this phone number");
        } else {
          toast.success(`Found ${res.results} warranty(s)`);
        }
      } else {
        const res = await fetchWarrantyByNumber(searchQuery);
        setResults([res.data.warranty]);
        setSelectedWarranty(res.data.warranty);
        toast.success("Warranty found!");
      }
    } catch (error: any) {
      toast.error(error.message || "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    onWarrantySelect?.(warranty);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle size={16} className="text-green-600" />;
      case "EXPIRED":
        return <XCircle size={16} className="text-red-600" />;
      case "CLAIMED":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "VOID":
        return <XCircle size={16} className="text-gray-600" />;
      default:
        return <ShieldCheck size={16} className="text-gray-600" />;
    }
  };

  const getProductName = (product: Warranty["product"]) => {
    return typeof product === "string" ? "Unknown Product" : product.name;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Controls */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Search Warranty
        </label>
        
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setSearchType("phone")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              searchType === "phone"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            By Phone
          </button>
          <button
            onClick={() => setSearchType("number")}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              searchType === "number"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            By Warranty #
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label=""
              name="warrantySearch"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                searchType === "phone"
                  ? "Enter customer phone..."
                  : "Enter warranty number (WR-YYYYMMDD-XXXX)..."
              }
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : <Search size={16} />}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            {results.length} Result{results.length !== 1 ? "s" : ""}
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((warranty) => (
              <div
                key={warranty._id}
                onClick={() => handleSelect(warranty)}
                className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                  selectedWarranty?._id === warranty._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(warranty.status)}
                      <span className="font-semibold text-gray-900">
                        {warranty.warrantyNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          warranty.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : warranty.status === "EXPIRED"
                            ? "bg-red-100 text-red-700"
                            : warranty.status === "CLAIMED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {warranty.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-900 font-medium">
                      {getProductName(warranty.product)}
                    </div>

                    <div className="text-sm text-gray-600 mt-1">
                      Customer: {warranty.customer.name} ({warranty.customer.phone})
                    </div>

                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Type:</span> {warranty.warrantyType}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span>{" "}
                        {formatWarrantyDuration(warranty.durationMonths)}
                      </div>
                      <div>
                        <span className="font-medium">Expires:</span>{" "}
                        {new Date(warranty.endDate).toLocaleDateString()}
                      </div>
                      {warranty.status === "ACTIVE" && (
                        <div className="text-blue-600 font-medium">
                          {calculateDaysRemaining(warranty)} days left
                        </div>
                      )}
                    </div>

                    {warranty.serialNumber && (
                      <div className="text-xs text-gray-500 mt-1">
                        Serial/IMEI: {warranty.serialNumber}
                      </div>
                    )}

                    {warranty.claims.length > 0 && (
                      <div className="text-xs text-yellow-600 mt-1 font-medium">
                        {warranty.claims.length} claim(s) filed
                      </div>
                    )}
                  </div>

                  {selectedWarranty?._id === warranty._id && (
                    <CheckCircle size={20} className="text-blue-600 shrink-0 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searchQuery && results.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ShieldCheck size={48} className="mx-auto mb-2 opacity-50" />
          <div className="text-sm">No warranties found</div>
        </div>
      )}
    </div>
  );
}
