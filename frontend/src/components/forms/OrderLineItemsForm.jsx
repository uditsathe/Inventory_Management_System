import { useState } from "react";

export default function OrderLineItemsForm({ products, items, onChange }) {
  const addItem = () => {
    onChange([...items, { product_id: "", quantity: 1 }]);
  };

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  const getProduct = (id) => products.find((p) => p.id === parseInt(id));

  const lineTotal = (item) => {
    const product = getProduct(item.product_id);
    if (!product || !item.quantity) return null;
    return (parseFloat(product.price) * parseInt(item.quantity)).toFixed(2);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const product = getProduct(item.product_id);
        const total = lineTotal(item);
        return (
          <div key={index} className="flex flex-col sm:flex-row sm:items-end gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1 w-full min-w-0">
              <label className="label">Product *</label>
              <select
                className="input"
                value={item.product_id}
                onChange={(e) => updateItem(index, "product_id", e.target.value)}
                required
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{parseFloat(p.price).toFixed(2)} ({p.quantity_in_stock} in stock)
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-28">
              <label className="label">Quantity *</label>
              <input
                className="input"
                type="number"
                min="1"
                max={product?.quantity_in_stock ?? undefined}
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                required
              />
            </div>
            <div className="w-full sm:w-32 sm:text-right">
              <p className="label">Line Total</p>
              <p className="text-sm font-semibold text-gray-800 py-2">
                {total ? <span className="figure">{`₹${total}`}</span> : "—"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="btn-danger px-3 py-2 text-xs w-full sm:w-auto"
            >
              Remove
            </button>
          </div>
        );
      })}
      <button type="button" onClick={addItem} className="btn-secondary w-full">
        + Add Line Item
      </button>
    </div>
  );
}
