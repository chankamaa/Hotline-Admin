"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sale } from "@/lib/types";
import { Edit, Trash2, Eye, Printer, Plus, Minus } from "lucide-react";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([
    {
      id: "1",
      invoiceNumber: "INV-001",
      customer: {
        id: "c1",
        name: "John Doe",
        phone: "+1234567890",
        email: "john@example.com",
        totalPurchases: 2,
        createdAt: new Date(),
      },
      items: [
        {
          productId: "p1",
          productName: "iPhone 15 Pro 256GB",
          sku: "IPH15P256",
          quantity: 1,
          price: 999,
          discount: 0,
          total: 999,
          imei: "123456789012345",
        },
      ],
      subtotal: 999,
      tax: 99.9,
      discount: 0,
      total: 1098.9,
      paymentMethod: "card",
      paymentStatus: "paid",
      status: "completed",
      employeeId: "e1",
      employeeName: "Milan",
      createdAt: new Date("2024-01-04"),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // New sale form state
  const [newSale, setNewSale] = useState({
    customerName: "",
    customerPhone: "",
    items: [{ productName: "", quantity: 1, price: 0, discount: 0 }],
    paymentMethod: "cash",
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAdd = () => {
    setCurrentSale(null);
    setNewSale({
      customerName: "",
      customerPhone: "",
      items: [{ productName: "", quantity: 1, price: 0, discount: 0 }],
      paymentMethod: "cash",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (sale: Sale) => {
    setCurrentSale(sale);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sale?")) {
      setSales(sales.filter((s) => s.id !== id));
    }
  };

  const handleView = (sale: Sale) => {
    setCurrentSale(sale);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    // Calculate totals
    const subtotal = newSale.items.reduce(
      (sum, item) => sum + item.quantity * item.price - item.discount,
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const sale: Sale = {
      id: String(sales.length + 1),
      invoiceNumber: `INV-${String(sales.length + 1).padStart(3, "0")}`,
      customer: {
        id: `c${sales.length + 1}`,
        name: newSale.customerName,
        phone: newSale.customerPhone,
        totalPurchases: 1,
        createdAt: new Date(),
      },
      items: newSale.items.map((item) => ({
        productId: `p${Math.random()}`,
        productName: item.productName,
        sku: `SKU${Math.random()}`,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total: item.quantity * item.price - item.discount,
      })),
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: newSale.paymentMethod as any,
      paymentStatus: "paid",
      status: "completed",
      employeeId: "e1",
      employeeName: "Milan",
      createdAt: new Date(),
    };

    if (currentSale) {
      setSales(sales.map((s) => (s.id === currentSale.id ? { ...sale, id: currentSale.id } : s)));
    } else {
      setSales([...sales, sale]);
    }

    setIsModalOpen(false);
  };

  const addItem = () => {
    setNewSale({
      ...newSale,
      items: [...newSale.items, { productName: "", quantity: 1, price: 0, discount: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setNewSale({
      ...newSale,
      items: newSale.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...newSale.items];
    items[index] = { ...items[index], [field]: value };
    setNewSale({ ...newSale, items });
  };

  const columns: DataTableColumn<Sale>[] = [
    {
      key: "invoiceNumber",
      label: "Invoice #",
      render: (sale) => (
        <div className="font-medium text-blue-600">{sale.invoiceNumber}</div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      render: (sale) => (
        <div>
          <div className="font-medium">{sale.customer?.name || "Walk-in"}</div>
          <div className="text-xs text-gray-500">{sale.customer?.phone}</div>
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (sale) => <div>{sale.items.length} item(s)</div>,
    },
    {
      key: "total",
      label: "Total",
      render: (sale) => (
        <div className="font-semibold">${sale.total.toFixed(2)}</div>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (sale) => (
        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 capitalize">
          {sale.paymentMethod}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (sale) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            sale.status === "completed"
              ? "bg-green-100 text-green-700"
              : sale.status === "pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {sale.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      render: (sale) => (
        <div className="text-sm">{new Date(sale.createdAt).toLocaleDateString()}</div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (sale) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(sale)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(sale)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(sale.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Print"
          >
            <Printer size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredSales = sales.filter(
    (sale) =>
      sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.phone.includes(searchQuery)
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Sales"
        description="Manage all your sales transactions"
      />

      <DataTable
        data={filteredSales}
        columns={columns}
        searchPlaceholder="Search by invoice, customer, phone..."
        onSearch={handleSearch}
        onAdd={handleAdd}
        onExport={() => alert("Export functionality")}
        addButtonLabel="New Sale"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentSale ? "Edit Sale" : "New Sale"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentSale ? "Update" : "Create"} Sale
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Customer Name"
              name="customerName"
              value={newSale.customerName}
              onChange={(e) =>
                setNewSale({ ...newSale, customerName: e.target.value })
              }
              placeholder="Enter customer name"
            />
            <Input
              label="Customer Phone"
              name="customerPhone"
              type="tel"
              value={newSale.customerPhone}
              onChange={(e) =>
                setNewSale({ ...newSale, customerPhone: e.target.value })
              }
              placeholder="+1234567890"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Items</h3>
              <Button size="sm" onClick={addItem}>
                <Plus size={16} /> Add Item
              </Button>
            </div>

            {newSale.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-3 items-end">
                <div className="col-span-5">
                  <Input
                    label={index === 0 ? "Product" : ""}
                    name="productName"
                    value={item.productName}
                    onChange={(e) => updateItem(index, "productName", e.target.value)}
                    placeholder="Product name"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Qty" : ""}
                    name="quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Price" : ""}
                    name="price"
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      updateItem(index, "price", Number(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Discount" : ""}
                    name="discount"
                    type="number"
                    value={item.discount}
                    onChange={(e) =>
                      updateItem(index, "discount", Number(e.target.value))
                    }
                  />
                </div>
                <div className="col-span-1">
                  {newSale.items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Input
            label="Payment Method"
            name="paymentMethod"
            type="select"
            value={newSale.paymentMethod}
            onChange={(e) =>
              setNewSale({ ...newSale, paymentMethod: e.target.value })
            }
            options={[
              { value: "cash", label: "Cash" },
              { value: "card", label: "Card" },
              { value: "mobile", label: "Mobile Payment" },
              { value: "bank", label: "Bank Transfer" },
            ]}
          />

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>
                $
                {newSale.items
                  .reduce(
                    (sum, item) =>
                      sum + item.quantity * item.price - item.discount,
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%):</span>
              <span>
                $
                {(
                  newSale.items.reduce(
                    (sum, item) =>
                      sum + item.quantity * item.price - item.discount,
                    0
                  ) * 0.1
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>
                $
                {(
                  newSale.items.reduce(
                    (sum, item) =>
                      sum + item.quantity * item.price - item.discount,
                    0
                  ) * 1.1
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Invoice: ${currentSale?.invoiceNumber}`}
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary">
              <Printer size={16} /> Print
            </Button>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </div>
        }
      >
        {currentSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-500">Customer</div>
                <div className="font-medium">{currentSale.customer?.name}</div>
                <div className="text-sm text-gray-600">
                  {currentSale.customer?.phone}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">
                  {new Date(currentSale.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs">Product</th>
                    <th className="px-3 py-2 text-right text-xs">Qty</th>
                    <th className="px-3 py-2 text-right text-xs">Price</th>
                    <th className="px-3 py-2 text-right text-xs">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentSale.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm">{item.productName}</td>
                      <td className="px-3 py-2 text-sm text-right">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        ${item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${currentSale.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${currentSale.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>${currentSale.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Payment Method:</span>
                <span className="font-medium capitalize">
                  {currentSale.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Payment Status:</span>
                <span className="font-medium capitalize">
                  {currentSale.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
