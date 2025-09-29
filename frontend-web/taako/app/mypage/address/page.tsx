// app/mypage/address/page.tsx
'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import AddAddress from '@/components/mypage/AddAddress';
import { useAddress } from '@/hooks/useAddress';

export default function MyAddressPage() {
  const {
    address,
    defaultAddress,
    handlerDeleteAddress,
    handlerDefaultAddress, // ← 올바른 함수명 사용
  } = useAddress();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // 기본 배송지를 제외한 나머지 주소
  const others = useMemo(() => address.filter(a => !a.default), [address]);

  const hasAny = address.length > 0;

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2>주소록</h2>
        </div>
        <Button variant="outline" className="cursor-pointer" onClick={handleOpenModal}>
          + 새 주소 추가하기
        </Button>
      </div>

      {hasAny ? (
        <div className="flex flex-col gap-5">
          {/* 기본 배송지 */}
          <div>
            <h3 className="py-4">기본 배송지</h3>
            <div>
              {defaultAddress ? (
                <div className="bg-gray-800 p-5 rounded-xl flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">{defaultAddress.placeName}</p>
                    <p className="text-sm">
                      ({defaultAddress.zipcode}){defaultAddress.baseAddress}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="py-3 px-7" variant="outline">
                      수정
                    </Button>
                    <Button
                      onClick={() => handlerDeleteAddress(defaultAddress.id)}
                      className="py-3 px-7"
                      variant="outline"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[#a5a5a5]">
                  기본 배송지가 없습니다. 아래 목록에서 기본 배송지를 설정하세요.
                </div>
              )}
            </div>
          </div>

          {/* 저장된 주소 (기본 제외) */}
          <div>
            <h3 className="py-4">저장된 주소</h3>
            <div className="flex flex-col">
              {others.length > 0 ? (
                others.map((item) => (
                  <div
                    key={item.id}
                    className="py-8 flex justify-between items-center border-b border-[#353535]"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold">{item.placeName}</p>
                      <p className="text-sm">
                        ({item.zipcode}){item.baseAddress}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlerDefaultAddress(item.id)}
                        className="py-3 px-7"
                        variant="outline"
                      >
                        기본 배송지
                      </Button>
                      <Button className="py-3 px-7" variant="outline">
                        수정
                      </Button>
                      <Button
                        onClick={() => handlerDeleteAddress(item.id)}
                        className="py-3 px-7"
                        variant="outline"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#a5a5a5]">기본 외 저장된 주소가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-40 text-sm text-[#a5a5a5] text-center">
          배송지 정보가 없습니다.
          <br />
          새 주소를 등록해주세요
        </div>
      )}

      {/* 모달 */}
      {isModalOpen && <AddAddress onClose={handleCloseModal} />}
    </div>
  );
}
