import { useCallback, useEffect, useMemo, useState } from "react";
import { getMyReviews } from "@/lib/review";

export type MyReviewRole = "BUYER" | "SELLER";

export interface MyReviewItem {
	auctionId: number;
	code: string;
	title: string;
	startDatetime: string;
	endDatetime: string;
	isEnd: boolean;
	closeReason: string | null;
	currentPrice: number;
	imageUrl?: string | null;
	delivery?: {
		status?: string;
		existTrackingNumber?: boolean;
		existRecipientAddress?: boolean;
		existSenderAddress?: boolean;
	};
	review?: {
		id: number;
		writerMaskedNickname: string;
		reviewText: string | null;
		cardCondition: "HEAVY_USED" | "NORMAL" | "LIKE_NEW";
		priceSatisfaction: "OVERPAID" | "NORMAL" | "VERY_GOOD_DEAL";
		descriptionMatch: "DIFFERENT" | "ALMOST" | "EXACT";
		star: number;
		createdAt: string;
	};
}

export interface MyReviewsState {
	loading: boolean;
	error: string | null;
	items: MyReviewItem[];
	reload: () => Promise<void>;
}

export function useMyReviews(role: MyReviewRole, done: boolean): MyReviewsState {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [items, setItems] = useState<MyReviewItem[]>([]);

	const fetcher = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await getMyReviews(role, done);
			// expected response shape: { isSuccess, result: MyReviewItem[] }
			const list: MyReviewItem[] = res?.result ?? [];
			setItems(Array.isArray(list) ? list : []);
		} catch (e: any) {
			setError(e?.message ?? "리뷰 목록을 불러오지 못했습니다.");
		} finally {
			setLoading(false);
		}
	}, [role, done]);

	useEffect(() => {
		fetcher();
	}, [fetcher]);

	return useMemo(() => ({ loading, error, items, reload: fetcher }), [loading, error, items, fetcher]);
}
