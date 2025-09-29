// Notification list & pagination related types

export interface NotificationListRow {
	id: number;
	type: string; // 서버에서 type code 문자열
	causeId: number | null;
	title: string;
	message: string;
	targetUrl: string;
	read: boolean;
	readAt: string | null;
	createdAt: string; // ISO string
}

export interface PageResponse<T> {
	content: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
}

export interface BaseEnvelope<T> {
	httpStatus: string;
	isSuccess: boolean;
	message: string;
	code: number;
	result: T;
}

export interface UnreadCountResponse {
	unreadCount: number;
}
