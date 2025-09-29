"use client";

import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { useMyReviews } from "@/hooks/useMyReviews";
import { formatKSTCompact } from "@/lib/formatKST";

export default function SellerReviews() {
	const tabs = [
		{ id: "pending", label: "받을 예정" },
		{ id: "received", label: "받은 리뷰" },
	] as const;
	const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("pending");

	const pending = useMyReviews("SELLER", false);
	const received = useMyReviews("SELLER", true);

	const current = tab === "pending" ? pending : received;

	return (
		<div className="flex flex-col gap-4">
			<div className="border-b border-[#353535] flex gap-4">
				{tabs.map((t) => (
					<button key={t.id} className={`px-3 py-2 ${tab === t.id ? "text-white border-b border-white" : "text-[#a5a5a5]"}`} onClick={() => setTab(t.id)}>
						{t.label}
					</button>
				))}
			</div>

			{current.loading && <p className="text-center text-gray-400 py-10">불러오는 중…</p>}
			{current.error && <p className="text-center text-red-400 py-10">{current.error}</p>}
			{!current.loading && !current.error && !current.items.length && <p className="text-center text-gray-400 py-10">표시할 항목이 없습니다.</p>}

			<div className="flex flex-col">
				{current.items.map((it) => (
					<div key={it.auctionId} className="flex flex-col gap-6 border-b border-[#353535] px-5 py-6">
						<div className="flex items-center gap-4">
							<div className="w-18 h-18 rounded-sm overflow-hidden">
								<Image className="w-full h-full object-fit" src={it.imageUrl || "/no-image.jpg"} alt="thumbnail" width={100} height={100} />
							</div>
							<div>
								<h3>{it.title}</h3>
								{tab === "received" && (
									<div className="flex items-center gap-2 text-sm text-[#a5a5a5]">
										<StarRow count={it.review?.star ?? 0} />
										<span>{formatKSTCompact(it.review?.createdAt)}</span>
										<span>by {it.review?.writerMaskedNickname}</span>
									</div>
								)}
							</div>
						</div>
						{tab === "received" && it.review && (
							<div className="flex gap-2 flex-wrap">
								{it.review.cardCondition && <Chip>{mapCondition(it.review.cardCondition)}</Chip>}
								{it.review.priceSatisfaction && <Chip>{mapPrice(it.review.priceSatisfaction)}</Chip>}
								{it.review.descriptionMatch && <Chip>{mapDesc(it.review.descriptionMatch)}</Chip>}
							</div>
						)}
						{tab === "received" && it.review?.reviewText && (
							<div className="mt-2 p-3 rounded-md bg-[#2a2a36] text-[#e5e5e5] text-sm leading-6">
								<div className="text-xs text-[#a5a5a5] mb-1">후기 내용</div>
								<p className="whitespace-pre-line">{it.review.reviewText}</p>
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
