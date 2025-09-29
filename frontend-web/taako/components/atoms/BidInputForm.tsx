// components/atoms/BidInputForm.tsx
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { queueBid, genRequestId } from "@/lib/auction";
import type { BidQueueResponse } from "@/types/bid";

import { Button } from "@/components/ui/button";
import { useBidLock } from "@/hooks/useBidLock";

// ---------- 유틸: 소수 정밀 덧셈/정규화 ----------
const decLen = (n: number) => {
  const s = String(n);
  const i = s.indexOf(".");
  return i === -1 ? 0 : s.length - i - 1;
};

// 특정 precision으로 반올림 고정
const roundTo = (n: number, precision: number) => {
  const k = Math.pow(10, precision);
  return Math.round(n * k) / k;
};

// 정밀 덧셈: (a + b)를 precision 기준으로 정확히 계산
const addPrecise = (a: number, b: number, precision: number) => {
  const k = Math.pow(10, precision);
  const A = Math.round(a * k);
  const B = Math.round(b * k);
  return (A + B) / k;
};

// 입력 파서 (최대 precision까지 허용)
function parseAmountStrict(input: string, maxPrecision: number): number {
  const cleaned = input.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  const parts = cleaned.split(".");
  if (parts.length > 2) return NaN;
  let [intPart, fracPart = ""] = parts;
  if (fracPart.length > maxPrecision) fracPart = fracPart.slice(0, maxPrecision);
  const composed = fracPart ? `${intPart}.${fracPart}` : intPart;
  const n = Number(composed);
  if (!Number.isFinite(n)) return NaN;
  return roundTo(n, maxPrecision);
}

// --- 추가: precision 기반 숫자 포맷터 ---
const fmt = (n: number, p: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: p, maximumFractionDigits: p });

type Guards = {
  isMyAuction?: boolean; // 내 경매면 비활성화
  isActive?: boolean;    // 진행 중이 아니면 비활성화
};

type BidInputFormProps = {
  auctionId: string | number;
  currentPrice: number;
  minIncrement: number;
  maxBid?: number;
  token?: string;
  onBidApplied?: (nextPrice: number, resp: BidQueueResponse) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  guards?: Guards;
};

export default function BidInputForm({
  auctionId,
  currentPrice,
  minIncrement,
  maxBid,
  token,
  onBidApplied,
  placeholder,
  disabled,
  className,
  guards,
}: Readonly<BidInputFormProps>) {
  // 정밀도 기준: minIncrement와 currentPrice 중 더 긴 소수 길이 사용
  const precision = useMemo(
    () => Math.max(decLen(minIncrement), decLen(currentPrice)),
    [minIncrement, currentPrice]
  );

  // 최소입찰가: currentPrice + minIncrement (정밀 계산)
  const minAllowed = useMemo(
    () => addPrecise(currentPrice, minIncrement, precision),
    [currentPrice, minIncrement, precision]
  );

  // 표시 금액 상태
  const [amount, setAmount] = useState<number>(minAllowed);
  const [amountStr, setAmountStr] = useState<string>(() => minAllowed.toFixed(precision));

  // 최고가 잠금/상태
  const { iAmTop, lockAsTop, resetLock } = useBidLock(currentPrice);

  // 내가 마지막으로 "확정"한 최고가
  const myTopPriceRef = useRef<number>(0);

  // 서버 응답 후 버튼 블록
  const [blocked, setBlocked] = useState(false);

  // 메시지/상태
  const wasTopRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [okMsg, setOkMsg] = useState<string>("");

  // 진행 불가 하드 가드 사유
  const hardBlockReason = useMemo<string | null>(() => {
    if (guards?.isMyAuction) return "본인 경매에는 입찰할 수 없습니다.";
    if (guards?.isActive === false) return "진행 중이 아닌 경매입니다.";
    return null;
  }, [guards]);

  // iAmTop 변화 안내
  useEffect(() => {
    if (iAmTop) {
      wasTopRef.current = true;
      return;
    }
    if (wasTopRef.current) {
      setOkMsg("다른 사용자가 더 높은 금액으로 입찰하여 현재 최고가가 아닙니다.");
      wasTopRef.current = false;
    }
  }, [iAmTop]);

  const requestId = genRequestId();

  // 현재가 변동 시(실시간) 상태 보정
  useEffect(() => {
    // 현재가가 내 확정가를 초과하면 다시 시도 가능
    if (currentPrice > (myTopPriceRef.current || 0)) {
      setBlocked(false);
    }
  }, [currentPrice]);

  // 상대가 내 확정가를 넘어섰는지
  const opponentOvertook = currentPrice > (myTopPriceRef.current || 0);

  // 입력 표시 보정
  useEffect(() => {
    const fixed = precision > 0 ? roundTo(amount, precision).toFixed(precision) : String(Math.round(amount));
    setAmountStr(fixed);
  }, [amount, precision]);

  // 금액 변경 핸들러
  const onChangeAmount = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextStr = e.target.value;
      setAmountStr(nextStr);
      const parsed = parseAmountStrict(nextStr, precision);
      if (Number.isFinite(parsed)) setAmount(parsed);
    },
    [precision]
  );

  // 증분(+x) 버튼
  const bump = useCallback(
    (delta: number) => {
      const next = addPrecise(amount, delta, precision);
      setAmount(next);
      setAmountStr(precision > 0 ? next.toFixed(precision) : String(Math.round(next)));
    },
    [amount, precision]
  );

  // “최소입찰” 버튼
  const setToMinAllowed = useCallback(() => {
    setAmount(minAllowed);
    setAmountStr(precision > 0 ? minAllowed.toFixed(precision) : String(Math.round(minAllowed)));
  }, [minAllowed, precision]);

  // 제출 가능 여부
  const meetsMin = Number.isFinite(amount) && amount >= minAllowed;
  const baseEnabled =
    !disabled &&
    !submitting &&
    !iAmTop &&
    !blocked &&
    opponentOvertook &&
    !hardBlockReason;

  const submitEnabled = baseEnabled && meetsMin;

  // 제출
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!submitEnabled) return;

    setError("");
    setOkMsg("");
    setSubmitting(true);

    try {
      const requestId = genRequestId();
      const res = await queueBid(auctionId, roundTo(amount, precision), { token, requestId });

      const serverPrice = res.result?.currentPrice ?? amount;
      onBidApplied?.(serverPrice, res);

      const status = (res.result?.status || "").toUpperCase();

      if (status === "FAILED") {
        setError("입찰 처리에 실패했습니다. 경매 상태와 금액을 확인해주세요.");
        setBlocked(true);
      } else if (status === "QUEUED") {
        myTopPriceRef.current = serverPrice;
        lockAsTop(serverPrice);
        setOkMsg(`입찰 요청중! 요청 가격: ${fmt(serverPrice, precision)}`);
        setBlocked(true);
      } 
    } catch (err: any) {
      setError(err?.message || "입찰 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // 버튼 라벨
  let submitLabel: string;
  if (submitting) submitLabel = "전송 중...";
  else if (hardBlockReason) submitLabel = "입찰 불가";
  else if (!opponentOvertook) submitLabel = "상대 입찰 대기";
  else if (!meetsMin) submitLabel = "최소입찰가 미만";
  else if (blocked) submitLabel = "처리 대기";
  else submitLabel = "입찰하기";

  return (
    <form
      onSubmit={handleSubmit}
      className={className ?? "flex flex-col gap-3 p-4 border rounded-xl bg-[#111] text-white"}
    >
      <label className="text-sm opacity-80" htmlFor={`bid-input-${auctionId}`}>
        입찰가
      </label>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          inputMode="decimal"
          value={amountStr}
          onChange={onChangeAmount}
          disabled={!!hardBlockReason || disabled || submitting || iAmTop}
          className="flex-1 px-3 py-2 rounded-md bg-[#1a1a1a] border border-[#333] focus:outline-none"
          placeholder={
            placeholder ?? `${fmt(minAllowed, precision)} 이상 (증분 ${fmt(minIncrement, precision)})`
          }
          id={`bid-input-${auctionId}`}
        />

        <Button type="submit" disabled={!submitEnabled} className="min-w-24">
          {submitLabel}
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => bump(minIncrement)}
          disabled={!!hardBlockReason || disabled || submitting || iAmTop}
          className="px-3 py-1 rounded-md bg-[#1f1f2a] border border-[#333]"
        >
          +{fmt(minIncrement, precision)}
        </button>
        <button
          type="button"
          onClick={() => bump(minIncrement * 5)}
          disabled={!!hardBlockReason || disabled || submitting || iAmTop}
          className="px-3 py-1 rounded-md bg-[#1f1f2a] border border-[#333]"
        >
          +{fmt(minIncrement * 5, precision)}
        </button>
        <button
          type="button"
          onClick={() => bump(minIncrement * 10)}
          disabled={!!hardBlockReason || disabled || submitting || iAmTop}
          className="px-3 py-1 rounded-md bg-[#1f1f2a] border border-[#333]"
        >
          +{fmt(minIncrement * 10, precision)}
        </button>
        <button
          type="button"
          onClick={setToMinAllowed}
          disabled={!!hardBlockReason || disabled || submitting || iAmTop}
          className="px-3 py-1 rounded-md bg-[#1f1f2a] border border-[#333]"
        >
          최소입찰
        </button>
        {maxBid != null && (
          <span className="ml-auto text-xs opacity-60 self-center">최대 {fmt(maxBid, precision)}</span>
        )}
      </div>

      {/* 경고/안내 메시지들 */}
      {hardBlockReason && <p className="text-sm text-red-400">{hardBlockReason}</p>}

      {!iAmTop && !submitting && Number.isFinite(amount) && amount < minAllowed && (
        <p className="text-xs text-red-400">
          입찰가는 {fmt(minAllowed, precision)} 이상이어야 합니다.
        </p>
      )}

      {!(currentPrice > (myTopPriceRef.current || 0)) && !iAmTop && !hardBlockReason && (
        <p className="text-xs text-amber-300">
          상대방의 더 높은 입찰이 발생하면 입찰할 수 있습니다.
        </p>
      )}

      {iAmTop && !error && (
        <p className="text-xs text-amber-300">
          내 입찰이 현재 최고가입니다. 다른 사용자가 올릴 때까지 대기하세요.
        </p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
      {okMsg && <p className="text-sm text-emerald-400">{okMsg}</p>}
    </form>
  );
}
