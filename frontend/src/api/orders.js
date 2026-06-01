import { api } from "./client";

export const fetchOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

export const fetchOrder = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

export const createOrder = async (payload) => {
  const res = await api.post("/orders", payload);
  return res.data;
};

export const updateOrder = async ({ id, ...payload }) => {
  const res = await api.put(`/orders/${id}`, payload);
  return res.data;
};

export const deleteOrder = async (id) => {
  await api.delete(`/orders/${id}`);
};
