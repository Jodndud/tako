import api from "@/lib/api";
import type { DeliveryApiResponse, DeliveryInfo } from "@/types/delivery";

export async function getDelivery(auctionId: number, addressId?: number) {
  // /v1/deliveries/{auctionId} (addressId는 서버 구현에 따라 query or 필요없음)
  const params = addressId ? { addressId } : undefined;
  const { data } = await api.get<DeliveryApiResponse<DeliveryInfo>>(
    `/v1/deliveries/${auctionId}`,
    { params }
  );
  return data;
}

export async function postRecipientAddress(auctionId: number, addressId: number) {
  // POST /v1/deliveries/{auctionId}/recipient/{addressId}
  const { data } = await api.post<DeliveryApiResponse<DeliveryInfo>>(
    `/v1/deliveries/${auctionId}/recipient/${addressId}`
  );
  return data;
}

// (판매자 전용 API는 참고용으로 남김)
// export async function postTrackingNumber(auctionId: number, trackingNumber: string) {
//   const { data } = await api.post<DeliveryApiResponse<DeliveryInfo>>(
//     `/v1/deliveries/${auctionId}/tracking`,
//     null,
//     { params: { auctionId, trackingNumber } }
//   );
//   return data;
// }

// 경매 배송 정보 조회
export const getAuctionDelivery = async(auctionId:number) => {
  const res = await api.get(`/v1/deliveries/${auctionId}`);
  return res.data;
}

// 판매자: 보내는 주소 설정
export const sellerDelivery = async(auctionId:number, addressId:number) => {
  const res = await api.post(`/v1/deliveries/${auctionId}/sender/${addressId}`);
  return res.data;
}

// 판매자: 운송장 등록
export const addTrackingNumber = async(auctionId:number, trackingNumber:string) => {
  const res = await api.post(`/v1/deliveries/${auctionId}/tracking?trackingNumber=${trackingNumber}`);
  return res.data;
}