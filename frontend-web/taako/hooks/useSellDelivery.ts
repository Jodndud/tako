import { addTrackingNumber, getAuctionDelivery, sellerDelivery } from "@/lib/delivery";
import { GetAuctionDelivery } from "@/types/delivery";
import { useState } from "react";

export function useDelivery() {
    const [auctionDelivery, setAuctionDelivery] = useState<GetAuctionDelivery>();

    // 경매 배송 정보 조회
    const handlerGetAuctionDelivery = async (auctionId:number) => {
        try {
        const res = await getAuctionDelivery(auctionId);
        setAuctionDelivery(res.result);
        } catch (err) {
        console.error(err);
        }
    };

    // 판매자: 보내는 주소 설정
    const handlerSellerAddress = async(auctionId:number, addressId:number) => {
        try{
            await sellerDelivery(auctionId, addressId);
        }catch(err){
            console.error(err);
        }
    }

    // 판매자: 운송장 등록
    const handlerTrackingNumber = async(auctionId:number, trackingNumber:string) => {
        try{
            await addTrackingNumber(auctionId, trackingNumber);
        }catch(err){
            console.error(err);
        }
    }

    return {
        handlerGetAuctionDelivery, auctionDelivery,
        handlerSellerAddress,
        handlerTrackingNumber,
    }
}