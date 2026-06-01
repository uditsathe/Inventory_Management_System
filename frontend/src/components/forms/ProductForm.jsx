import { useState } from "react";

const initialState = {
  name: "",
  sku: "",
  category: "",
  supplier: "",
  unit: "pcs",
  price: "",
  quantity_in_stock: "",
  reorder_level: "0",
};

export default function ProductForm({
  onSubmit,
  loading,
  defaultValues = {},
  isEdit = false,
  submitLabel,
}) {
  const [form, setForm] = useState({ ...initialState, ...defaultValues });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      category: form.category || null,
      supplier: form.supplier || null,
      unit: form.unit || "pcs",
      price: parseFloat(form.price),
      quantity_in_stock: parseInt(form.quantity_in_stock, 10),
      reorder_level: parseInt(form.reorder_level, 10) || 0,
    };
    if (!isEdit) {
      payload.sku = form.sku;
    }
    onSubmit(payload);
  };

  const label = submitLabel ?? (isEdit ? "Update Product" : "Save Product");

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Product Name *</label>
          <input className="input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Laptop Pro 15" />
        </div>
        <div>
          <label className="label">SKU *</label>
          <input
            className={`input ${isEdit ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            name="sku"
            value={form.sku}
            onChange={handleChange}
            required
            readOnly={isEdit}
            placeholder="e.g. ELEC-LP15"
          />
        </div>
        <div>
          <label className="label">Category</label>
          <input className="input" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Electronics" />
        </div>
        <div>
          <label className="label">Supplier</label>
          <input className="input" name="supplier" value={form.supplier} onChange={handleChange} placeholder="e.g. TechSupply Co." />
        </div>
        <div>
          <label className="label">Unit</label>
          <input className="input" name="unit" value={form.unit} onChange={handleChange} placeholder="pcs" />
        </div>
        <div>
          <label className="label">Price (INR) *</label>
          <input className="input" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required placeholder="0.00" />
        </div>
        <div>
          <label className="label">Quantity in Stock *</label>
          <input className="input" name="quantity_in_stock" type="number" min="0" value={form.quantity_in_stock} onChange={handleChange} required placeholder="0" />
        </div>
        <div>
          <label className="label">Reorder Level</label>
          <input className="input" name="reorder_level" type="number" min="0" value={form.reorder_level} onChange={handleChange} placeholder="0" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : label}
        </button>
      </div>
    </form>
  );
}
