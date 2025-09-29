'use client'

import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import Image from "next/image"

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function MainBanner() {
    return (
        <div className="default-container">
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                pagination={{
                  type: 'fraction',
                }}
                navigation={true}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                className="main-banner"
                // onSwiper={(swiper) => console.log(swiper)}
                // onSlideChange={() => console.log('slide change')}
            >
                <SwiperSlide className=''>
                    <div><Image src="/background/banner-2.png" alt="banner-2" width={1280} height={480} /></div>
                </SwiperSlide>
                <SwiperSlide className=''>
                    <div><Image src="/background/banner-2.png" alt="banner-2" width={1280} height={480} /></div>
                </SwiperSlide>
            </Swiper>
        </div>
    )
}