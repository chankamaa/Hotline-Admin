import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Get category name from category object or string
 */
function getCategoryName(category: string | Category | undefined): string {
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

  const totalValue = products.reduce((sum, p) => sum + p.sellingPrice, 0);
  doc.text(`Total Selling Price: ${formatCurrency(totalValue)}`, 14, 52);

  const costValue = products.reduce((sum, p) => sum + p.costPrice, 0);
  doc.text(`Total Cost Price: ${formatCurrency(costValue)}`, 14, 59);

  const profit = totalValue - costValue;
  doc.text(`Total Profit: ${formatCurrency(profit)}`, 14, 66);

  // Table data
  const tableData = products.map((product) => [
    product.name,
    product.sku || "—",
    getCategoryName(product.category),
    formatCurrency(product.costPrice),
    formatCurrency(product.sellingPrice),
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

  addField("Cost Price", formatCurrency(product.costPrice));
  addField("Selling Price", formatCurrency(product.sellingPrice));
  if (product.wholesalePrice) {
    addField("Wholesale Price", formatCurrency(product.wholesalePrice));
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
  const totalRevenue = summaryData?.totalRevenue ?? sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalDiscount = summaryData?.totalDiscount ?? sales.reduce((sum, s) => sum + s.discountTotal, 0);
  const totalTax = summaryData?.totalTax ?? sales.reduce((sum, s) => sum + s.taxTotal, 0);
  const avgSaleValue = summaryData?.avgSaleValue ?? (totalSales > 0 ? totalRevenue / totalSales : 0);

  doc.text(`Total Sales: ${totalSales}`, 14, 45);
  doc.text(`Total Revenue: ${formatCurrency(totalRevenue)}`, 14, 52);
  doc.text(`Total Discounts: ${formatCurrency(totalDiscount)}`, 14, 59);
  doc.text(`Total Tax: ${formatCurrency(totalTax)}`, 105, 45);
  doc.text(`Avg Sale Value: ${formatCurrency(avgSaleValue)}`, 105, 52);

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
