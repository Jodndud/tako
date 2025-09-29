import { addMyReview, getMyReview } from "@/lib/review";
import { useState } from "react";

interface ReviewRequest {
    auctionId: number;
    cardCondition: string;
    priceSatisfaction: string;
    descriptionMatch: string;
    star:number;
    reviewText: string|null;
}
interface ReviewResponse {
    id: number;
    auctionId: number;
    nickname: number;
    reviewText: string|null;
    cardCondition: string|null;
    priceSatisfaction: string|null;
    descriptionMatch: string|null;
    star: number;
    createdAt: string|null;
}

export function useReview() {
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);

    // 리뷰 조회
    const handleGetReview = async(memberId:number) => {
        try{
            const res = await getMyReview(memberId);
            setReviews(res.result)
            // console.log(res)
        }catch(err){
            console.error(err);
        }
    }

    // 리뷰 등록
    const handleAddReview = async (params: ReviewRequest) => {
        try {
          const res = await addMyReview(
            params.auctionId,
            params.cardCondition,
            params.priceSatisfaction,
            params.descriptionMatch,
            params.star,
            params.reviewText
          );
          console.log(res);
        } catch (err) {
          console.error(err);
        }
      };

    return {
        handleGetReview, handleAddReview,
        reviews,
    }
}