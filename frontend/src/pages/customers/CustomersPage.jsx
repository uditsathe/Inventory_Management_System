import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCustomers, createCustomer, deleteCustomer } from "../../api/customers";
import Table from "../../components/Table";
import CustomerForm from "../../components/forms/CustomerForm";

export default function CustomersPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const createMut = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      setShowForm(false);
      setError(null);
    },
    onError: (err) => {
      setError(err.response?.data?.detail || "Failed to create customer.");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries(["customers"]),
  });

  const columns = [
    { key: "full_name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "location",
      header: "Location",
      render: (row) => [row.city, row.state, row.country].filter(Boolean).join(", ") || "—",
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button
          className="btn-danger text-xs px-3 py-1"
          onClick={() => {
            if (confirm(`Delete customer "${row.full_name}"?`)) deleteMut.mutate(row.id);
          }}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">{customers.length} customer(s)</p>
        <button className="btn-primary w-full sm:w-auto" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {showForm && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">New Customer</h2>
          {error && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <CustomerForm onSubmit={createMut.mutate} loading={createMut.isPending} />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading customers...</p>
      ) : (
        <Table columns={columns} data={customers} emptyMessage="No customers yet. Add one above." />
      )}
    </div>
  );
}
