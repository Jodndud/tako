// lib/bc/contracts.ts
import { Contract, InterfaceAbi, JsonRpcSigner } from "ethers";
import { getSigner } from "./provider";

/** 최소 ERC-721 ABI (read/write 공통) */
export const ERC721_MIN_ABI: InterfaceAbi = [
  // read
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getApproved(uint256 tokenId) view returns (address)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  // write
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool _approved) external",
  // events
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
] as const;

/** Tako NFT (claim + ERC-721) */
export const TAKO_NFT_ABI: InterfaceAbi = [
  "function claim(uint256 tokenId, string secret) external",
  "function backendAdmin() view returns (address)",
  "function tokenSecrets(uint256 tokenId) view returns (bytes32)",
  "function usedSecrets(bytes32 h) view returns (bool)",
  ...ERC721_MIN_ABI,
] as const;

export const getErc721 = async (
  nftAddress: `0x${string}`,
  signer?: JsonRpcSigner
): Promise<Contract> => {
  const s = signer ?? (await getSigner());
  if (!s) throw new Error("지갑 연결이 필요합니다. (signer 없음)");
  return new Contract(nftAddress, ERC721_MIN_ABI, s);
};

export const getTakoNft = async (
  nftAddress: `0x${string}`,
  signer?: JsonRpcSigner
): Promise<Contract> => {
  const s = signer ?? (await getSigner());
  if (!s) throw new Error("지갑 연결이 필요합니다. (signer 없음)");
  return new Contract(nftAddress, TAKO_NFT_ABI, s);
};
