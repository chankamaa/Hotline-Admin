"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Package } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="p-6">
      <PageHeader
        title="Returns & Refunds"
        description="Manage product returns and process refunds"
      />
      
      <div className="flex items-center justify-center h-[60vh] bg-white rounded-xl border">
        <div className="text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Returns & Refunds</h3>
          <p className="text-gray-500">This page is under development</p>
        </div>
      </div>
    </div>
  );
}
