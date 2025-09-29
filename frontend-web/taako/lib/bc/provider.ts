// lib/bc/provider.ts
import {
  BrowserProvider,
  Eip1193Provider,
  JsonRpcSigner,
  JsonRpcProvider,      // ✅ 추가
} from "ethers";

/** 기본 체인: Sepolia (11155111) — 필요 시 환경변수로 덮어쓰기 */
const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111);
/** 퍼블릭 RPC URL (읽기 전용용) */
const DEFAULT_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? "https://rpc.sepolia.org";

/** 10진 체인ID → 0x Hex 문자열 */
const toHexChainId = (chainId: number) => {
  if (!Number.isInteger(chainId)) throw new Error(`잘못된 chainId: ${chainId}`);
  return `0x${chainId.toString(16)}`;
};

/** 알려진 체인의 wallet_addEthereumChain 파라미터 */
const getKnownChainParams = (chainId: number) => {
  if (chainId === 11155111) {
    return {
      chainId: toHexChainId(chainId),
      chainName: "Sepolia",
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: ["https://rpc.sepolia.org"],
      blockExplorerUrls: ["https://sepolia.etherscan.io"],
    };
  }
  return {
    chainId: toHexChainId(chainId),
    chainName: `EVM Chain ${chainId}`,
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    rpcUrls: [],
    blockExplorerUrls: [],
  };
};

export const getBrowserProvider = () => {
  const eth = (globalThis as any).ethereum as Eip1193Provider | undefined;
  if (!eth) throw new Error("MetaMask가 필요합니다.");
  return new BrowserProvider(eth);
};

/**
 * ✅ 읽기 전용 Provider (지갑 연결/승인 불필요)
 * - 브라우저 + MetaMask가 있으면 BrowserProvider를 그대로 사용(eth_requestAccounts 호출 안함)
 * - 없거나 SSR 환경이면 JsonRpcProvider 사용
 */
export const getProvider = async () => {
  try {
    if (typeof window !== "undefined") {
      const eth = (window as any).ethereum as Eip1193Provider | undefined;
      if (eth) {
        return new BrowserProvider(eth); // read-only 사용은 승인 필요 없음
      }
    }
  } catch {
    // 무시하고 아래 JsonRpcProvider로 폴백
  }
  return new JsonRpcProvider(DEFAULT_RPC_URL, DEFAULT_CHAIN_ID);
};

export const requestAccounts = async () => {
  const provider = getBrowserProvider();
  // 계정 연결 요청 (승인 창)
  await provider.send("eth_requestAccounts", []);
  return provider;
};

/**
 * 요구 체인 보장 (기본: Sepolia)
 * - 현재 네트워크가 다르면 wallet_switchEthereumChain
 * - 미등록 체인이면 wallet_addEthereumChain
 */
export const ensureChain = async (requiredChainId: number = DEFAULT_CHAIN_ID) => {
  const provider = await requestAccounts();

  const nw = await provider.getNetwork(); // ethers v6: { chainId: bigint }
  const current = Number(nw.chainId);

  if (current === requiredChainId) return provider;

  const chainIdHex = toHexChainId(requiredChainId);

  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: chainIdHex }]);
  } catch (e: any) {
    // 4902: Unrecognized chain → add
    if (e?.code === 4902) {
      const params = getKnownChainParams(requiredChainId);
      await provider.send("wallet_addEthereumChain", [params]);
    } else {
      throw e;
    }
  }
  return provider;
};

export const getSigner = async (requiredChainId?: number): Promise<JsonRpcSigner> => {
  const provider = await ensureChain(requiredChainId);
  const signer = await provider.getSigner();
  // 일부 지갑은 계정 미연결 시 signer.getAddress()에서 throw → 선검증
  try {
    await signer.getAddress();
  } catch {
    // 계정 연결 재요청
    await provider.send("eth_requestAccounts", []);
  }
  return signer;
};

export const getAccount = async (): Promise<`0x${string}`> => {
  const signer = await getSigner();
  const addr = await signer.getAddress();
  return addr as `0x${string}`;
};
