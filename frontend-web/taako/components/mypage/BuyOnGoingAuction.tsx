import Image from "next/image"
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { useMyInfo } from "@/hooks/useMyInfo"
import { useState } from "react";

export default function BuyOnGoingAuction(){
    const { ongoingAuctions, myBidLoading, myBidError, } = useMyInfo();
    const [remainingTime, setRemainingTime] = useState<number|null>(null);

    if (myBidLoading) return <div className="text-center text-[#a5a5a5] text-sm py-20">불러오는 중...</div>;
    if (myBidError) return <div className="text-center text-[#a5a5a5] text-sm py-20">에러가 발생했습니다 😢</div>;
    if (!ongoingAuctions || ongoingAuctions.length==0) return <div className="text-center text-[#a5a5a5] text-sm py-20">현재 입찰중인 경매가 없습니다.</div>;

    return(
      <div>
        {ongoingAuctions.map((item, index)=>{
          return(
            <div key={index}>
              <div className="h-3 bg-[#1F1F2D]"></div>
              <div className="flex justify-between border-b border-[#353535] px-6 py-4">
                <p className="text-sm">경매 번호 {item.code}</p>
                <p className="text-sm">남은 시간 {remainingTime}</p>
              </div>
              <div className="py-4 px-6 flex justify-between">
                <div className="flex items-center gap-5">
                  <div className="rounded-lg overflow-hidden w-22 h-22"><Image className="w-full h-full object-cover" src={item?.imageUrl || "/no-image.jpg"} alt="thumnail" width={100} height={100} unoptimized /></div>
                  <div className="">
                    <h3 className="bid">{item.title}</h3>
                    <p className="text-lg">입찰가 {item.currentPrice} TKC</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 items-end">
                    <p className="text-sm">현재 입찰가 <span className="text-green-500 ml-1">{item.currentPrice} TKC</span></p>
                    <p className="text-sm">내 입찰가 <span className="text-red-500 ml-1">{item.myTopBidAmount} TKC</span></p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Link
                      href={`/auction/${item.auctionId}`}
                      className="inline-flex items-center justify-center h-10 w-[120px] rounded-md bg-[#191924] border border-[#353535] text-sm text-[#dedede] hover:bg-[#242433]"
                    >
                      재입찰
                    </Link>
                    <Button disabled className="text-sm text-[#dedede] h-10 w-[120px] !rounded-md bg-[#191924] border-1 border-[#353535] hover:bg-[#242433] cursor-pointer" variant="default">즉시구매</Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
}