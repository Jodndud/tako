// lib/bc/escrow.ts
import { Contract, parseEther } from "ethers";
import { getSigner, getProvider } from "./provider"; // ← provider 가져오기
import { ESCROW_ABI } from "./escrowAbi";

export const getEscrowRead = async (escrowAddress: `0x${string}`) => {
  const provider = await getProvider();             // ✅ 읽기는 provider
  return new Contract(escrowAddress, ESCROW_ABI, provider);
};

export const getEscrowWrite = async (escrowAddress: `0x${string}`) => {
  const signer = await getSigner();                 // ✍️ 쓰기는 signer
  return new Contract(escrowAddress, ESCROW_ABI, signer);
};

export type EscrowInfo = {
  nftAddress: `0x${string}` | string;
  tokenId: bigint;
};

export const getEscrowInfo = async (escrowAddress: `0x${string}`): Promise<EscrowInfo> => {
  const c = await getEscrowRead(escrowAddress);     // ✅ provider 사용
  const [nft, tid] = await Promise.all([c.takoNFT(), c.tokenId()]);
  return { nftAddress: nft as `0x${string}`, tokenId: BigInt(tid) };
};

export const depositToEscrow = async (escrowAddress: `0x${string}`, amountEth: string | number) => {
  const c = await getEscrowWrite(escrowAddress);
  const tx = await c.deposit({ value: parseEther(String(amountEth)) });
  return await tx.wait();
};

export const confirmReceipt = async (escrowAddress: `0x${string}`) => {
  const c = await getEscrowWrite(escrowAddress);
  const tx = await c.confirmReceipt();
  return await tx.wait();
};

export const releaseFunds = async (escrowAddress: `0x${string}`) => {
  const c = await getEscrowWrite(escrowAddress);
  const tx = await c.releaseFunds();
  return await tx.wait();
};
