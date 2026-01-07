"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Percent, 
  DollarSign, 
  Calendar,
  Save,
  AlertTriangle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentPrice: number;
  newPrice?: number;
  priceChange?: number;
  percentageChange?: number;
}

interface ScheduledPriceChange {
  id: string;
  scheduledDate: Date;
  products: number;
  updateType: string;
  value: string;
  status: "Pending" | "Applied" | "Cancelled";
  createdBy: string;
  createdAt: Date;
}

export default function BulkPriceUpdatesPage() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [updateType, setUpdateType] = useState<"percentage" | "fixed">("percentage");
  const [updateValue, setUpdateValue] = useState("");
  const [updateDirection, setUpdateDirection] = useState<"increase" | "decrease">("increase");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "iPhone 15 Pro 256GB",
      sku: "IP15P-256",
      category: "Smartphones",
      currentPrice: 1199.99
    },
    {
      id: "2",
      name: "Samsung Galaxy S24 Ultra",
      sku: "SGS24U-512",
      category: "Smartphones",
      currentPrice: 1299.99
    },
    {
      id: "3",
      name: "AirPods Pro 2nd Gen",
      sku: "APP2-USB",
      category: "Accessories",
      currentPrice: 249.99
    },
    {
      id: "4",
      name: "iPhone 14 128GB",
      sku: "IP14-128",
      category: "Smartphones",
      currentPrice: 799.99
    },
    {
      id: "5",
      name: "Samsung Galaxy Buds 2 Pro",
      sku: "SGB2P-BK",
      category: "Accessories",
      currentPrice: 229.99
    },
  ]);

  const [scheduledChanges, setScheduledChanges] = useState<ScheduledPriceChange[]>([
    {
      id: "1",
      scheduledDate: new Date("2026-02-01"),
      products: 15,
      updateType: "Percentage Increase",
      value: "10%",
      status: "Pending",
      createdBy: "Admin User",
      createdAt: new Date("2026-01-05")
    },
    {
      id: "2",
      scheduledDate: new Date("2026-01-15"),
      products: 8,
      updateType: "Fixed Amount Decrease",
      value: "$50",
      status: "Pending",
      createdBy: "Manager",
      createdAt: new Date("2026-01-03")
    },
  ]);

  const calculateNewPrice = (currentPrice: number): number => {
    const value = parseFloat(updateValue) || 0;
    
    if (updateType === "percentage") {
      const change = (currentPrice * value) / 100;
      return updateDirection === "increase" 
        ? currentPrice + change 
        : currentPrice - change;
    } else {
      return updateDirection === "increase" 
        ? currentPrice + value 
        : currentPrice - value;
    }
  };

  const handlePreview = () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product");
      return;
    }
    if (!updateValue || parseFloat(updateValue) <= 0) {
      alert("Please enter a valid update value");
      return;
    }

    const updatedProducts = products.map(product => {
      if (selectedProducts.includes(product.id)) {
        const newPrice = calculateNewPrice(product.currentPrice);
        const priceChange = newPrice - product.currentPrice;
        const percentageChange = (priceChange / product.currentPrice) * 100;
        
        return {
          ...product,
          newPrice,
          priceChange,
          percentageChange
        };
      }
      return product;
    });

    setProducts(updatedProducts);
    setShowPreview(true);
  };

  const handleApplyChanges = () => {
    if (isScheduled && !scheduleDate) {
      alert("Please select a scheduled date");
      return;
    }

    if (isScheduled) {
      const newSchedule: ScheduledPriceChange = {
        id: (scheduledChanges.length + 1).toString(),
        scheduledDate: new Date(scheduleDate),
        products: selectedProducts.length,
        updateType: `${updateType === "percentage" ? "Percentage" : "Fixed Amount"} ${updateDirection === "increase" ? "Increase" : "Decrease"}`,
        value: updateType === "percentage" ? `${updateValue}%` : `$${updateValue}`,
        status: "Pending",
        createdBy: "Current User",
        createdAt: new Date()
      };
      setScheduledChanges([...scheduledChanges, newSchedule]);
      alert(`Price update scheduled for ${new Date(scheduleDate).toLocaleDateString()}`);
    } else {
      const updatedProducts = products.map(product => {
        if (selectedProducts.includes(product.id) && product.newPrice) {
          return {
            ...product,
            currentPrice: product.newPrice,
            newPrice: undefined,
            priceChange: undefined,
            percentageChange: undefined
          };
        }
        return product;
      });
      setProducts(updatedProducts);
      alert(`Price update applied to ${selectedProducts.length} products`);
    }

    // Reset form
    setSelectedProducts([]);
    setUpdateValue("");
    setScheduleDate("");
    setShowPreview(false);
    setIsScheduled(false);
  };

  const productColumns: DataTableColumn<Product>[] = [
    {
      key: "select",
      label: "",
      render: (item) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(item.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts([...selectedProducts, item.id]);
            } else {
              setSelectedProducts(selectedProducts.filter(id => id !== item.id));
            }
          }}
          className="w-4 h-4"
        />
      )
    },
    {
      key: "product",
      label: "Product",
      render: (item) => (
        <div>
          <div className="font-medium text-black">{item.name}</div>
          <div className="text-xs text-gray-500">{item.sku}</div>
        </div>
      )
    },
    {
      key: "category",
      label: "Category",
      render: (item) => <div className="text-black">{item.category}</div>
    },
    {
      key: "currentPrice",
      label: "Current Price",
      render: (item) => <div className="text-black font-semibold">${item.currentPrice.toFixed(2)}</div>
    },
    {
      key: "newPrice",
      label: "New Price",
      render: (item) => (
        item.newPrice ? (
          <div className="text-black font-semibold">${item.newPrice.toFixed(2)}</div>
        ) : (
          <div className="text-gray-400">-</div>
        )
      )
    },
    {
      key: "change",
      label: "Change",
      render: (item) => (
        item.priceChange ? (
          <div className={`font-semibold ${item.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {item.priceChange > 0 ? '+' : ''}{item.priceChange.toFixed(2)} ({item.percentageChange?.toFixed(1)}%)
          </div>
        ) : (
          <div className="text-gray-400">-</div>
        )
      )
    }
  ];

  const scheduleColumns: DataTableColumn<ScheduledPriceChange>[] = [
    {
      key: "scheduledDate",
      label: "Scheduled Date",
      render: (item) => (
        <div className="text-black">{new Date(item.scheduledDate).toLocaleDateString()}</div>
      )
    },
    {
      key: "products",
      label: "Products",
      render: (item) => <div className="text-black">{item.products}</div>
    },
    {
      key: "updateType",
      label: "Update Type",
      render: (item) => <div className="text-black">{item.updateType}</div>
    },
    {
      key: "value",
      label: "Value",
      render: (item) => <div className="text-black font-semibold">{item.value}</div>
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
          item.status === "Applied" ? "bg-green-100 text-green-700" :
          "bg-red-100 text-red-700"
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: "createdBy",
      label: "Created By",
      render: (item) => (
        <div>
          <div className="text-black">{item.createdBy}</div>
          <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
        </div>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        item.status === "Pending" && (
          <Button size="sm" variant="outline" onClick={() => alert("Cancel scheduled change")}>
            Cancel
          </Button>
        )
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Bulk Price Updates"
        description="Update prices for multiple products at once"
      />

      {/* Update Configuration */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-black">Price Update Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Update Type</label>
            <select
              className="w-full border rounded px-3 py-2 text-black"
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value as "percentage" | "fixed")}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Direction</label>
            <select
              className="w-full border rounded px-3 py-2 text-black"
              value={updateDirection}
              onChange={(e) => setUpdateDirection(e.target.value as "increase" | "decrease")}
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Value {updateType === "percentage" ? "(%)" : "($)"}
            </label>
            <Input
              type="number"
              value={updateValue}
              onChange={(e) => setUpdateValue(e.target.value)}
              placeholder={updateType === "percentage" ? "e.g., 10" : "e.g., 50"}
              min="0"
              step={updateType === "percentage" ? "0.1" : "0.01"}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-black">Schedule for Future Date</span>
            </label>
            {isScheduled && (
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePreview}>
            <AlertTriangle size={16} className="mr-2" />
            Preview Changes
          </Button>
          
          {showPreview && (
            <Button onClick={handleApplyChanges}>
              <Save size={16} className="mr-2" />
              {isScheduled ? "Schedule Update" : "Apply Now"}
            </Button>
          )}
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-black">
              <strong>{selectedProducts.length} products selected</strong> - 
              {updateType === "percentage" 
                ? ` ${updateDirection === "increase" ? "Increase" : "Decrease"} by ${updateValue}%`
                : ` ${updateDirection === "increase" ? "Increase" : "Decrease"} by $${updateValue}`}
            </p>
          </div>
        )}
      </div>

      {/* Product Selection Table */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Select Products</h3>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedProducts(products.map(p => p.id))}
            >
              Select All
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setSelectedProducts([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
        <DataTable
          data={products}
          columns={productColumns}
          searchPlaceholder="Search products..."
          onSearch={() => {}}
        />
      </div>

      {/* Scheduled Price Changes */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-lg font-semibold mb-4 text-black">Scheduled Price Changes</h3>
        <DataTable
          data={scheduledChanges}
          columns={scheduleColumns}
          searchPlaceholder="Search scheduled changes..."
          onSearch={() => {}}
        />
      </div>
    </div>
  );
}
