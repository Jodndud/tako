'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { useMajorCategories } from "@/hooks/useMajorCategories"
import { getHotCard } from "@/lib/card";

interface HotCard {
    cardId: number;
    name: string;
    rarity: string;
    score: number;
    url: string;
}

export default function MainHotCardSection(){
    const {
        majorCategories,
    } = useMajorCategories();

    // 카테고리 인기카드조회 handler
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(3);
    const [hotCards, setHotCards] = useState<HotCard[]>([]);
    useEffect(() => {
        if (selectedCategoryId !== null) {
            handleHotCards(selectedCategoryId);
        }
    }, [selectedCategoryId]);

    const handleHotCards = async(categoryId:number) => {
        try{
            setSelectedCategoryId(categoryId);
            const res = await getHotCard(categoryId);
            // console.log(res);
            setHotCards(res.result.content);
        }catch(err:any){
            console.log(err.message);
        }
    }
    // console.log(hotCards)

    return(
        <div className="py-30">
            <div className="default-container flex flex-col items-center gap-8">
                <h2>인기카드</h2>
                <ul className="flex gap-5">
                    {majorCategories && majorCategories.map((item, index) => (
                        <li
                        key={index}
                        className={`px-4 py-1 rounded-full cursor-pointer transition-colors duration-200 ${
                            selectedCategoryId === item.id 
                                ? "bg-[#FBE134] text-[#0D0D0D]" 
                                : "bg-black/20 hover:bg-[#FBE134] hover:text-[#0D0D0D]"
                        }`}
                        onClick={() => {handleHotCards(item.id)}}
                        >{item.name}</li>
                    ))}
                </ul>
            </div>
                {hotCards && hotCards.length>0 ? (
                    <Marquee>
                        <div className="flex gap-8 mr-8">
                        {hotCards.map((item, index)=>(
                            <div key={index} className="mt-10">
                                <Link href={`/category/${selectedCategoryId}/${item.cardId}`}>
                                    <Image src={`${item.url}`} alt={`hotCard-${item.cardId}`} width={250} height={100} unoptimized />
                                </Link>
                            </div>
                        ))}
                        </div>
                    </Marquee>
                    
                ): (
                    <div className="text-sm text-[#a5a5a5] text-center py-20">아직 집계된 인기 카드가 없습니다.</div>
                )}
        </div>
    )
}