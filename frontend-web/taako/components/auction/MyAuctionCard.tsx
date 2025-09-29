'use client'

import { MyBidAuctionResponse } from "@/types/auction"
import Image from "next/image"
import Link from "next/link";
import { useState, useEffect } from "react";
import { Clock, Users, DollarSign, Trophy } from 'lucide-react';
import { Badge } from "@/components/ui/badge"

export default function MyAuctionCard({ item }: { item: MyBidAuctionResponse }){
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        const endTime = new Date(item.endDatetime).getTime();
        const now = new Date().getTime();
        const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        setRemainingTime(timeLeft);

        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [item.endDatetime]);

    // remainingTime 일, 시간, 분, 초 변환
    const formatTime = (seconds: number) => {
        if (seconds <= 0) return '마감';
        
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days}일`);
        if (hours > 0) parts.push(`${hours}시간`);
        if (minutes > 0) parts.push(`${minutes}분`);
        if (secs > 0) parts.push(`${secs}초`);

        return parts.slice(0, 2).join(' ');
    };


    // 내 최고 입찰가가 현재가와 같은지 확인 (낙찰 여부)
    const isWinning = item.myTopBidAmount === item.currentPrice && item.bids.length > 0;
    
    return(
        <Link href={`/auction/${item.auctionId}`}>
            <div className="relative border rounded-lg h-80 flex items-end overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-0 left-0 w-full h-full">
                    <Image 
                        src={item.imageUrl || '/no-image.jpg'} 
                        alt={item.title}
                        width={300} 
                        height={300}
                        className="w-full h-full object-cover rounded"
                        unoptimized
                    />
                </div>

                {/* 낙찰 표시 */}
                {isWinning && item.isEnd && (
                    <div className="absolute top-2 right-2 z-10">
                        <Badge variant="secondary" className="bg-yellow-500 text-white text-xs font-semibold flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            낙찰
                        </Badge>
                    </div>
                )}

                <div className="w-full h-[45%] p-4 relative flex flex-col gap-2 bg-white/50 backdrop-blur-lg text-black rounded-lg">
                    <h3 className="h-13 font-semibold">
                        {item.title.length > 18 ? item.title.slice(0, 18) + "..." : item.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-[20px] font-semibold">
                        <DollarSign className="w-5 h-5" />
                        {item.currentPrice} ETH
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-[#242424]">
                        <Users className="w-4 h-4" />
                        <span>입찰 {item.bids.length}회</span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className={remainingTime <= 0 ? "text-red-500 font-semibold" : ""}>
                            {formatTime(remainingTime)}
                        </span>
                    </div>
                    
                    {/* 내 입찰 정보 */}
                    <div className="text-xs text-blue-600 font-medium">
                        내 입찰: {item.myTopBidAmount} ETH
                    </div>
                    
                    {item.bids.length > 0 && (
                        <div className="text-xs text-gray-600">
                            최고입찰: {item.bids[0].nickname} ({item.bids[0].price.toLocaleString()} ETH)
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
