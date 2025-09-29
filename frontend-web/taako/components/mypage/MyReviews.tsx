"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useMyReviews } from "@/hooks/useMyReviews";
import { formatKSTCompact } from "@/lib/formatKST";

export default function MyReviews() {
	// 구매자, 작성 완료 목록
	const { items, loading, error } = useMyReviews("BUYER", true);

	if (loading) return <p className="text-center text-gray-400 py-20">불러오는 중…</p>;
	if (error) return <p className="text-center text-red-400 py-20">{error}</p>;
	if (!items.length) return <p className="text-center text-gray-400 py-20">작성한 리뷰가 없습니다.</p>;

	return (
		<div className="flex flex-col">
			{items.map((it) => (
				<div key={it.auctionId} className="flex flex-col gap-6 border-b border-[#353535] px-5 py-6">
					<div className="flex justify-between items-center">
						<div className="flex gap-1">
							{Array.from({ length: 5 }, (_, i) => (
								<Star key={i} className="w-4 h-4" strokeWidth={0} fill={i < (it.review?.star ?? 0) ? "#f2b90c" : "#353535"} />
							))}
						</div>
						<p className="text-sm text-[#a5a5a5]">{formatKSTCompact(it.review?.createdAt)}</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-18 h-18 rounded-sm overflow-hidden">
							<Image className="w-full h-full object-cover" src={it.imageUrl || "/no-image.jpg"} alt="thumbnail" width={100} height={100} unoptimized />
						</div>
						<div>
							<h3>{it.title}</h3>
						</div>
					</div>
					<div className="flex gap-2 flex-wrap">
						{it.review?.cardCondition && <Chip>{mapCondition(it.review.cardCondition)}</Chip>}
						{it.review?.priceSatisfaction && <Chip>{mapPrice(it.review.priceSatisfaction)}</Chip>}
						{it.review?.descriptionMatch && <Chip>{mapDesc(it.review.descriptionMatch)}</Chip>}
					</div>
					{it.review?.reviewText && (
						<div className="mt-2 p-3 rounded-md bg-[#2a2a36] text-[#e5e5e5] text-sm leading-6">
							<div className="text-xs text-[#a5a5a5] mb-1">후기 내용</div>
							<p className="whitespace-pre-line">{it.review.reviewText}</p>
						</div>
					)}
				</div>
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
