'use client';

import { useState } from 'react';
import SellOnGoingAuction from '@/components/mypage/SellOnGoingAuction';
import SellEndedAuction from '@/components/mypage/SellEndedAuction';
import { useMyInfo } from '@/hooks/useMySellInfo';

export default function SellAuctionPage() {
  const { ongoingSellAuctions ,endedSellAuctions } = useMyInfo();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');
  const ongoing = ongoingSellAuctions.length || 0
  const ended = endedSellAuctions.length || 0

  return (
    <div>
      <h2>판매 경매 조회</h2>

      <div className="border-b border-[#a5a5a5] flex relative py-2 mt-3">
        <button
          onClick={() => setActiveTab('ongoing')}
          className="flex-1 flex gap-2 items-center justify-center cursor-pointer"
        >
          <div className={`${activeTab === 'ongoing' ? 'text-white font-medium' : 'font-light text-[#a5a5a5]'}`}>판매 중</div>
          <div className={`text-lg mb-0.5 ${
            activeTab === 'ongoing' ? 'text-[#F2B90C] font-medium' : 'font-light text-[#a5a5a5]'
          }`}>{ongoing}</div>
        </button>
        {/* 종료 */}
        <button
          onClick={() => setActiveTab('ended')}
          className="flex-1 flex gap-2 items-center justify-center cursor-pointer"
        >
          <div className={`${activeTab === 'ended' ? 'text-white font-medium' : 'font-light text-[#a5a5a5]'}`}>종료</div>
          <div className={`text-lg mb-0.5 ${
            activeTab === 'ended' ? 'text-[#F2B90C] font-medium' : 'font-light text-[#a5a5a5]'
          }`}>{ended}</div>
        </button>
        
        {/* 활성 탭 표시 바 */}
        <div 
          className={`absolute bottom-0 w-[50%] h-[1px] bg-white transition-all duration-300 ease-in-out z-1 ${
            activeTab === 'ongoing' ? 'left-0' : 'left-[50%] w-[50%]'
          }`}
        />
      </div>

      {/* 경매 목록 테이블 */}
      <div className=''>
        {activeTab==='ongoing' && (
          <SellOnGoingAuction />
        )}
        {activeTab==='ended' && (
          <SellEndedAuction />
        )}
      </div>
    </div>
  );
}
