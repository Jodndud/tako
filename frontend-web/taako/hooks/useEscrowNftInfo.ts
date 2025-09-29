// hooks/useEscrowNftInfo.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getEscrowInfo, type EscrowInfo } from "@/lib/bc/escrow";

export function useEscrowNftInfo(escrowAddress?: `0x${string}` | string) {
  return useQuery<EscrowInfo>({
    queryKey: ["escrowNftInfo", escrowAddress],
    queryFn: async () => {
      if (!escrowAddress) throw new Error("에스크로 주소가 필요합니다.");
      return await getEscrowInfo(escrowAddress as `0x${string}`);
    },
    enabled: !!escrowAddress,
    staleTime: 5 * 60 * 1000,
  });
}
