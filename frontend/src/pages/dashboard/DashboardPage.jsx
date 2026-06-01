import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchSummary, fetchOrdersVolume } from "../../api/dashboard";
import { fetchProducts } from "../../api/products";
import { fetchOrders } from "../../api/orders";
import KpiCard from "../../components/KpiCard";
import Table from "../../components/Table";
import BreakdownOverlay, {
  STATUS_COLORS,
} from "../../components/BreakdownOverlay";

function groupByCategory(products) {
  const counts = {};
  for (const product of products) {
    const category = product.category?.trim() || "Uncategorized";
    counts[category] = (counts[category] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function groupByStatus(orders) {
  const counts = {};
  for (const order of orders) {
    const status = order.status || "UNKNOWN";
    counts[status] = (counts[status] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const ProductIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
    />
  </svg>
);

const CustomerIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const OrderIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  </svg>
);

const RevenueIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const lowStockColumns = [
  { key: "name", header: "Product" },
  { key: "sku", header: "SKU", render: (row) => <span className="figure">{row.sku}</span> },
  {
    key: "quantity_in_stock",
    header: "In Stock",
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 figure">
        {row.quantity_in_stock}
      </span>
    ),
  },
  {
    key: "reorder_level",
    header: "Reorder At",
    render: (row) => <span className="figure">{row.reorder_level}</span>,
  },
];

const bestSellerColumns = [
  { key: "name", header: "Product" },
  {
    key: "total_quantity",
    header: "Units Sold",
    render: (row) => <span className="figure">{row.total_quantity}</span>,
  },
];

export default function DashboardPage() {
  const [breakdown, setBreakdown] = useState(null);

  const { data: summary, isLoading: loadingSum } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchSummary,
  });

  const { data: volume, isLoading: loadingVol } = useQuery({
    queryKey: ["orders-volume"],
    queryFn: () => fetchOrdersVolume(14),
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    enabled: breakdown === "products",
  });

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    enabled: breakdown === "orders",
  });

  const categoryBreakdown = useMemo(
    () => (breakdown === "products" ? groupByCategory(products) : []),
    [breakdown, products],
  );

  const statusBreakdown = useMemo(
    () => (breakdown === "orders" ? groupByStatus(orders) : []),
    [breakdown, orders],
  );

  if (loadingSum || loadingVol) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Loading dashboard...
      </div>
    );
  }

  const totals = summary?.totals ?? {};
  const lowStock = summary?.low_stock ?? [];
  const bestSellers = summary?.best_sellers ?? [];
  const volumePoints = volume?.points ?? [];

  const formatINR = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Products"
          value={totals.products ?? 0}
          icon={<ProductIcon />}
          color="blue"
          onClick={() => setBreakdown("products")}
        />
        <KpiCard
          title="Total Orders"
          value={totals.orders ?? 0}
          icon={<OrderIcon />}
          color="purple"
          onClick={() => setBreakdown("orders")}
        />
        <KpiCard
          title="Total Customers"
          value={totals.customers ?? 0}
          icon={<CustomerIcon />}
          color="green"
        />
        <KpiCard
          title="Total Revenue"
          value={formatINR(totals.revenue ?? 0)}
          icon={<RevenueIcon />}
          color="orange"
        />
      </div>

      {/* Chart */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Orders Volume (Last 14 Days)
        </h2>
        {volumePoints.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={volumePoints}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ECEDEA" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [v, "Orders"]}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#155E8A"
                strokeWidth={2}
                dot={{ r: 3, fill: "#155E8A" }}
                activeDot={{ r: 5, fill: "#155E8A" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">
            No order data in the last 14 days.
          </p>
        )}
      </div>

      {/* Low stock + Best sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`card p-5 ${lowStock.length > 0 ? "low-stock-card-alert" : ""}`}>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Low Stock Alert
            {lowStock.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 figure">
                {lowStock.length}
              </span>
            )}
          </h2>
          <Table
            columns={lowStockColumns}
            data={lowStock}
            emptyMessage="All products are well-stocked."
          />
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Best Sellers
          </h2>
          <Table
            columns={bestSellerColumns}
            data={bestSellers}
            emptyMessage="No sales data yet."
          />
        </div>
      </div>

      {breakdown === "products" && (
        <BreakdownOverlay
          title="Products by Category"
          subtitle={`${totals.products ?? 0} products across ${categoryBreakdown.length} categories`}
          data={categoryBreakdown}
          isLoading={loadingProducts}
          onClose={() => setBreakdown(null)}
        />
      )}

      {breakdown === "orders" && (
        <BreakdownOverlay
          title="Orders by Status"
          subtitle={`${totals.orders ?? 0} orders across ${statusBreakdown.length} statuses`}
          data={statusBreakdown}
          colorMap={STATUS_COLORS}
          isLoading={loadingOrders}
          onClose={() => setBreakdown(null)}
        />
      )}
    </div>
  );
}
