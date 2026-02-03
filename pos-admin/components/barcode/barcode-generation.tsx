'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateBarcode, validateBarcode } from '@/lib/barcode-utils';

type BarcodeFormat = 'EAN-13' | 'UPC' | 'Code128';

interface Product {
  id: string;
  name: string;
  barcode?: string;
  sku: string;
}

export default function BarcodeGeneration() {
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>('EAN-13');
  const [customBarcode, setCustomBarcode] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [generatedBarcode, setGeneratedBarcode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock products - replace with actual data from API
  const products: Product[] = [
    { id: '1', name: 'Product A', sku: 'SKU-001' },
    { id: '2', name: 'Product B', sku: 'SKU-002' },
    { id: '3', name: 'Product C', sku: 'SKU-003' },
    { id: '4', name: 'Product D', sku: 'SKU-004' },
  ];

  const handleGenerateSingle = () => {
    setError('');
    setSuccess('');

    if (!autoGenerate && customBarcode) {
      const validation = validateBarcode(customBarcode, barcodeFormat);
      if (!validation.valid) {
        setError(validation.error || 'Invalid barcode');
        return;
      }
      setGeneratedBarcode(customBarcode);
      setSuccess('Custom barcode validated successfully!');
    } else {
      const barcode = generateBarcode(barcodeFormat);
      setGeneratedBarcode(barcode);
      setSuccess('Barcode generated successfully!');
    }
  };

  const handleBulkGenerate = () => {
    setError('');
    setSuccess('');

    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      return;
    }

    // Simulate bulk generation
    setTimeout(() => {
      setSuccess(`Generated barcodes for ${selectedProducts.length} products`);
      setSelectedProducts([]);
    }, 1000);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Barcode Format
        </label>
        <select
          value={barcodeFormat}
          onChange={(e) => setBarcodeFormat(e.target.value as BarcodeFormat)}
          className="w-full md:w-64 px-3 text-blue-800 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="EAN-13">EAN-13 (European Article Number)</option>
          <option value="UPC">UPC (Universal Product Code)</option>
          <option value="Code128">Code 128 (Alphanumeric)</option>
        </select>
      </div>

      {/* Single Barcode Generation */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-500">Single Product Barcode</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={autoGenerate}
                onChange={() => setAutoGenerate(true)}
                className="mr-2"
              />
              <span className="text-sm text-gray-500">Auto-generate barcode</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!autoGenerate}
                onChange={() => setAutoGenerate(false)}
                className="mr-2"
              />
              <span className="text-sm text-gray-500">Custom barcode assignment</span>
            </label>
          </div>

          {!autoGenerate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Barcode Value
              </label>
              <Input
                name="customBarcode"
                type="text"
                value={customBarcode}
                onChange={(e) => setCustomBarcode(e.target.value)}
                placeholder="Enter custom barcode"
              />
            </div>
          )}

          <Button onClick={handleGenerateSingle}>
            Generate Barcode
          </Button>

          {generatedBarcode && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Generated Barcode:</p>
              <div className="flex items-center space-x-4">
                <div className="bg-white p-4 border-2 border-gray-300 rounded">
                  <svg width="200" height="80">
                    <text x="10" y="40" fontSize="24" fontFamily="monospace">
                      {generatedBarcode}
                    </text>
                  </svg>
                </div>
                <code className="text-lg font-mono">{generatedBarcode}</code>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Generation */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Bulk Barcode Generation</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">
              Select products to generate barcodes ({selectedProducts.length} selected)
            </p>
            <Button onClick={selectAllProducts} variant="ghost" size="sm">
              {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Current Barcode
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.barcode || 'Not assigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            onClick={handleBulkGenerate}
            disabled={selectedProducts.length === 0}
          >
            Generate Barcodes for Selected Products
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}
    </div>
  );
}
