'use client'

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useCallback } from 'react';
import { useDelivery } from '@/hooks/useSellDelivery';
import { GetAuctionDelivery } from "@/types/delivery";

interface AddTrackingProps {
  auctionId: number;
  item?: GetAuctionDelivery | null;
  onClose: () => void;
}

const statusMap: Record<string, string> = {
  WAITING: "배송준비중",
  IN_PROGRESS: "배송중",
  COMPLETED: "배송완료",
  CONFIRMED: "구매확정",
};

export default function AddTracking({ auctionId, item, onClose }: AddTrackingProps) {
  const { auctionDelivery, handlerGetAuctionDelivery, handlerTrackingNumber } = useDelivery();

  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 초기 배송 정보 로드
  useEffect(() => {
    (async () => {
      try {
        await handlerGetAuctionDelivery(auctionId);
      } catch (e) {
        // 조용히 무시 (필요 시 에러 메시지 표시 가능)
      }
    })();
  }, [auctionId, handlerGetAuctionDelivery]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!trackingNumber.trim()) {
      setErrorMsg("송장번호를 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await handlerTrackingNumber(auctionId, trackingNumber.trim());
      setSuccessMsg("송장 발급이 완료되었습니다.");
      // 최신 상태 반영
      try { await handlerGetAuctionDelivery(auctionId); } catch {}

      // 1초 후 자동 닫기
      setTimeout(() => onClose(), 1000);
    } catch (e: any) {
      const serverMsg =
        e?.response?.data?.message || e?.message || "등록 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      setErrorMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  }, [auctionId, trackingNumber, handlerTrackingNumber, handlerGetAuctionDelivery, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-[450px] bg-gray-800 p-5 rounded-xl relative flex flex-col gap-6 justify-center border border-[#353535]">
        {/* X 버튼 */}
        <X className="absolute top-5 right-5 cursor-pointer" onClick={onClose} />
        <h3 className="text-center text-white">송장번호 등록</h3>

        {/* 피드백 메시지 */}
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

        {auctionDelivery?.recipientAddress ? (
          <div className="flex flex-col gap-2">
            <p className="text-[#e5e7eb]">구매자 정보</p>
            <div className="bg-gray-700 rounded-lg p-4 flex flex-col gap-2">
              <div className="flex items-center text-sm">
                <p className="flex-1 text-[#ddd]">이름</p>
                <p className="flex-4">{auctionDelivery.recipientAddress.name}</p>
              </div>
              <div className="flex items-center text-sm">
                <p className="flex-1 text-[#ddd]">연락처</p>
                <p className="flex-4">{auctionDelivery.recipientAddress.phone}</p>
              </div>
              <div className="flex items-center text-sm">
                <p className="flex-1 text-[#ddd]">우편번호</p>
                <p className="flex-4">{auctionDelivery.recipientAddress.zipcode}</p>
              </div>
              <div className="flex items-center text-sm">
                <p className="flex-1 text-[#ddd]">기본주소</p>
                <p className="flex-4">{auctionDelivery.recipientAddress.baseAddress}</p>
              </div>
              <div className="flex items-center text-sm">
                <p className="flex-1 text-[#ddd]">상세주소</p>
                <p className="flex-4">{auctionDelivery.recipientAddress.addressDetail}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg text-center py-10 text-sm text-[#a5a5a5]">
            구매자 배송지 정보가 없습니다.
          </div>
        )}

        {!auctionDelivery?.trackingNumber ? (
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <p className="text-[#e5e7eb]">송장번호 등록</p>
            <div className="flex gap-3">
              <Input
                placeholder="송장번호를 입력해주세요"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                disabled={submitting}
              />
              <Button
                type="submit"
                variant="outline"
                className="cursor-pointer w-25 h-12"
                disabled={submitting}
              >
                {submitting ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[#e5e7eb]">배송상태</p>
            <div className="bg-gray-700 rounded-lg p-4 flex flex-col gap-2 items-center">
              <p className="text-lg text-white">
                {statusMap[auctionDelivery.status ?? ""] || "미배송"}
              </p>
              <p className="text-[#ddd]">송장번호: {auctionDelivery.trackingNumber}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            className="cursor-pointer h-12"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
          >
            닫기
          </Button>
          {/* 닫기 외 추가 액션이 필요하면 여기에 배치 */}
        </div>
      </div>
    </div>
  );
}
