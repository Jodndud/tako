import api from "@/lib/api";
import { NotificationSettingsResponse, PatchNotificationSettingsRequest, NotificationSettingsMap } from "@/types/notification";

export async function fetchNotificationSettings(): Promise<NotificationSettingsMap> {
	const { data } = await api.get<NotificationSettingsResponse>(`/v1/members/me/notification-settings`);
	return data.result;
}

export async function patchNotificationSettings(partial: PatchNotificationSettingsRequest["notificationSetting"]): Promise<NotificationSettingsMap> {
	const { data } = await api.patch<NotificationSettingsResponse>(`/v1/members/me/notification-settings`, { notificationSetting: partial });
	return data.result;
}
