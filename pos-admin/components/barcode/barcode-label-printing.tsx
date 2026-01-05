'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  sku: string;
}

type LabelSize = '2x1' | '3x2' | '4x3' | 'custom';

interface LabelSettings {
  size: LabelSize;
  customWidth?: number;
  customHeight?: number;
  columns: number;
  includePrice: boolean;
  includeName: boolean;
  includeBarcode: boolean;
  includeSKU: boolean;
}

export default function BarcodeLabelPrinting() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [labelSettings, setLabelSettings] = useState<LabelSettings>({
    size: '2x1',
    columns: 2,
    includePrice: true,
    includeName: true,
    includeBarcode: true,
    includeSKU: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('default');

  // Mock products with barcodes - replace with actual data from API
  const products: Product[] = [
    { id: '1', name: 'Premium Wireless Mouse', barcode: '1234567890123', price: 29.99, sku: 'SKU-001' },
    { id: '2', name: 'Mechanical Keyboard RGB', barcode: '1234567890124', price: 89.99, sku: 'SKU-002' },
    { id: '3', name: 'USB-C Hub 7-Port', barcode: '1234567890125', price: 39.99, sku: 'SKU-003' },
    { id: '4', name: 'Laptop Stand Adjustable', barcode: '1234567890126', price: 49.99, sku: 'SKU-004' },
    { id: '5', name: 'Wireless Charger 15W', barcode: '1234567890127', price: 24.99, sku: 'SKU-005' },
  ];

  // Mock printers
  const printers = [
    { id: 'default', name: 'Default Printer' },
    { id: 'thermal-1', name: 'Zebra ZD420 (Thermal)' },
    { id: 'laser-1', name: 'HP LaserJet Pro' },
  ];

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.includes(searchTerm)
  );

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handlePrint = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    // Simulate printing
    alert(`Printing ${selectedProducts.length} labels to ${printers.find(p => p.id === selectedPrinter)?.name}...`);
    console.log('Printing labels for products:', selectedProducts);
    console.log('Label settings:', labelSettings);
  };

  const getLabelDimensions = () => {
    switch (labelSettings.size) {
      case '2x1':
        return { width: 200, height: 100 };
      case '3x2':
        return { width: 300, height: 200 };
      case '4x3':
        return { width: 400, height: 300 };
      case 'custom':
        return {
          width: labelSettings.customWidth || 200,
          height: labelSettings.customHeight || 100,
        };
      default:
        return { width: 200, height: 100 };
    }
  };

  const selectedProductsData = products.filter((p) =>
    selectedProducts.includes(p.id)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Product Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Products for Label Printing</h3>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </p>
          <Button onClick={selectAllProducts} variant="secondary" size="sm">
            {selectedProducts.length === filteredProducts.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
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
                  Barcode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
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
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.barcode}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Label Settings */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Label Size and Format</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Label Size
            </label>
            <select
              value={labelSettings.size}
              onChange={(e) =>
                setLabelSettings({ ...labelSettings, size: e.target.value as LabelSize })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2x1">2" × 1" (Small)</option>
              <option value="3x2">3" × 2" (Medium)</option>
              <option value="4x3">4" × 3" (Large)</option>
              <option value="custom">Custom Size</option>
            </select>

            {labelSettings.size === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Width (px)</label>
                  <input
                    type="number"
                    value={labelSettings.customWidth || 200}
                    onChange={(e) =>
                      setLabelSettings({
                        ...labelSettings,
                        customWidth: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Height (px)</label>
                  <input
                    type="number"
                    value={labelSettings.customHeight || 100}
                    onChange={(e) =>
                      setLabelSettings({
                        ...labelSettings,
                        customHeight: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels per Row
            </label>
            <select
              value={labelSettings.columns}
              onChange={(e) =>
                setLabelSettings({ ...labelSettings, columns: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Include on Label
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={labelSettings.includeName}
                onChange={(e) =>
                  setLabelSettings({ ...labelSettings, includeName: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Product Name</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={labelSettings.includePrice}
                onChange={(e) =>
                  setLabelSettings({ ...labelSettings, includePrice: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Price</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={labelSettings.includeBarcode}
                onChange={(e) =>
                  setLabelSettings({ ...labelSettings, includeBarcode: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Barcode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={labelSettings.includeSKU}
                onChange={(e) =>
                  setLabelSettings({ ...labelSettings, includeSKU: e.target.checked })
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">SKU Code</span>
            </label>
          </div>
        </div>
      </div>

      {/* Printer Selection */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Printer Selection</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Printer
          </label>
          <select
            value={selectedPrinter}
            onChange={(e) => setSelectedPrinter(e.target.value)}
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {printers.map((printer) => (
              <option key={printer.id} value={printer.id}>
                {printer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      {showPreview && selectedProducts.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Print Preview</h3>
          
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${labelSettings.columns}, minmax(0, 1fr))`,
              }}
            >
              {selectedProductsData.slice(0, 6).map((product) => {
                const { width, height } = getLabelDimensions();
                return (
                  <div
                    key={product.id}
                    className="bg-white border-2 border-dashed border-gray-300 p-4 flex flex-col items-center justify-center"
                    style={{
                      width: `${width}px`,
                      height: `${height}px`,
                      fontSize: '10px',
                    }}
                  >
                    {labelSettings.includeName && (
                      <div className="font-semibold text-center mb-1 truncate w-full">
                        {product.name}
                      </div>
                    )}
                    {labelSettings.includeBarcode && (
                      <div className="my-2">
                        <svg width={width * 0.8} height={height * 0.4}>
                          <rect width="100%" height="100%" fill="white" />
                          {/* Simplified barcode representation */}
                          {[...Array(13)].map((_, i) => (
                            <rect
                              key={i}
                              x={i * (width * 0.8) / 13}
                              y="0"
                              width={(width * 0.8) / 26}
                              height="100%"
                              fill={i % 2 === 0 ? 'black' : 'white'}
                            />
                          ))}
                        </svg>
                        <div className="text-center text-xs font-mono mt-1">
                          {product.barcode}
                        </div>
                      </div>
                    )}
                    {labelSettings.includePrice && (
                      <div className="font-bold text-lg">${product.price.toFixed(2)}</div>
                    )}
                    {labelSettings.includeSKU && (
                      <div className="text-xs text-gray-500 mt-1">{product.sku}</div>
                    )}
                  </div>
                );
              })}
            </div>
            {selectedProducts.length > 6 && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                + {selectedProducts.length - 6} more label{selectedProducts.length - 6 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-4 border-t pt-6">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="ghost"
          disabled={selectedProducts.length === 0}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
        <Button
          onClick={handlePrint}
          disabled={selectedProducts.length === 0}
        >
          Print Labels ({selectedProducts.length})
        </Button>
      </div>
    </div>
  );
}
