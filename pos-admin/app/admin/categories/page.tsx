"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Tags } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Categories & Brands"
        description="Manage product categories and brand information"
      />
      
      <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl border">
        <div className="text-center">
          <Tags size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Categories & Brands</h3>
          <p className="text-gray-500">This page is under development</p>
        </div>
      </div>
    </div>
  );
}
