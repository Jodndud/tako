// lib/wish.ts
import api from "./api";

export async function addWishAuction(auctionId: number | string, signal?: AbortSignal) {
  const res = await api.post(`/v1/wishes/auctions/${auctionId}`, null, { signal });
  return res.data; // { isSuccess, ... } 형태라면 호출부에서 체크해도 됨
}

export async function removeWishAuction(auctionId: number | string, signal?: AbortSignal) {
  const res = await api.delete(`/v1/wishes/auctions/${auctionId}`, { data: {}, signal });
  return res.data;
}

export async function addWishCard(cardId: number | string, signal?: AbortSignal) {
  const res = await api.post(`/v1/wishes/cards/${cardId}`, null, { signal });
  return res.data;
}

export async function removeWishCard(cardId: number | string, signal?: AbortSignal) {
  const res = await api.delete(`/v1/wishes/cards/${cardId}`, { data: {}, signal });
  return res.data;
}

export async function getWishCard(cardId: number | string, signal?: AbortSignal) {
  const res = await api.get(`/v1/wishes/cards/${cardId}?page=0&size=20`, { signal });
  return res.data;
}

export async function getAllWishCards(page: number = 0, size: number = 20, signal?: AbortSignal) {
  const res = await api.get(`/v1/wishes/cards?page=${page}&size=${size}`, { signal });
  return res.data;
}

export async function getAllWishAuctions(page: number = 0, size: number = 20, signal?: AbortSignal) {
  const res = await api.get(`/v1/wishes/auctions?page=${page}&size=${size}`, { signal });
  return res.data;
}