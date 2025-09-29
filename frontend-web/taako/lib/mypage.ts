import api from "@/lib/api";
import { compressToUnder500KB } from "@/lib/imageCompression";
import type { MyBidAuctions, MyInfo } from "@/types/auth";

// ================= 새 프로필 관련 타입 =================
export interface MyProfileResult {
	memberId: number;
	email: string;
	nickname: string;
	introduction: string;
	profileImageUrl: string | null;
	backgroundImageUrl: string | null;
	walletAddress: string | null;
}

interface ApiBase<T> {
	httpStatus: any; // 백엔드에서 쓰는 스키마 그대로 두되 사용 안함
	isSuccess: boolean;
	message: string;
	code: number;
	result: T;
}

// GET /v1/members/me (내 프로필 조회)
export async function fetchMyProfile(): Promise<MyProfileResult> {
	const res = await api.get<ApiBase<MyProfileResult>>("/v1/members/me");
	return res.data.result;
}

// GET /v1/auth/availability/nickname?nickname=xxx
export async function checkNicknameAvailable(nickname: string) {
	if (!nickname) throw new Error("닉네임을 입력하세요.");
	const res = await api.get<ApiBase<{ field: string; value: string; available: boolean }>>("/v1/auth/availability/nickname", { params: { nickname } });
	return res.data.result;
}

// PATCH /v1/members/me - form-data (nickname, introduction, profileImage, backgroundImage)
export interface PatchProfilePayload {
	nickname?: string;
	introduction?: string;
	profileImageFile?: File | null;
	backgroundImageFile?: File | null;
}

export async function patchMyProfile(payload: PatchProfilePayload) {
	/*
		백엔드 시그니처(@RequestPart("request") UpdateMyProfileRequest, @RequestPart("profileImage"), @RequestPart("backgroundImage"))에 맞춰
		반드시 multipart/form-data 내에 "request" 라는 JSON 파트를 넣어야 함.
		이전 구현은 nickname / introduction 을 개별 text 파트로 보내 400 (잘못된 매개변수) 발생.
	*/
	const { nickname, introduction, profileImageFile, backgroundImageFile } = payload;

	// 변경 요청 JSON (null 이면 변경하지 않음 정책 -> undefined 는 key 자체 누락 vs null 은 명시적 무변경 여부는 백엔드 구현에 따라 다를 수 있으니
	// 안전하게 존재하는 필드만 보냄. 값이 빈 문자열이면 사용자 의도에 따라 그대로 전달.)
	const requestBody: Record<string, any> = {};
	if (nickname !== undefined) requestBody.nickname = nickname || null; // 빈 문자열은 null 로 치환하여 "변경 없음" 선택 가능하게 (필요시 조정)
	if (introduction !== undefined) requestBody.introduction = introduction || null;
	// notificationSetting 필드 필요 시 여기에 추가

	if (Object.keys(requestBody).length === 0 && !profileImageFile && !backgroundImageFile) {
		throw new Error("변경된 내용이 없습니다.");
	}

	const form = new FormData();
	form.append("request", new Blob([JSON.stringify(requestBody)], { type: "application/json" }));
	if (profileImageFile) {
		const compressed = await compressToUnder500KB(profileImageFile);
		form.append("profileImage", compressed);
	}
	if (backgroundImageFile) {
		const compressed = await compressToUnder500KB(backgroundImageFile);
		form.append("backgroundImage", compressed);
	}

	const res = await api.patch<ApiBase<Record<string, never>>>("/v1/members/me", form, {
		headers: { "Content-Type": "multipart/form-data" },
	});
	return res.data;
}

type Page<T> = { content: T[]; page: number; size: number; totalElements: number; totalPages: number };

type BidFilter =
	| { ended: boolean; page?: number; size?: number } // ✔ /v1/mypage/bids?ended=true|false
	| { isEnd: boolean; page?: number; size?: number } // ✔ ...?isEnd=true|false
	| { status: "ONGOING" | "ENDED"; page?: number; size?: number } // ✔ ...?status=...
	| { page?: number; size?: number }; // 기본

export async function getMyBidAuction(opts: BidFilter = {}): Promise<Page<MyBidAuctions>> {
	const { page = 0, size = 10 } = opts as any;
	const params: Record<string, any> = { page, size };

	// 우선순위: ended -> isEnd -> status
	if ("ended" in opts) params.ended = opts.ended;
	else if ("isEnd" in opts) params.isEnd = opts.isEnd;
	else if ("status" in opts) params.status = opts.status;

	const res = await api.get("/v1/auctions/mybid", { params });
	return res.data.result as Page<MyBidAuctions>;
}

export async function getInfo() {
	const res = await api.get("/v1/members/me");
	return res.data.result;
}

// 내 판매 경매 조회
export const getMySellAutcion = async () => {
	const res = await api.get("/v1/auctions/me");
	return res.data;
};

type ApiEnvelope<T> = {
	httpStatus: Record<string, unknown>;
	isSuccess: boolean;
	message: string;
	code: number;
	result: T;
};

export async function getInfoMe(): Promise<MyInfo> {
	const res = await api.get<ApiEnvelope<MyInfo>>("/v1/members/me");
	return res.data.result;
}

// ================= 신뢰도 (Trust Score) =================
export async function fetchTrustScore(memberId: number): Promise<number> {
	if (!memberId && memberId !== 0) throw new Error("memberId 누락");
	const res = await api.get<ApiBase<number>>(`/v1/members/${memberId}/trust`);
	return res.data.result;
}

export function formatTrustScore(raw: number | undefined | null): string {
	if (raw === undefined || raw === null || isNaN(raw as any)) return "0.0";
	// 정수 → 10으로 나눠 1자리 소수처럼 (365 -> 36.5)
	const scaled = raw / 10;
	return scaled.toFixed(1);
}

export function trustScoreImagePath(raw: number | undefined | null): string {
	if (raw === undefined || raw === null || isNaN(raw as any)) return "/icon/temperature/0.png";
	const v = raw;
	if (v < 200) return "/icon/temperature/0.png";
	if (v < 300) return "/icon/temperature/200.png";
	if (v < 500) return "/icon/temperature/300.png";
	if (v < 700) return "/icon/temperature/500.png";
	if (v < 900) return "/icon/temperature/700.png";
	return "/icon/temperature/900.png"; // 900 이상
}

// 신뢰온도 색상 매핑 (낮은 점수 -> Neutral, 높은 점수 -> Warm)
// 제공된 순서: 898881, 2c72aa, 86c7ed, ffc339, ff980f, f53301
// 점수 구간: <200, <300, <500, <700, <900, >=900
export function trustScoreColor(raw: number | undefined | null): string {
	if (raw === undefined || raw === null || isNaN(raw as any)) return "#898881";
	const v = raw;
	if (v < 200) return "#898881"; // 아주 낮음
	if (v < 300) return "#2c72aa"; // 낮음
	if (v < 500) return "#86c7ed"; // 보통
	if (v < 700) return "#ffc339"; // 양호
	if (v < 900) return "#ff980f"; // 좋음
	return "#f53301"; // 매우 좋음 (900 이상)
}
