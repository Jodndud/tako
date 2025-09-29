'use client'

import AuctionCard from "@/components/auction/AuctionCard"
import { useAuctionsQuery } from "@/hooks/useAuctionsQuery";
import { GetAuction } from "@/types/auction";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

export default function MainItemListSection({id}:{id:number}) {
    const { data, isLoading, isError } = useAuctionsQuery({ categoryMajorId: id, isEnded:false }, { enabled: !!id });
    const auctions: GetAuction[] = (data?.result?.content ?? []) as GetAuction[];

    return (
        <div className="default-container">
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
                        className={`category-${id}`}>
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