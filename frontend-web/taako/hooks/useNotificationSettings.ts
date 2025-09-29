import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotificationSettings, patchNotificationSettings } from "@/lib/notificationSettings";
import { categorizeSettings, groupByCategory, NotificationSettingsMap, NotificationSettingKey, NotificationCategory, NOTIFICATION_CATEGORY_ORDER } from "@/types/notification";

export function useNotificationSettings() {
	const qc = useQueryClient();

	const { data, isLoading, isError } = useQuery<NotificationSettingsMap>({
		queryKey: ["notificationSettings"],
		queryFn: fetchNotificationSettings,
	});

	const mutation = useMutation({
		mutationFn: async (update: { key: NotificationSettingKey; value: 0 | 1 }) => {
			return patchNotificationSettings({ [update.key]: update.value });
		},
		// Optimistic update
		onMutate: async (vars) => {
			await qc.cancelQueries({ queryKey: ["notificationSettings"] });
			const prev = qc.getQueryData<NotificationSettingsMap>(["notificationSettings"]);
			if (prev) {
				qc.setQueryData<NotificationSettingsMap>(["notificationSettings"], {
					...prev,
					[vars.key]: vars.value,
				});
			}
			return { prev };
		},
		onError: (_err, _vars, ctx) => {
			if (ctx?.prev) qc.setQueryData(["notificationSettings"], ctx.prev);
		},
		onSuccess: (partial) => {
			const prev = qc.getQueryData<NotificationSettingsMap>(["notificationSettings"]);
			if (prev) {
				qc.setQueryData<NotificationSettingsMap>(["notificationSettings"], { ...prev, ...partial });
			} else {
				qc.setQueryData(["notificationSettings"], partial);
			}
		},
	});

	const toggle = useCallback(
		(key: NotificationSettingKey) => {
			if (!data) return;
			const next = data[key] === 1 ? 0 : 1;
			mutation.mutate({ key, value: next });
		},
		[data, mutation]
	);

	const categorized = data ? categorizeSettings(data) : [];
	const grouped = groupByCategory(categorized);

	const orderedCategories: NotificationCategory[] = [...NOTIFICATION_CATEGORY_ORDER];

	return {
		settings: data,
		isLoading,
		isError,
		toggle,
		mutationLoading: mutation.isPending,
		grouped,
		orderedCategories,
	};
}
