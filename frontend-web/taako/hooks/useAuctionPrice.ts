// hooks/useAuctionPrice.ts
"use client";

import api from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { sseLog, isSseDebug, sseLogForce } from "@/lib/logger";

type Options = {
	sseUrl?: string; // 기본: /v1/auctions/{id}/live
	pollUrl?: string; // 기본: /v1/auctions/{id}
	getPrice?: (json: any) => number | undefined; // 응답에서 currentPrice 추출기
	withCredentials?: boolean; // 세션 쿠키 사용 시 true
	pollMs?: number; // 폴링 주기 (기본 4000ms)
	token?: string; // 토큰을 querystring으로 넘기고 싶을 때 (?token=)
	// 추가 SSE 이벤트 콜백들 (필요한 것만 전달 가능)
	onSnapshot?: (snap: { auctionId: number; currentPrice?: number; endTs?: number; isEnd?: boolean }) => void;
	onEndTs?: (payload: { auctionId: number; endTs: number }) => void;
	onEnd?: (payload: { auctionId: number }) => void;
	onBid?: (payload: { auctionId: number; nickname: string; amount: string; time: string }) => void;
	onBuyNow?: (payload: { auctionId: number; nickname: string; amount: string; time: string }) => void;
	onHeartbeat?: (ts: number) => void;
	debug?: boolean; // 디버그 로그
};

export function useAuctionPrice(auctionId: number | string, initialPrice: number, opts: Options = {}) {
	const [price, setPrice] = useState<number>(initialPrice);
	const esRef = useRef<EventSource | null>(null);
	const pollTimerRef = useRef<any>(null);
	const backoffRef = useRef<number>(1500);

	// logging helper (stable per render)
	const log = (...a: any[]) => {
		if (opts.debug) sseLogForce("auction", ...a);
		else if (isSseDebug()) sseLog("auction", ...a);
	};

	// util helpers
	const parseNumber = (v: any): number | undefined => {
		if (typeof v === "number") return v;
		if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
		return undefined;
	};

	const handlePriceLike = (data: any) => {
		let next: any = undefined;
		if (typeof data?.currentPrice === "number") next = data.currentPrice;
		else if (typeof data?.result?.currentPrice === "number") next = data.result.currentPrice;
		else next = parseNumber(data?.current_price);
		if (typeof next === "number") setPrice(next);
	};

	// factory to create per-event handler (reduces nesting depth inside startSSE)
	const createSSEHandler = (eventName: string, handler: (data: any) => void) => {
		return (e: MessageEvent) => {
			let data: any;
			try {
				data = JSON.parse(e.data);
			} catch (err) {
				log("parse error", eventName, err);
				return;
			}
			if (eventName === "heartbeat") log("heartbeat", data);
			else log("event", eventName, data);
			handler(data);
		};
	};

	useEffect(() => setPrice(initialPrice), [initialPrice]);

	useEffect(() => {
		const baseLive = `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auctions/${auctionId}/live`;
		let sseUrl = baseLive;
		if (opts.sseUrl) sseUrl = opts.sseUrl;
		else if (opts.token) sseUrl = `${baseLive}?token=${encodeURIComponent(opts.token)}`;
		const pollUrl = opts.pollUrl ?? `/v1/auctions/${auctionId}`;
		const pollMs = opts.pollMs ?? 4000;
		const getPrice = opts.getPrice ?? ((j: any) => (typeof j?.result?.currentPrice === "number" ? j.result.currentPrice : j?.currentPrice));

		const startPolling = () => {
			if (pollTimerRef.current) return;
			pollTimerRef.current = setInterval(async () => {
				try {
					const { data: j } = await api.get(pollUrl, {
						withCredentials: opts.withCredentials ?? true,
					});
					const next = getPrice(j);
					if (typeof next === "number") setPrice(next);
				} catch {
					// 폴링 에러는 무시 (다음 틱에 재시도)
				}
			}, pollMs);
		};

		const stopPolling = () => {
			if (pollTimerRef.current) {
				clearInterval(pollTimerRef.current);
				pollTimerRef.current = null;
			}
		};

		// 재연결 수행 함수 (setTimeout 콜백으로 직접 전달)
		const performReconnect = () => {
			backoffRef.current = Math.min(backoffRef.current * 2, 15000);
			stopPolling();
			log("reconnecting...", { nextBackoff: backoffRef.current });
			startSSE();
		};

		function startSSE() {
			let es: EventSource | null = null;
			try {
				es = new EventSource(sseUrl, { withCredentials: opts.withCredentials ?? true } as EventSourceInit);
			} catch {
				log("EventSource construct failed → fallback to polling");
				startPolling();
				return;
			}
			esRef.current = es;
			log("connecting", { url: sseUrl, auctionId });
			es.onopen = () => log("open");

			// attach listeners
			es.addEventListener(
				"message",
				createSSEHandler("message", (d) => {
					log("price(message)");
					handlePriceLike(d);
				})
			);
			es.addEventListener(
				"price",
				createSSEHandler("price", (d) => {
					log("price(price)");
					handlePriceLike(d);
				})
			);
			es.addEventListener(
				"snapshot",
				createSSEHandler("snapshot", (data) => {
					handlePriceLike(data);
					const snapPayload = {
						auctionId: Number(data.auctionId),
						currentPrice: parseNumber(data.currentPrice ?? data.current_price),
						endTs: parseNumber(data.endTs ?? data.end_ts),
						isEnd: data.isEnd === 1 || data.is_end === "1" || data.isEnd === true,
					};
					opts.onSnapshot?.(snapPayload);
					if (typeof snapPayload.currentPrice === "number") setPrice(snapPayload.currentPrice);
				})
			);
			es.addEventListener(
				"end_ts",
				createSSEHandler("end_ts", (data) => {
					const payload = { auctionId: Number(data.auctionId), endTs: parseNumber(data.endTs ?? data.end_ts) || 0 };
					opts.onEndTs?.(payload);
				})
			);
			es.addEventListener(
				"end",
				createSSEHandler("end", (data) => {
					const payload = { auctionId: Number(data.auctionId) };
					opts.onEnd?.(payload);
				})
			);
			es.addEventListener(
				"bid",
				createSSEHandler("bid", (data) => {
					const payload = { auctionId: Number(data.auctionId), nickname: data.nickname, amount: String(data.amount), time: data.time };
					handlePriceLike(data);
					opts.onBid?.(payload);
				})
			);
			es.addEventListener(
				"buy_now",
				createSSEHandler("buy_now", (data) => {
					const payload = { auctionId: Number(data.auctionId), nickname: data.nickname, amount: String(data.amount), time: data.time };
					handlePriceLike(data);
					opts.onBuyNow?.(payload);
				})
			);
			es.addEventListener(
				"heartbeat",
				createSSEHandler("heartbeat", (data) => {
					const ts = parseNumber(data.ts);
					if (typeof ts === "number") opts.onHeartbeat?.(ts);
				})
			);

			es.onerror = (e) => {
				log("error, will reconnect", e);
				es?.close();
				esRef.current = null;
				startPolling();
				const delay = Math.min(backoffRef.current, 15000);
				log("schedule reconnect", { delay });
				setTimeout(performReconnect, delay);
			};
		}

		// 시작
		startSSE();

		// 정리
		return () => {
			esRef.current?.close();
			esRef.current = null;
			stopPolling();
			backoffRef.current = 1500;
		};
	}, [auctionId, opts.sseUrl, opts.pollUrl, opts.withCredentials, opts.pollMs, opts.token, opts.getPrice]);

	return [price, setPrice] as const;
}
