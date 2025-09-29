// components/mypage/delivery/SellDeliveryForm.tsx
'use client'

import { CircleCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddress } from "@/hooks/useAddress"
import { useDelivery } from '@/hooks/useDelivery';
import { useEffect, useState, useCallback } from 'react';

interface BuyDeliveryFormProps {
  auctionId: number;
  onClose: () => void;
  onRegistered?: () => void; // 등록 완료 시 호출되는 콜백
}

export default function BuyDeliveryForm({ auctionId, onClose, onRegistered }: BuyDeliveryFormProps) {
  const { address, defaultAddress } = useAddress();
  // auctionId를 전달해서 훅을 올바르게 바인딩
  const { setRecipient } = useDelivery(auctionId);

  const [addressId, setAddressId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (defaultAddress) setAddressId(defaultAddress.id);
  }, [defaultAddress]);

  const onRegister = useCallback(async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (addressId === null) {
      setErrorMsg('배송지를 선택해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      // setRecipient는 addressId만 받습니다.
      await setRecipient(addressId);
      setSuccessMsg('배송지가 등록되었습니다.');
      onRegistered?.();       // 상위에 알려주기
      setTimeout(() => onClose(), 1000); // 1초 뒤 닫기
    } catch (e: any) {
      const serverMsg =
        e?.response?.data?.message || e?.message || '등록 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setErrorMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  // 존재하지 않는 변수 제거, 실제로 쓰는 것만 deps에
  }, [addressId, onClose, onRegistered, setRecipient]);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="w-[450px] bg-gray-800 p-5 rounded-xl relative flex flex-col gap-6 border border-[#353535]">
        <X className='absolute top-5 right-5 cursor-pointer' onClick={onClose} />

        <h3 className='text-center text-white'>배송지 등록</h3>

        {successMsg && (
          <div className="text-xs text-[#c0f6c0] bg-[#143216] border border-[#2b5f2d] rounded px-2 py-1">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="text-xs text-[#ffb4b4] bg-[#2a1616] border border-[#5c2c2c] rounded px-2 py-1">
            {errorMsg}
          </div>
        )}

        {/* 주소 리스트 */}
        <div className="flex flex-col gap-3">
          {address.length > 0 ? (
            address.map((item) => {
              const isSelected = addressId === item.id;
              const isDefault = item.default;
              return (
                <div
                  key={item.id}
                  className={`p-4 border-1 border-[#666] rounded-lg flex justify-between items-center hover:bg-gray-700 cursor-pointer ${isSelected ? "bg-gray-700" : ""}`}
                  onClick={() => setAddressId(item.id)}
                >
                  <div>
                    <p className="text-white">{item.placeName}</p>
                    <p className="text-sm text-[#a5a5a5]">{item.baseAddress}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {isDefault && (
                      <span className={`${isSelected ? 'text-white' : 'text-[#a9a9a9]'}`}>기본배송지</span>
                    )}
                    <CircleCheck className="w-5" stroke={isSelected ? "#ffffff" : "#a9a9a9"} />
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-4 text-center text-sm text-[#a5a5a5]">
              등록된 배송지가 없습니다. <br />
              <span className="text-white">마이페이지 &gt; 주소록</span> 에서 주소를 등록해주세요.
            </div>
          )}
        </div>

        <div className='grid grid-cols-2 gap-3'>
          <Button
            className='cursor-pointer h-12'
            variant="outline"
            onClick={onRegister}
            disabled={submitting}
          >
            {submitting ? '등록 중...' : '등록하기'}
          </Button>
          <Button
            className='cursor-pointer h-12'
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            취소
          </Button>
        </div>
      </div>
    </div>
  )
}
