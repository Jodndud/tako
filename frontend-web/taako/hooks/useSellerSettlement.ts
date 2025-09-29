// hooks/useSellerSettlement.ts
"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEscrowAddress } from "@/hooks/useEscrowAddress";
import { useEscrowState } from "@/hooks/useEscrowState";
import { useEscrowNftInfo } from "@/hooks/useEscrowNftInfo";
import { useERC721Approval } from "@/hooks/useERC721Approval";
import { releaseFunds } from "@/lib/bc/escrow";
import { ESCROW_STATE } from "@/lib/bc/escrowAbi";
import { ZeroAddress } from "ethers";
import { getProvider } from "@/lib/bc/provider";

type Params = {
  auctionId: number;
  sellerWallet?: `0x${string}`;
  preferForAll?: boolean;
};

const isZeroLike = (addr?: string) =>
  !addr || addr.toLowerCase() === ZeroAddress.toLowerCase();

const ZERO_BI = BigInt(0);

export function useSellerSettlement({
  auctionId,
  sellerWallet,
  preferForAll = true,
}: Params) {
  // 1) 에스크로 주소
  const { data: escrowAddress, isLoading: escrowLoading, error: escrowError } =
    useEscrowAddress(auctionId);

  // 2) 에스크로 상태 폴링
  const {
    state: escrowState,
    loading: stateLoading,
    error: stateError,
    refetch: refetchState,
  } = useEscrowState(auctionId, true, 10_000);

  const buyerConfirmed = Number(escrowState) === ESCROW_STATE.Complete;

  // 3) 에스크로에서 NFT/TokenId 조회
  const {
    data: escrowNftInfo,
    isLoading: nftLoading,
    error: nftError,
  } = useEscrowNftInfo(escrowAddress);

  const nftAddress = escrowNftInfo?.nftAddress ?? ZeroAddress;
  const tokenId: bigint = escrowNftInfo?.tokenId ?? ZERO_BI;

  const nftNotMinted = isZeroLike(nftAddress) || tokenId === ZERO_BI;

  // 4) NFT 승인 상태
  const approval = useERC721Approval({
    nftAddress,
    tokenId,
    spender: (escrowAddress ?? ZeroAddress) as string,
  });

  // 5) 대금 인출 완료 감지 (에스크로 잔액 0)
  const releasedQuery = useQuery({
    queryKey: ["escrowReleased", escrowAddress],
    enabled: !!escrowAddress,
    queryFn: async () => {
      if (!escrowAddress) throw new Error("에스크로 주소가 없습니다.");
      const provider = await getProvider();
      const bal = await provider.getBalance(escrowAddress as string);
      return { balanceIsZero: bal === BigInt(0) };
    },
    refetchInterval: (q) => {
      const d = q.state.data as { balanceIsZero?: boolean } | undefined;
      // 잔액이 0이면 폴링 중단
      if (d?.balanceIsZero) return false;
      return 10_000;
    },
    staleTime: 5_000,
    gcTime: 5 * 60 * 1000,
  });

  const released = !!releasedQuery.data?.balanceIsZero;

  // 버튼 활성 조건
  // - approve: buyerConfirmed && !alreadyApproved && !nftNotMinted
  // - release: buyerConfirmed && (alreadyApproved || nftNotMinted) && !released
  const canApprove = useMemo(
    () =>
      Boolean(escrowAddress) &&
      buyerConfirmed &&
      !approval.isAlreadyApproved &&
      !nftNotMinted,
    [escrowAddress, buyerConfirmed, approval.isAlreadyApproved, nftNotMinted]
  );

  const canReleaseBase = useMemo(
    () =>
      Boolean(escrowAddress) &&
      buyerConfirmed &&
      (approval.isAlreadyApproved || nftNotMinted),
    [escrowAddress, buyerConfirmed, approval.isAlreadyApproved, nftNotMinted]
  );

  const canRelease = canReleaseBase && !released;

  // 승인 실행
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!escrowAddress) throw new Error("에스크로 주소를 불러오지 못했습니다.");
      if (nftNotMinted) throw new Error("NFT가 아직 발급되지 않아 승인할 필요가 없습니다.");
      if (preferForAll) return await approval.setApprovalForAll(true);
      return await approval.approveToken();
    },
    onSuccess: () => {
      void approval.refresh();
    },
  });

  // 정산 실행
  const releaseMutation = useMutation({
    mutationFn: async () => {
      if (!escrowAddress) throw new Error("에스크로 주소를 불러오지 못했습니다.");
      if (!buyerConfirmed) throw new Error("구매자가 아직 구매확정을 완료하지 않았습니다.");
      if (!nftNotMinted && !approval.isAlreadyApproved) {
        throw new Error("먼저 NFT 승인(approve)을 완료해주세요.");
      }
      const receipt = await releaseFunds(escrowAddress as `0x${string}`); // tx
      void refetchState();          // 에스크로 상태 즉시 갱신 시도
      void releasedQuery.refetch(); // 잔액 0 반영 즉시 시도
      return receipt;
    },
  });

  return {
    // 상태
    escrowAddress,
    escrowState,
    buyerConfirmed,
    released, // 인출 완료 여부
    escrowLoading: escrowLoading || stateLoading || nftLoading || releasedQuery.isLoading,
    escrowError: escrowError || stateError || nftError || (releasedQuery.isError ? (releasedQuery.error instanceof Error ? releasedQuery.error.message : "정산 상태 확인 오류") : ""),

    // 에스크로에서 읽은 NFT/토큰 (UI 표시용)
    nftAddress,
    tokenId,

    // 승인 관련
    alreadyApproved: approval.isAlreadyApproved,
    approving: approveMutation.isPending,
    canApprove,
    nftNotMinted,

    // 정산 관련
    releasing: releaseMutation.isPending,
    canRelease,

    // 액션
    approve: async () => {
      try {
        await approveMutation.mutateAsync();
        return { ok: true, message: "승인이 완료되었습니다." };
      } catch (e) {
        return { ok: false, message: "NFT 소유권 이전 권한 승인 중 오류가 발생하였습니다." };
      }
    },
    release: async () => {
      try {
        await releaseMutation.mutateAsync();
        return { ok: true, message: "대금 인출이 완료되었습니다." };
      } catch (e) {
        return { ok: false, message: "대금 인출 과정 중 오류가 발생하였습니다." };
      }
    },

    // 외부에서 필요 시 수동 새로고침
    refetchReleased: releasedQuery.refetch,
    refetchState,
  };
}
