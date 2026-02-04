"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Plus, 
  User, 
  Mail,
  Phone,
  Clock,
  Edit,
  Eye,
  UserX,
  Grid,
  List,
  Search
} from "lucide-react";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: "Active" | "On Leave" | "Inactive";
  lastLogin?: Date;
  hireDate: Date;
  photoUrl?: string;
}

export default function EmployeesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    hireDate: ""
  });

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      employeeId: "EMP001",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@hotline.com",
      phone: "+1234567890",
      role: "Cashier",
      department: "Sales",
      status: "Active",
      lastLogin: new Date("2026-01-07T09:30:00"),
      hireDate: new Date("2024-06-15"),
      photoUrl: "/avatars/john.jpg"
    },
    {
      id: "2",
      employeeId: "EMP002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@hotline.com",
      phone: "+1234567891",
      role: "Technician",
      department: "Repairs",
      status: "Active",
      lastLogin: new Date("2026-01-07T08:15:00"),
      hireDate: new Date("2024-03-20"),
      photoUrl: "/avatars/jane.jpg"
    },
    {
      id: "3",
      employeeId: "EMP003",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@hotline.com",
      phone: "+1234567892",
      role: "Store Manager",
      department: "Management",
      status: "Active",
      lastLogin: new Date("2026-01-07T07:45:00"),
      hireDate: new Date("2023-01-10"),
      photoUrl: "/avatars/mike.jpg"
    },
    {
      id: "4",
      employeeId: "EMP004",
      firstName: "Sarah",
      lastName: "Williams",
      email: "sarah.williams@hotline.com",
      phone: "+1234567893",
      role: "Inventory Manager",
      department: "Inventory",
      status: "On Leave",
      lastLogin: new Date("2026-01-05T16:30:00"),
      hireDate: new Date("2024-08-01"),
      photoUrl: "/avatars/sarah.jpg"
    },
    {
      id: "5",
      employeeId: "EMP005",
      firstName: "Robert",
      lastName: "Brown",
      email: "robert.brown@hotline.com",
      phone: "+1234567894",
      role: "Cashier",
      department: "Sales",
      status: "Inactive",
      lastLogin: new Date("2025-12-15T14:20:00"),
      hireDate: new Date("2023-11-05"),
      photoUrl: "/avatars/robert.jpg"
    },
  ]);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      employeeId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      hireDate: ""
    });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      hireDate: new Date(employee.hireDate).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleDeactivate = (employee: Employee) => {
    if (confirm(`Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`)) {
      setEmployees(employees.map(e => 
        e.id === employee.id ? { ...e, status: "Inactive" } : e
      ));
    }
  };

  const handleSave = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    if (selectedEmployee) {
      setEmployees(employees.map(e => 
        e.id === selectedEmployee.id 
          ? { 
              ...e, 
              ...formData,
              hireDate: new Date(formData.hireDate)
            } 
          : e
      ));
    } else {
      const newEmployee: Employee = {
        id: (employees.length + 1).toString(),
        employeeId: formData.employeeId || `EMP${String(employees.length + 1).padStart(3, '0')}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        status: "Active",
        hireDate: new Date(formData.hireDate)
      };
      setEmployees([...employees, newEmployee]);
    }

    setIsModalOpen(false);
  };

  const filteredEmployees = statusFilter === "all" 
    ? employees 
    : employees.filter(e => e.status === statusFilter);

  const employeeColumns: DataTableColumn<Employee>[] = [
    {
      key: "employee",
      label: "Employee",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={`${item.firstName} ${item.lastName}`} className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium text-black">{item.firstName} {item.lastName}</div>
            <div className="text-xs text-gray-500">{item.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      key: "contact",
      label: "Contact",
      render: (item) => (
        <div>
          <div className="text-black text-sm flex items-center gap-1">
            <Mail size={14} className="text-gray-400" />
            {item.email}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Phone size={12} className="text-gray-400" />
            {item.phone}
          </div>
        </div>
      )
    },
    {
      key: "role",
      label: "Role & Department",
      render: (item) => (
        <div>
          <div className="text-black font-medium">{item.role}</div>
          <div className="text-xs text-gray-500">{item.department}</div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.status === "Active" ? "bg-green-100 text-green-700" :
          item.status === "On Leave" ? "bg-yellow-100 text-yellow-700" :
          "bg-gray-100 text-gray-700"
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: "lastLogin",
      label: "Last Login",
      render: (item) => (
        item.lastLogin ? (
          <div className="text-black text-sm flex items-center gap-1">
            <Clock size={14} className="text-gray-400" />
            <div>
              <div>{new Date(item.lastLogin).toLocaleDateString()}</div>
              <div className="text-xs text-gray-500">{new Date(item.lastLogin).toLocaleTimeString()}</div>
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">Never</span>
        )
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Link href={`/admin/employees/${item.id}`}>
            <Button size="sm" variant="ghost">
              <Eye size={14} />
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={() => handleEditEmployee(item)}>
            <Edit size={14} />
          </Button>
          {item.status !== "Inactive" && (
            <Button size="sm" variant="ghost" onClick={() => handleDeactivate(item)}>
              <UserX size={14} />
            </Button>
          )}
        </div>
      )
    }
  ];

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "Active").length,
    onLeave: employees.filter(e => e.status === "On Leave").length,
    inactive: employees.filter(e => e.status === "Inactive").length
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Employees"
        description="Manage employee profiles, roles, and status"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Total Employees</div>
          <div className="text-2xl font-bold text-black">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">On Leave</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.onLeave}</div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="text-sm text-gray-600 mb-1">Inactive</div>
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-black">Filter by Status:</span>
            <select 
              className="border rounded px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Employees</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border rounded overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-gray-200" : "hover:bg-gray-100"}`}
              >
                <Grid size={18} />
              </button>
            </div>
            <Button onClick={handleAddEmployee}>
              <Plus size={16} className="mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      </div>

      {/* Employee List/Grid */}
      {viewMode === "list" ? (
        <div className="bg-white rounded-xl border p-4">
          <DataTable
            data={filteredEmployees}
            columns={employeeColumns}
            searchPlaceholder="Search employees..."
            onSearch={() => {}}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {employee.photoUrl ? (
                      <img src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-black">{employee.firstName} {employee.lastName}</div>
                    <div className="text-xs text-gray-500">{employee.employeeId}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  employee.status === "Active" ? "bg-green-100 text-green-700" :
                  employee.status === "On Leave" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                }`}>
                  {employee.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <div className="font-medium text-black">{employee.role}</div>
                  <div className="text-xs text-gray-500">{employee.department}</div>
                </div>
                <div className="text-sm text-black flex items-center gap-1">
                  <Mail size={14} className="text-gray-400" />
                  {employee.email}
                </div>
                <div className="text-sm text-black flex items-center gap-1">
                  <Phone size={14} className="text-gray-400" />
                  {employee.phone}
                </div>
                {employee.lastLogin && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} className="text-gray-400" />
                    Last login: {new Date(employee.lastLogin).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Link href={`/admin/employees/${employee.id}`} className="flex-1">
                  <Button size="sm" variant="ghost" className="w-full">
                    <Eye size={14} className="mr-1" />
                    View
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => handleEditEmployee(employee)}>
                  <Edit size={14} className="mr-1" />
                  Edit
                </Button>
                {employee.status !== "Inactive" && (
                  <Button size="sm" variant="ghost" onClick={() => handleDeactivate(employee)}>
                    <UserX size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEmployee ? "Edit Employee" : "Add New Employee"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {selectedEmployee ? "Update" : "Add"} Employee
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              name="employeeId"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="EMP001"
              disabled={!!selectedEmployee}
            />
            <Input
              label="Hire Date"
              name="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
              required
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john.doe@hotline.com"
            required
          />

          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1234567890"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Role</label>
              <select
                className="w-full border rounded px-3 py-2 text-black"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="">Select Role</option>
                <option value="Cashier">Cashier</option>
                <option value="Technician">Technician</option>
                <option value="Store Manager">Store Manager</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Sales Associate">Sales Associate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Department</label>
              <select
                className="w-full border rounded px-3 py-2 text-black"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <option value="">Select Department</option>
                <option value="Sales">Sales</option>
                <option value="Repairs">Repairs</option>
                <option value="Inventory">Inventory</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
