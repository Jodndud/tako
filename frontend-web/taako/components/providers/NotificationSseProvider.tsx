"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationToastStore } from "@/stores/useNotificationToastStore";
import { useQueryClient } from "@tanstack/react-query";
import { resolveNotificationPath } from "@/lib/notificationRoute";
import { sseLog } from "@/lib/logger";
import { EventStreamContentType, fetchEventSource } from "@microsoft/fetch-event-source";

function isRecord(v: unknown): v is Record<string, any> {
	return !!v && typeof v === "object" && !Array.isArray(v);
}

function parseData(data: any): unknown {
	try {
		if (typeof data === "string") {
			return JSON.parse(data);
		}
	} catch {
		// not JSON string
	}
	return data;
}

function toToastFromEvent(eventName: string, payload: unknown) {
	// payload can be NotificationEvent-like or arbitrary map
	if (isRecord(payload)) {
		const title = payload.title ?? undefined;
		const message = payload.message ?? payload.msg ?? payload.text ?? undefined;
		const link = payload.link ?? payload.url ?? undefined;
		return { type: String(eventName), title, message: message ?? JSON.stringify(payload), link };
	}
	let msg = "";
	if (payload != null) {
		if (typeof payload === "string") msg = payload;
		else msg = JSON.stringify(payload);
	}
	return { type: String(eventName), title: undefined, message: msg, link: undefined };
}

export default function NotificationSseProvider() {
	const token = useAuthStore((s) => s.token);
	const pushToast = useNotificationToastStore((s) => s.push);
	const qc = useQueryClient();
	const controllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		const base = process.env.NEXT_PUBLIC_API_BASE_URL;
		if (!base) return;

		function cleanup() {
			if (controllerRef.current) {
				controllerRef.current.abort();
				controllerRef.current = null;
			}
		}

		if (!token) {
			cleanup();
			return;
		}

		const raw = token.startsWith("Bearer ") ? token.slice(7) : token;
		const url = `${base.replace(/\/$/, "")}/v1/notifications/stream`;
		const log = (...args: any[]) => sseLog("notification", ...args);

		cleanup();
		const ctrl = new AbortController();
		controllerRef.current = ctrl;

		const handleEvent = (name: string, data: unknown) => {
			const DEFAULT_TITLES: Record<string, string> = {
				WISH_AUCTION_STARTED: "위시한 경매가 시작됨",
				WISH_AUCTION_DUE_SOON: "위시한 경매 마감 임박",
				WISH_AUCTION_ENDED: "위시한 경매 종료",
				WISH_CARD_LISTED: "위시한 카드가 새로 등록됨",
				AUCTION_NEW_INQUIRY: "내 경매에 새 문의가 등록됨",
				INQUIRY_ANSWERED: "내 문의에 답변이 달렸습니다",
				AUCTION_WON: "경매 낙찰",
				BID_ACCEPTED: "입찰 반영 성공",
				BID_REJECTED: "입찰 거절",
				BID_FAILED: "입찰 반영 실패",
				BID_OUTBID: "상위 입찰 발생으로 최고가 지위 상실",
				DELIVERY_STARTED: "배송 시작",
				DELIVERY_STATUS_CHANGED: "배송 상태 변경",
				DELIVERY_CONFIRM_REQUEST: "구매 확정 요청",
				DELIVERY_CONFIRMED_SELLER: "구매 확정 완료(판매자)",
				AUCTION_CLOSED_SELLER: "경매 종료(판매자)",
				AUCTION_CANCELED: "경매 취소",
				NOTICE_NEW: "새 공지",
			} as any;

			const UI_LEVEL: Record<string, "info" | "success" | "warning" | "error"> = {
				WISH_AUCTION_STARTED: "info",
				WISH_AUCTION_DUE_SOON: "warning",
				WISH_AUCTION_ENDED: "info",
				WISH_CARD_LISTED: "info",
				AUCTION_NEW_INQUIRY: "info",
				INQUIRY_ANSWERED: "info",
				AUCTION_WON: "success",
				BID_ACCEPTED: "success",
				BID_REJECTED: "warning",
				BID_FAILED: "error",
				BID_OUTBID: "warning",
				DELIVERY_STARTED: "info",
				DELIVERY_STATUS_CHANGED: "info",
				DELIVERY_CONFIRM_REQUEST: "warning",
				DELIVERY_CONFIRMED_SELLER: "success",
				AUCTION_CLOSED_SELLER: "info",
				AUCTION_CANCELED: "warning",
				NOTICE_NEW: "info",
			};

			if (isRecord(data)) {
				const title = (data.title as string | undefined) ?? DEFAULT_TITLES[name];
				const message = (data.message as string | undefined) ?? (data.msg as string | undefined) ?? (data.text as string | undefined);
				const link = (data.link as string | undefined) ?? (data.url as string | undefined);
				const causeId = data.causeId as number | string | undefined;
				const level = UI_LEVEL[name] ?? "info";
				const computedPath = link || resolveNotificationPath(name, causeId as any) || undefined;
				pushToast({ type: level, rawType: name, title, message: message ?? JSON.stringify(data), link: computedPath, causeId });
			} else {
				const level = UI_LEVEL[name] ?? "info";
				const message = typeof data === "string" ? data : JSON.stringify(data);
				pushToast({ type: level, rawType: name, title: DEFAULT_TITLES[name], message });
			}

			if (name === "notification" || name === "notice" || name === "test" || name === "message" || name === "NOTICE_NEW") {
				qc.invalidateQueries({ queryKey: ["unreadCount"] });
			}
		};

		// 팝업을 띄울 이벤트 타입 화이트리스트 (명시된 타입만 토스트)
		const TOASTABLE_EVENTS = new Set<string>([
			// generic levels
			"notification",
			"notice",
			"info",
			"success",
			"warning",
			"error",
			// grouped
			"inquiry",
			"auction",
			"bid",
			"delivery",
			"wish",
			// domain specific
			"WISH_AUCTION_STARTED",
			"WISH_AUCTION_DUE_SOON",
			"WISH_AUCTION_ENDED",
			"WISH_CARD_LISTED",
			"AUCTION_NEW_INQUIRY",
			"INQUIRY_ANSWERED",
			"AUCTION_WON",
			"BID_ACCEPTED",
			"BID_REJECTED",
			"BID_FAILED",
			"BID_OUTBID",
			"DELIVERY_STARTED",
			"DELIVERY_STATUS_CHANGED",
			"DELIVERY_CONFIRM_REQUEST",
			"DELIVERY_CONFIRMED_SELLER",
			"AUCTION_CLOSED_SELLER",
			"AUCTION_CANCELED",
			"NOTICE_NEW",
			// test hook
			"test",
		]);

		const run = async () => {
			while (!ctrl.signal.aborted) {
				try {
					await fetchEventSource(url, {
						method: "GET",
						headers: {
							Authorization: `Bearer ${raw}`,
						},
						// 쿠키도 포함 (백엔드가 같은 도메인의 세션/보호 쿠키를 참조할 수 있음)
						credentials: "include",
						signal: ctrl.signal,
						openWhenHidden: true,
						async onopen(res) {
							log("open", res.status);
							const contentType = res.headers.get("content-type");
							if (!res.ok) throw new Error(`SSE open failed: ${res.status}`);
							if (!contentType?.startsWith(EventStreamContentType)) {
								throw new Error(`Unexpected content-type: ${contentType}`);
							}
						},
						onmessage(ev) {
							const name = ev.event || "message";
							const data = parseData(ev.data);
							// 연결 상태 이벤트는 팝업 제외
							if (name === "heartbeat" || name === "connected") {
								log("skip", name, data);
								return;
							}
							// 지정된 타입에 대해서만 토스트
							if (!TOASTABLE_EVENTS.has(name)) {
								log("skip-unhandled", name, data);
								return;
							}
							log("event", name, data);
							handleEvent(name, data);
						},
						onerror(err) {
							if ((ctrl.signal as any).aborted) return;
							log("error", err);
							// throw to exit this fetchEventSource call and trigger our retry loop
							throw err;
						},
					});
				} catch (err) {
					if (ctrl.signal.aborted) break;
					log("disconnected, retry in 3s", err);
					await new Promise((r) => setTimeout(r, 3000));
					continue;
				}
				// normal close: wait and reconnect
				if (ctrl.signal.aborted) break;
				await new Promise((r) => setTimeout(r, 3000));
			}
		};

		run();
		return () => cleanup();
	}, [token]);

	return null;
}
