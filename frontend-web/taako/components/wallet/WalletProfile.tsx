// components/wallet/WalletProfile.tsx
'use client';

import React, { useMemo, useState, useCallback, useMemo as useMemo2 } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useWallet from '@/hooks/useWallet';
import { sendWalletAddress } from '@/lib/bc/wallet';
import { useMyInfo } from '@/hooks/useMyInfo';
import type { UiError, NetworkTarget } from '@/types/wallet';

// ---------- 오류 파서 ----------
function toUiError(err: any): UiError {
  const code = err?.code ?? err?.data?.code;
  if (code === 4001) return { title: '사용자가 요청을 취소했어요.' };
  if (code === -32002) return { title: '메타마스크 요청이 이미 진행 중이에요. 지갑 팝업을 확인해 주세요.' };

  const status = err?.response?.status ?? err?.status;
  const serverMsg = err?.response?.data?.message ?? err?.data?.message ?? err?.message;

  if (status === 409) return { title: '이미 사용 중인 지갑 주소입니다.' };
  if (status === 400) return { title: '요청이 올바르지 않아요.', detail: serverMsg };
  if (status === 401) return { title: '로그인이 필요해요.' };
  if (status === 403) return { title: '권한이 없어요.' };
  if (status === 404) return { title: '대상을 찾을 수 없어요.' };
  if (status === 429) return { title: '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.' };
  if (status >= 500) return { title: '서버 오류가 발생했어요.', detail: serverMsg };

  if (err?.name === 'TypeError' && /fetch/i.test(err?.message ?? '')) {
    return { title: '네트워크 연결을 확인해 주세요.' };
  }
  return { title: serverMsg || '알 수 없는 오류가 발생했어요.' };
}

// ---------- 유틸 ----------
const sameAddr = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();
const short = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

const ErrorBanner = ({ error }: { error?: UiError | null }) =>
  !error ? null : (
    <div className="rounded-lg border border-[#5c2c2c] bg-[#2a1616] p-3 text-sm text-[#ffb4b4]">
      <div className="font-semibold">{error.title}</div>
      {error.detail && <div className="text-[#ffdede] mt-1">{error.detail}</div>}
    </div>
  );

const WalletProfile: React.FC = () => {
  const qc = useQueryClient();

  const {
    walletAddress: connected,
    chainName,
    balance,
    error: walletErrorRaw,
    loading,
    needsMetaMask,
    connectWallet,
    switchNetwork,
    installMetaMask,
    reloadAndAutoConnect,
    isInstalling,
  } = useWallet();

  const { me, meLoading, meError, storedWallet } = useMyInfo();

  const hasStored = !!storedWallet;
  const hasConnected = !!connected;
  const isMismatch = hasStored && hasConnected && !sameAddr(storedWallet, connected);

  const {
    mutate: updateWallet,
    isPending: isUpdating,
    error: updateErrorRaw,
  } = useMutation({
    mutationFn: async (address: string) => await sendWalletAddress(address),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['myInfo'] });
    },
  });

  const uiError: UiError | null = useMemo2(() => {
    if (updateErrorRaw) return toUiError(updateErrorRaw);
    if (walletErrorRaw) return toUiError(walletErrorRaw);
    if (meError) return toUiError(meError);
    return null;
  }, [updateErrorRaw, walletErrorRaw, meError]);

  const [target, setTarget] = useState<NetworkTarget>('sepolia');

  // 연결된 지갑을 내 계정에 저장
  const onAdoptConnected = useCallback(() => {
    if (!connected) return;
    updateWallet(connected);
  }, [connected, updateWallet]);

  // 최초 연결(등록 없음) 시: MetaMask 연결만 실행 (서버 저장은 버튼에서만)
  const onConnectThenSave = useCallback(async () => {
    await connectWallet();
  }, [connectWallet]);

  // 상단 우측 "지갑 바꾸기" 작은 버튼 → 경고 후 진행(연결만)
  const onConfirmChangeWallet = useCallback(async () => {
    const ok = typeof window !== 'undefined' && window.confirm(
      [
        '지갑을 변경하면 진행 중인 경매와 정산에 영향이 있을 수 있어요.',
        '진행 중인 경매를 모두 완료한 뒤 변경하는 것을 권장합니다.',
        '',
        '지갑을 변경하시겠습니까?',
      ].join('\n')
    );
    if (!ok) return;
    await connectWallet();
  }, [connectWallet]);

  const loadingAny = loading || meLoading || isUpdating;

  // ✅ 잔액은 "DB 저장 지갑"과 "브라우저 연결 지갑"이 일치할 때만 노출
  const showBalance = hasStored && hasConnected && sameAddr(storedWallet, connected);
  const safeBalance = showBalance ? (balance || '-') : '-';

  return (
    <div className="relative flex-1 p-8 border border-[#353535] bg-[#191924] rounded-xl flex justify-between">
      {/* 상단 우측 작은 "지갑 바꾸기" 버튼: 저장된 지갑이 있을 때만 노출 */}
      {hasStored && (
        <button
          onClick={onConfirmChangeWallet}
          className="absolute top-4 right-4 text-xs px-2 py-1 rounded-md border border-[#444] text-[#dcdcdc] hover:bg-[#242433]"
          disabled={loadingAny}
          aria-label="지갑 바꾸기"
          title="지갑 바꾸기"
        >
          지갑 바꾸기
        </button>
      )}

      <div className="flex flex-col gap-4">
        <h3 className="text-white text-xl font-semibold">내 지갑 정보</h3>

        <ErrorBanner error={uiError} />

        {/* 메타마스크 미설치 & 미연결 & 미등록 */}
        {needsMetaMask && !hasConnected && !hasStored && (
          <div className="flex flex-col gap-3">
            <p className="text-[#D2D2D2]">메타마스크가 설치되어 있지 않습니다.</p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={installMetaMask} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg">
                메타마스크 설치하기
              </button>
              <button onClick={connectWallet} disabled={loadingAny} className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg">
                {isInstalling ? '설치 감지 중...' : loadingAny ? '확인 중...' : '설치 완료 — 자동 연결'}
              </button>
              <button onClick={reloadAndAutoConnect} className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg">
                새로고침 후 자동 연결
              </button>
            </div>
            <p className="text-xs text-[#9aa0a6]">설치 후 이 탭으로 돌아오면 자동으로 연결을 시도합니다.</p>
          </div>
        )}

        {/* 정보 영역: 지갑/네트워크/잔액 */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <span className="text-[#D2D2D2]">지갑</span>
            <span className="text-2xl text-[#A4B2FF] font-semibold">
              {hasStored ? short(storedWallet!) : '-'}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="text-[#D2D2D2]">네트워크</span>
            <span className="text-lg text-yellow-400 font-medium">{hasConnected ? (chainName || '-') : '-'}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[#D2D2D2]">잔액</span>
            <span className="text-lg text-green-400 font-medium">{safeBalance}</span>
          </div>
        </div>

        {/* 네트워크 전환 */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <select
            className="bg-[#101018] text-white border border-[#353535] rounded-lg px-3 py-2"
            value={target}
            onChange={(e) => setTarget(e.target.value as NetworkTarget)}
          >
            <option value="sepolia">Sepolia</option>
            <option value="mainnet">Mainnet</option>
          </select>
          <button
            onClick={() => switchNetwork(target)}
            disabled={loadingAny}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 text-white font-semibold py-2 px-4 rounded-lg"
          >
            {loadingAny ? '전환 중...' : '네트워크 전환'}
          </button>
        </div>

        {/* 저장된 지갑과 연결된 지갑이 다른 경우(불일치 안내 + 액션) */}
        {isMismatch && (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border border-[#5c2c2c] bg-[#2a1616] p-3 text-sm text-[#ffb4b4]">
              <div className="font-semibold mb-1">연결된 지갑과 계정에 저장된 지갑이 다릅니다.</div>
              <div className="text-[#ffdede]">
                <div>저장된 주소(DB): <span className="font-mono">{storedWallet}</span></div>
                <div>연결된 주소(브라우저): <span className="font-mono">{connected}</span></div>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={onAdoptConnected}
                disabled={isUpdating || !connected}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {isUpdating ? '갱신 중...' : '연결된 지갑으로 변경(저장)'}
              </button>
            </div>

            {/* ✅ 안내 문구: 프로그램으로 메타마스크 계정 전환은 불가 */}
            <div className="text-xs text-[#cfcfcf]">
              메타마스크 확장에서 <span className="font-mono">{short(storedWallet!)}</span> 계정으로 직접 전환해 주세요.
              (브라우저에서 지갑 계정은 앱이 임의로 변경할 수 없습니다)
            </div>
          </div>
        )}

        {/* DB 저장된 지갑이 없고, 아직 브라우저도 미연결 */}
        {!hasStored && !hasConnected && !needsMetaMask && (
          <button
            onClick={onConnectThenSave}
            disabled={loadingAny}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg"
          >
            {loadingAny ? '연결중...' : '지갑 연동하기'}
          </button>
        )}

        {/* DB 저장된 지갑이 없고, 브라우저 지갑은 연결됨 → 등록 버튼만 제공
            (상단 정보 영역의 "지갑" 값은 여전히 '-' 로 유지됨) */}
        {!hasStored && hasConnected && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[#D2D2D2]">브라우저 연결</span>
              <span className="text-2xl text-[#A4B2FF] font-semibold">{short(connected!)}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={onAdoptConnected}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-500 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg"
              >
                {isUpdating ? '저장 중...' : '내 계정에 등록'}
              </button>
              <button
                onClick={onConfirmChangeWallet}
                className="bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg"
                disabled={loadingAny}
              >
                다른 지갑 연결
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletProfile;
