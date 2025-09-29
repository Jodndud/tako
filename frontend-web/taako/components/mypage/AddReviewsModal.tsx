"use client";

import { X, Star } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useReview } from "@/hooks/useReview";

// 렌더링 타입
interface AddReviewsModalProps {
	auctionId: number;
	star: number;
	onClose: () => void;
}

// 리뷰 request타입
interface ReviewRequest {
	auctionId: number;
	cardCondition: string;
	priceSatisfaction: string;
	descriptionMatch: string;
	star: number;
	reviewText: string | null;
}

const questions = [
	{
		label: "카드 컨디션은 어땠나요?",
		title: "condition",
		options: ["사용감이 많아요", "보통이에요", "최상급이에요"],
		query: ["HEAVY_USED", "NORMAL", "LIKE_NEW"],
	},
	{
		label: "가격은 적당했나요?",
		title: "price",
		options: ["비싸요", "적당해요", "저렴해요"],
		query: ["OVERPAID", "NORMAL", "VERY_GOOD_DEAL"],
	},
	{
		label: "제품이 설명과 동일한가요?",
		title: "description",
		options: ["차이가 있어요", "거의 비슷해요", "정확히 일치해요"],
		query: ["DIFFERENT", "ALMOST", "EXACT"],
	},
];

export default function AddReviewsModal({ auctionId, star, onClose }: Readonly<AddReviewsModalProps>) {
	const [answers, setAnswers] = useState<Record<string, string>>({});
	const [reviewText, setReviewText] = useState<string>("");
	const { handleAddReview } = useReview();
	const handleChange = (title: string, value: string) => {
		setAnswers((prev) => ({ ...prev, [title]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!answers.condition || !answers.price || !answers.description) return;

		const payload: ReviewRequest = {
			auctionId: auctionId,
			cardCondition: answers.condition,
			priceSatisfaction: answers.price,
			descriptionMatch: answers.description,
			star: star,
			reviewText: reviewText.trim() ? reviewText.trim() : null,
		};

		handleAddReview(payload);
		onClose();
	};

	const isSubmitDisabled = questions.some((q) => !answers[q.title]);

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<div className="relative p-5 w-[500px] h-[740px] max-h-[85vh] bg-gray-800 rounded-lg flex flex-col">
				<X onClick={onClose} className="absolute top-5 right-5 cursor-pointer text-gray-400 hover:text-white" />
				<h3 className="text-center mb-2">리뷰 작성</h3>
				<form id="review-form" className="scrollbar-hide flex flex-col gap-8 overflow-y-auto flex-1 pr-1" onSubmit={handleSubmit}>
					{/* 별점 표시 */}
					<div className="flex flex-col gap-3">
						<p className="text-sm">상품은 마음에 드셨나요?</p>
						<div className="flex gap-2">
							{Array.from({ length: star }, (_, i) => (
								<Star key={i} strokeWidth={0} className="w-12 h-12" stroke="#f2b90c" fill="#f2b90c" />
							))}
						</div>
					</div>

					{/* 질문 리스트 */}
					{questions.map((q) => (
						<div key={q.title} className="flex flex-col gap-3">
							<p className="text-sm">{q.label}</p>
							<div className="flex gap-2">
								{q.options.map((opt, i) => (
									<label key={`${q.title}-${q.query[i]}`} className="cursor-pointer">
										<input
											type="radio"
											name={q.title}
											value={q.query[i]} // 여기서 query 값 사용
											checked={answers[q.title] === q.query[i]}
											onChange={() => handleChange(q.title, q.query[i])}
											className="peer hidden"
										/>
										<div
											className="py-2 px-4 text-sm rounded-full bg-gray-700 
                            peer-checked:bg-yellow-500 hover:bg-yellow-500 hover:text-black peer-checked:text-black 
                            transition-colors"
										>
											{opt}
										</div>
									</label>
								))}
							</div>
						</div>
					))}

					{/* 후기 내용 (선택) */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<label htmlFor="review-text" className="text-sm">
								후기 내용 (선택, 최대 255자)
							</label>
							<span className="text-xs text-[#a5a5a5]">{reviewText.length}/255</span>
						</div>
						<textarea
							id="review-text"
							className="w-full min-h-28 resize-y rounded-md bg-gray-700 text-white p-3 outline-none focus:ring-2 ring-yellow-500/70"
							placeholder="거래 후기를 자유롭게 남겨주세요."
							maxLength={255}
							value={reviewText}
							onChange={(e) => setReviewText(e.target.value)}
						/>
					</div>
				</form>
				{/* 버튼 (스크롤 영역 밖, 레이아웃 내 하단 고정) */}
				<div className="mt-2 pt-2 border-t border-gray-600 bg-gray-800/0 shrink-0">
					<Button type="submit" form="review-form" className="h-12 w-full text-md" disabled={isSubmitDisabled}>
						리뷰 제출하기
					</Button>
				</div>
			</div>
		</div>
	);
}
