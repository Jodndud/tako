import api from "@/lib/api";
import type { EscrowAddressResp } from "@/types/escrow";

export async function fetchEscrowAddress(auctionId: number) {
  // GET /v1/auctions/{auctionId}/contract-address/escrow
  const { data } = await api.get<EscrowAddressResp>(
    `/v1/auctions/${auctionId}/contract-address/escrow`
  );
  return data.result.escrowAddress;
}
