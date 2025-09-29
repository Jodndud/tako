import api from "./api";
import { GetHotCards, AuctionDetailProps, WeeklyAuctions } from "@/types/auction";
import { compressToUnder500KB } from "@/lib/imageCompression";
import type { Card } from "@/types/card";
import type { Seller } from "@/types/seller";
import type { History } from "@/types/history";
import type { BidQueueRequest, BidQueueResponse } from "@/types/bid";

// 경매 등록
export const createAuction = async (requestDto: any, files: File[]) => {
  const formData = new FormData();

  // JSON은 반드시 Blob으로 넣어 Content-Type이 application/json 이 되게
  formData.append(
    "requestDto",
    new Blob([JSON.stringify(requestDto)], { type: "application/json" })
  );

  for (const f of files || []) formData.append("files", f);

  // 여기서 Content-Type 지정하지 마세요 (axios가 자동으로 multipart/form-data; boundary=... 붙임)
  const res = await api.post("/v1/auctions", formData);
  return res.data;
};

// 경매 목록 조회
export const getAuctions = async (params: GetHotCards) => {
	const res = await api.get("/v1/auctions", {
		params: params,
	});
	return res.data;
};

// 경매 상세 페이지
type RawResponse = {
	httpStatus: string;
	isSuccess: boolean;
	message: string;
	code: number;
	result: {
		auction: any;
		card: any;
		imageUrls: string[];
		history: any[];
		weeklyPrices: any[];
		seller: any;
		wished: boolean;
		tokenId: number | null;
	};
};

function normalizeCard(raw: any): Card {
	return {
		id: raw?.id ?? 0,
		name: raw?.cardName ?? raw?.name ?? "",
		grade: raw?.grade ?? "", // 등급은 auction에 있을 수도 있어 아래에서 덮어씀
		rarity: raw?.rarity ?? "DEFAULT",
		categoryMajorId: raw?.categoryMajorId ?? 0,
		categoryMajorName: raw?.categoryMajorName ?? "",
		categoryMediumId: raw?.categoryMediumId ?? 0,
		categoryMediumName: raw?.categoryMediumName ?? "",
	} as Card;
}

function normalizeSeller(raw: any): Seller {
	return {
		id: raw?.id ?? 0,
		nickname: raw?.nickname ?? "알 수 없음",
		reviewCount: raw?.reviewCount ?? 0,
		// 타입이 number 라면 null 방지를 위해 0으로 보정
		reviewStarAvg: typeof raw?.reviewStarAvg === "number" ? raw.reviewStarAvg : 0,
		profileImageUrl: raw?.profileImageUrl ?? "/no-image.jpg",
	} as Seller;
}

function normalizeHistory(list: any[]): History[] {
	return (list ?? []).map((h) => ({
		createdAt: h?.createdAt ?? h?.time ?? "",
		amount: h?.amount ?? h?.amount ?? 0,
		bidderNickname: h?.bidderNickname ?? h?.nickname ?? "",
	})) as History[];
}

function normalizeWeekly(list: any[]): WeeklyAuctions[] {
	return (list ?? []).map((p) => ({
		date: p?.date ?? "",
		minPrice: p?.minPrice ?? 0,
		maxPrice: p?.maxPrice ?? 0,
		avgPrice: p?.avgPrice ?? 0,
	})) as WeeklyAuctions[];
}

function normalizeAuctionDetail(result: RawResponse["result"]): AuctionDetailProps {
	const a = result.auction ?? {};
	const c = result.card ?? {};
	const token = result.tokenId;
	const card = normalizeCard(c);
	// auction.grade 가 진짜 카드 등급이면 카드에 반영
	if (a?.grade && typeof a.grade === "string") {
		card.grade = a.grade;
	}

	return {
		id: a?.id ?? 0,
		code: a?.code ?? "",
		title: a?.title ?? "",
		detail: a?.detail ?? "",

		imageUrls: result?.imageUrls ?? [],

		startPrice: a?.startPrice ?? 0,
		currentPrice: a?.currentPrice ?? 0,
		bidUnit: a?.bidUnit ?? 1,

		startDatetime: a?.startDatetime || a?.start_time || a?.startTime || a?.startAt || a?.startDateTime || "",
		endDatetime: a?.endDatetime || a?.end_time || a?.endTime || a?.endsAt || a?.endDateTime || "",
		endTime: a?.endTime ?? a?.endsAt ?? a?.endDatetime ?? "", // legacy fallback
		createAt: a?.createAt ?? a?.createdAt ?? "",
		end: Boolean(a?.end ?? a?.isEnded ?? false),

		buyNowFlag: Boolean(a?.buyNowFlag ?? a?.buyNow ?? false),
		buyNowPrice: a?.buyNowPrice ?? null,

		card,
		weeklyAuctions: normalizeWeekly(result?.weeklyPrices),
		history: normalizeHistory(result?.history),
		seller: normalizeSeller(result?.seller),
		tokenId: token,
	} as AuctionDetailProps;
}

export type AuctionDetailPageData = {
	detail: AuctionDetailProps;
	wished: boolean;
};

export async function getAuctionDetail(auctionId: number | string, opts?: { historySize?: number; signal?: AbortSignal }): Promise<AuctionDetailPageData> {
	const { historySize = 5, signal } = opts || {};
	const res = await api.get<RawResponse>(`/v1/auctions/${auctionId}`, {
		params: { historySize },
		signal,
	});

	const payload = res.data;
	if (!payload?.isSuccess) throw new Error(payload?.message || "요청 실패");

	return {
		detail: normalizeAuctionDetail(payload.result),
		wished: Boolean(payload.result?.wished),
	};
}

// ↓ 이렇게 export 하세요
export function genRequestId() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
	return "req_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * 상대경로 호출: /v1/auctions/{id}/bids/queue
 * requestId는 "사용자 고유 UUID"여야 함 (필수)
 */
export async function queueBid(auctionId: string | number, amount: number, opts: { token?: string; requestId: string }): Promise<BidQueueResponse> {
	if (!opts?.requestId) throw new Error("requestId(사용자 UUID)가 필요합니다.");

	const body: BidQueueRequest = {
		amount, // ⚠ 서버가 정수만 받는다면 Math.round(amount)로 맞춰줘
		requestId: opts.requestId,
	};

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

	// axios 인스턴스 사용(기존 getAuctionDetail과 동일한 베이스 URL/쿠키 정책)
	const { data } = await api.post<BidQueueResponse>(`/v1/auctions/${auctionId}/bids/queue`, body, { headers, withCredentials: true });

	// 판정은 HTTP 2xx + isSuccess 기준으로
	if (!data?.isSuccess) {
		// 서버가 message를 준다면 그대로 노출
		throw new Error(data?.message || "입찰 처리 중 오류가 발생했습니다.");
	}

	// httpStatus.error 에 의존하지 않음 (문서 예시가 헷갈림)
	return data;
}
