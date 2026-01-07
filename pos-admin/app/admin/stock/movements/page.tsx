"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Search,
  Download,
  Filter,
  Calendar,
  MapPin,
  User,
  FileText,
  Eye
} from "lucide-react";

interface StockMovement {
  id: string;
  date: Date;
  movementType: "Entry" | "Adjustment Increase" | "Adjustment Decrease" | "Transfer Out" | "Transfer In" | "Sale" | "Return";
  productName: string;
  productCode: string;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reference: string;
  performedBy: string;
  notes?: string;
  status: string;
}

export default function StockMovementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const [movements, setMovements] = useState<StockMovement[]>([
    {
      id: "1",
      date: new Date("2026-01-07T10:30:00"),
      movementType: "Entry",
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      quantity: 50,
      toLocation: "Main Warehouse",
      reference: "SE-001",
      performedBy: "John Doe",
      notes: "New stock from Apple Distributor",
      status: "Verified"
    },
    {
      id: "2",
      date: new Date("2026-01-07T11:15:00"),
      movementType: "Adjustment Decrease",
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      quantity: 2,
      fromLocation: "Main Warehouse",
      reference: "ADJ-001",
      performedBy: "John Doe",
      notes: "Damage during inspection",
      status: "Completed"
    },
    {
      id: "3",
      date: new Date("2026-01-07T14:20:00"),
      movementType: "Transfer Out",
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      quantity: 10,
      fromLocation: "Main Warehouse",
      toLocation: "Branch 1 - Downtown",
      reference: "TRF-001",
      performedBy: "Jane Smith",
      status: "Completed"
    },
    {
      id: "4",
      date: new Date("2026-01-07T14:20:00"),
      movementType: "Transfer In",
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      quantity: 10,
      toLocation: "Branch 1 - Downtown",
      fromLocation: "Main Warehouse",
      reference: "TRF-001",
      performedBy: "Jane Smith",
      status: "Completed"
    },
    {
      id: "5",
      date: new Date("2026-01-07T15:45:00"),
      movementType: "Sale",
      productName: "iPhone 15 Pro",
      productCode: "IPH15P-256",
      quantity: 1,
      fromLocation: "Branch 1 - Downtown",
      reference: "INV-001234",
      performedBy: "Cashier Mike",
      status: "Completed"
    },
    {
      id: "6",
      date: new Date("2026-01-06T09:00:00"),
      movementType: "Entry",
      productName: "Samsung Galaxy S24",
      productCode: "SAM-S24-128",
      quantity: 30,
      toLocation: "Main Warehouse",
      reference: "SE-002",
      performedBy: "Jane Smith",
      status: "Received"
    },
    {
      id: "7",
      date: new Date("2026-01-06T10:30:00"),
      movementType: "Adjustment Increase",
      productName: "Samsung Galaxy S24",
      productCode: "SAM-S24-128",
      quantity: 5,
      toLocation: "Main Warehouse",
      reference: "ADJ-002",
      performedBy: "Jane Smith",
      notes: "Count correction - found additional stock",
      status: "Completed"
    },
    {
      id: "8",
      date: new Date("2026-01-05T16:30:00"),
      movementType: "Return",
      productName: "Phone Case",
      productCode: "ACC-CASE-001",
      quantity: 1,
      toLocation: "Branch 1 - Downtown",
      reference: "RET-001",
      performedBy: "Cashier Mike",
      notes: "Customer return - defective",
      status: "Completed"
    }
  ]);

  const getMovementIcon = (type: string) => {
    switch(type) {
      case "Entry": return <Package size={16} className="text-blue-600" />;
      case "Adjustment Increase": return <TrendingUp size={16} className="text-green-600" />;
      case "Adjustment Decrease": return <TrendingDown size={16} className="text-red-600" />;
      case "Transfer Out": return <ArrowRightLeft size={16} className="text-purple-600" />;
      case "Transfer In": return <ArrowRightLeft size={16} className="text-purple-600" />;
      case "Sale": return <TrendingDown size={16} className="text-orange-600" />;
      case "Return": return <TrendingUp size={16} className="text-teal-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getMovementColor = (type: string) => {
    switch(type) {
      case "Entry": return "bg-blue-100 text-blue-700";
      case "Adjustment Increase": return "bg-green-100 text-green-700";
      case "Adjustment Decrease": return "bg-red-100 text-red-700";
      case "Transfer Out": return "bg-purple-100 text-purple-700";
      case "Transfer In": return "bg-purple-100 text-purple-700";
      case "Sale": return "bg-orange-100 text-orange-700";
      case "Return": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = movementTypeFilter === "all" || movement.movementType === movementTypeFilter;
    const matchesLocation = locationFilter === "all" || 
                           movement.fromLocation === locationFilter || 
                           movement.toLocation === locationFilter;
    return matchesSearch && matchesType && matchesLocation;
  });

  const columns = [
    {
      key: "date",
      label: "Date & Time",
      render: (movement: StockMovement) => (
        <div className="text-sm">
          <div className="font-medium text-black">{new Date(movement.date).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{new Date(movement.date).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      key: "type",
      label: "Movement Type",
      render: (movement: StockMovement) => (
        <div className="flex items-center gap-2">
          {getMovementIcon(movement.movementType)}
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMovementColor(movement.movementType)}`}>
            {movement.movementType}
          </span>
        </div>
      )
    },
    {
      key: "product",
      label: "Product",
      render: (movement: StockMovement) => (
        <div>
          <div className="font-medium text-black">{movement.productName}</div>
          <div className="text-sm text-gray-500">{movement.productCode}</div>
        </div>
      )
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (movement: StockMovement) => {
        const isIncrease = ["Entry", "Adjustment Increase", "Transfer In", "Return"].includes(movement.movementType);
        return (
          <div className={`font-bold text-sm ${isIncrease ? "text-green-600" : "text-red-600"}`}>
            {isIncrease ? "+" : "-"}{movement.quantity}
          </div>
        );
      }
    },
    {
      key: "locations",
      label: "Locations",
      render: (movement: StockMovement) => (
        <div className="text-sm">
          {movement.fromLocation && (
            <div className="text-gray-700">
              <span className="text-xs text-gray-500">From: </span>
              {movement.fromLocation}
            </div>
          )}
          {movement.toLocation && (
            <div className="text-gray-700">
              <span className="text-xs text-gray-500">To: </span>
              {movement.toLocation}
            </div>
          )}
        </div>
      )
    },
    {
      key: "reference",
      label: "Reference",
      render: (movement: StockMovement) => (
        <div className="text-sm font-mono text-blue-600">{movement.reference}</div>
      )
    },
    {
      key: "performedBy",
      label: "Performed By",
      render: (movement: StockMovement) => (
        <div className="text-sm text-black flex items-center gap-1">
          <User size={12} className="text-gray-400" />
          {movement.performedBy}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (movement: StockMovement) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          movement.status === "Completed" || movement.status === "Verified" ? "bg-green-100 text-green-700" :
          movement.status === "Received" ? "bg-blue-100 text-blue-700" :
          "bg-yellow-100 text-yellow-700"
        }`}>
          {movement.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (movement: StockMovement) => (
        <Button size="sm" variant="outline">
          <Eye size={14} />
        </Button>
      )
    }
  ];

  // Calculate statistics
  const stats = {
    totalMovements: movements.length,
    stockIn: movements.filter(m => ["Entry", "Adjustment Increase", "Transfer In", "Return"].includes(m.movementType)).reduce((sum, m) => sum + m.quantity, 0),
    stockOut: movements.filter(m => ["Adjustment Decrease", "Transfer Out", "Sale"].includes(m.movementType)).reduce((sum, m) => sum + m.quantity, 0),
    netChange: 0
  };
  stats.netChange = stats.stockIn - stats.stockOut;

  const locations = ["Main Warehouse", "Branch 1 - Downtown", "Branch 2 - Uptown", "Branch 3 - Suburbs", "Service Center"];
  const movementTypes = ["Entry", "Adjustment Increase", "Adjustment Decrease", "Transfer Out", "Transfer In", "Sale", "Return"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="All Stock Movements"
        description="Comprehensive view of all inventory movements across locations"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{stats.totalMovements}</div>
              <div className="text-sm text-gray-500">Total Movements</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">+{stats.stockIn}</div>
              <div className="text-sm text-gray-500">Stock In</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">-{stats.stockOut}</div>
              <div className="text-sm text-gray-500">Stock Out</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="text-purple-600" size={24} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${stats.netChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stats.netChange >= 0 ? "+" : ""}{stats.netChange}
              </div>
              <div className="text-sm text-gray-500">Net Change</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by product, code, or reference..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={movementTypeFilter}
            onChange={(e) => setMovementTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {movementTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-4 py-2 text-black"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-black"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          />

          <input
            type="date"
            className="border rounded-lg px-4 py-2 text-black"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          />

          <Button variant="outline">
            <Download size={18} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl border">
        <DataTable columns={columns} data={filteredMovements} />
      </div>
    </div>
  );
}
