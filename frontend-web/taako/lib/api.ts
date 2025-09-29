// lib/api.ts
import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,            // 쿠키 세션/CSRF 쓰면 필요(토큰만 쓴다면 켜져있어도 무방)
  xsrfCookieName: "XSRF-TOKEN",     // 스프링 기본
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    // 1) FormData면 Content-Type 제거해서 axios가 boundary 포함 자동 설정하게
    const isFormData =
      (typeof FormData !== "undefined" && config.data instanceof FormData) ||
      (config.headers && String(config.headers["Content-Type"] || "").includes("multipart/form-data"));

    if (isFormData && config.headers) {
      delete (config.headers as any)["Content-Type"];
    }

    // 2) Authorization: Bearer 토큰 강제
    const raw = useAuthStore.getState().token;
    if (raw) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = raw.startsWith("Bearer ") ? raw : `Bearer ${raw}`;
    }

    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error)))
);

// 응답 인터셉터(401 → 토큰 재발급)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (originalRequest.url?.includes("/v1/auth/token/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();
        if (newToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = newToken.startsWith("Bearer ")
            ? newToken
            : `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        console.error("토큰 재발급 실패:", e);
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
