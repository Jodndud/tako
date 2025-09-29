import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

// 환경변수에서 Firebase 설정 로드
// NEXT_PUBLIC_ 접두사는 클라이언트에 노출되므로 민감정보(apiKey 등)는 노출을 피할 수 없으나 Web FCM 특성 상 필수.
// 서버 사이드에서만 필요한 값은 NEXT_PUBLIC 제거.

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const getFirebaseApp = () => {
	if (typeof window === "undefined") return null; // SSR 방지
	return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
	if (typeof window === "undefined") return null;
	try {
		const supported = await isSupported();
		if (!supported) return null;
		const app = getFirebaseApp();
		if (!app) return null;
		return getMessaging(app);
	} catch (e) {
		console.warn("[FCM] Messaging not supported:", e);
		return null;
	}
};
