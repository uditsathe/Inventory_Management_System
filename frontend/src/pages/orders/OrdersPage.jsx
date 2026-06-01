import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchOrders, deleteOrder, updateOrder } from "../../api/orders";
import Table from "../../components/Table";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const deleteMut = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => queryClient.invalidateQueries(["orders"]),
  });

  const updateMut = useMutation({
    mutationFn: updateOrder,
    onSuccess: () => queryClient.invalidateQueries(["orders"]),
  });

  const columns = [
    {
      key: "id",
      header: "Order #",
      render: (row) => (
        <Link
          to={`/orders/${row.id}`}
          className="figure text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          #{row.id}
        </Link>
      ),
    },
    {
      key: "customer_id",
      header: "Customer ID",
      render: (row) => <span className="figure text-gray-600">#{row.customer_id}</span>,
    },
    {
      key: "order_date",
      header: "Date",
      render: (row) => new Date(row.order_date).toLocaleDateString("en-IN"),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <select
          value={row.status}
          onChange={(e) => updateMut.mutate({ id: row.id, status: e.target.value })}
          className={`text-xs font-medium px-2 py-1 rounded border-0 focus:ring-1 focus:ring-blue-400 figure uppercase ${STATUS_COLORS[row.status] || "bg-gray-100 text-gray-700"}`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    },
    {
      key: "total_amount",
      header: "Total",
      render: (row) => (
        <span className="figure">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: row.currency || "INR" }).format(row.total_amount)}
        </span>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (row) => `${(row.items || []).length} item(s)`,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/orders/${row.id}`} className="btn-secondary text-xs px-3 py-1">
            View
          </Link>
          <button
            className="btn-danger text-xs px-3 py-1"
            onClick={() => {
              if (confirm(`Delete Order #${row.id}?`)) deleteMut.mutate(row.id);
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">{orders.length} order(s)</p>
        <Link to="/orders/new" className="btn-primary w-full sm:w-auto text-center">
          + New Order
        </Link>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading orders...</p>
      ) : (
        <Table columns={columns} data={orders} emptyMessage="No orders yet. Create one." />
      )}
    </div>
  );
}
