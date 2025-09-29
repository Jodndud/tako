"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useSellerReviews } from "@/hooks/useSellerReviews";
import { formatKSTCompact } from "@/lib/formatKST";

interface SellerReviewsProps {
	sellerId: number;
}

export default function SellerReviews({ sellerId }: Readonly<SellerReviewsProps>) {
	const { loading, error, items } = useSellerReviews(sellerId);

	return (
		<div className="flex flex-col gap-4">
			{loading && <p className="text-center text-gray-400 py-10">불러오는 중…</p>}
			{error && <p className="text-center text-red-400 py-10">{error}</p>}
			{!loading && !error && items.length === 0 && <p className="text-center text-gray-400 py-10">아직 받은 리뷰가 없습니다.</p>}

			<div className="flex flex-col">
				{items.map((review) => (
					<div key={review.id} className="flex flex-col gap-6 border-b border-[#353535] px-5 py-6">
						<div className="flex items-center gap-4">
							<div className="w-18 h-18 rounded-sm overflow-hidden bg-gray-600 flex items-center justify-center relative">
								<Image alt={`auction-${review.auctionId}`} src={review.imageUrl || "/no-image.jpg"} fill unoptimized style={{ objectFit: "cover" }} />
							</div>
							<div>
								<h3>경매 #{review.auctionId}</h3>
								<div className="flex items-center gap-2 text-sm text-[#a5a5a5]">
									<StarRow count={review.star} />
									<span>{formatKSTCompact(review.createdAt)}</span>
									<span>by {review.nickname}</span>
								</div>
							</div>
						</div>
						<div className="flex gap-2 flex-wrap">
							<Chip>{mapCondition(review.cardCondition)}</Chip>
							<Chip>{mapPrice(review.priceSatisfaction)}</Chip>
							<Chip>{mapDesc(review.descriptionMatch)}</Chip>
						</div>
						{review.reviewText && (
							<div className="mt-2 p-3 rounded-md bg-[#2a2a36] text-[#e5e5e5] text-sm leading-6">
								<div className="text-xs text-[#a5a5a5] mb-1">후기 내용</div>
								<p className="whitespace-pre-line">{review.reviewText}</p>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

function StarRow({ count }: Readonly<{ count: number }>) {
	return (
		<div className="flex gap-1">
			{Array.from({ length: 5 }, (_, i) => (
				<Star key={i} className="w-4 h-4" strokeWidth={0} fill={i < count ? "#f2b90c" : "#353535"} />
			))}
		</div>
	);
}

function Chip({ children }: Readonly<{ children: React.ReactNode }>) {
	return <div className="text-sm px-2 py-1 rounded-sm bg-gray-300 text-black">{children}</div>;
}

function mapCondition(v: string) {
	switch (v) {
		case "HEAVY_USED":
			return "사용감이 많아요";
		case "NORMAL":
			return "보통이에요";
		case "LIKE_NEW":
			return "최상급이에요";
		default:
			return v;
	}
}

function mapPrice(v: string) {
	switch (v) {
		case "OVERPAID":
			return "비싸요";
		case "NORMAL":
			return "적당해요";
		case "VERY_GOOD_DEAL":
			return "저렴해요";
		default:
			return v;
	}
}

function mapDesc(v: string) {
	switch (v) {
		case "DIFFERENT":
			return "차이가 있어요";
		case "ALMOST":
			return "거의 비슷해요";
		case "EXACT":
			return "정확히 일치해요";
		default:
			return v;
	}
}
