"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { Edit, Trash2, Eye, Package, AlertTriangle } from "lucide-react";

export default function ProductsPage() {
  const categoryOptions = [
    "Buns",
    "Soft Drinks",
    "Cold Beverages",
    "Cakes",
    "Sandwiches",
  ];

  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "iPhone 15 Pro 256GB",
      sku: "IPH15P256",
      barcode: "1234567890123",
      category: "Smartphones",
      brand: "Apple",
      type: "phone",
      imei: "123456789012345",
      price: 999,
      cost: 750,
      stockQuantity: 15,
      minStockLevel: 10,
      description: "Latest iPhone with A17 Pro chip",
      warranty: "1 year",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Samsung Galaxy S24 Ultra",
      sku: "SAMS24U",
      barcode: "9876543210987",
      category: "Smartphones",
      brand: "Samsung",
      type: "phone",
      price: 1199,
      cost: 900,
      stockQuantity: 8,
      minStockLevel: 8,
      description: "Premium Samsung flagship",
      warranty: "1 year",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      name: "USB-C Fast Charger",
      sku: "CHG-USBC",
      barcode: "4567890123456",
      category: "Accessories",
      brand: "Generic",
      type: "accessory",
      price: 25,
      cost: 10,
      stockQuantity: 45,
      minStockLevel: 50,
      description: "20W USB-C fast charger",
      warranty: "6 months",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    category: "",
    brand: "",
    type: "phone" as "phone" | "accessory" | "part",
    price: 0,
    cost: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    description: "",
    warranty: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      barcode: "",
      category: "",
      brand: "",
      type: "phone",
      price: 0,
      cost: 0,
      stockQuantity: 0,
      minStockLevel: 0,
      description: "",
      warranty: "",
    });
  };

  const handleAdd = () => {
    setCurrentProduct(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      category: product.category,
      brand: product.brand,
      type: product.type,
      price: product.price,
      cost: product.cost,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      description: product.description || "",
      warranty: product.warranty || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleView = (product: Product) => {
    setCurrentProduct(product);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    const product: Product = {
      id: currentProduct?.id || String(products.length + 1),
      ...formData,
      createdAt: currentProduct?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (currentProduct) {
      setProducts(products.map((p) => (p.id === currentProduct.id ? product : p)));
    } else {
      setProducts([...products, product]);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      label: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-gray-400" />
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-gray-500">{product.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (product) => (
        <div>
          <div className="text-sm">{product.category}</div>
          <div className="text-xs text-gray-500">{product.brand}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (product) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 capitalize">
          {product.type}
        </span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (product) => (
        <div>
          <div className="font-semibold">${product.price.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Cost: ${product.cost.toFixed(2)}</div>
        </div>
      ),
    },
    {
      key: "stockQuantity",
      label: "Stock",
      render: (product) => (
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              product.stockQuantity <= product.minStockLevel
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {product.stockQuantity}
          </span>
          {product.stockQuantity <= product.minStockLevel && (
            <AlertTriangle size={14} className="text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (product) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(product)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(product)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(product.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode.includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Products"
        description="Manage your mobile phones and accessories inventory"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Total Products</div>
          <div className="text-2xl font-bold">{products.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Low Stock Items</div>
          <div className="text-2xl font-bold text-red-600">
            {products.filter((p) => p.stockQuantity <= p.minStockLevel).length}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold">
            ${products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0).toFixed(0)}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Categories</div>
          <div className="text-2xl font-bold">
            {new Set(products.map((p) => p.category)).size}
          </div>
        </div>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        searchPlaceholder="Search by name, SKU, barcode..."
        onSearch={setSearchQuery}
        onAdd={handleAdd}
        onExport={() => alert("Export functionality")}
        addButtonLabel="Add Product"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentProduct ? "Edit Product" : "Add New Product"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentProduct ? "Update" : "Create"} Product
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
            />
            <Input
              label="Type"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: "phone", label: "Phone" },
                { value: "accessory", label: "Accessory" },
                { value: "part", label: "Part" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions.map((c) => ({ value: c, label: c }))}
              required
            />
            <Input
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., Apple, Samsung"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Cost Price"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stock Quantity"
              name="stockQuantity"
              type="number"
              value={formData.stockQuantity}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Min Stock Level"
              name="minStockLevel"
              type="number"
              value={formData.minStockLevel}
              onChange={handleInputChange}
              required
            />
          </div>

          <Input
            label="Warranty Period"
            name="warranty"
            value={formData.warranty}
            onChange={handleInputChange}
            placeholder="e.g., 1 year, 6 months"
          />

          <Input
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">Profit Margin</div>
            <div className="text-2xl font-bold text-blue-600">
              ${(formData.price - formData.cost).toFixed(2)} (
              {formData.cost > 0
                ? (((formData.price - formData.cost) / formData.cost) * 100).toFixed(1)
                : 0}
              %)
            </div>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Product Details"
        size="lg"
      >
        {currentProduct && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package size={40} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{currentProduct.name}</h3>
                <p className="text-gray-600 text-sm">{currentProduct.description}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                    {currentProduct.sku}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                    {currentProduct.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Category</div>
                <div className="font-medium">{currentProduct.category}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Brand</div>
                <div className="font-medium">{currentProduct.brand}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Selling Price</div>
                <div className="font-bold text-lg">${currentProduct.price.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Cost Price</div>
                <div className="font-medium">${currentProduct.cost.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Stock Quantity</div>
                <div
                  className={`font-bold text-lg ${
                    currentProduct.stockQuantity <= currentProduct.minStockLevel
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {currentProduct.stockQuantity} units
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Min Stock Level</div>
                <div className="font-medium">{currentProduct.minStockLevel} units</div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-700 mb-1">Profit Margin</div>
              <div className="text-2xl font-bold text-green-600">
                ${(currentProduct.price - currentProduct.cost).toFixed(2)} (
                {(
                  ((currentProduct.price - currentProduct.cost) / currentProduct.cost) *
                  100
                ).toFixed(1)}
                %)
              </div>
            </div>

            {currentProduct.barcode && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Barcode</div>
                <div className="font-mono text-lg">{currentProduct.barcode}</div>
              </div>
            )}

            {currentProduct.warranty && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1">Warranty</div>
                <div className="font-medium">{currentProduct.warranty}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
