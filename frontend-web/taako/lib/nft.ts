import api from "@/lib/api";

export interface History {
  seller: {
    walletAddress: string;
    nickname: string;
    email: string;
  };
  buyer: {
    walletAddress: string;
    nickname: string;
    email: string;
  };
  priceInEth: string;
  grade: {
    gradeId: number;
    gradeCode: string;
  };
  timestamp: string;
}

export async function fetchNFThistory(tokenId: number) {
  const res = await api.get(`/v1/physical-cards/${tokenId}/history`);
  return res.data.result;
}
