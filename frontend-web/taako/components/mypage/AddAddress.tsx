'use client'

import React from 'react';
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from 'lucide-react';
import { AddressRequest } from '@/types/address';
import { useAddress } from '@/hooks/useAddress';

interface AddAddressProps {
  onClose: () => void;
}

export default function AddAddress({ onClose }: AddAddressProps) {
  const { handlerAddAddress } = useAddress();
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<AddressRequest>({
    defaultValues: {
      placeName: "",
      name: "",
      phone: "",
      baseAddress: "",
      addressDetail: "",
      zipcode: "",
      setAsDefault: false,
    },
  });

  const onSubmit: SubmitHandler<AddressRequest> = async(data) => {
    try {
      await handlerAddAddress(
        data.placeName?.trim() || "",
        data.name?.trim() || "",
        data.phone?.trim() || "",
        data.baseAddress?.trim() || "",
        data.addressDetail?.trim() || "",
        data.zipcode?.trim() || "",
        data.setAsDefault || false
      );
      onClose();
    } catch (err) {
      console.error("주소 추가 실패:", err);
    }
  };

  const open = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  );

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddr = "";
    if (data.addressType === "R") {
      if (data.bname) extraAddr += data.bname;
      if (data.buildingName) extraAddr += extraAddr ? `, ${data.buildingName}` : data.buildingName;
      if (extraAddr) fullAddress += ` (${extraAddr})`;
    }
    setValue("zipcode", data.zonecode.trim());
    setValue("baseAddress", fullAddress.trim());
    setValue("addressDetail", "");
  };

  const handleClick = () => {
    open({ onComplete: handleComplete });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative p-5 w-[448px] bg-gray-700 border rounded-lg shadow-md space-y-4 z-10">
        <X className="absolute top-4 right-4 cursor-pointer" onClick={onClose} />
        <div className="text-lg text-center mb-8">새 주소 추가</div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* 배송지 별칭 */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="placeName" className="text-sm">배송지 별칭</Label>
            <Input id="placeName" placeholder="예: 우리집, 회사" {...register("placeName")} />
          </div>
          {/* 이름 */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="name" className="text-sm">이름</Label>
            <Input id="name" placeholder="수령인의 이름" {...register("name", { required: "이름을 입력하세요" })} />
            {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
          </div>
          {/* 휴대폰 */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="phone" className="text-sm">휴대폰 번호</Label>
            <Input id="phone" placeholder="휴대폰 번호" {...register("phone", { required: "휴대폰 번호를 입력하세요" })} />
            {errors.phone && <p className="text-red-400 text-sm">{errors.phone.message}</p>}
          </div>
          {/* 우편번호 */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="zipcode" className="text-sm">우편번호</Label>
            <div className="flex gap-2">
              <Input id="zipcode" placeholder="우편 번호를 검색하세요" readOnly {...register("zipcode", { required: "우편번호를 입력하세요" })} />
              <Button type="button" onClick={handleClick} variant="outline">우편번호</Button>
            </div>
            {errors.zipcode && <p className="text-red-400 text-sm">{errors.zipcode.message}</p>}
          </div>
          {/* 주소 */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="baseAddress" className="text-sm">주소</Label>
            <Input id="baseAddress" placeholder="우편 번호 검색 후 자동입력" readOnly {...register("baseAddress", { required: "주소를 입력하세요" })} />
            {errors.baseAddress && <p className="text-red-400 text-sm">{errors.baseAddress.message}</p>}
          </div>
          {/* 상세 주소 */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="addressDetail" className="text-sm">상세 주소</Label>
            <Input id="addressDetail" placeholder="건물, 아파트, 동/호수 입력" {...register("addressDetail", { required: "상세 주소를 입력하세요" })} />
            {errors.addressDetail && <p className="text-red-400 text-sm">{errors.addressDetail.message}</p>}
          </div>
          {/* 기본 배송지 체크 */}
          <div className="flex items-center space-x-2">
            <Controller
              name="setAsDefault"
              control={control}
              render={({ field }) => (
                <Checkbox id="setAsDefault" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              )}
            />
            <Label htmlFor="setAsDefault" className="text-sm">기본 배송지로 설정</Label>
          </div>
          {/* 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={onClose}>취소</Button>
            <Button type="submit" variant="default">저장하기</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
