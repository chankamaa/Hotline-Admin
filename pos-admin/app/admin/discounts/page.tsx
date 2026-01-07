"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Percent, 
  DollarSign, 
  Calendar,
  Tag,
  Users,
  Package,
  ShoppingBag
} from "lucide-react";

interface DiscountRule {
  id: string;
  code: string;
  name: string;
  type: "Percentage" | "Fixed Amount";
  value: number;
  validFrom: Date;
  validTo: Date;
  minimumPurchase: number;
  applicableProducts: string[];
  applicableCategories: string[];
  customerTypes: string[];
  usageLimit?: number;
  usedCount: number;
  status: "Active" | "Scheduled" | "Expired" | "Inactive";
  createdBy: string;
  createdAt: Date;
}

interface PromotionalOffer {
  id: string;
  name: string;
  type: "Buy X Get Y" | "Bundle" | "Seasonal" | "Flash Sale";
  details: string;
  validFrom: Date;
  validTo: Date;
  status: "Active" | "Scheduled" | "Expired";
  revenue: number;
  orderCount: number;
}

export default function DiscountsPage() {
  const [activeTab, setActiveTab] = useState<"rules" | "promotions">("rules");
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<DiscountRule | null>(null);

  const [ruleFormData, setRuleFormData] = useState({
    code: "",
    name: "",
    type: "Percentage" as "Percentage" | "Fixed Amount",
    value: "",
    validFrom: "",
    validTo: "",
    minimumPurchase: "",
    applicableCategories: [] as string[],
    customerTypes: [] as string[],
    usageLimit: ""
  });

  const [promoFormData, setPromoFormData] = useState({
    name: "",
    type: "Buy X Get Y" as "Buy X Get Y" | "Bundle" | "Seasonal" | "Flash Sale",
    details: "",
    validFrom: "",
    validTo: ""
  });

  const [discountRules, setDiscountRules] = useState<DiscountRule[]>([
    {
      id: "1",
      code: "NEWYEAR2026",
      name: "New Year Sale",
      type: "Percentage",
      value: 15,
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-01-31"),
      minimumPurchase: 100,
      applicableProducts: [],
      applicableCategories: ["Smartphones", "Accessories"],
      customerTypes: ["All"],
      usageLimit: 1000,
      usedCount: 245,
      status: "Active",
      createdBy: "Admin User",
      createdAt: new Date("2025-12-20")
    },
    {
      id: "2",
      code: "FIRSTBUY50",
      name: "First Purchase Discount",
      type: "Fixed Amount",
      value: 50,
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-12-31"),
      minimumPurchase: 200,
      applicableProducts: [],
      applicableCategories: ["All"],
      customerTypes: ["New"],
      usedCount: 87,
      status: "Active",
      createdBy: "Manager",
      createdAt: new Date("2025-12-15")
    },
    {
      id: "3",
      code: "VIP20",
      name: "VIP Customer Discount",
      type: "Percentage",
      value: 20,
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-06-30"),
      minimumPurchase: 0,
      applicableProducts: [],
      applicableCategories: ["All"],
      customerTypes: ["VIP"],
      usedCount: 156,
      status: "Active",
      createdBy: "Admin User",
      createdAt: new Date("2025-12-01")
    },
    {
      id: "4",
      code: "HOLIDAY25",
      name: "Holiday Special",
      type: "Percentage",
      value: 25,
      validFrom: new Date("2025-12-20"),
      validTo: new Date("2025-12-31"),
      minimumPurchase: 150,
      applicableProducts: [],
      applicableCategories: ["Smartphones"],
      customerTypes: ["All"],
      usageLimit: 500,
      usedCount: 500,
      status: "Expired",
      createdBy: "Manager",
      createdAt: new Date("2025-12-10")
    },
  ]);

  const [promotionalOffers, setPromotionalOffers] = useState<PromotionalOffer[]>([
    {
      id: "1",
      name: "Buy iPhone Get AirPods",
      type: "Buy X Get Y",
      details: "Buy any iPhone 15 model and get AirPods Pro free",
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-01-31"),
      status: "Active",
      revenue: 125000,
      orderCount: 45
    },
    {
      id: "2",
      name: "Smartphone Bundle Deal",
      type: "Bundle",
      details: "Phone + Case + Screen Protector - Save $75",
      validFrom: new Date("2026-01-01"),
      validTo: new Date("2026-02-28"),
      status: "Active",
      revenue: 89500,
      orderCount: 78
    },
    {
      id: "3",
      name: "Valentine's Day Special",
      type: "Seasonal",
      details: "20% off on select accessories",
      validFrom: new Date("2026-02-10"),
      validTo: new Date("2026-02-14"),
      status: "Scheduled",
      revenue: 0,
      orderCount: 0
    },
    {
      id: "4",
      name: "Flash Sale - Galaxy S24",
      type: "Flash Sale",
      details: "$200 off for 24 hours only",
      validFrom: new Date("2026-01-15T00:00:00"),
      validTo: new Date("2026-01-15T23:59:59"),
      status: "Scheduled",
      revenue: 0,
      orderCount: 0
    },
  ]);

  const handleAddRule = () => {
    setSelectedRule(null);
    setRuleFormData({
      code: "",
      name: "",
      type: "Percentage",
      value: "",
      validFrom: "",
      validTo: "",
      minimumPurchase: "",
      applicableCategories: [],
      customerTypes: [],
      usageLimit: ""
    });
    setIsRuleModalOpen(true);
  };

  const handleEditRule = (rule: DiscountRule) => {
    setSelectedRule(rule);
    setRuleFormData({
      code: rule.code,
      name: rule.name,
      type: rule.type,
      value: rule.value.toString(),
      validFrom: new Date(rule.validFrom).toISOString().split('T')[0],
      validTo: new Date(rule.validTo).toISOString().split('T')[0],
      minimumPurchase: rule.minimumPurchase.toString(),
      applicableCategories: rule.applicableCategories,
      customerTypes: rule.customerTypes,
      usageLimit: rule.usageLimit?.toString() || ""
    });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = () => {
    if (!ruleFormData.code || !ruleFormData.name || !ruleFormData.value) {
      alert("Please fill in all required fields");
      return;
    }

    const newRule: DiscountRule = {
      id: selectedRule?.id || (discountRules.length + 1).toString(),
      code: ruleFormData.code.toUpperCase(),
      name: ruleFormData.name,
      type: ruleFormData.type,
      value: parseFloat(ruleFormData.value),
      validFrom: new Date(ruleFormData.validFrom),
      validTo: new Date(ruleFormData.validTo),
      minimumPurchase: parseFloat(ruleFormData.minimumPurchase) || 0,
      applicableProducts: [],
      applicableCategories: ruleFormData.applicableCategories,
      customerTypes: ruleFormData.customerTypes,
      usageLimit: ruleFormData.usageLimit ? parseInt(ruleFormData.usageLimit) : undefined,
      usedCount: selectedRule?.usedCount || 0,
      status: new Date(ruleFormData.validFrom) > new Date() ? "Scheduled" : "Active",
      createdBy: "Current User",
      createdAt: selectedRule?.createdAt || new Date()
    };

    if (selectedRule) {
      setDiscountRules(discountRules.map(r => r.id === selectedRule.id ? newRule : r));
    } else {
      setDiscountRules([...discountRules, newRule]);
    }

    setIsRuleModalOpen(false);
  };

  const handleAddPromo = () => {
    setPromoFormData({
      name: "",
      type: "Buy X Get Y",
      details: "",
      validFrom: "",
      validTo: ""
    });
    setIsPromoModalOpen(true);
  };

  const ruleColumns: DataTableColumn<DiscountRule>[] = [
    {
      key: "code",
      label: "Discount Code",
      render: (item) => (
        <div>
          <div className="font-mono font-semibold text-black">{item.code}</div>
          <div className="text-xs text-gray-500">{item.name}</div>
        </div>
      )
    },
    {
      key: "discount",
      label: "Discount Value",
      render: (item) => (
        <div className="text-black font-semibold">
          {item.type === "Percentage" ? `${item.value}%` : `$${item.value.toFixed(2)}`}
        </div>
      )
    },
    {
      key: "validity",
      label: "Valid Period",
      render: (item) => (
        <div>
          <div className="text-black text-sm">
            {new Date(item.validFrom).toLocaleDateString()} - {new Date(item.validTo).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: "minimumPurchase",
      label: "Min Purchase",
      render: (item) => (
        <div className="text-black">
          {item.minimumPurchase > 0 ? `$${item.minimumPurchase.toFixed(2)}` : "No minimum"}
        </div>
      )
    },
    {
      key: "applicable",
      label: "Applicable To",
      render: (item) => (
        <div>
          <div className="text-black text-sm">
            {item.applicableCategories.join(", ") || "All Products"}
          </div>
          <div className="text-xs text-gray-500">
            {item.customerTypes.join(", ")} Customers
          </div>
        </div>
      )
    },
    {
      key: "usage",
      label: "Usage",
      render: (item) => (
        <div>
          <div className="text-black">
            {item.usedCount}{item.usageLimit ? `/${item.usageLimit}` : ""}
          </div>
          {item.usageLimit && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${(item.usedCount / item.usageLimit) * 100}%` }}
              />
            </div>
          )}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.status === "Active" ? "bg-green-100 text-green-700" :
          item.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
          item.status === "Expired" ? "bg-gray-100 text-gray-700" :
          "bg-red-100 text-red-700"
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEditRule(item)}>
            Edit
          </Button>
          {item.status === "Active" && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setDiscountRules(discountRules.map(r => 
                  r.id === item.id ? { ...r, status: "Inactive" } : r
                ));
              }}
            >
              Disable
            </Button>
          )}
        </div>
      )
    }
  ];

  const promoColumns: DataTableColumn<PromotionalOffer>[] = [
    {
      key: "name",
      label: "Promotion Name",
      render: (item) => (
        <div>
          <div className="font-semibold text-black">{item.name}</div>
          <div className="text-xs text-gray-500">{item.details}</div>
        </div>
      )
    },
    {
      key: "type",
      label: "Type",
      render: (item) => (
        <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">
          {item.type}
        </span>
      )
    },
    {
      key: "validity",
      label: "Valid Period",
      render: (item) => (
        <div className="text-black text-sm">
          {new Date(item.validFrom).toLocaleDateString()} - {new Date(item.validTo).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "performance",
      label: "Performance",
      render: (item) => (
        <div>
          <div className="text-black font-semibold">${item.revenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500">{item.orderCount} orders</div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          item.status === "Active" ? "bg-green-100 text-green-700" :
          item.status === "Scheduled" ? "bg-blue-100 text-blue-700" :
          "bg-gray-100 text-gray-700"
        }`}>
          {item.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <Button size="sm" variant="outline">
          Edit
        </Button>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Discount & Promotional Management"
        description="Configure discount rules and promotional offers"
      />

      {/* Tab Navigation */}
      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "rules"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Discount Rules
        </button>
        <button
          onClick={() => setActiveTab("promotions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "promotions"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-black hover:text-blue-600"
          }`}
        >
          Promotional Offers
        </button>
      </div>

      {/* DISCOUNT RULES TAB */}
      {activeTab === "rules" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button onClick={handleAddRule}>
              <Plus size={16} className="mr-2" />
              Create Discount Code
            </Button>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <DataTable
              data={discountRules}
              columns={ruleColumns}
              searchPlaceholder="Search discount codes..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* PROMOTIONAL OFFERS TAB */}
      {activeTab === "promotions" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button onClick={handleAddPromo}>
              <Plus size={16} className="mr-2" />
              Create Promotion
            </Button>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <DataTable
              data={promotionalOffers}
              columns={promoColumns}
              searchPlaceholder="Search promotions..."
              onSearch={() => {}}
            />
          </div>
        </div>
      )}

      {/* Discount Rule Modal */}
      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title={selectedRule ? "Edit Discount Rule" : "Create Discount Rule"}
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRule}>
              {selectedRule ? "Update" : "Create"} Rule
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount Code"
              name="code"
              value={ruleFormData.code}
              onChange={(e) => setRuleFormData({ ...ruleFormData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., NEWYEAR2026"
              required
            />
            <Input
              label="Name"
              name="name"
              value={ruleFormData.name}
              onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
              placeholder="e.g., New Year Sale"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Discount Type</label>
              <select
                className="w-full border rounded px-3 py-2 text-black"
                value={ruleFormData.type}
                onChange={(e) => setRuleFormData({ ...ruleFormData, type: e.target.value as "Percentage" | "Fixed Amount" })}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed Amount">Fixed Amount ($)</option>
              </select>
            </div>
            <Input
              label={`Value ${ruleFormData.type === "Percentage" ? "(%)" : "($)"}`}
              name="value"
              type="number"
              value={ruleFormData.value}
              onChange={(e) => setRuleFormData({ ...ruleFormData, value: e.target.value })}
              placeholder={ruleFormData.type === "Percentage" ? "e.g., 15" : "e.g., 50"}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              name="validFrom"
              type="date"
              value={ruleFormData.validFrom}
              onChange={(e) => setRuleFormData({ ...ruleFormData, validFrom: e.target.value })}
              required
            />
            <Input
              label="Valid To"
              name="validTo"
              type="date"
              value={ruleFormData.validTo}
              onChange={(e) => setRuleFormData({ ...ruleFormData, validTo: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Purchase ($)"
              name="minimumPurchase"
              type="number"
              value={ruleFormData.minimumPurchase}
              onChange={(e) => setRuleFormData({ ...ruleFormData, minimumPurchase: e.target.value })}
              placeholder="0 for no minimum"
            />
            <Input
              label="Usage Limit"
              name="usageLimit"
              type="number"
              value={ruleFormData.usageLimit}
              onChange={(e) => setRuleFormData({ ...ruleFormData, usageLimit: e.target.value })}
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Applicable Categories</label>
            <div className="flex flex-wrap gap-2">
              {["All", "Smartphones", "Accessories", "Parts"].map(cat => (
                <label key={cat} className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleFormData.applicableCategories.includes(cat)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRuleFormData({ 
                          ...ruleFormData, 
                          applicableCategories: [...ruleFormData.applicableCategories, cat] 
                        });
                      } else {
                        setRuleFormData({ 
                          ...ruleFormData, 
                          applicableCategories: ruleFormData.applicableCategories.filter(c => c !== cat) 
                        });
                      }
                    }}
                  />
                  <span className="text-sm text-black">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Customer Type Restrictions</label>
            <div className="flex flex-wrap gap-2">
              {["All", "New", "Regular", "VIP"].map(type => (
                <label key={type} className="flex items-center gap-2 px-3 py-2 border rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleFormData.customerTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRuleFormData({ 
                          ...ruleFormData, 
                          customerTypes: [...ruleFormData.customerTypes, type] 
                        });
                      } else {
                        setRuleFormData({ 
                          ...ruleFormData, 
                          customerTypes: ruleFormData.customerTypes.filter(t => t !== type) 
                        });
                      }
                    }}
                  />
                  <span className="text-sm text-black">{type}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Promotional Offer Modal */}
      <Modal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        title="Create Promotional Offer"
        size="lg"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setIsPromoModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsPromoModalOpen(false)}>
              Create Promotion
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Promotion Name"
            name="name"
            value={promoFormData.name}
            onChange={(e) => setPromoFormData({ ...promoFormData, name: e.target.value })}
            placeholder="e.g., Buy iPhone Get AirPods"
            required
          />

          <div>
            <label className="block text-sm font-medium text-black mb-2">Promotion Type</label>
            <select
              className="w-full border rounded px-3 py-2 text-black"
              value={promoFormData.type}
              onChange={(e) => setPromoFormData({ ...promoFormData, type: e.target.value as any })}
            >
              <option value="Buy X Get Y">Buy X Get Y Free</option>
              <option value="Bundle">Bundle Discount</option>
              <option value="Seasonal">Seasonal Sale</option>
              <option value="Flash Sale">Flash Sale</option>
            </select>
          </div>

          <Input
            label="Details"
            name="details"
            type="textarea"
            value={promoFormData.details}
            onChange={(e) => setPromoFormData({ ...promoFormData, details: e.target.value })}
            placeholder="Describe the promotion details..."
            rows={3}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valid From"
              name="validFrom"
              type="datetime-local"
              value={promoFormData.validFrom}
              onChange={(e) => setPromoFormData({ ...promoFormData, validFrom: e.target.value })}
              required
            />
            <Input
              label="Valid To"
              name="validTo"
              type="datetime-local"
              value={promoFormData.validTo}
              onChange={(e) => setPromoFormData({ ...promoFormData, validTo: e.target.value })}
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-black">
            <strong>Configuration:</strong> After creating the promotion, you'll need to configure 
            the specific products, quantities, and rules that apply to this offer.
          </div>
        </div>
      </Modal>
    </div>
  );
}
