import api from "@/lib/api";
import { getFirebaseMessaging } from "@/lib/firebase";
import { getToken, deleteToken, onMessage } from "firebase/messaging";

// 디버그 플래그 (환경변수로 on/off)
const DEBUG_FCM = process.env.NEXT_PUBLIC_DEBUG_FCM === "1";
const log = (...args: any[]) => {
	if (DEBUG_FCM) console.log("[FCM]", ...args);
};

// 백엔드 추정 응답 타입 (status 엔드포인트)
export interface FcmStatus {
	hasAnyToken: boolean; // 회원이 하나라도 등록된 FCM 토큰이 있는지
	currentRegistered: boolean; // 현재 브라우저 토큰이 등록되어 있는지
	tokenCount: number; // 등록된 총 토큰 수
}

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const LS_KEY = "__fcm_token"; // 로컬 캐시 (디바이스 고유 식별 용도 아님, 단순 비교/재전송 방지)
log("VAPID_KEY loaded?", !!VAPID_KEY);

export async function requestNotificationPermission(): Promise<NotificationPermission> {
	if (typeof window === "undefined") return "denied";
	log("Requesting notification permission...");
	const permission = await Notification.requestPermission();
	log("Permission result:", permission);
	return permission;
}

export async function getOrCreateFcmToken(forceRefresh = false): Promise<string | null> {
	const messaging = await getFirebaseMessaging();
	if (!messaging) {
		log("Messaging not available");
		return null;
	}
	try {
		if (!forceRefresh && typeof window !== "undefined") {
			const cached = localStorage.getItem(LS_KEY);
			if (cached) {
				log("Returning cached token", cached.substring(0, 12) + "...");
				return cached;
			}
		}
		log("Calling getToken (forceRefresh=", forceRefresh, ") vapidKey length:", VAPID_KEY?.length);
		const token = await getToken(messaging, { vapidKey: VAPID_KEY });
		if (token && typeof window !== "undefined") {
			localStorage.setItem(LS_KEY, token);
		}
		log("Received token:", token ? token.substring(0, 12) + "..." : null);
		return token || null;
	} catch (e) {
		console.error("[FCM] getToken error", e);
		return null;
	}
}

export async function removeFcmToken(token?: string): Promise<boolean> {
	const messaging = await getFirebaseMessaging();
	if (!messaging) {
		log("removeFcmToken: messaging null");
		return false;
	}
	try {
		log("Deleting token. Provided?", !!token);
		const result = await deleteToken(messaging);
		if (result && typeof window !== "undefined") {
			localStorage.removeItem(LS_KEY);
		}
		log("deleteToken result:", result);
		return result;
	} catch (e) {
		console.error("[FCM] deleteToken error", e);
		return false;
	}
}

// 인증 기반: 서버가 AuthenticationPrincipal 로 사용자 식별
// 백엔드 구현 (/v1/fcm/enable)과 맞춘 등록(활성화)
export async function registerTokenToBackend(token: string) {
	log("registerTokenToBackend(/enable) start", { tokenPreview: token.substring(0, 10) });
	await api.post(`/v1/fcm/enable`, { token });
	log("registerTokenToBackend done");
}

// 현재 백엔드 /disable 은 토큰을 실제 삭제(unregister) 하므로 다시 enable 시 새 토큰이 나올 수 있음.
// 토큰을 유지하면서 비활성화하는 패턴과 다름에 유의.
export async function unregisterTokenFromBackend(token: string) {
	log("unregisterTokenFromBackend(/disable) start", { tokenPreview: token.substring(0, 10) });
	await api.post(`/v1/fcm/disable`, { token });
	log("unregisterTokenFromBackend done");
}

export async function fetchFcmStatus(token?: string): Promise<FcmStatus> {
	const query = token ? `?token=${encodeURIComponent(token)}` : "";
	log("fetchFcmStatus ->", query || "(no token param)");
	const res = await api.get(`/v1/fcm/status${query}`);
	log("fetchFcmStatus raw response", res.data);
	// 백엔드가 { active, currentRegistered, tokenCount } 형태라고 로그 상 추정 → hasAnyToken 에 active 매핑
	const data = res.data;
	const normalized: FcmStatus = {
		hasAnyToken: typeof data.active === "boolean" ? data.active : !!data.hasAnyToken,
		currentRegistered: !!data.currentRegistered,
		tokenCount: typeof data.tokenCount === "number" ? data.tokenCount : data.count || 0,
	};
	log("fetchFcmStatus normalized", normalized);
	return normalized;
}

export function subscribeForegroundMessage(callback: (payload: unknown) => void) {
	getFirebaseMessaging().then((m) => {
		if (!m) {
			log("subscribeForegroundMessage: messaging null");
			return;
		}
		onMessage(m, (payload: any) => {
			log("foreground message", payload);
			callback(payload);
		});
	});
}

/**
 * 사용자 "알림 끄기" UX 에서 실제 deleteToken 을 즉시 호출하면 다음에 다시 켤 때 새로운 토큰이 발급되어
 * "왜 매번 토큰이 바뀌냐" 혼란을 줄 수 있습니다.
 * => 서버에 enabled flag 저장 / 토큰은 유지하는 패턴 권장.
 * 필요 시 강제 재발급 (ex. VAPID 교체) 에만 removeFcmToken 을 호출하세요.
 */
/**
 * 사용자가 알림 켜기: 토큰 (필요 시 생성) 후 /enable 호출.
 */
export async function enableNotifications(forceRefresh = false) {
	const token = await getOrCreateFcmToken(forceRefresh);
	if (!token) return false;
	await registerTokenToBackend(token);
	return true;
}

/**
 * 사용자가 알림 끄기: 현재 캐시 토큰을 /disable 로 보내어 백엔드에서 삭제.
 * (주의) 백엔드 정책상 삭제이므로 다시 켜면 새 토큰 생성될 수 있음.
 */
export async function disableNotifications() {
	if (typeof window === "undefined") return false;
	const token = localStorage.getItem(LS_KEY);
	if (!token) {
		log("disableNotifications: no cached token");
		return false;
	}
	try {
		await unregisterTokenFromBackend(token);
	} finally {
		// 로컬에서도 제거 (백엔드 정책에 맞춤)
		localStorage.removeItem(LS_KEY);
	}
	return true;
}

/**
 * (선택) 강제 재발급 시나리오: 기존 토큰 서버에서 지우고(삭제 정책), 클라이언트 deleteToken 실행 후 새로 enable.
 */
export async function forceRefreshToken() {
	const oldToken = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
	if (oldToken) {
		try {
			await unregisterTokenFromBackend(oldToken);
		} catch (e) {
			log("forceRefreshToken: backend unregister failed (ignore)", e);
		}
	}
	await removeFcmToken(); // firebase deleteToken
	return enableNotifications(true);
}
