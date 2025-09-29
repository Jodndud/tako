// hooks/useBidAmount.ts
"use client";

import { useEffect, useMemo, useState } from "react";

/** step(예: 0.01) 기준으로 반올림 */
function computeDecimals(step: number) {
	const s = step.toString();
	if (s.includes("e-")) return parseInt(s.split("e-")[1], 10);
	const dot = s.indexOf(".");
	return dot >= 0 ? s.length - dot - 1 : 0;
}

function roundToStep(v: number, step: number, decimals: number) {
	if (!Number.isFinite(v) || !Number.isFinite(step) || step <= 0) return v;
	// 정수 스케일 방식: (v / step) 반올림 후 다시 step 곱
	const units = Math.round(v / step);
	const q = units * step;
	return Number(q.toFixed(decimals));
}

export function useBidAmount(currentPrice: number, minIncrement: number, maxBid?: number) {
	const decimals = useMemo(() => computeDecimals(minIncrement), [minIncrement]);

	const minAllowed = useMemo(() => roundToStep(currentPrice + minIncrement, minIncrement, decimals), [currentPrice, minIncrement, decimals]);

	const initial = useMemo(() => Math.max(minAllowed, 0), [minAllowed]);

	const [amount, setAmount] = useState<number>(initial);

	// currentPrice 변경 시 최소 허용가 기준 재설정 (반올림 포함)
	useEffect(() => {
		setAmount(Math.max(minAllowed, 0));
	}, [minAllowed]);

	const bump = (delta: number) => {
		setAmount((prev) => {
			const base = minAllowed;
			const start = Number.isFinite(prev) ? prev : base;
			const next = Math.max(start + delta, base);
			const capped = maxBid != null ? Math.min(next, maxBid) : next;
			return roundToStep(capped, minIncrement, decimals);
		});
	};

	/** 제출 가능 여부를 외부 상태와 함께 판단 */
	const canSubmit = (opts: { submitting: boolean; disabled?: boolean; iAmTop?: boolean }) => {
		if (opts.disabled || opts.submitting || opts.iAmTop) return false;
		if (!Number.isFinite(amount)) return false;
		if (amount < minAllowed) return false;
		if (maxBid != null && amount > maxBid) return false;
		return true;
	};

	return { amount, setAmount, bump, minAllowed, canSubmit };
}
