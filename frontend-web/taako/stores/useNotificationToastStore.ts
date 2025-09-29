import { create } from "zustand";

export type ToastLevel = "info" | "success" | "warning" | "error";

export interface NotificationToastItem {
	id: string; // unique id
	// backend에서 오는 임의 type을 문자열로 보관하되, UI 색상 매핑은 내부에서만 ToastLevel 기준으로 처리
	type?: string; // ui level: info|success|warning|error
	rawType?: string; // original SSE event type
	title?: string;
	message?: string;
	link?: string;
	causeId?: number | string; // 라우팅 목적의 식별자 (auctionId, noticeId 등)
	createdAt: number;
	durationMs?: number; // auto dismiss ms (default 5000)
}

interface ToastState {
	toasts: NotificationToastItem[];
	push: (t: Omit<NotificationToastItem, "id" | "createdAt"> & { id?: string }) => string;
	remove: (id: string) => void;
	clear: () => void;
}

export const useNotificationToastStore = create<ToastState>()((set, get) => ({
	toasts: [],
	push: (t) => {
		const id = t.id ?? `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
		const item: NotificationToastItem = {
			id,
			createdAt: Date.now(),
			durationMs: 5000,
			...t,
		};
		// 새 알림을 위쪽(최근순)으로 쌓기
		set((s) => ({ toasts: [item, ...s.toasts] }));
		return id;
	},
	remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
	clear: () => set({ toasts: [] }),
}));
