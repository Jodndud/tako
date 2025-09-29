// lib/notificationRoute.ts
// SSE/푸시 알림 payload의 { rawType, causeId }로부터 프론트엔드 경로를 유추합니다.

/**
 * 주된 규칙
 * - NOTICE_NEW: causeId = noticeId → "/notice/{id}"
 * - 그 외 대부분: causeId = auctionId → "/auction/{id}"
 * 향후 타입이 늘어나면 안전하게 여기에만 매핑을 추가하세요.
 */
export function resolveNotificationPath(rawType: string | undefined, causeId: unknown): string | null {
	const id = normalizeId(causeId);
	if (!rawType || !id) return null;

	// 공지 상세
	if (rawType === "NOTICE_NEW") {
		return `/notice/${id}`;
	}

	// 위시/경매/입찰/배송/문의 관련은 경매 상세로 유도 (문의는 상세 라우트가 없고 경매 상세 내 모달/섹션으로 처리됨)
	const AUCTION_TYPES = new Set<string>([
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
	]);

	if (AUCTION_TYPES.has(rawType)) {
		return `/auction/${id}`;
	}

	return null;
}

function normalizeId(v: unknown): number | null {
	if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
	if (typeof v === "string") {
		const n = Number(v);
		if (Number.isFinite(n) && n > 0) return n;
	}
	return null;
}
