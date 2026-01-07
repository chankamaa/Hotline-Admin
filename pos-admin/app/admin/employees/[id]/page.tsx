"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { 
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  Users,
  AlertCircle,
  FileText,
  Download,
  Upload,
  Plus,
  User
} from "lucide-react";

interface EmploymentHistory {
  position: string;
  department: string;
  startDate: Date;
  endDate?: Date;
  status: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: Date;
  size: string;
}

export default function EmployeeProfilePage({ params }: { params: { id: string } }) {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Mock employee data - in real app, fetch by params.id
  const employee = {
    id: params.id,
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@hotline.com",
    phone: "+1234567890",
    address: "123 Main Street, Apt 4B, New York, NY 10001",
    dateOfBirth: new Date("1990-05-15"),
    nationalId: "123-45-6789",
    role: "Cashier",
    department: "Sales",
    status: "Active",
    hireDate: new Date("2024-06-15"),
    salary: 45000,
    photoUrl: "/avatars/john.jpg",
    lastLogin: new Date("2026-01-07T09:30:00")
  };

  const [employmentHistory, setEmploymentHistory] = useState<EmploymentHistory[]>([
    {
      position: "Cashier",
      department: "Sales",
      startDate: new Date("2024-06-15"),
      status: "Current"
    },
    {
      position: "Sales Associate",
      department: "Sales",
      startDate: new Date("2023-01-10"),
      endDate: new Date("2024-06-14"),
      status: "Promoted"
    }
  ]);

  const [permissions, setPermissions] = useState({
    sales: ["Process Sales", "Issue Refunds", "Apply Discounts"],
    inventory: ["View Stock", "Request Restock"],
    reports: ["View Sales Reports"],
    customers: ["View Customer Info", "Create Customer Profiles"]
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    {
      name: "Jane Doe",
      relationship: "Spouse",
      phone: "+1234567899",
      email: "jane.doe@email.com"
    },
    {
      name: "Robert Doe",
      relationship: "Father",
      phone: "+1234567898"
    }
  ]);

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Employment Contract.pdf",
      type: "Contract",
      uploadDate: new Date("2024-06-15"),
      size: "245 KB"
    },
    {
      id: "2",
      name: "ID Verification.pdf",
      type: "Identification",
      uploadDate: new Date("2024-06-15"),
      size: "1.2 MB"
    },
    {
      id: "3",
      name: "Certification - POS Systems.pdf",
      type: "Certification",
      uploadDate: new Date("2024-07-20"),
      size: "890 KB"
    }
  ]);

  const [personalFormData, setPersonalFormData] = useState({
    phone: employee.phone,
    address: employee.address,
    email: employee.email
  });

  const [contactFormData, setContactFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: ""
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Link href="/admin/employees">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft size={16} className="mr-2" />
            Back to Employees
          </Button>
        </Link>
        <PageHeader
          title={`${employee.firstName} ${employee.lastName}`}
          description={`${employee.role} • ${employee.department}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="space-y-6">
          {/* Photo and Basic Info */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-4">
                {employee.photoUrl ? (
                  <img src={employee.photoUrl} alt={`${employee.firstName} ${employee.lastName}`} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-gray-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-black">{employee.firstName} {employee.lastName}</h2>
              <p className="text-sm text-gray-500 mb-2">{employee.employeeId}</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                employee.status === "Active" ? "bg-green-100 text-green-700" :
                employee.status === "On Leave" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {employee.status}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase size={16} className="text-gray-400" />
                <span className="text-black">{employee.role}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-gray-400" />
                <span className="text-black">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-black">Joined {new Date(employee.hireDate).toLocaleDateString()}</span>
              </div>
              {employee.lastLogin && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-black">Last login: {new Date(employee.lastLogin).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t">
              <Button className="w-full" variant="outline">
                <Edit size={16} className="mr-2" />
                Edit Profile Photo
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Shield size={16} className="mr-2" />
                Manage Permissions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar size={16} className="mr-2" />
                View Attendance
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText size={16} className="mr-2" />
                Performance Report
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Personal Information</h3>
              <Button size="sm" variant="outline" onClick={() => setIsEditingPersonal(true)}>
                <Edit size={14} className="mr-1" />
                Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Full Name</div>
                <div className="text-black font-medium">{employee.firstName} {employee.lastName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
                <div className="text-black font-medium">{new Date(employee.dateOfBirth).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">National ID</div>
                <div className="text-black font-medium">{employee.nationalId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="text-black font-medium flex items-center gap-1">
                  <Mail size={14} className="text-gray-400" />
                  {employee.email}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Phone</div>
                <div className="text-black font-medium flex items-center gap-1">
                  <Phone size={14} className="text-gray-400" />
                  {employee.phone}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500 mb-1">Address</div>
                <div className="text-black font-medium flex items-start gap-1">
                  <MapPin size={14} className="text-gray-400 mt-1" />
                  {employee.address}
                </div>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Role & Permissions</h3>
              <Button size="sm" variant="outline">
                <Shield size={14} className="mr-1" />
                Manage
              </Button>
            </div>
            <div className="space-y-4">
              {Object.entries(permissions).map(([module, perms]) => (
                <div key={module}>
                  <div className="text-sm font-semibold text-black capitalize mb-2 bg-gray-50 p-2 rounded">
                    {module}
                  </div>
                  <div className="pl-4 space-y-1">
                    {perms.map((perm, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-black">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        {perm}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employment History */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Employment History</h3>
            <div className="space-y-4">
              {employmentHistory.map((history, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${history.status === "Current" ? "bg-green-500" : "bg-gray-300"}`}></div>
                    {index < employmentHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="font-semibold text-black">{history.position}</div>
                    <div className="text-sm text-gray-500">{history.department}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(history.startDate).toLocaleDateString()} - {history.endDate ? new Date(history.endDate).toLocaleDateString() : "Present"}
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${
                      history.status === "Current" ? "bg-green-100 text-green-700" :
                      history.status === "Promoted" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {history.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Emergency Contacts</h3>
              <Button size="sm" variant="outline" onClick={() => setIsAddingContact(true)}>
                <Plus size={14} className="mr-1" />
                Add Contact
              </Button>
            </div>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle size={20} className="text-red-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-black">{contact.name}</div>
                        <div className="text-xs text-gray-500">{contact.relationship}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit size={12} />
                    </Button>
                  </div>
                  <div className="mt-3 pl-13 space-y-1">
                    <div className="text-sm text-black flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      {contact.phone}
                    </div>
                    {contact.email && (
                      <div className="text-sm text-black flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        {contact.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents & Certifications */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black">Documents & Certifications</h3>
              <Button size="sm" variant="outline" onClick={() => setIsUploadingDoc(true)}>
                <Upload size={14} className="mr-1" />
                Upload
              </Button>
            </div>
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-black text-sm">{doc.name}</div>
                      <div className="text-xs text-gray-500">
                        {doc.type} • {doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Info Modal */}
      <Modal
        isOpen={isEditingPersonal}
        onClose={() => setIsEditingPersonal(false)}
        title="Edit Personal Information"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsEditingPersonal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditingPersonal(false)}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={personalFormData.email}
            onChange={(e) => setPersonalFormData({ ...personalFormData, email: e.target.value })}
          />
          <Input
            label="Phone"
            type="tel"
            value={personalFormData.phone}
            onChange={(e) => setPersonalFormData({ ...personalFormData, phone: e.target.value })}
          />
          <Input
            label="Address"
            type="textarea"
            value={personalFormData.address}
            onChange={(e) => setPersonalFormData({ ...personalFormData, address: e.target.value })}
            rows={3}
          />
        </div>
      </Modal>

      {/* Add Emergency Contact Modal */}
      <Modal
        isOpen={isAddingContact}
        onClose={() => setIsAddingContact(false)}
        title="Add Emergency Contact"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsAddingContact(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddingContact(false)}>
              Add Contact
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={contactFormData.name}
            onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
            placeholder="Jane Doe"
            required
          />
          <Input
            label="Relationship"
            value={contactFormData.relationship}
            onChange={(e) => setContactFormData({ ...contactFormData, relationship: e.target.value })}
            placeholder="Spouse, Parent, Sibling..."
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={contactFormData.phone}
            onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
            placeholder="+1234567890"
            required
          />
          <Input
            label="Email (Optional)"
            type="email"
            value={contactFormData.email}
            onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
            placeholder="contact@email.com"
          />
        </div>
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadingDoc}
        onClose={() => setIsUploadingDoc(false)}
        title="Upload Document"
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsUploadingDoc(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsUploadingDoc(false)}>
              Upload
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Document Type</label>
            <select className="w-full border rounded px-3 py-2 text-black">
              <option value="">Select Type</option>
              <option value="contract">Contract</option>
              <option value="identification">Identification</option>
              <option value="certification">Certification</option>
              <option value="training">Training Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">File</label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG up to 10MB
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
