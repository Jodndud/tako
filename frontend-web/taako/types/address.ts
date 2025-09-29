// 등록용
export interface AddressRequest {
    placeName: string|null;
    name: string|null;
    phone: string|null;
    baseAddress: string|null;
    addressDetail: string|null;
    zipcode: string|null;
    setAsDefault: boolean;
}
// 조회용
export interface AddressResponse {
    id: number;
    placeName: string;
    baseAddress: string;
    zipcode: string;
    default: boolean;
}

// 상세 조회/생성/수정 응답 (result 스키마)
export interface AddressDetail {
  id: number;
  placeName: string;
  name: string;
  phone: string;
  baseAddress: string;
  addressDetail: string;
  zipcode: string;
  default: boolean;
}

// 기본 배송지 조회
export interface GetDefaultAddress {
    id: number;
    placeName: string;
    baseAddress: string;
    zipcode: string;
}

// 조회용
export interface AddressResponse {
    id: number;
    placeName: string;
    baseAddress: string;
    zipcode: string;
    default: boolean;
}