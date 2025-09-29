'use client';

import Image from "next/image";
import { Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishAuctions, WishAuctionItem } from "@/hooks/useWishAuctions";

interface WishAuctionsProps {
  page?: number;
  size?: number;
}

function WishAuctionCard({ item, onRemove }: { item: WishAuctionItem; onRemove: (auctionId: number) => void }) {
  const endDate = new Date(item.endDatetime);
  const now = new Date();
  const timeLeft = endDate.getTime() - now.getTime();
  
  const isEnded = timeLeft <= 0;
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const formatTimeLeft = () => {
    if (isEnded) return "종료됨";
    if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  return (
    <div className="relative border-b border-[#353535]">
      <div className="py-5 px-6 flex justify-between items-center">
        <div className="flex items-center gap-5 flex-1">
          <div className="rounded-md overflow-hidden w-20 h-20 flex-shrink-0">
            <Image 
              className="w-full h-full object-cover" 
              src={item.imageKey || "/no-image.jpg"} 
              alt={item.title} 
              width={80} 
              height={80} 
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-lg mb-2 truncate">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-[#a5a5a5]">
              <Clock className="w-4 h-4" />
              <span className={isEnded ? "text-red-400" : "text-[#a5a5a5]"}>
                {isEnded ? "종료됨" : `남은 시간: ${formatTimeLeft()}`}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-[#a5a5a5] mb-1">현재 입찰가</p>
            <p className="text-lg font-medium text-green-500">
              {item.currentPrice.toFixed(2)} PKC
            </p>
          </div>
          
          <Button 
            variant="secondary" 
            size="icon" 
            className="size-10 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            onClick={() => onRemove(item.auctionId)}
          >
            <Heart className="w-5 h-5 fill-current" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// 진행중 관심 경매 컴포넌트
export function WishOngoingAuctions({ page = 0, size = 20 }: WishAuctionsProps) {
  const { ongoingAuctions, loading, error, removeWish } = useWishAuctions(page, size);

  if (loading) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        에러가 발생했습니다 😢
      </div>
    );
  }

  if (!ongoingAuctions || ongoingAuctions.length === 0) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        진행중인 관심 경매가 없습니다.
      </div>
    );
  }

  return (
    <div>
      {ongoingAuctions.map((item) => (
        <WishAuctionCard 
          key={item.auctionId} 
          item={item} 
          onRemove={removeWish}
        />
      ))}
    </div>
  );
}

// 종료된 관심 경매 컴포넌트
export function WishEndedAuctions({ page = 0, size = 20 }: WishAuctionsProps) {
  const { endedAuctions, loading, error, removeWish } = useWishAuctions(page, size);

  if (loading) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        에러가 발생했습니다 😢
      </div>
    );
  }

  if (!endedAuctions || endedAuctions.length === 0) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        종료된 관심 경매가 없습니다.
      </div>
    );
  }

  return (
    <div>
      {endedAuctions.map((item) => (
        <WishAuctionCard 
          key={item.auctionId} 
          item={item} 
          onRemove={removeWish}
        />
      ))}
    </div>
  );
}

// 기존 컴포넌트는 호환성을 위해 유지
export default function WishAuctions({ page = 0, size = 20 }: WishAuctionsProps) {
  const { wishAuctions, loading, error, totalElements, removeWish } = useWishAuctions(page, size);

  if (loading) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        에러가 발생했습니다 😢
      </div>
    );
  }

  if (!wishAuctions || wishAuctions.length === 0) {
    return (
      <div className="text-center text-[#a5a5a5] text-sm py-20">
        관심 경매가 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="px-6 py-3 bg-[#171725] border-b border-[#353535]">
        <p className="text-sm text-[#a5a5a5]">
          총 <span className="text-white font-medium">{totalElements}</span>건
        </p>
      </div>
      
      <div>
        {wishAuctions.map((item) => (
          <WishAuctionCard 
            key={item.auctionId} 
            item={item} 
            onRemove={removeWish}
          />
        ))}
      </div>
    </div>
  );
}
