import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";
import { PageResponse, NotificationListRow } from "@/types/notificationsPage";

export function useNotifications(page: number, size: number) {
	return useQuery<PageResponse<NotificationListRow>>({
		queryKey: ["notifications", page, size],
		queryFn: () => fetchNotifications(page, size),
		// v5: keepPreviousData 대체 - 이전 데이터가 존재하면 placeholderData 로 사용
		placeholderData: (prev) => prev,
	});
}

export function useUnreadCount(pollMs = 15000) {
	return useQuery<number>({
		queryKey: ["unreadCount"],
		queryFn: fetchUnreadCount,
		refetchInterval: pollMs,
	});
}

export function useNotificationMutations() {
	const qc = useQueryClient();

	const readOne = useMutation({
		mutationFn: async (id: number) => markNotificationRead(id),
		onSuccess: (_res, id) => {
			// 갱신: 목록에서 해당 항목 read=true 로 수정
			const keys = qc
				.getQueryCache()
				.findAll({ queryKey: ["notifications"] })
				.map((e) => e.queryKey);
			keys.forEach((k) => {
				const data = qc.getQueryData<PageResponse<NotificationListRow>>(k);
				if (data) {
					qc.setQueryData<PageResponse<NotificationListRow>>(k, {
						...data,
						content: data.content.map((n) => (n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n)),
					});
				}
			});
			// 미읽음 카운트 재검증
			qc.invalidateQueries({ queryKey: ["unreadCount"] });
		},
	});

	const readAll = useMutation({
		mutationFn: () => markAllNotificationsRead(),
		onSuccess: () => {
			// 모든 목록 캐시 read=true 처리
			const keys = qc
				.getQueryCache()
				.findAll({ queryKey: ["notifications"] })
				.map((e) => e.queryKey);
			keys.forEach((k) => {
				const data = qc.getQueryData<PageResponse<NotificationListRow>>(k);
				if (data) {
					qc.setQueryData<PageResponse<NotificationListRow>>(k, {
						...data,
						content: data.content.map((n) => (n.read ? n : { ...n, read: true, readAt: new Date().toISOString() })),
					});
				}
			});
			qc.invalidateQueries({ queryKey: ["unreadCount"] });
		},
	});

	return { readOne, readAll };
}
