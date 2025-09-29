// hooks/useWallet.ts
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { formatEther } from 'ethers';
import {
  getBrowserProvider,
  getMetaMaskProvider,
  friendlyChainName,
  getMetaMaskInstallUrl,
  switchNetwork as ethSwitchNetwork,
  type NetworkKey,
} from '@/lib/ethereum';
import type { MetaMaskInpageProvider } from '@metamask/providers';

const AUTO_CONNECT_KEY = 'MM_AUTO_CONNECT';

interface UseWalletReturn {
  walletAddress: string;
  chainName: string;
  balance: string;
  error: string;
  loading: boolean;
  needsMetaMask: boolean;
  isInstalling: boolean;
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (key: NetworkKey) => Promise<void>;
  installMetaMask: () => void;
  reloadAndAutoConnect: () => void;
}

const isUserRejected = (e: any) => {
  const code = e?.code ?? e?.error?.code;
  return code === 4001 || code === 'ACTION_REJECTED';
};

const useWallet = (): UseWalletReturn => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [chainName, setChainName] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [needsMetaMask, setNeedsMetaMask] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const connectingRef = useRef(false); // 중복 클릭 방지

  const prettyEth = (wei: bigint) => {
    const eth = parseFloat(formatEther(wei));
    return Number.isFinite(eth) ? eth.toFixed(4) : '0.0000';
  };

  const fetchChainAndBalance = useCallback(async (address: string) => {
    const provider = getBrowserProvider();
    if (!provider) return;
    try {
      const net = await provider.getNetwork();
      const bal = await provider.getBalance(address);
      setChainName(friendlyChainName(net.chainId, net.name));
      setBalance(`${prettyEth(bal)} ETH`);
    } catch (e) {
      console.error('[wallet] fetchChainAndBalance error', e);
      setChainName('');
      setBalance('');
    }
  }, []);

  // 새로고침 + 자동연결 플로우
  const reloadAndAutoConnect = useCallback(() => {
    try {
      localStorage.setItem(AUTO_CONNECT_KEY, '1');
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, []);

  // ⚠️ 서버 저장 없음: 연결만 수행하고 로컬 상태/잔액만 갱신
  const connectWallet = useCallback(async () => {
    if (connectingRef.current) return;
    connectingRef.current = true;

    setError('');
    setNeedsMetaMask(false);
    setLoading(true);
    try {
      let provider = getBrowserProvider();

      if (!provider) {
        // 메타마스크 없음 → 설치 유도 + 장기 폴링
        setNeedsMetaMask(true);
        setIsInstalling(true);

        const found = await waitForMetaMask(180000, 1000); // ⏱ 최대 3분, 1초 간격
        setIsInstalling(false);

        if (!found) {
          setError('메타마스크가 감지되지 않았습니다. "새로고침 후 자동 연결"을 눌러주세요.');
          return;
        }

        provider = getBrowserProvider();
        if (!provider) {
          setError('메타마스크 감지에 실패했습니다. 새로고침 후 다시 시도해주세요.');
          return;
        }
        setNeedsMetaMask(false);
      }

      // 계정 요청
      const signerAccounts = await provider.send('eth_requestAccounts', []);
      const addr = (signerAccounts?.[0] as string) ?? '';

      if (!addr) {
        setError('지갑 계정을 찾을 수 없어요. MetaMask를 확인해주세요.');
        return;
      }

      // 로컬 상태만 갱신 (DB 저장은 컴포넌트에서 버튼으로!)
      setWalletAddress(addr);
      await fetchChainAndBalance(addr);
    } catch (err: any) {
      if (isUserRejected(err)) {
        setError('연결이 취소됐어요. 다시 연결해주세요.');
      } else if (err?.code === -32002) {
        setError('MetaMask에서 이전 요청이 진행 중입니다. 확장창을 확인해주세요.');
      } else {
        setError('지갑 연결 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.');
      }
      console.error('[wallet] connect error:', err);
    } finally {
      setLoading(false);
      connectingRef.current = false;
      // 자동연결 플래그 제거(루프 방지)
      try { localStorage.removeItem(AUTO_CONNECT_KEY); } catch {}
    }
  }, [fetchChainAndBalance]);

  const disconnect = useCallback(() => {
    setWalletAddress('');
    setChainName('');
    setBalance('');
    setError('');
    try { localStorage.removeItem(AUTO_CONNECT_KEY); } catch {}
  }, []);

  const installMetaMask = useCallback(() => {
    // 설치하러 나가기 전에 자동연결 플래그를 미리 켬
    try { localStorage.setItem(AUTO_CONNECT_KEY, '1'); } catch {}
    const url = getMetaMaskInstallUrl();
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const switchNetwork = useCallback(async (key: NetworkKey) => {
    setError('');
    setLoading(true);
    try {
      await ethSwitchNetwork(key);
      if (walletAddress) {
        await fetchChainAndBalance(walletAddress);
      }
    } catch (e: any) {
      if (e?.code === 4001) setError('사용자가 네트워크 전환을 거절했습니다.');
      else if (e?.code === -32002) setError('이전 네트워크 전환 요청이 진행 중입니다. MetaMask 창을 확인하세요.');
      else setError(e?.message || '네트워크 전환 실패');
      console.error('[wallet] switchNetwork error', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [walletAddress, fetchChainAndBalance]);

  // MetaMask 설치 감지: interval 동안 window.ethereum 등장 대기
  const waitForMetaMask = (timeoutMs = 180000, intervalMs = 1000): Promise<boolean> =>
    new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).ethereum) return resolve(true);

      let elapsed = 0;
      const iv = window.setInterval(() => {
        elapsed += intervalMs;
        if ((window as any).ethereum) {
          window.clearInterval(iv);
          document.removeEventListener('visibilitychange', onVisible);
          resolve(true);
        } else if (elapsed >= timeoutMs) {
          window.clearInterval(iv);
          document.removeEventListener('visibilitychange', onVisible);
          resolve(false);
        }
      }, intervalMs);

      const onVisible = () => {
        if ((window as any).ethereum) {
          window.clearInterval(iv);
          document.removeEventListener('visibilitychange', onVisible);
          resolve(true);
        }
      };
      document.addEventListener('visibilitychange', onVisible);
    });

  // 이벤트 바인딩 + 초기 자동 연결
  useEffect(() => {
    const mm = getMetaMaskProvider() as MetaMaskInpageProvider | undefined;
    if (!mm) {
      setNeedsMetaMask(true);
    }

    // ⚠️ 서버 저장 금지: 계정 바뀌면 로컬 상태/잔액만 업데이트
    const onAccountsChanged = async (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? (args[0] as string[]) : [];
      const next = accounts[0] ?? '';

      if (!next) {
        disconnect();
        return;
      }
      setWalletAddress(next);
      try { await fetchChainAndBalance(next); } catch {}
    };

    const onChainChanged = async () => {
      if (!walletAddress) return;
      try { await fetchChainAndBalance(walletAddress); } catch (e) {
        console.error('[wallet] chainChanged refetch error', e);
      }
    };

    const onDisconnect = () => {
      disconnect();
    };

    mm?.on?.('accountsChanged', onAccountsChanged as any);
    mm?.on?.('chainChanged', onChainChanged as any);
    mm?.on?.('disconnect', onDisconnect as any);

    (async () => {
      try {
        const provider = getBrowserProvider();
        if (!provider) return;

        const accounts = await provider.send('eth_accounts', []);
        if (accounts?.[0]) {
          setNeedsMetaMask(false);
          setWalletAddress(accounts[0]);
          await fetchChainAndBalance(accounts[0]); // 서버 저장 없음
          return;
        }

        // 설치 후 복귀 자동연결
        const shouldAuto = (() => {
          try { return !!localStorage.getItem(AUTO_CONNECT_KEY); } catch { return false; }
        })();
        if (shouldAuto) {
          await connectWallet(); // 서버 저장 없음
        }
      } catch { /* noop */ }
    })();

    return () => {
      mm?.removeListener?.('accountsChanged', onAccountsChanged as any);
      mm?.removeListener?.('chainChanged', onChainChanged as any);
      mm?.removeListener?.('disconnect', onDisconnect as any);
    };
  }, [walletAddress, fetchChainAndBalance, disconnect, connectWallet]);

  return {
    walletAddress,
    chainName,
    balance,
    error,
    loading,
    needsMetaMask,
    isInstalling,
    connectWallet,
    disconnect,
    switchNetwork,
    installMetaMask,
    reloadAndAutoConnect,
  };
};

export default useWallet;
