import { api } from "./client";

export const fetchCustomers = async () => {
  const res = await api.get("/customers");
  return res.data;
};

export const fetchCustomer = async (id) => {
  const res = await api.get(`/customers/${id}`);
  return res.data;
};

export const createCustomer = async (payload) => {
  const res = await api.post("/customers", payload);
  return res.data;
};

export const updateCustomer = async ({ id, ...payload }) => {
  const res = await api.put(`/customers/${id}`, payload);
  return res.data;
};

export const deleteCustomer = async (id) => {
  await api.delete(`/customers/${id}`);
};
