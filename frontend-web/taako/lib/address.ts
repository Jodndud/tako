// lib/address.ts
import api from "./api";
import type { AddressRequest, AddressResponse, AddressDetail } from "@/types/address";

// 배송지 등록 (POST /v1/addresses)
export const addMyAddress = async (
  placeName: string,
  name: string,
  phone: string,
  baseAddress: string,
  addressDetail: string,
  zipcode: string,
  setAsDefault: boolean,
): Promise<AddressDetail> => {
  const res = await api.post("/v1/addresses", {
    placeName,
    name,
    phone,
    baseAddress,
    addressDetail,
    zipcode,
    setAsDefault,
  });
  return res.data.result as AddressDetail; // ★ result만 반환
};

// 배송지 목록 요약 (GET /v1/addresses)
export const getMyAddress = async (): Promise<AddressResponse[]> => {
  const res = await api.get("/v1/addresses");
  return res.data.result as AddressResponse[]; // ★ result만 반환
};

// 배송지 상세 (GET /v1/addresses/{id}) — 필요하면 사용
export const getAddressDetail = async (addressId: number): Promise<AddressDetail> => {
  const res = await api.get(`/v1/addresses/${addressId}`);
  return res.data.result as AddressDetail;
};

// 배송지 수정 (PUT /v1/addresses/{id}) — 필요하면 사용
export const updateMyAddress = async (addressId: number, body: AddressRequest): Promise<AddressDetail> => {
  const res = await api.put(`/v1/addresses/${addressId}`, body);
  return res.data.result as AddressDetail;
};

// 배송지 삭제 (DELETE /v1/addresses/{id})
export const deleteMyAddress = async (addressId: number): Promise<void> => {
  await api.delete(`/v1/addresses/${addressId}`);
};

// 기본 배송지 설정 (POST /v1/addresses/{id}/default)
export const defaultAddAddress = async (addressId: number): Promise<{
  id: number; placeName: string; baseAddress: string; zipcode: string;
}> => {
  const res = await api.post(`/v1/addresses/${addressId}/default`);
  return res.data.result;
};

// 기본 배송지 조회 (GET /v1/addresses/default)
export const getDefaultMyAddress = async (): Promise<AddressDetail | null> => {
  const res = await api.get("/v1/addresses/default");
  const r = res.data?.result;
  // 스웨거 예시에 {}가 올 수 있으므로 안전 처리
  if (!r || r.id == null) return null;
  return r as AddressDetail;
};
