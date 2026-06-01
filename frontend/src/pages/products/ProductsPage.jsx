import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, createProduct, deleteProduct, deleteProducts } from "../../api/products";
import Table from "../../components/Table";
import ProductForm from "../../components/forms/ProductForm";

const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

function normalizeCategory(category) {
  return category?.trim() || "Uncategorized";
}

function sortProducts(products, sortBy) {
  const sorted = [...products];
  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    case "price-desc":
      return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    case "newest":
      return sorted.sort((a, b) => b.id - a.id);
    case "oldest":
      return sorted.sort((a, b) => a.id - b.id);
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => normalizeCategory(p.category)))];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const displayedProducts = useMemo(() => {
    const filtered =
      categoryFilter === "all"
        ? products
        : products.filter((p) => normalizeCategory(p.category) === categoryFilter);
    return sortProducts(filtered, sortBy);
  }, [products, categoryFilter, sortBy]);

  const createMut = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      setShowForm(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Failed to create product.");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries(["products"]),
  });

  const bulkDeleteMut = useMutation({
    mutationFn: deleteProducts,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      exitBulkDeleteMode();
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Failed to delete selected products.");
    },
  });

  const exitBulkDeleteMode = () => {
    setBulkDeleteMode(false);
    setSelectedIds(new Set());
  };

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const visibleIds = displayedProducts.map((p) => p.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  };

  const handleBulkAction = () => {
    if (selectedIds.size === 0) {
      exitBulkDeleteMode();
      return;
    }
    const count = selectedIds.size;
    if (confirm(`Delete ${count} selected product(s)? This cannot be undone.`)) {
      bulkDeleteMut.mutate([...selectedIds]);
    }
  };

  const handleSingleDelete = (row) => {
    if (confirm(`Delete "${row.name}"?`)) {
      deleteMut.mutate(row.id);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <Link to={`/products/${row.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
          {row.name}
        </Link>
      ),
    },
    { key: "sku", header: "SKU", render: (row) => <span className="figure">{row.sku}</span> },
    { key: "category", header: "Category" },
    {
      key: "price",
      header: "Price",
      render: (row) => (
        <span className="figure">{`₹${parseFloat(row.price).toFixed(2)}`}</span>
      ),
    },
    {
      key: "quantity_in_stock",
      header: "In Stock",
      render: (row) => {
        const isLow = row.quantity_in_stock <= row.reorder_level;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium figure ${
              isLow ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {row.quantity_in_stock} {row.unit}
          </span>
        );
      },
    },
    { key: "reorder_level", header: "Reorder At", render: (row) => <span className="figure">{row.reorder_level}</span> },
    { key: "supplier", header: "Supplier" },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/products/${row.id}`} className="btn-secondary text-xs px-3 py-1">
            View
          </Link>
          {!bulkDeleteMode && (
            <button
              type="button"
              className="btn-danger text-xs px-3 py-1"
              onClick={() => handleSingleDelete(row)}
              disabled={deleteMut.isPending}
            >
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  const allSelected =
    displayedProducts.length > 0 &&
    displayedProducts.every((p) => selectedIds.has(p.id));
  const indeterminate = selectedIds.size > 0 && !allSelected;

  const productCountLabel =
    categoryFilter === "all" && sortBy === "default"
      ? `${products.length} product(s)`
      : `${displayedProducts.length} of ${products.length} product(s)`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          {productCountLabel}
          {bulkDeleteMode && selectedIds.size > 0 && (
            <span className="ml-2 text-gray-700">· {selectedIds.size} selected</span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {!bulkDeleteMode ? (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setBulkDeleteMode(true);
                  setSelectedIds(new Set());
                  setError(null);
                }}
              >
                Delete Multiple
              </button>
              <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
                {showForm ? "Cancel" : "+ Add Product"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={selectedIds.size > 0 ? "btn-danger" : "btn-secondary"}
              onClick={handleBulkAction}
              disabled={bulkDeleteMut.isPending}
            >
              {bulkDeleteMut.isPending
                ? "Deleting..."
                : selectedIds.size > 0
                  ? "Delete Selected"
                  : "Cancel Deletion"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && !bulkDeleteMode && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">New Product</h2>
          <ProductForm onSubmit={createMut.mutate} loading={createMut.isPending} />
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <div className="card px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="category-filter" className="text-sm font-medium text-gray-600">
                Category
              </label>
              <select
                id="category-filter"
                className="select w-auto min-w-[9.5rem] py-1.5"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={bulkDeleteMode}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-sm font-medium text-gray-600">
                Sort by
              </label>
              <select
                id="sort-by"
                className="select w-auto min-w-[10.5rem] py-1.5"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={bulkDeleteMode}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary text-sm py-1.5"
            onClick={() => {
              setCategoryFilter("all");
              setSortBy("default");
            }}
            disabled={bulkDeleteMode || (categoryFilter === "all" && sortBy === "default")}
          >
            Clear Filters
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading products...</p>
      ) : (
        <Table
          columns={columns}
          data={displayedProducts}
          emptyMessage={
            products.length === 0
              ? "No products yet. Add one above."
              : "No products match the selected filter."
          }
          selection={
            bulkDeleteMode
              ? {
                  enabled: true,
                  selectedIds,
                  onToggleRow: toggleRow,
                  onToggleAll: toggleAll,
                  allSelected,
                  indeterminate,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
