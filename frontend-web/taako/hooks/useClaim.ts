// features/takoNft/claim.ts
import { Contract, Interface } from "ethers";
import { getTakoNft } from "@/lib/bc/takoNft";
import { TAKO_NFT_ABI } from "@/lib/bc/takoNft";

export async function claimTakoNft({
  contract, tokenId, secret,
}: { contract: `0x${string}`; tokenId: string|number|bigint; secret: string }) {
  // 1) 값 방어
  if (secret == null || secret.trim() === "") throw new Error("secret이 비어있습니다.");
  const id = typeof tokenId === "bigint" ? tokenId : BigInt(tokenId);

  const nft = await getTakoNft(contract);

  // 2) 인코딩이 제대로 되는지 먼저 확인 (길이가 4바이트 초과해야 정상)
  const iface = new Interface(TAKO_NFT_ABI);
  const encoded = iface.encodeFunctionData("claim", [id, secret]);
  if (encoded.length <= 10) { // '0x' + 8자리 selector = 10
    console.error("encoded", encoded);
    throw new Error("ABI/인자 인코딩 실패: claim 인자가 전송되지 않습니다.");
  }

  // 3) 사전 시뮬레이션 → 정확한 리버트 reason 얻기
  try {
    await nft.claim.staticCall(id, secret);
  } catch (e:any) {
    throw new Error(e?.reason || e?.shortMessage || e?.message || "claim 시뮬 실패");
  }

  // 4) 실제 전송
  const tx = await nft.claim(id, secret);
  const receipt = await tx.wait();
  if (receipt.status !== 1) throw new Error("claim 트랜잭션 실패");
  return receipt.transactionHash as string;
}
