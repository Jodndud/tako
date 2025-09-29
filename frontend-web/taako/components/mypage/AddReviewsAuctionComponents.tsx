// components/review/AuctionItem.tsx
'use client'

import Image from 'next/image';
import { Star } from 'lucide-react';
import { useState } from 'react';
import AddReviewsModal from './AddReviewsModal';

interface AuctionItemProps {
  item: any; // 필요에 따라 타입 정의
}

export default function AuctionItem({ item }: AuctionItemProps) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [selectedStar, setSelectedStar] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleStarClick = (count: number) => {
    setSelectedStar(count);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 border-b border-[#353535] px-5 py-6">
      {/* 상품 정보 */}
      <div className="flex items-center gap-4">
        <div className="w-18 h-18 rounded-sm overflow-hidden">
          <Image
            className="w-full h-full object-fit"
            src={item.imageUrl || '/no-image.jpg'}
            alt="thumbnail"
            width={100}
            height={100}
          />
        </div>
        <div>
          <h3>{item.title}</h3>
          <p>
            최종 입찰가 <span className="text-green-500 ml-1">{item.myTopBidAmount}</span> ETH
          </p>
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
              stroke={isActive ? '#f2b90c' : '#353535'}
              fill={isActive ? '#f2b90c' : '#353535'}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => handleStarClick(star)}
            />
          );
        })}
      </div>

      <p className="text-[#a5a5a5] text-sm">별점을 선택하세요.</p>

      {/* 모달 */}
      {isModalOpen && (
        <AddReviewsModal
          auctionId={item.auctionId}
          star={selectedStar}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
