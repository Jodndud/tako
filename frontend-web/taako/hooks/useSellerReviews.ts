import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyReview } from "@/lib/review";

export interface SellerReviewItem {
	id: number;
	auctionId: number;
	imageUrl?: string | null;
	nickname: string;
	reviewText: string | null;
	cardCondition: "HEAVY_USED" | "NORMAL" | "LIKE_NEW";
	priceSatisfaction: "OVERPAID" | "NORMAL" | "VERY_GOOD_DEAL";
	descriptionMatch: "DIFFERENT" | "ALMOST" | "EXACT";
	star: number;
	createdAt: string;
}

export interface SellerReviewsState {
	loading: boolean;
	error: string | null;
	items: SellerReviewItem[];
	reload: () => Promise<void>;
}

export function useSellerReviews(sellerId: number): SellerReviewsState {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<SellerReviewItem[]>([]);

	const fetcher = useCallback(async () => {
		if (!sellerId) return;

		setLoading(true);
		setError(null);
		try {
			const res = await getMyReview(sellerId);
			// expected response shape: { isSuccess, result: SellerReviewItem[] }
			const rawList: any[] = res?.result ?? [];
			const list: SellerReviewItem[] = Array.isArray(rawList)
				? rawList.map((r) => ({
						...r,
						imageUrl: r?.imageUrl ?? r?.primaryImageUrl ?? null,
				  }))
				: [];
			setItems(list);
		} catch (e: any) {
			setError(e?.message ?? "리뷰 목록을 불러오지 못했습니다.");
		} finally {
			setLoading(false);
		}
	}, [sellerId]);

	useEffect(() => {
		fetcher();
	}, [fetcher]);

	return useMemo(() => ({ loading, error, items, reload: fetcher }), [loading, error, items, fetcher]);
}
