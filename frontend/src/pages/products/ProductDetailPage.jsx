import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProduct, updateProduct, deleteProduct } from "../../api/products";
import ProductForm from "../../components/forms/ProductForm";

function DetailRow({ label, value, figure: useFigure }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 ${useFigure ? "figure" : ""}`}>{value ?? "—"}</dd>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
  });

  const updateMut = useMutation({
    mutationFn: (payload) => updateProduct({ id: Number(id), ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries(["product", id]);
      queryClient.invalidateQueries(["products"]);
      setIsEditing(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Failed to update product.");
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteProduct(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      navigate("/products");
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Failed to delete product.");
    },
  });

  const handleDelete = () => {
    if (confirm(`Delete "${product?.name}"? This cannot be undone.`)) {
      deleteMut.mutate();
    }
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading product...</p>;
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">Product not found.</p>
        <Link to="/products" className="btn-secondary inline-flex">
          Back to Products
        </Link>
      </div>
    );
  }

  const formDefaults = {
    name: product.name,
    sku: product.sku,
    category: product.category ?? "",
    supplier: product.supplier ?? "",
    unit: product.unit ?? "pcs",
    price: String(product.price),
    quantity_in_stock: String(product.quantity_in_stock),
    reorder_level: String(product.reorder_level ?? 0),
  };

  const isLowStock = product.quantity_in_stock <= product.reorder_level;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/products" className="text-sm text-blue-600 hover:text-blue-800">
          ← Back to Products
        </Link>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {!isEditing && (
            <button type="button" className="btn-secondary" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={deleteMut.isPending}
          >
            {deleteMut.isPending ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {isEditing ? (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Edit Product</h2>
          <ProductForm
            isEdit
            defaultValues={formDefaults}
            onSubmit={updateMut.mutate}
            loading={updateMut.isPending}
          />
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => {
              setIsEditing(false);
              setError(null);
            }}
          >
            Cancel Edit
          </button>
        </div>
      ) : (
        <div className="card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-500 figure mt-1">{product.sku}</p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium figure ${
                isLowStock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {product.quantity_in_stock} {product.unit} in stock
            </span>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <DetailRow label="Category" value={product.category} />
            <DetailRow label="Supplier" value={product.supplier} />
            <DetailRow label="Unit" value={product.unit} />
            <DetailRow label="Price" value={`₹${parseFloat(product.price).toFixed(2)}`} figure />
            <DetailRow label="Quantity in Stock" value={product.quantity_in_stock} figure />
            <DetailRow label="Reorder Level" value={product.reorder_level} figure />
            <DetailRow label="Status" value={product.archived ? "Archived" : "Active"} />
          </dl>
        </div>
      )}
    </div>
  );
}
