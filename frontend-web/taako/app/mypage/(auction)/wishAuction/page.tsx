'use client';

import { useState } from 'react';
import { WishOngoingAuctions, WishEndedAuctions } from '@/components/mypage/WishAuctions';
import { useWishAuctions } from '@/hooks/useWishAuctions';

// {
//   "httpStatus": {
//     "error": true,
//     "is4xxClientError": true,
//     "is5xxServerError": true,
//     "is1xxInformational": true,
//     "is2xxSuccessful": true,
//     "is3xxRedirection": true
//   },
//   "isSuccess": true,
//   "message": "string",
//   "code": 0,
//   "result": {
//     "content": [
//       {
//         "auctionId": 123,
//         "imageKey": "auction/item/123/main.jpg",
//         "title": "전설의 푸른 용 1st Edition",
//         "currentPrice": 10.5,
//         "endDatetime": "2025-09-27T12:26:51.194Z"
//       }
//     ],
//     "page": 0,
//     "size": 0,
//     "totalElements": 0,
//     "totalPages": 0
//   }
// }

export default function WishAuctionPage() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');
  const { ongoingAuctions, endedAuctions } = useWishAuctions();

  return (
    <div>
      <h2>관심 경매</h2>

      {/* 구분 탭 */}
      <div className="border-b border-[#a5a5a5] flex relative py-2 mt-3">
        {/* 경매 중 */}
        <button
          onClick={() => setActiveTab('ongoing')}
          className="flex-1 flex gap-2 items-center justify-center cursor-pointer"
        >
          <div className={`${activeTab === 'ongoing' ? 'text-white font-medium' : 'font-light text-[#a5a5a5]'}`}>경매 중</div>
          <div className={`text-lg mb-0.5 ${
            activeTab === 'ongoing' ? 'text-[#F2B90C] font-medium' : 'font-light text-[#a5a5a5]'
          }`}>{ongoingAuctions.length}</div>
        </button>
        {/* 종료 */}
        <button
          onClick={() => setActiveTab('ended')}
          className="flex-1 flex gap-2 items-center justify-center cursor-pointer"
        >
          <div className={`${activeTab === 'ended' ? 'text-white font-medium' : 'font-light text-[#a5a5a5]'}`}>종료</div>
          <div className={`text-lg mb-0.5 ${
            activeTab === 'ended' ? 'text-[#F2B90C] font-medium' : 'font-light text-[#a5a5a5]'
          }`}>{endedAuctions.length}</div>
        </button>
        
        {/* 활성 탭 표시 바 */}
        <div 
          className={`absolute bottom-0 w-[50%] h-[1px] bg-white transition-all duration-300 ease-in-out z-1 ${
            activeTab === 'ongoing' ? 'left-0' : 'left-[50%] w-[50%]'
          }`}
        />
      </div>

      {/* 관심 경매 목록 테이블 */}
      <div className=''>
        {activeTab === 'ongoing' && (
          <WishOngoingAuctions />
        )}
        {activeTab === 'ended' && (
          <WishEndedAuctions />
        )}
      </div>
    </div>
  );
}
