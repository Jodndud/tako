// components/nft/BuyEndedAuction.tsx
"use client";

import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMyInfo } from "@/hooks/useMyInfo";
import ConfirmReceiptButton from "@/components/nft/ConfirmReceiptButton";
import { useDelivery } from "@/hooks/useDelivery";
import BuyDeliveryForm from "@/components/mypage/delivery/BuyDeliveryForm";
import { useEscrowAddress } from "@/hooks/useEscrowAddress";
import { depositToEscrow } from "@/lib/bc/escrow";
import PayButton from "@/components/nft/PayButton";
import type { MyBidAuctions } from "@/types/auth";

const statusMap: Record<string, string> = {
  WAITING: "배송준비중",
  IN_PROGRESS: "배송중",
  COMPLETED: "배송완료",
  CONFIRMED: "구매확정",
};

function DeliveryBadge({ auctionId }: { auctionId: number }) {
  const { info, status, hasTracking } = useDelivery(auctionId);

  const label = useMemo(() => {
    if (!hasTracking) return "운송장 대기";
    switch (status) {
      case "WAITING":
        return "배송 준비중";
      case "IN_PROGRESS":
        return "배송중";
      case "COMPLETED":
        return "배송완료";
      case "CONFIRMED":
        return "구매확정됨";
      default:
        return status;
    }
  }, [hasTracking, status]);

  return (
    <div className="px-6 py-2 bg-[#171725] border-b border-[#353535] flex items-center justify-between">
      <p className="text-xs text-[#a5a5a5]">
        배송상태: <span className="text-[#e1e1e1]">{label}</span>
        {info?.trackingNumber ? (
          <span className="ml-2 text-[#8bb4ff]">#{info.trackingNumber}</span>
        ) : null}
      </p>
    </div>
  );
}

/** 경매 카드 1개 렌더링 */
function AuctionEndedRow({ item }: { item: MyBidAuctions }) {
  const auctionId = Number(item.auctionId);
  if (!Number.isFinite(auctionId)) {
    console.warn("유효하지 않은 auctionId", item);
    return null;
  }

  const [openAddressModal, setOpenAddressModal] = useState(false);

  // 배송 관련 상태
  const { info, hasRecipient } = useDelivery(auctionId);
  const trackingNumber = info?.trackingNumber ?? null;
  const trackingMissing = !((trackingNumber ?? "").trim().length > 0);

  // 에스크로/결제
  const { data: escrowAddress } = useEscrowAddress(auctionId);
  const priceEth = useMemo(() => Number(item.currentPrice) || 0, [item.currentPrice]);

  // 버튼 표시 여부: 내 입찰가가 현재가보다 크거나 같아야 버튼 노출
  const canAct = useMemo(() => {
    const current = Number(item.currentPrice);
    const mine = Number(item.myTopBidAmount);
    if (!Number.isFinite(current) || !Number.isFinite(mine)) return false;
    return mine >= current;
  }, [item.currentPrice, item.myTopBidAmount]);

  const onPay = useCallback(async () => {
    if (!escrowAddress) throw new Error("에스크로 주소를 가져오지 못했습니다.");
    await depositToEscrow(escrowAddress, priceEth);
  }, [escrowAddress, priceEth]);

  return (
    <div>
      <div className="h-3 bg-[#1F1F2D]" />

      {/* 배송 상태 */}
      <DeliveryBadge auctionId={auctionId} />

      {/* 상단 바 */}
      <div className="flex justify-between border-b border-[#353535] px-6 py-4">
        <p className="text-sm">경매 번호 {item.code}</p>
        <p className="text-sm flex gap-1 items-center">
          경매종료 {item.endDatetime} <ChevronRight className="w-4" />
        </p>
      </div>

      {/* 본문 */}
      <div className="py-4 px-6 flex justify-between">
        <div className="flex items-center gap-5">
          <div className="rounded-lg overflow-hidden w-22 h-22">
            <Image
              className="w-full h-full object-cover"
              src={item.imageUrl || "/no-image.jpg"}
              alt="thumbnail"
              width={80}
              height={80}
              unoptimized
            />
          </div>
          <div>
            <h3 className="bid">{item.title}</h3>
            {canAct && (
              <div>
                {info?.status ? (
                  <p className="text-sm text-green-500">
                    {statusMap[info.status] ?? info.status}
                  </p>
                ) : (
                  <p className="text-sm text-red-500">배송지 입력 대기</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-3 items-end">
            <p className="text-sm">
              현재 입찰가{" "}
              <span className="text-green-500 ml-1">{item.currentPrice} ETH</span>
            </p>
            <p className="text-sm">
              내 입찰가{" "}
              <span className="text-green-500 ml-1">{item.myTopBidAmount} ETH</span>
            </p>

            {/* 버튼들: 내 입찰가 < 현재가면 버튼 숨김 */}
            {canAct && (
              <div className="flex justify-end items-center gap-3">
                {/* 1) 배송지 선택 버튼 */}
                <Button
                  variant="outline"
                  className="min-w-[104px]"
                  onClick={() => setOpenAddressModal(true)}
                >
                  {hasRecipient ? "배송지 선택 완료" : "배송지 선택"}
                </Button>

                {/* 2) 결제 버튼 */}
                <PayButton
                  auctionId={auctionId}
                  trackingMissing={trackingMissing}
                  disabledReason={trackingMissing ? "운송장 발급 후 결제 가능합니다." : undefined}
                  onPay={onPay}
                  className="min-w-[104px]"
                />

                {/* 3) 구매확정 버튼 */}
                <ConfirmReceiptButton auctionId={auctionId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 배송지 선택 모달 */}
      {openAddressModal && (
        <BuyDeliveryForm
          auctionId={auctionId}
          onClose={() => setOpenAddressModal(false)}
          onRegistered={() => setOpenAddressModal(false)}
        />
      )}
    </div>
  );
}

export default function BuyEndedAuction() {
  const { endedAuctions, myBidLoading, myBidError } = useMyInfo();

  if (myBidLoading)
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        불러오는 중...
      </div>
    );

  if (myBidError)
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        에러가 발생했습니다 😢
      </div>
    );

  if (!endedAuctions || endedAuctions.length === 0) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        종료된 경매가 없습니다.
      </div>
    );
  }

  return (
    <div>
      {endedAuctions.map((item) => (
        <AuctionEndedRow key={String(item.auctionId)} item={item} />
      ))}
    </div>
  );
}
