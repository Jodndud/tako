import api from "./api";

// 리뷰 조회
export async function getMyReview(memberId: number) {
	const res = await api.get(`/v1/reviews/${memberId}/reviews`);
	return res.data;
}

/**
 * 내 리뷰 목록 조회 (BUYER/SELLER, done 여부)
 * GET /v1/reviews/me?role=BUYER|SELLER&done=true|false
 */
export async function getMyReviews(role: "BUYER" | "SELLER", done: boolean) {
	const res = await api.get(`/v1/reviews/me`, {
		params: { role, done },
	});
	return res.data;
}

// 리뷰 작성
export async function addMyReview(auctionId: number, cardCondition: string, priceSatisfaction: string, descriptionMatch: string, star: number, reviewText: string | null) {
	const res = await api.post(`/v1/reviews`, {
		auctionId,
		cardCondition,
		priceSatisfaction,
		descriptionMatch,
		star,
		reviewText,
	});
	return res.data;
}
