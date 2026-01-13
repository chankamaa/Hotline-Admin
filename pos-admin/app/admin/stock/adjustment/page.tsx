"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Plus, TrendingUp, TrendingDown, Eye, User } from "lucide-react";

import { fetchProducts } from "@/lib/api/productApi";
import { adjustStock, fetchAdjustmentTypes } from "@/lib/api/inventoryApi";

/* --------------------------------------------------
   Component
-------------------------------------------------- */
export default function StockAdjustmentPage() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [adjustmentTypes, setAdjustmentTypes] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewing, setViewing] = useState<any | null>(null);

  /* Product autocomplete (UNCHANGED) */
  const [productSearch, setProductSearch] = useState("");
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [form, setForm] = useState({
    productId: "",
    type: "",
    quantity: 1,
    reason: "",
    reference: "",
    referenceType: "Manual",
  });

  /* --------------------------------------------------
     Load adjustment types
  -------------------------------------------------- */
  useEffect(() => {
    fetchAdjustmentTypes().then((res) =>
      setAdjustmentTypes(res.data.data.types)
    );
  }, []);

  /* --------------------------------------------------
     Product autocomplete search (UNCHANGED)
  -------------------------------------------------- */
  useEffect(() => {
    if (!productSearch || productSearch.length < 2) {
      setProductOptions([]);
      return;
    }

    const loadProducts = async () => {
      const res = await fetchProducts({ search: productSearch });
      setProductOptions(res.data.products);
    };

    loadProducts();
  }, [productSearch]);

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setForm({ ...form, productId: product._id });
    setProductSearch(`${product.name} (${product.sku})`);
    setProductOptions([]);
  };

  /* --------------------------------------------------
     Derived quantities (MODEL-ALIGNED)
  -------------------------------------------------- */
  const previousQuantity = selectedProduct?.quantity ?? 0;

  const isIncrease = ["ADDITION", "PURCHASE", "RETURN", "TRANSFER_IN"].includes(
    form.type
  );

  const newQuantity = isIncrease
    ? previousQuantity + form.quantity
    : previousQuantity - form.quantity;

  /* --------------------------------------------------
     Validation (schema-based)
  -------------------------------------------------- */
  const isValid =
    form.productId &&
    form.type &&
    form.quantity >= 1 &&
    newQuantity >= 0 &&
    form.reason.length <= 500;

  /* --------------------------------------------------
     Create adjustment
  -------------------------------------------------- */
  const handleCreate = async () => {
    if (!isValid) return;

    const res = await adjustStock({
      productId: form.productId,
      type: form.type,
      quantity: form.quantity,
      reason: form.reason || undefined,
      reference: form.reference || undefined,
      referenceType: form.referenceType as any,
    });

    setAdjustments((prev) => [
      {
        ...res.data.data.adjustment,
        stock: res.data.data.stock,
      },
      ...prev,
    ]);

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setForm({
      productId: "",
      type: "",
      quantity: 1,
      reason: "",
      reference: "",
      referenceType: "Manual",
    });
    setProductSearch("");
    setSelectedProduct(null);
  };

  /* --------------------------------------------------
     Table columns
  -------------------------------------------------- */
  const columns = [
    {
      key: "date",
      label: "Date",
      render: (a: any) => new Date(a.createdAt).toLocaleString(),
    },
    {
      key: "product",
      label: "Product",
      render: (a: any) => (
        <div>
          <div className="font-medium">{a.stock.product.name}</div>
          <div className="text-xs text-gray-500">{a.stock.product.sku}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (a: any) => (
        <div className="flex items-center gap-2">
          {a.stock.change > 0 ? (
            <TrendingUp size={16} className="text-green-600" />
          ) : (
            <TrendingDown size={16} className="text-red-600" />
          )}
          {a.type}
        </div>
      ),
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (a: any) => (
        <div>
          <div className="font-bold">
            {a.stock.change > 0 ? "+" : ""}
            {a.quantity}
          </div>
          <div className="text-xs text-gray-500">
            {a.stock.previousQuantity} → {a.stock.newQuantity}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      label: "Adjusted By",
      render: (a: any) => (
        <div className="flex items-center gap-1">
          <User size={14} />
          {a.createdBy.username}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (a: any) => (
        <Button size="sm" variant="outline" onClick={() => setViewing(a)}>
          <Eye size={14} />
        </Button>
      ),
    },
  ];

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */
  return (
    <div className="p-6 text-gray-700">
      <PageHeader
        title="Stock Adjustments"
        description="Inventory adjustment audit trail"
      />

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          New Adjustment
        </Button>
      </div>

      <DataTable data={adjustments} columns={columns} />

      {/* Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Stock Adjustment"
      >
        <div className="space-y-4 relative">
          {/* Product autocomplete (UNCHANGED) */}
          <div className="relative">
            <Input
              label="Product"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search product by name or SKU"
            />

            {productOptions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow">
                {productOptions.map((p) => (
                  <div
                    key={p._id}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelectProduct(p)}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.sku}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quantities */}
          <Input label="Previous Quantity" value={''} disabled />
          <Input label="New Quantity"  type="number" min={1} value={form.quantity} onChange={(e) =>
              setForm({ ...form, quantity: Number(e.target.value) })
            } />

          {/* Adjustment type */}
          <Input
            label="Adjustment Type"
            type="select"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
            options={adjustmentTypes.map((t) => ({
              value: t.value,
              label: `${t.value} (${t.direction})`,
            }))}
          />

          {/* Quantity */}
          <Input
            label="Quantity"
            type="number"
           
            value={''}
           disabled
          />

          {/* Reason */}
          <Input
            label="Reason (max 500 chars)"
            type="textarea"
            maxLength={500}
            value={form.reason}
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />

          {/* Reference */}
          <Input
            label="Reference"
            value={form.reference}
            onChange={(e) =>
              setForm({ ...form, reference: e.target.value })
            }
          />

          {/* Reference Type */}
          <Input
            label="Reference Type"
            type="select"
            value={form.referenceType}
            onChange={(e) =>
              setForm({ ...form, referenceType: e.target.value })
            }
            options={[
              { value: "Manual", label: "Manual" },
              { value: "Sale", label: "Sale" },
              { value: "Purchase", label: "Purchase" },
              { value: "Transfer", label: "Transfer" },
            ]}
          />

          <Button
            onClick={handleCreate}
            className="w-full text-gray-800"
            
          >
            Save Adjustment
          </Button>
        </div>
      </Modal>
    </div>
  );
}
