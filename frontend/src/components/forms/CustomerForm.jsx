import { useState } from "react";

const initialState = {
  full_name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
};

export default function CustomerForm({ onSubmit, loading, defaultValues = {} }) {
  const [form, setForm] = useState({ ...initialState, ...defaultValues });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" name="full_name" value={form.full_name} onChange={handleChange} required placeholder="e.g. Arjun Sharma" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="arjun@example.com" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+91-9876543210" />
        </div>
        <div>
          <label className="label">Street</label>
          <input className="input" name="street" value={form.street} onChange={handleChange} placeholder="123 Main Street" />
        </div>
        <div>
          <label className="label">City</label>
          <input className="input" name="city" value={form.city} onChange={handleChange} placeholder="Bengaluru" />
        </div>
        <div>
          <label className="label">State</label>
          <input className="input" name="state" value={form.state} onChange={handleChange} placeholder="Karnataka" />
        </div>
        <div>
          <label className="label">Postal Code</label>
          <input className="input" name="postal_code" value={form.postal_code} onChange={handleChange} placeholder="560001" />
        </div>
        <div>
          <label className="label">Country</label>
          <input className="input" name="country" value={form.country} onChange={handleChange} placeholder="India" />
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Save Customer"}
        </button>
      </div>
    </form>
  );
}
