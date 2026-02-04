"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CategorySelector } from "@/components/categories/category-selector";
import { fetchProducts } from "@/lib/api/productApi";
import { fetchCategories } from "@/lib/api/categoryApi";
import { generateProductsPDF } from "@/lib/pdf-utils";
import { useToast } from "@/providers/toast-provider";
import { Download, FileText, Loader2, Filter } from "lucide-react";
import { Category } from "@/types/index.d";

interface ProductPDFDownloadProps {
  /** Optional: pre-selected category ID */
  initialCategoryId?: string;
  /** Show as a compact button or full panel */
  variant?: "button" | "panel";
}

export function ProductPDFDownload({
  initialCategoryId,
  variant = "panel",
}: ProductPDFDownloadProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialCategoryId || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const toast = useToast();

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetchCategories({ tree: true });
        setCategories(res.data.categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Find category name for the selected category
  const findCategoryName = (
    cats: Category[],
    id: string
  ): string | undefined => {
    for (const cat of cats) {
      if (cat._id === id) return cat.name;
      if (cat.subcategories) {
        const found = findCategoryName(cat.subcategories, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Fetch products with optional category filter
      // Use a high limit to get all products for PDF
      const params: Parameters<typeof fetchProducts>[0] = {
        limit: 1000,
        includeStock: true,
      };

      if (selectedCategoryId) {
        params.category = selectedCategoryId;
      }

      const res = await fetchProducts(params);
      const products = res.data.products;

      if (products.length === 0) {
        toast.warning("No products found for the selected criteria");
        setIsLoading(false);
        return;
      }

      // Get category name for PDF title
      const categoryName = selectedCategoryId
        ? findCategoryName(categories, selectedCategoryId)
        : undefined;

      // Generate and download PDF
      generateProductsPDF(products, categoryName);
      toast.success(`PDF downloaded with ${products.length} products`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Compact button variant
  if (variant === "button") {
    return (
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant="secondary"
        size="md"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export PDF
      </Button>
    );
  }

  // Full panel variant
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            Download Products as PDF
          </h3>
          <p className="text-sm text-gray-500">
            Generate a PDF catalog of your products
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Filter className="w-4 h-4" />
            Filter by Category (Optional)
          </label>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading categories...
            </div>
          ) : (
            <div className="relative">
              <CategorySelector
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                categories={categories}
                placeholder="All Categories"
                showFullPath
              />
              {selectedCategoryId && (
                <button
                  onClick={() => setSelectedCategoryId("")}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Info text */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600">
            {selectedCategoryId ? (
              <>
                Products from{" "}
                <span className="font-medium">
                  {findCategoryName(categories, selectedCategoryId)}
                </span>{" "}
                category will be included in the PDF.
              </>
            ) : (
              <>All products from all categories will be included in the PDF.</>
            )}
          </p>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isLoading || categoriesLoading}
          variant="primary"
          size="lg"
          fullWidth
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Product Catalog
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
