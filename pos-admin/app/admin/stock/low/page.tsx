"use client";

import { useState } from "react";
import { AlertCircle, Clock, Package } from "lucide-react";

// Example data structure, replace with backend data
const mockAlerts = [
  { id: 1, name: "Samsung Galaxy S24", code: "CA0002", current: 0, min: 10, status: "out" },
  { id: 2, name: "Samsung Galaxy S24 Ultra", code: "CA0001", current: 0, min: 10, status: "out" },
  { id: 3, name: "Samsung Galaxy S24+", code: "CA0003", current: 0, min: 10, status: "out" },
  { id: 4, name: "Samsung Galaxy S24 Mini", code: "BR0002", current: 0, min: 8, status: "out" },

];

export default function LowStockPage() {
  const [search, setSearch] = useState("");
  const filtered = mockAlerts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  const total = mockAlerts.length;
  const out = mockAlerts.filter(a => a.status === "out").length;
  const low = mockAlerts.filter(a => a.status === "low").length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen ">
      <h1 className="text-3xl font-bold mb-6 text-amber-800">Stock Alerts</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 ">
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4  ">
          <Package className="text-blue-500 " size={32} />
          <div>
            <div className="text-xs text-gray-500">Total Items</div>
            <div className="text-2xl font-bold  text-black">{total}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
          <AlertCircle className="text-red-500" size={32} />
          <div>
            <div className="text-xs text-gray-500">Out of Stock</div>
            <div className="text-2xl font-bold  text-black">{out}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4 flex items-center gap-4">
          <Clock className="text-yellow-500" size={32} />
          <div>
            <div className="text-xs text-gray-500">Low Stock</div>
            <div className="text-2xl font-bold  text-black">{low}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4 ">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2 mb-2">
          <div className="flex-1 ">
            <input
              className="w-full border rounded px-3 py-2 text-sm  text-black"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Add branch/status filters here if needed */}
        </div>
        <div className="text-xs text-gray-500 mb-2 ">
          Showing {filtered.length} of {total} stock alerts
        </div>
        <div className="overflow-x-auto ">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 px-2 font-medium">ITEM</th>
                <th className="py-2 px-2 font-medium">CURRENT STOCK</th>
                <th className="py-2 px-2 font-medium">REQUIRED LEVEL</th>
                <th className="py-2 px-2 font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b last:border-0 ">
                  <td className="py-2 px-2 flex items-center gap-2 text-black">
                    <Package className="text-blue-400" size={20} />
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-gray-400">{a.code}</div>
                    </div>
                  </td>
                  <td className="py-2 px-2 font-semibold">{a.current} U</td>
                  <td className="py-2 px-2 text-gray-500">Min: {a.min}U</td>
                  <td className="py-2 px-2">
                    {a.status === "out" ? (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">Out of Stock</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">Low Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
