// hooks/useEscrowState.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { Contract } from "ethers";
import { useEscrowAddress } from "@/hooks/useEscrowAddress";
import { ESCROW_ABI, ESCROW_STATE } from "@/lib/bc/escrowAbi";
import { getProvider } from "@/lib/bc/provider"; // ✅ 추가

type EscrowStateData = { state: number };

export function useEscrowState(auctionId: number, poll = true, intervalMs = 10_000) {
  const { data: escrowAddress } = useEscrowAddress(auctionId);

  const q = useQuery<EscrowStateData>({
    queryKey: ["escrowState", auctionId, escrowAddress],
    enabled: !!auctionId && !!escrowAddress,
    queryFn: async () => {
      if (!escrowAddress) throw new Error("에스크로 주소가 없습니다.");
      const provider = await getProvider();                 // ✅ 지갑 없이 읽기
      const escrow = new Contract(escrowAddress, ESCROW_ABI, provider);
      const state: bigint = await escrow.currentState();
      // console.log("[escrowState]", { auctionId, escrowAddress, state})
      return { state: Number(state) };
    },
    refetchInterval: (query) => {
      if (!poll) return false;
      const s = (query.state.data as { state: number } | undefined)?.state;
      return s === ESCROW_STATE.Complete || s === ESCROW_STATE.Canceled ? false : intervalMs;
    },
    staleTime: 10_000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    escrowAddress,
    state: q.data?.state,
    loading: q.isLoading,
    error: q.isError ? (q.error instanceof Error ? q.error.message : "Unknown error") : "",
    refetch: q.refetch,
  };
}
