import api from "./api";

export const getSellerProfile = async (sellerId: number) => {
  const response = await api.get(`/v1/members/${sellerId}/public-profile`);
  return response.data;
};