import { useQuery } from "@tanstack/react-query";
import { fetchEscrowAddress } from "@/lib/escrow";

export function useEscrowAddress(auctionId: number | string | undefined) {
  return useQuery({
    queryKey: ["escrowAddress", auctionId],
    queryFn: async () => {
      if (!auctionId) throw new Error("auctionId 필요");
      return await fetchEscrowAddress(Number(auctionId));
    },
    enabled: !!auctionId,
    staleTime: 5 * 60 * 1000,
  });
}
