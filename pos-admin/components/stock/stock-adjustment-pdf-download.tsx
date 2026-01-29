"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProducts } from "@/lib/api/productApi";
import { fetchStockHistory, fetchAdjustmentTypes } from "@/lib/api/inventoryApi";
import { useToast } from "@/providers/toast-provider";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Download,
  FileText,
  Loader2,
  Filter,
  Search,
  Package,
} from "lucide-react";

interface StockAdjustmentPDFDownloadProps {
  variant?: "button" | "panel";
  productId?: string;
}

type AdjustmentType =
  | "ADDITION"
  | "REDUCTION"
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "DAMAGE"
  | "THEFT"
  | "CORRECTION"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function StockAdjustmentPDFDownload({
  variant = "panel",
  productId: initialProductId,
}: StockAdjustmentPDFDownloadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Adjustment types
  const [adjustmentTypes, setAdjustmentTypes] = useState<any[]>([]);
  
  const toast = useToast();

  // Load adjustment types on mount
  useEffect(() => {
    const loadAdjustmentTypes = async () => {
      try {
        const response = await fetchAdjustmentTypes() as any;
        if (response.data?.adjustmentTypes) {
          setAdjustmentTypes(response.data.adjustmentTypes);
        }
      } catch (error) {
        console.error("Failed to load adjustment types:", error);
      }
    };
    loadAdjustmentTypes();
  }, []);

  // Search products as user types
  useEffect(() => {
    const searchProducts = async () => {
      if (productSearch.length < 2) {
        setProducts([]);
        return;
      }
      try {
        const response = await fetchProducts({ search: productSearch, limit: 10 });
        setProducts(response.data?.products || []);
      } catch (error) {
        console.error("Failed to search products:", error);
      }
    };
    
    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [productSearch]);

  const handleDownload = async () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    setIsLoading(true);
    try {
      const params: any = {};
      if (adjustmentType) params.type = adjustmentType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      params.limit = 1000; // Get all adjustments

      const response = await fetchStockHistory(selectedProduct._id, params) as any;
      const adjustments = response.data?.adjustments || response.data?.history || [];

      if (adjustments.length === 0) {
        toast.warning("No stock adjustments found for the selected filters");
        setIsLoading(false);
        return;
      }

      // Generate PDF
      generateStockAdjustmentPDF(adjustments, selectedProduct, {
        type: adjustmentType,
        startDate,
        endDate,
      });

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateStockAdjustmentPDF = (
    adjustments: any[],
    product: any,
    filters: { type?: string; startDate?: string; endDate?: string }
  ) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Stock Adjustment Report", pageWidth / 2, 20, { align: "center" });

    // Product info
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Product: ${product.name}`, pageWidth / 2, 28, { align: "center" });
    
    if (product.sku) {
      doc.setFontSize(10);
      doc.text(`SKU: ${product.sku}`, pageWidth / 2, 35, { align: "center" });
    }

    // Filter info
    doc.setFontSize(10);
    doc.setTextColor(100);
    const filterParts: string[] = [];
    if (filters.type) filterParts.push(`Type: ${filters.type}`);
    if (filters.startDate && filters.endDate) {
      filterParts.push(`Period: ${filters.startDate} to ${filters.endDate}`);
    }
    if (filterParts.length > 0) {
      doc.text(filterParts.join(" | "), pageWidth / 2, 42, { align: "center" });
    }

    // Generated date
    doc.text(
      `Generated on: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      pageWidth / 2,
      48,
      { align: "center" }
    );

    // Summary
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Total Adjustments: ${adjustments.length}`, 14, 58);

    const additions = adjustments.filter(a => 
      ["ADDITION", "PURCHASE", "RETURN", "TRANSFER_IN", "CORRECTION"].includes(a.type) && a.quantity > 0
    ).reduce((sum, a) => sum + Math.abs(a.quantity), 0);
    
    const reductions = adjustments.filter(a => 
      ["REDUCTION", "SALE", "DAMAGE", "THEFT", "TRANSFER_OUT"].includes(a.type) || a.quantity < 0
    ).reduce((sum, a) => sum + Math.abs(a.quantity), 0);

    doc.text(`Total Added: +${additions}`, 14, 65);
    doc.text(`Total Reduced: -${reductions}`, 80, 65);
    doc.text(`Net Change: ${additions - reductions >= 0 ? '+' : ''}${additions - reductions}`, 140, 65);

    // Table data
    const tableData = adjustments.map((adj) => [
      formatDate(adj.createdAt || adj.date),
      adj.type,
      adj.quantity >= 0 ? `+${adj.quantity}` : String(adj.quantity),
      adj.previousQuantity !== undefined ? String(adj.previousQuantity) : "—",
      adj.newQuantity !== undefined ? String(adj.newQuantity) : "—",
      adj.reason || "—",
      adj.adjustedBy?.username || adj.adjustedBy?.name || adj.createdBy?.username || "—",
    ]);

    // Generate table
    autoTable(doc, {
      startY: 75,
      head: [["Date", "Type", "Qty Change", "Before", "After", "Reason", "Adjusted By"]],
      body: tableData,
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Date
        1: { cellWidth: 25 }, // Type
        2: { cellWidth: 20, halign: "center" }, // Qty Change
        3: { cellWidth: 18, halign: "center" }, // Before
        4: { cellWidth: 18, halign: "center" }, // After
        5: { cellWidth: 40 }, // Reason
        6: { cellWidth: 25 }, // Adjusted By
      },
      margin: { top: 75, left: 14, right: 14 },
      didDrawPage: (data) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" }
        );
      },
    });

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    const productSlug = product.sku || product._id;
    const typeSlug = filters.type ? `-${filters.type.toLowerCase()}` : "";
    const filename = `stock-adjustments-${productSlug}${typeSlug}-${timestamp}.pdf`;

    doc.save(filename);
  };

  const selectProduct = (product: any) => {
    setSelectedProduct(product);
    setProductSearch(product.name);
    setShowSuggestions(false);
  };

  if (variant === "button") {
    return (
      <Button
        onClick={handleDownload}
        disabled={isLoading || !selectedProduct}
        variant="secondary"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Export PDF
      </Button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-6 w-6 text-gray-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Export Stock Adjustments
          </h3>
          <p className="text-sm text-gray-500">
            Download stock adjustment history as PDF
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Product Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Package className="h-4 w-4 inline mr-1" />
            Product *
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search product by name or SKU..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowSuggestions(true);
                if (!e.target.value) setSelectedProduct(null);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          {showSuggestions && products.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => selectProduct(product)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    SKU: {product.sku || "—"} | Stock: {product.stock ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedProduct && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              Selected: {selectedProduct.name} (SKU: {selectedProduct.sku || "—"})
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Filter className="h-4 w-4 inline mr-1" />
            Adjustment Type
          </label>
          <select
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">All Types</option>
            {adjustmentTypes.length > 0 ? (
              adjustmentTypes.map((type) => (
                <option key={type.value || type} value={type.value || type}>
                  {type.label || type}
                </option>
              ))
            ) : (
              <>
                <option value="ADDITION">Addition</option>
                <option value="REDUCTION">Reduction</option>
                <option value="PURCHASE">Purchase</option>
                <option value="SALE">Sale</option>
                <option value="RETURN">Return</option>
                <option value="DAMAGE">Damage</option>
                <option value="THEFT">Theft</option>
                <option value="CORRECTION">Correction</option>
                <option value="TRANSFER_IN">Transfer In</option>
                <option value="TRANSFER_OUT">Transfer Out</option>
              </>
            )}
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isLoading || !selectedProduct}
          className="w-full"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Download Stock Adjustment PDF
        </Button>

        {!selectedProduct && (
          <p className="text-sm text-amber-600 text-center">
            Please select a product to export its stock adjustment history
          </p>
        )}
      </div>
    </div>
  );
}
