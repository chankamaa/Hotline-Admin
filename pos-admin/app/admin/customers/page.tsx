"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer } from "@/lib/types";
import { Edit, Trash2, Eye, Mail, Phone, MapPin } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      address: "123 Main St",
      city: "New York",
      totalPurchases: 2450,
      lastVisit: new Date("2024-01-03"),
      loyaltyPoints: 245,
      createdAt: new Date("2023-06-15"),
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1234567891",
      address: "456 Oak Ave",
      city: "Los Angeles",
      totalPurchases: 1899,
      lastVisit: new Date("2024-01-02"),
      loyaltyPoints: 189,
      createdAt: new Date("2023-08-20"),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
    });
  };

  const handleAdd = () => {
    setCurrentCustomer(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setCurrentCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone,
      address: customer.address || "",
      city: customer.city || "",
      notes: customer.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  const handleView = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleSave = () => {
    const customer: Customer = {
      id: currentCustomer?.id || String(customers.length + 1),
      ...formData,
      totalPurchases: currentCustomer?.totalPurchases || 0,
      lastVisit: currentCustomer?.lastVisit,
      loyaltyPoints: currentCustomer?.loyaltyPoints || 0,
      createdAt: currentCustomer?.createdAt || new Date(),
    };

    if (currentCustomer) {
      setCustomers(customers.map((c) => (c.id === currentCustomer.id ? customer : c)));
    } else {
      setCustomers([...customers, customer]);
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

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      label: "Customer",
      render: (customer) => (
        <div>
          <div className="font-medium">{customer.name}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Phone size={12} /> {customer.phone}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (customer) =>
        customer.email ? (
          <div className="flex items-center gap-1 text-sm">
            <Mail size={14} className="text-gray-400" />
            {customer.email}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
    {
      key: "city",
      label: "Location",
      render: (customer) =>
        customer.city ? (
          <div className="flex items-center gap-1 text-sm">
            <MapPin size={14} className="text-gray-400" />
            {customer.city}
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        ),
    },
    {
      key: "totalPurchases",
      label: "Total Purchases",
      render: (customer) => (
        <div className="font-semibold text-green-600">
          {customer.totalPurchases.toFixed(2)}
        </div>
      ),
    },
    {
      key: "loyaltyPoints",
      label: "Points",
      render: (customer) => (
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
          {customer.loyaltyPoints} pts
        </span>
      ),
    },
    {
      key: "lastVisit",
      label: "Last Visit",
      render: (customer) =>
        customer.lastVisit ? (
          <div className="text-sm">{new Date(customer.lastVisit).toLocaleDateString()}</div>
        ) : (
          <span className="text-gray-400 text-sm">Never</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (customer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(customer)}
            className="p-1 hover:bg-gray-100 rounded"
            title="View"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleEdit(customer)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(customer.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Customers"
        description="Manage your customer database and track purchase history"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Total Customers</div>
          <div className="text-2xl font-bold">{customers.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600">
            ${customers.reduce((sum, c) => sum + c.totalPurchases, 0).toFixed(0)}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Avg Purchase</div>
          <div className="text-2xl font-bold">
            $
            {customers.length > 0
              ? (
                  customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length
                ).toFixed(0)
              : 0}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-500 mb-1">Active This Month</div>
          <div className="text-2xl font-bold">
            {
              customers.filter(
                (c) =>
                  c.lastVisit &&
                  new Date(c.lastVisit).getMonth() === new Date().getMonth()
              ).length
            }
          </div>
        </div>
      </div>

      <DataTable
        data={filteredCustomers}
        columns={columns}
        searchPlaceholder="Search by name, phone, email..."
        onSearch={setSearchQuery}
        onAdd={handleAdd}
        onExport={() => alert("Export functionality")}
        addButtonLabel="Add Customer"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentCustomer ? "Edit Customer" : "Add New Customer"}
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {currentCustomer ? "Update" : "Create"} Customer
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
          />

          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
          />

          <Input
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Customer Details"
        size="lg"
      >
        {currentCustomer && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
              <div>
                <h3 className="text-xl font-bold mb-1">{currentCustomer.name}</h3>
                <div className="text-sm opacity-90">
                  Customer since {new Date(currentCustomer.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {currentCustomer.loyaltyPoints}
                </div>
                <div className="text-xs opacity-90">Loyalty Points</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Phone size={14} /> Phone
                </div>
                <div className="font-medium">{currentCustomer.phone}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Mail size={14} /> Email
                </div>
                <div className="font-medium">{currentCustomer.email || "-"}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg col-span-2">
                <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin size={14} /> Address
                </div>
                <div className="font-medium">
                  {currentCustomer.address || "-"}
                  {currentCustomer.city && `, ${currentCustomer.city}`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1">Total Purchases</div>
                <div className="text-2xl font-bold text-green-600">
                  {currentCustomer.totalPurchases.toFixed(2)}
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1">Last Visit</div>
                <div className="text-lg font-medium">
                  {currentCustomer.lastVisit
                    ? new Date(currentCustomer.lastVisit).toLocaleDateString()
                    : "Never"}
                </div>
              </div>
            </div>

            {currentCustomer.notes && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-700 mb-1 font-medium">Notes</div>
                <div className="text-sm">{currentCustomer.notes}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
