"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useState } from "react";
import AddReviewsModal from "./AddReviewsModal";
import { useMyReviews } from "@/hooks/useMyReviews";

export default function AddReviews() {
	const [hoveredStar, setHoveredStar] = useState<number>(0);
	const [selectedStar, setSelectedStar] = useState<number>(0);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

	// 구매자, 미작성 목록
	const { items, loading, error } = useMyReviews("BUYER", false);

	const handleStarClick = (auctionId: number, count: number) => {
		setSelectedAuctionId(auctionId);
		setSelectedStar(count);
		setIsModalOpen(true);
	};

	if (loading) return <p className="text-center text-gray-400 py-20">불러오는 중…</p>;
	if (error) return <p className="text-center text-red-400 py-20">{error}</p>;

	if (!items.length) {
		return <p className="text-center text-gray-400 py-20">구매 확정되었지만 아직 리뷰할 항목이 없습니다.</p>;
	}

	return (
		<div>
			{items.map((item) => (
				<div key={item.auctionId}>
					<div className="flex flex-col gap-6 border-b border-[#353535] px-5 py-6">
						{/* 상품 정보 */}
						<div className="flex items-center gap-4">
							<div className="w-18 h-18 rounded-sm overflow-hidden">
								<Image className="w-full h-full object-cover" src={item.imageUrl || "/no-image.jpg"} alt="thumbnail" width={100} height={100} unoptimized />
							</div>
							<div>
								<h3>{item.title}</h3>
								{/* 가격 정보는 응답 스키마에 없으므로 생략 */}
							</div>
						</div>

						{/* 별점 영역 */}
						<div className="flex gap-3 pl-2">
							{[1, 2, 3, 4, 5].map((star) => {
								const isActive = hoveredStar >= star || selectedStar >= star;
								return (
									<Star
										key={star}
										className="w-12 h-12 cursor-pointer transition-colors"
										strokeWidth={0}
										stroke={isActive ? "#f2b90c" : "#353535"}
										fill={isActive ? "#f2b90c" : "#353535"}
										onMouseEnter={() => setHoveredStar(star)}
										onMouseLeave={() => setHoveredStar(0)}
										onClick={() => handleStarClick(item.auctionId, star)}
									/>
								);
							})}
						</div>

						<p className="text-[#a5a5a5] text-sm">별점을 선택하세요.</p>
					</div>

					{/* 모달 */}
					{isModalOpen && selectedAuctionId === item.auctionId && <AddReviewsModal auctionId={item.auctionId} star={selectedStar} onClose={() => setIsModalOpen(false)} />}
				</div>
			))}
		</div>
	);
}
