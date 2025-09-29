// 알림 설정 관련 타입 정의
// 서버 응답 예시 기반 (key: string, value: 0|1)

export type NotificationSettingKey =
	| "DELIVERY_CONFIRM_REQUEST"
	| "INQUIRY_ANSWERED"
	| "BID_FAILED"
	| "BID_OUTBID"
	| "AUCTION_CLOSED_SELLER"
	| "AUCTION_NEW_INQUIRY"
	| "AUCTION_CANCELED"
	| "BID_REJECTED"
	| "NOTICE_NEW"
	| "WISH_CARD_LISTED"
	| "WISH_AUCTION_STARTED"
	| "DELIVERY_STATUS_CHANGED"
	| "DELIVERY_CONFIRMED_SELLER"
	| "DELIVERY_STARTED"
	| "BID_ACCEPTED"
	| "AUCTION_WON"
	| "WISH_AUCTION_DUE_SOON"
	| "WISH_AUCTION_ENDED";

export type NotificationSettingValue = 0 | 1;
export type NotificationSettingsMap = Record<NotificationSettingKey, NotificationSettingValue>;

export interface NotificationSettingsResponse {
	httpStatus: string;
	isSuccess: boolean;
	message: string;
	code: number;
	result: NotificationSettingsMap;
}

export interface PatchNotificationSettingsRequest {
	notificationSetting: Partial<NotificationSettingsMap>;
}

// 카테고리 분류용 매핑
export type NotificationCategory = "WISH" | "AUCTION" | "DELIVERY" | "BID" | "NOTICE" | "INQUIRY";

export const NOTIFICATION_CATEGORY_ORDER: NotificationCategory[] = ["WISH", "AUCTION", "DELIVERY", "BID", "NOTICE", "INQUIRY"];

export const NOTIFICATION_CATEGORY_LABEL: Record<NotificationCategory, string> = {
	WISH: "관심", // 위시 관련
	AUCTION: "경매",
	DELIVERY: "배송",
	BID: "입찰",
	NOTICE: "공지",
	INQUIRY: "문의",
};

export interface CategorizedNotificationSettingItem {
	key: NotificationSettingKey;
	value: NotificationSettingValue;
	category: NotificationCategory;
	label: string; // UI 표시용 (간단 라벨)
	description?: string; // 필요하면 추가 설명
}

// 각 키를 카테고리 & 라벨에 매핑
export const NOTIFICATION_SETTING_META: Record<NotificationSettingKey, Omit<CategorizedNotificationSettingItem, "key" | "value">> = {
	NOTICE_NEW: { category: "NOTICE", label: "새 공지" },
	INQUIRY_ANSWERED: { category: "INQUIRY", label: "문의 답변" },
	BID_ACCEPTED: { category: "BID", label: "입찰 성공" },
	BID_FAILED: { category: "BID", label: "입찰 실패" },
	BID_OUTBID: { category: "BID", label: "상위 입찰 발생" },
	BID_REJECTED: { category: "BID", label: "입찰 거절" },
	AUCTION_CLOSED_SELLER: { category: "AUCTION", label: "내 경매 종료" },
	AUCTION_NEW_INQUIRY: { category: "AUCTION", label: "경매 새 문의" },
	AUCTION_CANCELED: { category: "AUCTION", label: "경매 취소" },
	AUCTION_WON: { category: "AUCTION", label: "낙찰 성공" },
	WISH_CARD_LISTED: { category: "WISH", label: "관심 카드 등록" },
	WISH_AUCTION_STARTED: { category: "WISH", label: "관심 경매 시작" },
	DELIVERY_CONFIRM_REQUEST: { category: "DELIVERY", label: "수취 확인 요청" },
	DELIVERY_STATUS_CHANGED: { category: "DELIVERY", label: "배송 상태 변경" },
	DELIVERY_CONFIRMED_SELLER: { category: "DELIVERY", label: "구매자 수취 확인" },
	DELIVERY_STARTED: { category: "DELIVERY", label: "배송 시작" },
	WISH_AUCTION_DUE_SOON: { category: "WISH", label: "관심 경매 마감 임박" },
	WISH_AUCTION_ENDED: { category: "WISH", label: "관심 경매 종료" },
};

export function categorizeSettings(map: NotificationSettingsMap): CategorizedNotificationSettingItem[] {
	return Object.entries(map).map(([k, v]) => {
		const key = k as NotificationSettingKey;
		const meta = NOTIFICATION_SETTING_META[key];
		return { key, value: v, category: meta.category, label: meta.label };
	});
}

export function groupByCategory(items: CategorizedNotificationSettingItem[]): Record<NotificationCategory, CategorizedNotificationSettingItem[]> {
	return items.reduce((acc, item) => {
		acc[item.category] = acc[item.category] || [];
		acc[item.category].push(item);
		return acc;
	}, {} as Record<NotificationCategory, CategorizedNotificationSettingItem[]>);
}
