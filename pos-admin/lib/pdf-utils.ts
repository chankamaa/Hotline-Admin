import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Type definitions for PDF utilities
interface Product {
  _id: string;
  name: string;
  sku?: string;
  sellingPrice?: number;
  costPrice?: number;
  quantity?: number;
  category?: { name?: string } | string;
  [key: string]: any;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get category name from category object or string
 */
function getCategoryName(category: string | { name?: string } | undefined): string {
  if (!category) return "—";
  if (typeof category === "string") return category;
  return category.name || "—";
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Generate and download a PDF containing product details
 */
export function generateProductsPDF(
  products: Product[],
  categoryName?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Product Report", pageWidth / 2, 20, { align: "center" });

  // Subtitle with category filter info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const subtitle = categoryName
    ? `Category: ${categoryName}`
    : "All Categories";
  doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

  // Date generated
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  // Summary statistics
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Total Products: ${products.length}`, 14, 45);

  const totalValue = products.reduce((sum, p) => sum + (p.sellingPrice || 0), 0);
  doc.text(`Total Selling Price: ${formatCurrency(totalValue)}`, 14, 52);

  const costValue = products.reduce((sum, p) => sum + (p.costPrice || 0), 0);
  doc.text(`Total Cost Price: ${formatCurrency(costValue)}`, 14, 59);

  const profit = totalValue - costValue;
  doc.text(`Total Profit: ${formatCurrency(profit)}`, 14, 66);

  // Table data
  const tableData = products.map((product) => [
    product.name,
    product.sku || "—",
    getCategoryName(product.category),
    formatCurrency(product.costPrice || 0),
    formatCurrency(product.sellingPrice || 0),
    product.stock !== undefined ? String(product.stock) : "—",
    product.isActive ? "Active" : "Inactive",
  ]);

  // Generate table
  autoTable(doc, {
    startY: 75,
    head: [
      [
        "Product Name",
        "SKU",
        "Category",
        "Cost Price",
        "Selling Price",
        "Stock",
        "Status",
      ],
    ],
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
      0: { cellWidth: 45 }, // Product Name
      1: { cellWidth: 25 }, // SKU
      2: { cellWidth: 30 }, // Category
      3: { cellWidth: 22, halign: "right" }, // Cost Price
      4: { cellWidth: 25, halign: "right" }, // Selling Price
      5: { cellWidth: 18, halign: "center" }, // Stock
      6: { cellWidth: 18, halign: "center" }, // Status
    },
    margin: { top: 60, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer with page numbers
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
  const categorySlug = categoryName
    ? `-${categoryName.toLowerCase().replace(/\s+/g, "-")}`
    : "";
  const filename = `products${categorySlug}-${timestamp}.pdf`;

  // Download
  doc.save(filename);
}

/**
 * Generate a detailed PDF for a single product
 */
export function generateSingleProductPDF(product: Product): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Product Details", pageWidth / 2, 20, { align: "center" });

  // Product name
  doc.setFontSize(14);
  doc.text(product.name, pageWidth / 2, 32, { align: "center" });

  let yPosition = 45;
  const leftMargin = 20;
  const labelWidth = 50;

  const addField = (label: string, value: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, leftMargin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, leftMargin + labelWidth, yPosition);
    yPosition += 8;
  };

  // Basic Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Basic Information", leftMargin, yPosition);
  yPosition += 10;

  addField("SKU", product.sku || "—");
  addField("Barcode", product.barcode || "—");
  addField("Category", getCategoryName(product.category));
  addField("Unit", product.unit);
  addField("Status", product.isActive ? "Active" : "Inactive");

  yPosition += 5;

  // Pricing
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Pricing", leftMargin, yPosition);
  yPosition += 10;

  addField(
    "Cost Price",
    product.costPrice !== undefined ? formatCurrency(product.costPrice) : "—"
  );
  addField(
    "Selling Price",
    product.sellingPrice !== undefined
      ? formatCurrency(product.sellingPrice)
      : "—"
  );
  if (product.wholesalePrice !== undefined) {
    addField(
      "Wholesale Price",
      formatCurrency(product.wholesalePrice)
    );
  }
  addField("Tax Rate", `${product.taxRate}%`);
  if (product.profitMargin !== undefined) {
    addField("Profit Margin", `${product.profitMargin.toFixed(2)}%`);
  }

  yPosition += 5;

  // Stock Info
  if (product.stock !== undefined) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Stock Information", leftMargin, yPosition);
    yPosition += 10;

    addField("Current Stock", String(product.stock));
    addField("Min Stock Level", String(product.minStockLevel));
    addField("Stock Status", product.stockStatus || "—");
  }

  yPosition += 5;

  // Warranty
  if (product.warrantyType !== "NONE") {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Warranty", leftMargin, yPosition);
    yPosition += 10;

    addField("Warranty Type", product.warrantyType);
    addField("Duration", `${product.warrantyDuration} months`);
    if (product.warrantyDescription) {
      addField("Description", product.warrantyDescription);
    }
  }

  // Description
  if (product.description) {
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Description", leftMargin, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const splitDescription = doc.splitTextToSize(
      product.description,
      pageWidth - 40
    );
    doc.text(splitDescription, leftMargin, yPosition);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: "center" }
  );

  // Download
  const filename = `product-${product.sku || product._id}.pdf`;
  doc.save(filename);
}

/* =====================================================
   SALES REPORT PDF
===================================================== */

interface SaleForPDF {
  _id: string;
  saleNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  customer?: {
    name?: string;
    phone?: string;
  };
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  status: string;
  createdAt: string;
  createdBy?: {
    username?: string;
    name?: string;
  };
}

interface SalesReportFilters {
  period?: string;
  status?: string;
  cashier?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Generate and download a PDF containing sales report
 */
export function generateSalesReportPDF(
  sales: SaleForPDF[],
  filters?: SalesReportFilters,
  summaryData?: {
    totalRevenue?: number;
    totalSales?: number;
    totalDiscount?: number;
    totalTax?: number;
    avgSaleValue?: number;
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Report", pageWidth / 2, 20, { align: "center" });

  // Subtitle with filter info
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const filterParts: string[] = [];
  if (filters?.period) filterParts.push(`Period: ${filters.period}`);
  if (filters?.status) filterParts.push(`Status: ${filters.status}`);
  if (filters?.cashier) filterParts.push(`Cashier: ${filters.cashier}`);
  if (filters?.startDate && filters?.endDate) {
    filterParts.push(`${filters.startDate} to ${filters.endDate}`);
  }
  const subtitle = filterParts.length > 0 ? filterParts.join(" | ") : "All Sales";
  doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

  // Date generated
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  // Summary statistics
  doc.setTextColor(0);
  doc.setFontSize(11);

  const totalSales = summaryData?.totalSales ?? sales.length;
  
  const totalDiscount = summaryData?.totalDiscount ?? sales.reduce((sum, s) => sum + s.discountTotal, 0);
  const totalRevenue = summaryData?.totalRevenue ?? sales.reduce((sum, s) => sum + s.grandTotal, 0);
  
  // Calculate profit: revenue - discounts (Note: cost price data not available in sales objects)
  const totalProfit = totalRevenue - totalDiscount;
 
  doc.text(`Total Sales: ${totalSales}`, 14, 45);

  doc.text(`Total Discounts: ${formatCurrency(totalDiscount)}`, 14, 59);
doc.text(`Total Profit: ${formatCurrency(totalProfit)}`, 14, 52);

  // Table data
  const tableData = sales.map((sale) => [
    sale.saleNumber,
    new Date(sale.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    sale.customer?.name || "Walk-in",
    sale.items.length.toString(),
    formatCurrency(sale.subtotal),
    formatCurrency(sale.discountTotal),
    formatCurrency(sale.grandTotal),
    sale.status,
    sale.createdBy?.username || sale.createdBy?.name || "—",
  ]);

  // Generate table
  autoTable(doc, {
    startY: 70,
    head: [
      [
        "Sale #",
        "Date",
        "Customer",
        "Items",
        "Subtotal",
        "Discount",
        "Total",
        "Status",
        "Cashier",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Sale #
      1: { cellWidth: 22 }, // Date
      2: { cellWidth: 25 }, // Customer
      3: { cellWidth: 12, halign: "center" }, // Items
      4: { cellWidth: 22, halign: "right" }, // Subtotal
      5: { cellWidth: 20, halign: "right" }, // Discount
      6: { cellWidth: 22, halign: "right" }, // Total
      7: { cellWidth: 18, halign: "center" }, // Status
      8: { cellWidth: 20 }, // Cashier
    },
    margin: { top: 70, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer with page numbers
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
  let filenameParts = ["sales-report"];
  if (filters?.period) filenameParts.push(filters.period.toLowerCase());
  if (filters?.status) filenameParts.push(filters.status.toLowerCase());
  filenameParts.push(timestamp);
  const filename = `${filenameParts.join("-")}.pdf`;

  // Download
  doc.save(filename);
}

/**
 * Generate sales summary PDF (aggregate data)
 */
export function generateSalesSummaryPDF(
  summaryData: {
    period: string;
    periodLabel: string;
    startDate: string;
    endDate: string;
    totalSales: number;
    totalRevenue: number;
    totalDiscount: number;
    totalTax: number;
    avgSaleValue: number;
    totalItems: number;
    voidedSales: number;
    paymentBreakdown: Array<{ method: string; total: number; count: number }>;
  },
  categoryData?: Array<{ name: string; totalRevenue: number; itemsSold: number }>,
  topProducts?: Array<{ productName: string; totalQuantity: number; totalRevenue: number }>
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Summary Report", pageWidth / 2, 20, { align: "center" });

  // Period info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(summaryData.periodLabel, pageWidth / 2, 28, { align: "center" });

  // Date range
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `${summaryData.startDate} to ${summaryData.endDate}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth / 2,
    42,
    { align: "center" }
  );

  // Summary section
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, 55);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  let yPos = 65;
  const col1 = 14;
  const col2 = 110;

  doc.text(`Total Sales: ${summaryData.totalSales}`, col1, yPos);
  doc.text(`Total Items Sold: ${summaryData.totalItems}`, col2, yPos);
  yPos += 8;
  
  doc.text(`Total Revenue: ${formatCurrency(summaryData.totalRevenue)}`, col1, yPos);
  doc.text(`Voided Sales: ${summaryData.voidedSales}`, col2, yPos);
  yPos += 8;

  doc.text(`Total Discounts: ${formatCurrency(summaryData.totalDiscount)}`, col1, yPos);
  doc.text(`Avg Sale Value: ${formatCurrency(summaryData.avgSaleValue)}`, col2, yPos);
  yPos += 8;

  doc.text(`Total Tax: ${formatCurrency(summaryData.totalTax)}`, col1, yPos);
  yPos += 15;

  // Payment breakdown
  if (summaryData.paymentBreakdown.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Methods", 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [["Method", "Count", "Total"]],
      body: summaryData.paymentBreakdown.map((p) => [
        p.method,
        p.count.toString(),
        formatCurrency(p.total),
      ]),
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30, halign: "center" },
        2: { cellWidth: 50, halign: "right" },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 130,
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Top products
  if (topProducts && topProducts.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Top Selling Products", 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [["Product", "Qty Sold", "Revenue"]],
      body: topProducts.slice(0, 10).map((p) => [
        p.productName,
        p.totalQuantity.toString(),
        formatCurrency(p.totalRevenue),
      ]),
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 145,
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // Sales by category
  if (categoryData && categoryData.length > 0) {
    // Check if we need a new page
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Sales by Category", 14, yPos);
    yPos += 5;

    autoTable(doc, {
      startY: yPos,
      head: [["Category", "Items Sold", "Revenue"]],
      body: categoryData.map((c) => [
        c.name,
        c.itemsSold.toString(),
        formatCurrency(c.totalRevenue),
      ]),
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 40, halign: "right" },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 145,
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Generate filename
  const timestamp = new Date().toISOString().split("T")[0];
  const filename = `sales-summary-${summaryData.period}-${timestamp}.pdf`;

  // Download
  doc.save(filename);
}

/* ================================================
   WARRANTY PDF GENERATION
================================================ */

export interface WarrantyForPDF {
  _id: string;
  warrantyNumber: string;
  productName: string;
  serialNumber?: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  warrantyType: "MANUFACTURER" | "SHOP" | "EXTENDED" | "REPAIR";
  durationMonths: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CLAIMED" | "VOID";
  claims?: Array<{
    claimNumber: string;
    issue: string;
    resolution?: string;
    claimDate: string;
  }>;
  notes?: string;
  createdAt: string;
}

/**
 * Generate and download a PDF containing warranty list
 */
export function generateWarrantyReportPDF(
  warranties: WarrantyForPDF[],
  filterLabel?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Warranty Report", pageWidth / 2, 20, { align: "center" });

  // Subtitle with filter info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const subtitle = filterLabel || "All Warranties";
  doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

  // Date generated
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  // Summary statistics
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Total Warranties: ${warranties.length}`, 14, 45);

  const activeCount = warranties.filter((w) => w.status === "ACTIVE").length;
  doc.text(`Active: ${activeCount}`, 14, 52);

  const expiredCount = warranties.filter((w) => w.status === "EXPIRED").length;
  doc.text(`Expired: ${expiredCount}`, 70, 52);

  const claimedCount = warranties.filter((w) => w.status === "CLAIMED").length;
  doc.text(`Claimed: ${claimedCount}`, 120, 52);

  // Table data
  const tableData = warranties.map((warranty) => [
    warranty.warrantyNumber,
    warranty.productName.length > 25
      ? warranty.productName.substring(0, 22) + "..."
      : warranty.productName,
    warranty.customer.name,
    warranty.warrantyType,
    `${warranty.durationMonths} mo`,
    formatDate(warranty.startDate),
    formatDate(warranty.endDate),
    warranty.status,
  ]);

  // Generate table
  autoTable(doc, {
    startY: 60,
    head: [
      [
        "Warranty #",
        "Product",
        "Customer",
        "Type",
        "Duration",
        "Start Date",
        "End Date",
        "Status",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Warranty #
      1: { cellWidth: 35 }, // Product
      2: { cellWidth: 28 }, // Customer
      3: { cellWidth: 22 }, // Type
      4: { cellWidth: 18, halign: "center" }, // Duration
      5: { cellWidth: 22 }, // Start Date
      6: { cellWidth: 22 }, // End Date
      7: { cellWidth: 18, halign: "center" }, // Status
    },
    margin: { top: 60, left: 14, right: 14 },
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
  const filterSlug = filterLabel
    ? `-${filterLabel.toLowerCase().replace(/\s+/g, "-")}`
    : "";
  const filename = `warranty-report${filterSlug}-${timestamp}.pdf`;

  // Download
  doc.save(filename);
}

/**
 * Generate a detailed warranty certificate PDF for a single warranty
 */
export function generateWarrantyCertificatePDF(
  warranty: WarrantyForPDF,
  companyInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Default company info
  const company = {
    name: companyInfo?.name || "Hotline POS",
    phone: companyInfo?.phone || "+1 (555) 123-4567",
    email: companyInfo?.email || "support@hotlinepos.com",
    address: companyInfo?.address || "123 Business Street, City, State 12345",
    website: companyInfo?.website || "www.hotlinepos.com",
  };

  // Border decoration
  doc.setDrawColor(0);
  doc.setLineWidth(2);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  doc.setLineWidth(0.5);
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28);

  // Header
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("WARRANTY CERTIFICATE", pageWidth / 2, 35, { align: "center" });

  // Warranty number
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Certificate No: ${warranty.warrantyNumber}`, pageWidth / 2, 45, {
    align: "center",
  });

  // Status badge
  doc.setTextColor(0);
  const statusColors: Record<string, [number, number, number]> = {
    ACTIVE: [34, 197, 94],
    EXPIRED: [239, 68, 68],
    CLAIMED: [234, 179, 8],
    VOID: [107, 114, 128],
  };
  const statusColor = statusColors[warranty.status] || [0, 0, 0];
  doc.setFillColor(...statusColor);
  const statusText = warranty.status;
  const statusWidth = doc.getTextWidth(statusText) + 16;
  doc.roundedRect(
    pageWidth / 2 - statusWidth / 2,
    50,
    statusWidth,
    10,
    2,
    2,
    "F"
  );
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, pageWidth / 2, 57, { align: "center" });

  doc.setTextColor(0);
  let yPos = 75;
  const leftMargin = 25;
  const rightCol = pageWidth / 2 + 10;

  // Section helper
  const addSection = (title: string, y: number): number => {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(title, leftMargin, y);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, y + 2, pageWidth - leftMargin, y + 2);
    return y + 12;
  };

  // Field helper
  const addField = (
    label: string,
    value: string,
    x: number,
    y: number
  ): void => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80);
    doc.text(label, x, y);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(value, x, y + 6);
  };

  // Product Information
  yPos = addSection("Product Information", yPos);
  addField("Product Name", warranty.productName, leftMargin, yPos);
  if (warranty.serialNumber) {
    addField("Serial Number", warranty.serialNumber, rightCol, yPos);
  }
  yPos += 20;

  // Customer Information
  yPos = addSection("Customer Information", yPos);
  addField("Customer Name", warranty.customer.name, leftMargin, yPos);
  addField("Phone", warranty.customer.phone, rightCol, yPos);
  yPos += 15;
  if (warranty.customer.email) {
    addField("Email", warranty.customer.email, leftMargin, yPos);
    yPos += 15;
  }

  // Warranty Details
  yPos = addSection("Warranty Details", yPos);
  addField("Warranty Type", warranty.warrantyType, leftMargin, yPos);
  addField("Duration", `${warranty.durationMonths} Months`, rightCol, yPos);
  yPos += 15;
  addField(
    "Start Date",
    formatDate(warranty.startDate),
    leftMargin,
    yPos
  );
  addField("End Date", formatDate(warranty.endDate), rightCol, yPos);
  yPos += 20;

  // Terms and Conditions
  yPos = addSection("Terms & Conditions", yPos);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60);
  const terms = [
    "1. This warranty covers manufacturing defects and component failures under normal use.",
    "2. Warranty is void if the product shows signs of physical damage, water damage, or unauthorized repair.",
    "3. Proof of purchase (this certificate) must be presented when making a warranty claim.",
    "4. Warranty claims must be filed before the expiration date shown above.",
    "5. Replacement or repair will be at the sole discretion of the service provider.",
    "6. This warranty does not cover accessories, consumable parts, or software issues.",
  ];
  terms.forEach((term, index) => {
    const lines = doc.splitTextToSize(term, pageWidth - 50);
    doc.text(lines, leftMargin, yPos + index * 8);
  });
  yPos += terms.length * 8 + 10;

  // Customer Support
  yPos = addSection("Customer Support", yPos);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0);
  doc.text(`Phone: ${company.phone}`, leftMargin, yPos);
  doc.text(`Email: ${company.email}`, leftMargin, yPos + 7);
  doc.text(`Website: ${company.website}`, leftMargin, yPos + 14);
  doc.text(`Address: ${company.address}`, leftMargin, yPos + 21);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" }
  );
  doc.text(company.name, pageWidth / 2, pageHeight - 15, { align: "center" });

  // Generate filename
  const filename = `warranty-certificate-${warranty.warrantyNumber}.pdf`;

  // Download
  doc.save(filename);
}

/* ================================================
   STOCK/INVENTORY PDF GENERATION
================================================ */

export interface StockItemForPDF {
  _id: string;
  productName: string;
  sku?: string;
  category?: string;
  currentQuantity: number;
  minStockLevel: number;
  warehouseLocation?: string;
  lastStockIn?: string;
  lastStockOut?: string;
  lastUpdated?: string;
  isLowStock: boolean;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

export interface StockMovementForPDF {
  _id: string;
  productName: string;
  sku?: string;
  type: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  reference?: string;
  performedBy?: string;
  createdAt: string;
}

/**
 * Generate and download a PDF containing stock inventory report
 */
export function generateStockReportPDF(
  stockItems: StockItemForPDF[],
  filterLabel?: string
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Stock Inventory Report", pageWidth / 2, 20, { align: "center" });

  // Subtitle with filter info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const subtitle = filterLabel || "All Products";
  doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

  // Date generated
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  // Summary statistics
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Total Products: ${stockItems.length}`, 14, 45);

  const totalQuantity = stockItems.reduce((sum, item) => sum + item.currentQuantity, 0);
  doc.text(`Total Units: ${totalQuantity.toLocaleString()}`, 14, 52);

  const inStock = stockItems.filter((item) => item.status === "In Stock").length;
  doc.text(`In Stock: ${inStock}`, 70, 52);

  const lowStock = stockItems.filter((item) => item.status === "Low Stock").length;
  doc.text(`Low Stock: ${lowStock}`, 120, 52);

  const outOfStock = stockItems.filter((item) => item.status === "Out of Stock").length;
  doc.text(`Out of Stock: ${outOfStock}`, 170, 52);

  // Table data
  const tableData = stockItems.map((item) => [
    item.productName.length > 25
      ? item.productName.substring(0, 22) + "..."
      : item.productName,
    item.sku || "—",
    item.category || "—",
    String(item.currentQuantity),
    String(item.minStockLevel),
    item.warehouseLocation || "—",
    item.status,
    item.lastUpdated ? formatDate(item.lastUpdated) : "—",
  ]);

  // Generate table
  autoTable(doc, {
    startY: 60,
    head: [
      [
        "Product",
        "SKU",
        "Category",
        "Qty",
        "Min",
        "Location",
        "Status",
        "Last Updated",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Product
      1: { cellWidth: 22 }, // SKU
      2: { cellWidth: 28 }, // Category
      3: { cellWidth: 15, halign: "center" }, // Qty
      4: { cellWidth: 15, halign: "center" }, // Min
      5: { cellWidth: 25 }, // Location
      6: { cellWidth: 22, halign: "center" }, // Status
      7: { cellWidth: 23 }, // Last Updated
    },
    margin: { top: 60, left: 14, right: 14 },
    didDrawCell: (data) => {
      // Color code status cells
      if (data.column.index === 6 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "Out of Stock") {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = "bold";
        } else if (status === "Low Stock") {
          data.cell.styles.textColor = [202, 138, 4]; // Yellow
          data.cell.styles.fontStyle = "bold";
        } else if (status === "In Stock") {
          data.cell.styles.textColor = [22, 163, 74]; // Green
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
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
  const filterSlug = filterLabel
    ? `-${filterLabel.toLowerCase().replace(/\s+/g, "-")}`
    : "";
  const filename = `stock-inventory${filterSlug}-${timestamp}.pdf`;

  // Download
  doc.save(filename);
}

/**
 * Generate and download a PDF for stock movements/adjustments
 */
export function generateStockMovementsReportPDF(
  movements: StockMovementForPDF[],
  filters?: {
    productName?: string;
    startDate?: string;
    endDate?: string;
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Stock Movements Report", pageWidth / 2, 20, { align: "center" });

  // Subtitle with filter info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const filterParts: string[] = [];
  if (filters?.productName) filterParts.push(filters.productName);
  if (filters?.startDate && filters?.endDate) {
    filterParts.push(`${filters.startDate} to ${filters.endDate}`);
  }
  const subtitle = filterParts.length > 0 ? filterParts.join(" - ") : "All Movements";
  doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

  // Date generated
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  // Summary statistics
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Total Movements: ${movements.length}`, 14, 45);

  const additions = movements.filter((m) =>
    ["ADDITION", "PURCHASE", "RETURN", "TRANSFER_IN"].includes(m.type)
  ).length;
  doc.text(`Stock In: ${additions}`, 14, 52);

  const reductions = movements.filter((m) =>
    ["REDUCTION", "SALE", "DAMAGE", "THEFT", "TRANSFER_OUT"].includes(m.type)
  ).length;
  doc.text(`Stock Out: ${reductions}`, 70, 52);

  // Table data
  const tableData = movements.map((movement) => {
    const isAddition = ["ADDITION", "PURCHASE", "RETURN", "TRANSFER_IN"].includes(
      movement.type
    );
    const qtyDisplay = isAddition ? `+${movement.quantity}` : `-${movement.quantity}`;

    return [
      formatDate(movement.createdAt),
      movement.productName.length > 22
        ? movement.productName.substring(0, 19) + "..."
        : movement.productName,
      movement.sku || "—",
      movement.type,
      qtyDisplay,
      String(movement.previousQuantity),
      String(movement.newQuantity),
      movement.reason || "—",
      movement.performedBy || "—",
    ];
  });

  // Generate table
  autoTable(doc, {
    startY: 60,
    head: [
      [
        "Date",
        "Product",
        "SKU",
        "Type",
        "Qty Change",
        "Previous",
        "New",
        "Reason",
        "By",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
    },
    bodyStyles: {
      fontSize: 6,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Date
      1: { cellWidth: 30 }, // Product
      2: { cellWidth: 18 }, // SKU
      3: { cellWidth: 22 }, // Type
      4: { cellWidth: 18, halign: "center" }, // Qty Change
      5: { cellWidth: 15, halign: "center" }, // Previous
      6: { cellWidth: 15, halign: "center" }, // New
      7: { cellWidth: 28 }, // Reason
      8: { cellWidth: 20 }, // By
    },
    margin: { top: 60, left: 14, right: 14 },
    didDrawCell: (data) => {
      // Color code quantity changes
      if (data.column.index === 4 && data.section === "body") {
        const qty = data.cell.raw as string;
        if (qty.startsWith("+")) {
          data.cell.styles.textColor = [22, 163, 74]; // Green
          data.cell.styles.fontStyle = "bold";
        } else if (qty.startsWith("-")) {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
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
  const filename = `stock-movements-${timestamp}.pdf`;

  // Download
  doc.save(filename);
}

/* ================================================
   REPAIR RECORDS PDF GENERATION
================================================ */

export interface RepairRecordForPDF {
  _id: string;
  jobNumber: string;
  equipmentName: string;
  brand?: string;
  model?: string;
  customerName: string;
  customerPhone: string;
  reportedIssue: string;
  diagnosisNotes?: string;
  repairActions?: string;
  status: string;
  priority?: string;
  technicianName?: string;
  laborCost: number;
  partsTotal: number;
  totalCost: number;
  receivedAt?: string;
  completedAt?: string;
  createdAt: string;
}

/**
 * Generate and download a PDF containing repair records report
 */
export function generateRepairRecordsReportPDF(
  repairs: RepairRecordForPDF[],
  filters?: {
    status?: string;
    technician?: string;
    startDate?: string;
    endDate?: string;
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Repair Records Report", pageWidth / 2, 20, { align: "center" });

  // Subtitle with filter info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const filterParts: string[] = [];
  if (filters?.status) filterParts.push(filters.status);
  if (filters?.technician) filterParts.push(`Tech: ${filters.technician}`);
  if (filters?.startDate && filters?.endDate) {
    filterParts.push(`${filters.startDate} to ${filters.endDate}`);
  }
  const subtitle = filterParts.length > 0 ? filterParts.join(" | ") : "All Repairs";
  doc.text(subtitle, pageWidth / 2, 28, { align: "center" });

  // Date generated
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    35,
    { align: "center" }
  );

  // Summary statistics
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.text(`Total Repairs: ${repairs.length}`, 14, 45);

  const totalRevenue = repairs.reduce((sum, r) => sum + r.totalCost, 0);
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, 52);

  const completed = repairs.filter((r) => r.status === "COMPLETED").length;
  doc.text(`Completed: ${completed}`, 100, 52);

  const inProgress = repairs.filter((r) => r.status === "IN_PROGRESS").length;
  doc.text(`In Progress: ${inProgress}`, 150, 52);

  // Table data
  const tableData = repairs.map((repair) => [
    repair.jobNumber,
    repair.equipmentName.length > 20
      ? repair.equipmentName.substring(0, 17) + "..."
      : repair.equipmentName,
    repair.customerName.length > 18
      ? repair.customerName.substring(0, 15) + "..."
      : repair.customerName,
    repair.reportedIssue.length > 25
      ? repair.reportedIssue.substring(0, 22) + "..."
      : repair.reportedIssue,
    repair.status,
    repair.technicianName || "—",
    formatCurrency(repair.totalCost),
    repair.completedAt ? formatDate(repair.completedAt) : repair.receivedAt ? formatDate(repair.receivedAt) : "—",
  ]);

  // Generate table
  autoTable(doc, {
    startY: 60,
    head: [
      [
        "Job #",
        "Equipment",
        "Customer",
        "Issue",
        "Status",
        "Technician",
        "Cost",
        "Date",
      ],
    ],
    body: tableData,
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { cellWidth: 22 }, // Job #
      1: { cellWidth: 28 }, // Equipment
      2: { cellWidth: 26 }, // Customer
      3: { cellWidth: 35 }, // Issue
      4: { cellWidth: 20, halign: "center" }, // Status
      5: { cellWidth: 24 }, // Technician
      6: { cellWidth: 20, halign: "right" }, // Cost
      7: { cellWidth: 20 }, // Date
    },
    margin: { top: 60, left: 14, right: 14 },
    didDrawCell: (data) => {
      // Color code status cells
      if (data.column.index === 4 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "COMPLETED") {
          data.cell.styles.textColor = [22, 163, 74]; // Green
          data.cell.styles.fontStyle = "bold";
        } else if (status === "IN_PROGRESS") {
          data.cell.styles.textColor = [59, 130, 246]; // Blue
          data.cell.styles.fontStyle = "bold";
        } else if (status === "READY") {
          data.cell.styles.textColor = [202, 138, 4]; // Yellow
          data.cell.styles.fontStyle = "bold";
        } else if (status === "CANCELLED") {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
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
  const filterSlug = filters?.status
    ? `-${filters.status.toLowerCase()}`
    : "";
  const filename = `repair-records${filterSlug}-${timestamp}.pdf`;

  // Download
  doc.save(filename);
}

/**
 * Generate a detailed repair job PDF for a single repair
 */
export function generateSingleRepairJobPDF(
  repair: RepairRecordForPDF & {
    serialNumber?: string;
    imei?: string;
    color?: string;
    accessories?: string[];
    condition?: string;
    partsUsed?: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    advancePayment?: number;
    balanceDue?: number;
    paymentStatus?: string;
  }
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("REPAIR JOB DETAILS", pageWidth / 2, 20, { align: "center" });

  // Job number and status
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Job Number: ${repair.jobNumber}`, pageWidth / 2, 30, {
    align: "center",
  });

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    RECEIVED: [100, 116, 139],
    IN_PROGRESS: [59, 130, 246],
    READY: [234, 179, 8],
    COMPLETED: [22, 163, 74],
    CANCELLED: [220, 38, 38],
  };
  const statusColor = statusColors[repair.status] || [107, 114, 128];
  doc.setFillColor(...statusColor);
  const statusText = repair.status;
  const statusWidth = doc.getTextWidth(statusText) + 16;
  doc.roundedRect(
    pageWidth / 2 - statusWidth / 2,
    35,
    statusWidth,
    10,
    2,
    2,
    "F"
  );
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, pageWidth / 2, 42, { align: "center" });

  doc.setTextColor(0);
  let yPos = 55;
  const leftMargin = 20;
  const rightCol = pageWidth / 2 + 10;

  // Section helper
  const addSection = (title: string, y: number): number => {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(title, leftMargin, y);
    doc.setLineWidth(0.5);
    doc.line(leftMargin, y + 2, pageWidth - leftMargin, y + 2);
    return y + 10;
  };

  // Field helper
  const addField = (
    label: string,
    value: string,
    x: number,
    y: number
  ): void => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80);
    doc.text(label, x, y);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    const lines = doc.splitTextToSize(value, 70);
    doc.text(lines, x, y + 5);
  };

  // Customer Information
  yPos = addSection("Customer Information", yPos);
  addField("Name", repair.customerName, leftMargin, yPos);
  addField("Phone", repair.customerPhone, rightCol, yPos);
  yPos += 15;

  // Device/Equipment Information
  yPos = addSection("Equipment Information", yPos);
  addField("Equipment", repair.equipmentName, leftMargin, yPos);
  if (repair.brand && repair.model) {
    addField("Brand/Model", `${repair.brand} ${repair.model}`, rightCol, yPos);
  }
  yPos += 12;
  if (repair.serialNumber) {
    addField("Serial Number", repair.serialNumber, leftMargin, yPos);
    yPos += 12;
  }
  if (repair.imei) {
    addField("IMEI", repair.imei, leftMargin, yPos);
    yPos += 12;
  }
  if (repair.color) {
    addField("Color", repair.color, leftMargin, yPos);
    yPos += 12;
  }
  if (repair.accessories && repair.accessories.length > 0) {
    addField("Accessories", repair.accessories.join(", "), leftMargin, yPos);
    yPos += 12;
  }

  // Problem & Repair Details
  yPos = addSection("Problem & Repair Details", yPos);
  addField("Reported Issue", repair.reportedIssue, leftMargin, yPos);
  yPos += 18;
  if (repair.diagnosisNotes) {
    addField("Diagnosis", repair.diagnosisNotes, leftMargin, yPos);
    yPos += 18;
  }
  if (repair.repairActions) {
    addField("Repair Actions Taken", repair.repairActions, leftMargin, yPos);
    yPos += 18;
  }

  // Technician & Dates
  yPos = addSection("Service Information", yPos);
  if (repair.technicianName) {
    addField("Technician", repair.technicianName, leftMargin, yPos);
  }
  if (repair.priority) {
    addField("Priority", repair.priority, rightCol, yPos);
  }
  yPos += 12;
  if (repair.receivedAt) {
    addField("Received Date", formatDate(repair.receivedAt), leftMargin, yPos);
  }
  if (repair.completedAt) {
    addField("Completed Date", formatDate(repair.completedAt), rightCol, yPos);
  }
  yPos += 15;

  // Parts Used
  if (repair.partsUsed && repair.partsUsed.length > 0) {
    yPos = addSection("Parts Used", yPos);
    autoTable(doc, {
      startY: yPos,
      head: [["Part Name", "Qty", "Unit Price", "Total"]],
      body: repair.partsUsed.map((part) => [
        part.productName,
        String(part.quantity),
        formatCurrency(part.unitPrice),
        formatCurrency(part.total),
      ]),
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 30, halign: "right" },
      },
      margin: { left: leftMargin, right: leftMargin },
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Cost Breakdown
  yPos = addSection("Cost Breakdown", yPos);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const costX = leftMargin;
  const valueX = pageWidth - leftMargin - 40;

  doc.text("Labor Cost:", costX, yPos);
  doc.text(formatCurrency(repair.laborCost), valueX, yPos, { align: "right" });
  yPos += 7;

  doc.text("Parts Total:", costX, yPos);
  doc.text(formatCurrency(repair.partsTotal), valueX, yPos, { align: "right" });
  yPos += 7;

  doc.setLineWidth(0.5);
  doc.line(costX, yPos, pageWidth - leftMargin, yPos);
  yPos += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Total Cost:", costX, yPos);
  doc.text(formatCurrency(repair.totalCost), valueX, yPos, { align: "right" });
  yPos += 10;

  if (repair.advancePayment) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Advance Payment:", costX, yPos);
    doc.text(formatCurrency(repair.advancePayment), valueX, yPos, {
      align: "right",
    });
    yPos += 7;
  }

  if (repair.balanceDue !== undefined) {
    doc.setFont("helvetica", "bold");
    doc.text("Balance Due:", costX, yPos);
    doc.text(formatCurrency(repair.balanceDue), valueX, yPos, {
      align: "right",
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );

  // Generate filename
  const filename = `repair-job-${repair.jobNumber}.pdf`;

  // Download
  doc.save(filename);
}

/**
 * Generate Repair Analytics Report PDF
 */
export interface RepairAnalyticsData {
  repairIncome: number;
  repairCost: number;
  laborCost: number;
  totalJobs: number;
  technicianStats: Array<{
    technician: {
      _id: string;
      username: string;
      email?: string;
    };
    jobCount: number;
    totalRevenue: number;
    partsCost: number;
    laborCost: number;
  }>;
  periodLabel: string;
  startDate?: string;
  endDate?: string;
}

export function generateRepairAnalyticsPDF(data: RepairAnalyticsData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Repair Analytics Report", pageWidth / 2, 20, { align: "center" });

  // Subtitle - Period
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${data.periodLabel}`, pageWidth / 2, 28, { align: "center" });

  // Date range if available
  if (data.startDate && data.endDate) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`,
      pageWidth / 2,
      35,
      { align: "center" }
    );
  }

  // Generated date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    pageWidth / 2,
    data.startDate && data.endDate ? 42 : 35,
    { align: "center" }
  );

  // Summary Box
  doc.setTextColor(0);
  const summaryStartY = data.startDate && data.endDate ? 52 : 45;
  
  doc.setFillColor(240, 248, 255); // Light blue background
  doc.roundedRect(14, summaryStartY, pageWidth - 28, 48, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Summary Statistics", 18, summaryStartY + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const col1X = 18;
  const col2X = pageWidth / 2 + 5;
  let lineY = summaryStartY + 16;
  
  doc.text(`Total Jobs:`, col1X, lineY);
  doc.text(`${data.totalJobs}`, col1X + 45, lineY);
  
  doc.text(`Total Income:`, col2X, lineY);
  doc.text(formatCurrency(data.repairIncome), col2X + 45, lineY);
  
  lineY += 7;
  doc.text(`Parts Cost:`, col1X, lineY);
  doc.text(formatCurrency(data.repairCost), col1X + 45, lineY);
  
  doc.text(`Labor Cost:`, col2X, lineY);
  doc.text(formatCurrency(data.laborCost), col2X + 45, lineY);
  
  lineY += 7;
  const netProfit = data.repairIncome - data.repairCost - data.laborCost;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  if (netProfit >= 0) {
    doc.setTextColor(0, 128, 0); // Green
  } else {
    doc.setTextColor(255, 0, 0); // Red
  }
  doc.text(`Net Profit:`, col1X, lineY);
  doc.text(formatCurrency(netProfit), col1X + 45, lineY);
  
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const avgJobValue = data.totalJobs > 0 ? data.repairIncome / data.totalJobs : 0;
  doc.text(`Avg Job Value:`, col2X, lineY);
  doc.text(formatCurrency(avgJobValue), col2X + 45, lineY);
  
  lineY += 7;
  const profitMargin = data.repairIncome > 0 ? ((netProfit / data.repairIncome) * 100).toFixed(1) : '0.0';
  doc.text(`Profit Margin:`, col1X, lineY);
  doc.text(`${profitMargin}%`, col1X + 45, lineY);

  // Technician Performance Table
  const tableStartY = summaryStartY + 56;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Technician Performance", 14, tableStartY);

  if (data.technicianStats.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("No technician data available for this period", 14, tableStartY + 10);
  } else {
    // Table headers and data with profit column
    const tableData = data.technicianStats.map((tech) => {
      const techProfit = tech.totalRevenue - tech.partsCost - tech.laborCost;
      return [
        tech.technician.username,
        tech.jobCount.toString(),
        formatCurrency(tech.totalRevenue),
        formatCurrency(tech.partsCost),
        formatCurrency(tech.laborCost),
        formatCurrency(techProfit),
      ];
    });

    // Add totals row
    const totals = data.technicianStats.reduce(
      (acc, tech) => ({
        jobCount: acc.jobCount + tech.jobCount,
        totalRevenue: acc.totalRevenue + tech.totalRevenue,
        partsCost: acc.partsCost + tech.partsCost,
        laborCost: acc.laborCost + tech.laborCost,
      }),
      { jobCount: 0, totalRevenue: 0, partsCost: 0, laborCost: 0 }
    );

    const totalProfit = totals.totalRevenue - totals.partsCost - totals.laborCost;

    tableData.push([
      "TOTAL",
      totals.jobCount.toString(),
      formatCurrency(totals.totalRevenue),
      formatCurrency(totals.partsCost),
      formatCurrency(totals.laborCost),
      formatCurrency(totalProfit),
    ]);

    // Generate table
    autoTable(doc, {
      startY: tableStartY + 8,
      head: [["Technician", "Jobs", "Revenue", "Parts", "Labor", "Profit"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 30, halign: "right" },
        3: { cellWidth: 28, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
        5: { cellWidth: 30, halign: "right" },
      },
      didParseCell: function (data) {
        // Make the last row (totals) bold
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [220, 230, 245];
        }
        // Color profit column - green for positive, red for negative
        if (data.column.index === 5 && data.row.index < tableData.length - 1) {
          const profitText = data.cell.text[0];
          if (profitText && profitText.includes('-')) {
            data.cell.styles.textColor = [255, 0, 0];
          } else if (profitText && profitText !== '$0.00') {
            data.cell.styles.textColor = [0, 128, 0];
          }
        }
      },
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    "This report provides insights into repair operations and technician performance",
    pageWidth / 2,
    pageHeight - 20,
    { align: "center" }
  );

  doc.setFontSize(7);
  doc.text(
    "POS Admin System - Repair Analytics",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );

  // Generate filename with date
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `repair-analytics-${data.periodLabel.toLowerCase().replace(/\s+/g, "-")}-${dateStr}.pdf`;

  // Download
  doc.save(filename);
}
