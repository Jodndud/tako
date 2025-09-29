'use client'

import Link from "next/link";
import AuctionCard from "@/components/auction/AuctionCard"
import { useMemo } from "react";
import { useAuctionsQuery } from "@/hooks/useAuctionsQuery";
import { GetAuction } from "@/types/auction";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { ChevronRight } from 'lucide-react';

export default function MainItemEndCloseSection() {
    const { data, isLoading, isError } = useAuctionsQuery({ sort: 'ENDTIME_ASC', isEnded:false });
    // console.log(data)

    const auctions: GetAuction[] = data?.result?.content?.filter(
        (item: GetAuction) => item.remainingSeconds > 0
      ) ?? [];
      
    return (
        <div className="default-container">
            <Link href={`/search?sort=ENDTIME_ASC`}>
                <h2 className="mb-6 flex gap-1 items-center">마감 임박 경매 <ChevronRight /></h2>
            </Link>
            {isLoading ? (
                <div className="flex justify-center items-center h-50 text-sm text-[#a5a5a5]">
                    경매를 불러오는 중입니다
                </div>
            ) : isError ? (
                <div className="flex justify-center items-center h-50 text-sm text-red-500">
                    경매 데이터를 불러오는데 실패했습니다
                </div>
            ) : auctions.length === 0 ? (
                <div className="flex justify-center items-center h-50 text-sm text-[#a5a5a5]">
                    등록된 경매가 없습니다
                </div>
            ) : (
                <div>
                    <Swiper
                        slidesPerView={5}
                        spaceBetween={30}
                        navigation={true}
                        modules={[Navigation]}
                        className="end-close-auction">
                        {auctions.map((item: GetAuction, index: number) => (
                            <SwiperSlide key={index}>
                                <AuctionCard item={item} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </div>
    )
}