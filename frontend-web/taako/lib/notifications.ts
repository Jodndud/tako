import api from "@/lib/api";
import { BaseEnvelope, PageResponse, NotificationListRow, UnreadCountResponse } from "@/types/notificationsPage";

export async function fetchNotifications(page = 0, size = 20) {
	const { data } = await api.get<BaseEnvelope<PageResponse<NotificationListRow>>>(`/v1/notifications?page=${page}&size=${size}`);
	return data.result;
}

export async function fetchUnreadCount() {
	const { data } = await api.get<BaseEnvelope<UnreadCountResponse>>(`/v1/notifications/unread-count`);
	return data.result.unreadCount;
}

export async function markNotificationRead(id: number) {
	await api.patch(`/v1/notifications/${id}/read`);
	return true;
}

export async function markAllNotificationsRead() {
	const { data } = await api.post<BaseEnvelope<number>>(`/v1/notifications/read-all`);
	return data.result; // changed count
}
