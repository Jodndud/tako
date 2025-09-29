// lib/ethereum.ts
import { BrowserProvider, isAddress } from 'ethers';
import type { MetaMaskInpageProvider } from '@metamask/providers';

/** 멀티지갑 환경에서 메타마스크 provider 선택 */
export function getMetaMaskProvider():
  (MetaMaskInpageProvider & { isMetaMask?: boolean }) | undefined {
  if (typeof window === 'undefined') return undefined;
  const eth: any = (window as any).ethereum;
  if (!eth) return undefined;
  if (Array.isArray(eth?.providers)) return eth.providers.find((p: any) => p?.isMetaMask);
  return eth;
}

/** BrowserProvider 생성 */
export function getBrowserProvider(): BrowserProvider | null {
  const mm = getMetaMaskProvider();
  if (!mm) return null;
  return new BrowserProvider(mm as any);
}

/** 주소 유효성 */
export const isValidAddress = (addr: string) => isAddress(addr);

/** 친숙한 체인명 */
// 사람이 읽기 쉬운 체인 이름 (bigint 리터럴 없이)
export function friendlyChainName(chainId: bigint | number, fallback?: string) {
  const id = typeof chainId === 'bigint' ? Number(chainId) : chainId;
  if (id === 1) return 'mainnet';
  if (id === 11155111) return 'sepolia';
  return fallback || `chain(${id})`;
}

/** 사용자의 브라우저에 맞는 MetaMask 설치 URL 반환 */
export function getMetaMaskInstallUrl(): string {
  if (typeof navigator === 'undefined') return 'https://metamask.io/download/';
  const ua = navigator.userAgent.toLowerCase();

  // iOS/Android는 앱 스토어로
  if (/iphone|ipad|ipod/.test(ua)) return 'https://apps.apple.com/app/metamask/id1438144202';
  if (/android/.test(ua)) return 'https://play.google.com/store/apps/details?id=io.metamask';

  // 데스크톱 브라우저별
  if (/edg\//.test(ua)) {
    return 'https://microsoftedge.microsoft.com/addons/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';
  }
  // Brave/Opera/Vivaldi 등 크로뮴 계열은 크롬 웹스토어로
  if (/chrome\//.test(ua) || /crios/.test(ua) || /brave\//.test(ua) || /opr\//.test(ua) || /vivaldi/.test(ua)) {
    return 'https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn';
  }
  if (/firefox/.test(ua)) {
    return 'https://addons.mozilla.org/firefox/addon/ether-metamask/';
  }
  // 그 외(사파리 등)
  return 'https://metamask.io/download/';
}

/** 네트워크 전환 지원 */
const NETWORKS = {
  mainnet: {
    chainIdHex: '0x1',
    chainName: 'Ethereum Mainnet',
    rpcUrls: ['https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  sepolia: {
    chainIdHex: '0xAA36A7', // 11155111
    chainName: 'Sepolia Test Network',
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;

export async function switchNetwork(key: NetworkKey) {
  const mm = getMetaMaskProvider();
  if (!mm) throw new Error('MetaMask가 설치되어 있지 않습니다.');
  const target = NETWORKS[key];

  try {
    await (mm as any).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: target.chainIdHex }],
    });
  } catch (e: any) {
    if (e?.code === 4902) {
      await (mm as any).request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: target.chainIdHex,
          chainName: target.chainName,
          rpcUrls: target.rpcUrls,
          blockExplorerUrls: target.blockExplorerUrls,
          nativeCurrency: target.nativeCurrency,
        }],
      });
      await (mm as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: target.chainIdHex }],
      });
    } else {
      throw e;
    }
  }
}
