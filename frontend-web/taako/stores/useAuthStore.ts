import api from "@/lib/api";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: null,
			loading: false,
			error: null,

			login: async (email: string, password: string) => {
				set({ loading: true, error: null });
				try {
					const res = await api.post(
						"/v1/auth/sign-in",
						{
							email,
							password,
						},
						{ withCredentials: true }
					);

					if (res.data.code !== 200) {
						alert(res.data.message);
						set({ loading: false });
						return false;
					}

					const token = res.headers["authorization"];
					set({ loading: false, token });
					return true;
				} catch (err: any) {
					set({
						error: err.response?.data?.message || "로그인 실패",
						loading: false,
						token: null,
					});
					return false;
				}
			},

			logout: async () => {
				try {
					const token = get().token;
					if (!token) return;

					await api.post(
						"/v1/auth/sign-out",
						{},
						{
							headers: { Authorization: token },
						}
					);
					set({ token: null });
				} catch (err: any) {
					console.error("로그아웃 실패:", err);
				}
			},

			refreshAccessToken: async () => {
				try {
					const oldToken = get().token;
					const res = await api.post("/v1/auth/token/refresh", undefined, {
						// payload 없음으로 판단하고 헤더 사용
						headers: { Authorization: oldToken },
						withCredentials: true,
					});
					console.log(res);
					const token = res.headers["authorization"];
					if (token) set({ token });
					return token;
				} catch (err: any) {
					console.error("재요청 실패: ", err);
					set({ token: null });
					return null;
				}
			},
		}),
		{
			name: "authStorage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ token: state.token }),
			onRehydrateStorage: () => (state) => {
				// hydration 완료 후 콜백
				if (state) {
					state.loading = false;
				}
			},
		}
	)
);
