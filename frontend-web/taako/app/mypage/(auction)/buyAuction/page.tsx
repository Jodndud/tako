'use client';

import { useState } from 'react';
import BuyOnGoingAuction from '@/components/mypage/BuyOnGoingAuction';
import BuyEndedAuction from '@/components/mypage/BuyEndedAuction';
import { useMyInfo } from '@/hooks/useMyInfo';

export default function BuyAuctionPage() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'ended'>('ongoing');
  const { countOngoing, countEnded } = useMyInfo();

  return (
    <div>
      <h2>입찰 경매 조회</h2>

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
          }`}>{countOngoing}</div>
        </button>
        {/* 종료 */}
        <button
          onClick={() => setActiveTab('ended')}
          className="flex-1 flex gap-2 items-center justify-center cursor-pointer"
        >
          <div className={`${activeTab === 'ended' ? 'text-white font-medium' : 'font-light text-[#a5a5a5]'}`}>종료</div>
          <div className={`text-lg mb-0.5 ${
            activeTab === 'ended' ? 'text-[#F2B90C] font-medium' : 'font-light text-[#a5a5a5]'
          }`}>{countEnded}</div>
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
          <BuyOnGoingAuction />
        )}
        {activeTab==='ended' && (
          <BuyEndedAuction />
        )}
      </div>
  </div>
  );
}