export type AddressBrief = {
  id: number;
  placeName: string;
  name: string;
  phone: string;
  baseAddress: string;
  addressDetail: string;
  zipcode: string;
};

export type DeliveryStatus =
  | "WAITING"        // 배송준비중
  | "CONFIRMED"      // 구매확정 완료
  | "IN_PROGRESS"      // 배송중
  | "COMPLETED"     // 배송완료
  | "CANCELLED_BY_USER"      // 미사용
  | string;          

export type DeliveryInfo = {
  createdAt: string;
  updatedAt: string;
  id: number;
  senderAddress?: AddressBrief | null;
  recipientAddress?: AddressBrief | null;
  trackingNumber?: string | null;
  status: DeliveryStatus;
};

export type DeliveryApiResponse<T = DeliveryInfo> = {
  httpStatus: any;
  isSuccess: boolean;
  message: string;
  code: number;
  result: T;
};
// 경매 배송 정보 조회
export interface GetAuctionDelivery {
    createdAt: string|null;
    updatedAt: string|null;
    id: number|null;
    senderAddress: {
      id: number|null;
      placeName: string|null;
      name: string|null;
      phone: string|null;
      baseAddress: string|null;
      addressDetail: string|null;
      zipcode: string|null;
    },
    recipientAddress: {
      id: number|null;
      placeName: string|null;
      name: string|null;
      phone: string|null;
      baseAddress: string|null;
      addressDetail: string|null;
      zipcode: string|null;
    },
    trackingNumber: string|null;
    status: string|null;
}
