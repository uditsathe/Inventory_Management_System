import { api } from "./client";

export const fetchSummary = async () => {
  const res = await api.get("/dashboard/summary");
  return res.data;
};

export const fetchOrdersVolume = async (days = 14) => {
  const res = await api.get(`/dashboard/orders_volume?days=${days}`);
  return res.data;
};
