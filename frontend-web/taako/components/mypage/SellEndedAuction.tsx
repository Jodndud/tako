'use client'

import { useState } from "react";
import { MySellAuctions } from "@/types/auth";
import { useMyInfo } from "@/hooks/useMySellInfo";
import { useDelivery } from "@/hooks/useSellDelivery";
import SellEndedAuctionDetail from "./SellEndedAuctionDetail";

export default function SellOnGoingAuction() {
  const { endedSellAuctions } = useMyInfo();

  // 모달 상태 관리
  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);
  const [modalType, setModalType] = useState<"delivery" | "tracking" | null>(null);

  const handleOpenModal = (auctionId: number, type: "delivery" | "tracking") => {
    setSelectedAuctionId(auctionId);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setSelectedAuctionId(null);
    setModalType(null);
  };

  if (endedSellAuctions.length === 0) {
    return <p className="text-center text-sm text-[#a5a5a5] py-20">종료된 경매가 없습니다.</p>;
  }

  return (
    <div>
      {endedSellAuctions.map((item: MySellAuctions) => (
        <SellEndedAuctionDetail
          key={item.auctionId}
          item={item}
          modalType={selectedAuctionId === item.auctionId ? modalType : null}
          onOpenModal={(type) => handleOpenModal(item.auctionId, type)}
          onCloseModal={handleCloseModal}
        />
      ))}
    </div>
  );
}
