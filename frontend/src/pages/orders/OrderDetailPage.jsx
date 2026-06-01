import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrder, deleteOrder, updateOrder } from "../../api/orders";
import { fetchCustomer } from "../../api/customers";
import { fetchProducts } from "../../api/products";
import Table from "../../components/Table";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

function DetailRow({ label, value, figure: useFigure }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 break-words ${useFigure ? "figure" : ""}`}>
        {value ?? "—"}
      </dd>
    </div>
  );
}

function formatCurrency(amount, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
  });

  const { data: customer } = useQuery({
    queryKey: ["customer", order?.customer_id],
    queryFn: () => fetchCustomer(order.customer_id),
    enabled: Boolean(order?.customer_id),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const updateMut = useMutation({
    mutationFn: (payload) => updateOrder({ id: Number(id), ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries(["order", id]);
      queryClient.invalidateQueries(["orders"]);
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteOrder(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      navigate("/orders");
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete Order #${id}? This cannot be undone.`)) {
      deleteMut.mutate();
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading order...</p>;
  }

  if (isError || !order) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Order not found.</p>
        <Link to="/orders" className="btn-secondary inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const lineItemColumns = [
    {
      key: "product",
      header: "Product",
      render: (row) => {
        const product = productMap[row.product_id];
        return product ? (
          <Link
            to={`/products/${product.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {product.name}
          </Link>
        ) : (
          <span className="figure text-gray-500">Product #{row.product_id}</span>
        );
      },
    },
    {
      key: "sku",
      header: "SKU",
      render: (row) => (
        <span className="figure text-gray-500">{productMap[row.product_id]?.sku ?? "—"}</span>
      ),
    },
    {
      key: "quantity",
      header: "Qty",
      render: (row) => <span className="figure">{row.quantity}</span>,
    },
    {
      key: "unit_price",
      header: "Unit Price",
      render: (row) => (
        <span className="figure">{formatCurrency(row.unit_price, order.currency)}</span>
      ),
    },
    {
      key: "line_total",
      header: "Line Total",
      render: (row) => (
        <span className="figure">{formatCurrency(row.line_total, order.currency)}</span>
      ),
    },
  ];

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Orders
        </Link>
        <button
          type="button"
          className="btn-danger w-full sm:w-auto"
          onClick={handleDelete}
          disabled={deleteMut.isPending}
        >
          {deleteMut.isPending ? "Deleting..." : "Delete Order"}
        </button>
      </div>

      <div className="card p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 figure">Order #{order.id}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.order_date).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Status
            </label>
            <select
              value={order.status}
              onChange={(e) => updateMut.mutate({ status: e.target.value })}
              disabled={updateMut.isPending}
              className={`text-xs font-medium px-2 py-1 rounded border-0 focus:ring-1 focus:ring-blue-400 figure uppercase w-full sm:w-auto ${
                STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-100">
          <DetailRow
            label="Total Amount"
            value={formatCurrency(order.total_amount, order.currency)}
            figure
          />
          <DetailRow label="Currency" value={order.currency} />
          <DetailRow label="Line Items" value={`${(order.items || []).length} item(s)`} />
          <DetailRow label="Customer ID" value={`#${order.customer_id}`} figure />
        </dl>

        {customer && (
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <DetailRow label="Name" value={customer.full_name} />
              <DetailRow label="Email" value={customer.email} />
              <DetailRow label="Phone" value={customer.phone} />
              <DetailRow
                label="Location"
                value={[customer.city, customer.state, customer.country].filter(Boolean).join(", ")}
              />
            </dl>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Line Items</h3>
          <Table
            columns={lineItemColumns}
            data={order.items || []}
            emptyMessage="No line items on this order."
          />
        </div>
      </div>
    </div>
  );
}
