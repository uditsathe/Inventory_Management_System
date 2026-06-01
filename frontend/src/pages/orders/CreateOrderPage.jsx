import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts } from "../../api/products";
import { fetchCustomers } from "../../api/customers";
import { createOrder } from "../../api/orders";
import OrderLineItemsForm from "../../components/forms/OrderLineItemsForm";

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [status, setStatus] = useState("PENDING");
  const [items, setItems] = useState([{ product_id: "", quantity: 1 }]);
  const [error, setError] = useState(null);

  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: fetchCustomers });

  const createMut = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      queryClient.invalidateQueries(["products"]);
      queryClient.invalidateQueries(["dashboard-summary"]);
      navigate("/orders");
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Failed to create order.");
    },
  });

  const getProduct = (id) => products.find((p) => p.id === parseInt(id));

  const orderTotal = items.reduce((sum, item) => {
    const product = getProduct(item.product_id);
    if (!product || !item.quantity) return sum;
    return sum + parseFloat(product.price) * parseInt(item.quantity);
  }, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) {
      setError("Please add at least one line item.");
      return;
    }
    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    createMut.mutate({
      customer_id: parseInt(customerId),
      status,
      currency,
      items: validItems.map((i) => ({
        product_id: parseInt(i.product_id),
        quantity: parseInt(i.quantity),
      })),
    });
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="card p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Order Details</h2>

        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="label">Customer *</label>
              <select
                className="input"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Line Items</h3>
            <OrderLineItemsForm products={products} items={items} onChange={setItems} />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Order Total</p>
              <p className="text-xl font-bold text-gray-900 figure">
                {new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(orderTotal)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => navigate("/orders")}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={createMut.isPending}>
                {createMut.isPending ? "Creating..." : "Create Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
