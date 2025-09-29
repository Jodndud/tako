/* eslint-disable no-undef */
/**
 * Firebase Messaging Service Worker (Aligned with backend notification payload spec)
 * 데이터 규칙: notificationId, originalType, type(그룹), causeId, click_action, title, body, tag
 * 백엔드가 Webpush + data 를 모두 내려주는 경우 browser 기본 표시를 존중하고
 * 재표시 조건(RICH / alwaysOverride / no notification payload) 에서만 showNotification 수행.
 */

importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// ================== 기본 설정 ==================
const SW_VERSION = "v1.0.1"; // 변경 시 캐시/업데이트 유도
const DEBUG = true;

const DEFAULT_ICON = "/icons/fcm_icon_192.png";
const DEFAULT_BADGE = "/icons/fcm_icon_72.png";
const DEFAULT_FALLBACK_TITLE = "알림";
const DEFAULT_CLICK_FALLBACK = "/";

// 빌드 타임 치환 (환경별 값 주입)
const cfg = {
	apiKey: "@@FIREBASE_API_KEY@@",
	authDomain: "@@FIREBASE_AUTH_DOMAIN@@",
	projectId: "@@FIREBASE_PROJECT_ID@@",
	storageBucket: "@@FIREBASE_STORAGE_BUCKET@@",
	messagingSenderId: "@@FIREBASE_MESSAGING_SENDER_ID@@",
	appId: "@@FIREBASE_APP_ID@@",
	measurementId: "@@FIREBASE_MEASUREMENT_ID@@",
};

firebase.initializeApp(cfg);
const messaging = firebase.messaging();

// ================== 유틸 ==================
function log(...args) {
	if (DEBUG) console.log("[SW][FCM]", ...args);
}

async function openOrFocusClient(url) {
	const target = new URL(url, self.location.origin).href;
	const list = await clients.matchAll({ type: "window", includeUncontrolled: true });

	for (const client of list) {
		try {
			if ((client.url || "").startsWith(self.location.origin)) {
				await client.focus();
				// SPA 라우팅 지시
				try {
					client.postMessage({ type: "NAVIGATE", url: target });
				} catch (e) {
					// ignore
				}
				return;
			}
		} catch (e) {
			// ignore
		}
	}
	await clients.openWindow(target);
}

/**
 * payload 를 기반으로 Notification 표시 옵션 구성
 * @returns { title, options, silent, forceOverride }
 */
function buildNotificationOptions(payload) {
	const { notification, data = {} } = payload || {};

	// title 우선순위: data.title > notification.title > fallback
	const title = data.title || data.notificationTitle || (notification && notification.title) || DEFAULT_FALLBACK_TITLE;

	const body = (data.body || data.notificationBody || (notification && notification.body) || "") + "";

	const icon = data.icon || (notification && notification.icon) || DEFAULT_ICON;
	const badge = data.badge || (notification && notification.badge) || DEFAULT_BADGE;

	const clickAction = data.click_action || data.clickAction || (notification && notification.click_action) || DEFAULT_CLICK_FALLBACK;

	// silent 규칙 (서버가 data.silent=true 또는 type=SILENT 로 전송)
	const silent = data.silent === "true" || data.type === "SILENT";

	// 태그: 서버가 내려준 tag 사용, 없으면 그룹 기반 기본
	const tag = data.tag || `${data.type || "GENERIC"}-${data.causeId || "GEN"}`;

	const renotify = data.renotify === "true";
	const requireInteraction = data.requireInteraction === "true";
	const forceOverride = data.alwaysOverride === "true";
	const richType = data.type === "RICH"; // RICH 전략: payload.notification 있어도 재표시

	// 액션 (예시) - 필요 시 서버 data.action_* 값 기반으로 push
	const actions = [];
	// if (data.action_mark_read === "true") {
	//   actions.push({ action: "mark_read", title: "읽음", icon: "/icons/check.png" });
	// }

	return {
		title,
		options: {
			body,
			icon,
			badge,
			tag,
			renotify,
			requireInteraction,
			data: {
				...data,
				click_action: clickAction,
				_swVersion: SW_VERSION,
				_hasNotificationPayload: !!notification,
			},
			actions,
		},
		silent,
		forceOverride: forceOverride || richType,
	};
}

// ================== Background 메시지 수신 ==================
messaging.onBackgroundMessage((payload) => {
	log("Received payload:", payload);

	const hasNotification = !!payload.notification;
	const { title, options, silent, forceOverride } = buildNotificationOptions(payload);

	// 기본 정책:
	// 1) 알림 payload(notification)가 있고, forceOverride 조건이 아니면 재표시하지 않음
	// 2) data-only 또는 forceOverride 시 showNotification 수행
	if (silent) {
		log("Silent message → 표시 생략 (다만 in-app sync 필요 시 여기에서 처리)");
		// TODO: IndexedDB 저장 / postMessage 로 unread 카운트 sync
		return;
	}

	if (hasNotification && !forceOverride) {
		log("Browser already displayed notification (native). Skipping duplicate show.");
		return;
	}

	self.registration.showNotification(title, options);
});

// ================== Notification 클릭 ==================
self.addEventListener("notificationclick", (event) => {
	event.notification.close();
	const data = event.notification && event.notification.data ? event.notification.data : {};
	const clickAction = data.click_action || DEFAULT_CLICK_FALLBACK;

	if (event.action) {
		switch (event.action) {
			case "mark_read":
				// TODO: 서버 읽음 처리 (data.notificationId 활용)
				event.waitUntil(
					(async () => {
						try {
							await fetch("/api/notifications/mark-read", {
								method: "POST",
								headers: { "Content-Type": "application/json" },
								body: JSON.stringify({ id: data.notificationId }),
							});
						} catch (e) {
							log("mark_read failed", e);
						}
						await openOrFocusClient(clickAction);
					})()
				);
				return;
			default:
				break;
		}
	}

	event.waitUntil(openOrFocusClient(clickAction));
});

// ================== Notification 닫힘 ==================
self.addEventListener("notificationclose", (event) => {
	if (DEBUG) log("Notification closed:", event.notification && event.notification.data);
	// TODO: 필요 시 닫힘 이벤트 보고
});

// ================== 클라이언트 <-> SW 메시지 ==================
self.addEventListener("message", (event) => {
	if (!event.data) return;
	if (event.data.type === "PING") {
		event.ports?.[0]?.postMessage({ type: "PONG", version: SW_VERSION });
	}
});

// ================== 설치/활성화 (버전 관리) ==================
self.addEventListener("install", (event) => {
	log("Installing SW", SW_VERSION);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	log("Activating SW", SW_VERSION);
	event.waitUntil(
		(async () => {
			// 오래된 패턴 알림 정리 가능
			const existing = await self.registration.getNotifications();
			log("Existing notifications:", existing.length);
			await clients.claim();
		})()
	);
});
