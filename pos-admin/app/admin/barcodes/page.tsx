'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import BarcodeGeneration from '@/components/barcode/barcode-generation';
import BarcodeLabelPrinting from '@/components/barcode/barcode-label-printing';

type TabType = 'generation' | 'printing';

export default function BarcodesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('generation');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Barcode Management"
        description="Generate barcodes for products and print labels"
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('generation')}
            className={`${
              activeTab === 'generation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Barcode Generation
          </button>
          <button
            onClick={() => setActiveTab('printing')}
            className={`${
              activeTab === 'printing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
          >
            Label Printing
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'generation' && <BarcodeGeneration />}
        {activeTab === 'printing' && <BarcodeLabelPrinting />}
      </div>
    </div>
  );
}
