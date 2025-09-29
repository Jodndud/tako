// lib/bc/wallet.ts
import api from "@/lib/api";

interface WalletAddressPayload {
	walletAddress: string;
}

/** 백엔드에 지갑주소 등록 */
export const sendWalletAddress = async (walletAddress: string) => {
	if (!walletAddress || !walletAddress.startsWith("0x")) {
		throw new Error("유효한 지갑 주소가 아닙니다.");
	}
	const payload: WalletAddressPayload = { walletAddress };
	const res = await api.post("/v1/members/me/wallet", payload);
	return res.data;
};
