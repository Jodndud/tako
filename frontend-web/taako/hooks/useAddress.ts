// hooks/useAddress.ts
'use client';

import {
  addMyAddress,
  getMyAddress,
  deleteMyAddress,
  defaultAddAddress,
  getDefaultMyAddress,
  getAddressDetail,
  updateMyAddress
} from "@/lib/address";
import type { AddressRequest, AddressResponse, AddressDetail } from "@/types/address";
import { useEffect, useState } from "react";

export function useAddress() {
  const [address, setAddress] = useState<AddressResponse[]>([]);
  const defaultAddress = address.find(item => item.default) ?? null; // ★ 하나만

  // 배송지 목록 조회
  const handlerGetAddress = async () => {
    try {
      const list = await getMyAddress();         // ★ lib에서 result만 반환
      setAddress(list);
    } catch (err) {
      console.error("주소 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    handlerGetAddress();
  }, []);

  // 배송지 추가
  const handlerAddAddress = async (
    placeName: string,
    name: string,
    phone: string,
    baseAddress: string,
    addressDetail: string,
    zipcode: string,
    setAsDefault: boolean
  ) => {
    try {
      await addMyAddress(placeName, name, phone, baseAddress, addressDetail, zipcode, setAsDefault);
      await handlerGetAddress();
    } catch (err) {
      console.error("주소 추가 실패:", err);
      throw err;
    }
  };

  // 배송지 삭제
  const handlerDeleteAddress = async (addressId: number) => {
    try {
      await deleteMyAddress(addressId);
      setAddress(prev => prev.filter(item => item.id !== addressId));
    } catch (err) {
      console.error("주소 삭제 실패:", err);
      throw err;
    }
  };

  // 기본 배송지 등록
  const handlerDefaultAddress = async (addressId: number) => {
    try {
      await defaultAddAddress(addressId);
      alert("기본 배송지가 변경되었습니다.");
      await handlerGetAddress();
    } catch (err) {
      console.error("기본 배송지 설정 실패:", err);
      throw err;
    }
  };
  // (하위 호환: 오타 함수명 유지)
  const handlerDefalutAddress = handlerDefaultAddress;

  /**
   * 결제 전에 "기본 배송지 존재 보장" 유틸
   * - 기본이 있으면 상세를 반환
   * - 없으면 input으로 생성(+ setAsDefault true 권장) 후 기본 설정까지 보장
   * - input이 없으면 에러 throw → UI에서 모달 열어 입력받기
   */
  const ensureDefaultAddress = async (input?: AddressRequest): Promise<AddressDetail> => {
    // 1) 서버의 기본 배송지 조회
    const cur = await getDefaultMyAddress();
    if (cur) return cur;

    // 2) 없으면 입력 필요
    if (!input) {
      const e: any = new Error("NO_DEFAULT_ADDRESS");
      e.code = "NO_DEFAULT_ADDRESS";
      throw e;
    }

    // 3) 생성 (setAsDefault가 false여도 아래에서 강제 기본 설정)
    const created = await addMyAddress(
      input.placeName?.trim() || "",
      input.name?.trim() || "",
      input.phone?.trim() || "",
      input.baseAddress?.trim() || "",
      input.addressDetail?.trim() || "",
      input.zipcode?.trim() || "",
      input.setAsDefault ?? true
    );

    // 4) 기본 보장
    if (!input.setAsDefault) {
      await defaultAddAddress(created.id);
    }

    // 5) 목록 새로고침 후 상세 반환(없으면 생성값 반환)
    await handlerGetAddress();
    return (await getDefaultMyAddress()) ?? created;
  };

  // 상세 조회
  const handlerGetAddressDetail = async (addressId: number): Promise<AddressDetail> => {
    try {
      return await getAddressDetail(addressId);
    } catch (err) {
      console.error("주소 상세 조회 실패:", err);
      throw err;
    }
  };

  // 수정
  const handlerUpdateAddress = async (addressId: number, body: AddressRequest) => {
    try {
      await updateMyAddress(addressId, body);
      await handlerGetAddress(); // 목록 갱신
    } catch (err) {
      console.error("주소 수정 실패:", err);
      throw err;
    }
  };

  return {
    // CRUD
    handlerAddAddress,
    handlerDeleteAddress,
    handlerDefaultAddress,     // 올바른 이름
    handlerDefalutAddress,     // 하위 호환 오타 유지
    handlerGetAddress,
    handlerGetAddressDetail,
    handlerUpdateAddress,

    // 데이터
    address,
    defaultAddress,

    // 결제용 헬퍼
    ensureDefaultAddress,
  };
}
