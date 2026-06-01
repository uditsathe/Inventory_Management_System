import { api } from "./client";

export const fetchProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

export const fetchProduct = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (payload) => {
  const res = await api.post("/products", payload);
  return res.data;
};

export const updateProduct = async ({ id, ...payload }) => {
  const res = await api.put(`/products/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};

export const deleteProducts = async (ids) => {
  await Promise.all(ids.map((id) => api.delete(`/products/${id}`)));
};
