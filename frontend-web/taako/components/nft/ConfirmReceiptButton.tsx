"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useEscrowAddress } from "@/hooks/useEscrowAddress";
import { confirmReceipt } from "@/lib/bc/escrow";
import { useDelivery } from "@/hooks/useDelivery";

/**
 * 구매확정 버튼
 * - 배송완료 이후 노출(또는 활성화)하는 것을 권장
 */
export default function ConfirmReceiptButton({
  auctionId,
  disabledReason, // 필요 시 상태 메시지
  className,
  label = "구매확정",
}: {
  auctionId: number;
  disabledReason?: string;
  className?: string;
  label?: string;
}) {
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);
  const { data: escrowAddress } = useEscrowAddress(auctionId);
  const { status } = useDelivery(auctionId);

  const enabled = !!escrowAddress && !working && !done;

  const onClick = async () => {
    if (!escrowAddress) return alert("에스크로 주소를 가져오지 못했습니다.");
    setWorking(true);
    try {
      const receipt = await confirmReceipt(escrowAddress);
      console.log("ConfirmReceipt receipt:", receipt);
      alert("구매확정 완료! 판매자에게 대금 출금 가능 상태로 변경됩니다.");
      setDone(true); // 완료 상태로 전환
    } catch (e: any) {
      if (e?.code === 4001) {
        alert("사용자가 트랜잭션을 취소했습니다.");
      } else {
        alert("구매확정 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setWorking(false);
    }
  };

  // 예: 배송완료 상태일 때만 활성화
  const shouldDisableByStatus = !["COMPLETED"].includes(status);

  let buttonText = label;
  if (working) buttonText = "구매확정중...";
  else if (done) buttonText = "구매확정 완료";

  return (
    <Button
      className={
        className ??
        "text-sm text-[#dedede] h-10 w-[120px] !rounded-md bg-[#191924] border-1 border-[#353535] hover:bg-[#242433]"
      }
      onClick={onClick}
      disabled={working || done || !enabled || shouldDisableByStatus}
      title={
        shouldDisableByStatus
          ? disabledReason ?? "배송 완료 후에 구매확정 가능합니다."
          : undefined
      }
    >
      {buttonText}
    </Button>
  );
}
