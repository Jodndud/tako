'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useEscrowState } from '@/hooks/useEscrowState';
import { ESCROW_STATE } from '@/lib/bc/escrowAbi';

type Props = {
  auctionId?: number | null;
  /** 운송장 미발급 등으로 결제 금지 */
  trackingMissing?: boolean;
  /** 과거 호환용: 외부에서 추가 비활성화 */
  externalDisabled?: boolean;
  /** 실제 결제 로직 (입금 tx) */
  onPay?: () => Promise<void> | void;
  className?: string;
  disabledReason?: string;
};

export default function PayButton({
  auctionId,
  trackingMissing = false,
  externalDisabled = false,
  onPay,
  className,
  disabledReason,
}: Props) {
  const [paying, setPaying] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const hasAuction = typeof auctionId === 'number' && Number.isFinite(auctionId);
  const { state, loading: stateLoading, error, refetch } = hasAuction
    ? useEscrowState(auctionId as number, true, 10_000)
    : { state: undefined, loading: false, error: '', refetch: async () => ({}) as any };

  const isPaid = useMemo(() => {
    if (state === undefined) return false;
    return state === ESCROW_STATE.AwaitingConfirmation || state === ESCROW_STATE.Complete;
  }, [state]);

  const label = paying ? '결제 중...' : isPaid ? '결제 완료' : '결제하기';

  const disabled =
    trackingMissing ||
    externalDisabled ||
    paying ||
    isPaid ||
    !hasAuction ||
    stateLoading;

  const title =
    trackingMissing
      ? disabledReason ?? '운송장 발급 후 결제 가능합니다.'
      : !hasAuction
      ? disabledReason ?? '경매 정보가 없습니다.'
      : undefined;

  const onClick = useCallback(async () => {
    setErrMsg('');
    if (disabled) return;
    try {
      setPaying(true);
      await onPay?.();     // 부모에서 deposit 트랜잭션 수행
      await refetch();     // 즉시 상태 갱신
    } catch (e: any) {
      const code = e?.code ?? e?.data?.code;
      if (code === 4001) setErrMsg('사용자가 결제를 취소했습니다.');
      else if (code === -32002) setErrMsg('이전 요청이 진행 중입니다. MetaMask 창을 확인해주세요.');
      else setErrMsg('결제 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setPaying(false);
    }
  }, [disabled, onPay, refetch]);

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={
          className ??
          'text-sm h-10 w-[120px] !rounded-md bg-[#191924] border border-[#353535] hover:bg-[#242433] text-[#dedede]'
        }
      >
        {label}
      </Button>

      {(errMsg || error) && (
        <div className="text-xs text-[#ffb4b4] bg-[#2a1616] border border-[#5c2c2c] rounded px-2 py-1">
          {errMsg || error}
        </div>
      )}
    </div>
  );
}
