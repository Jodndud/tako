
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api"
import MyAuctionCard from "../auction/MyAuctionCard"
import { MyBidAuctionResponse } from "@/types/auction"

type HomeBidAuctionsProps = {
  type: "bid" | "sell";
  setTotalBidAuction: (count: number) => void;
  setTotalSellAuction: (count: number) => void;
}

export default function HomeBidAuctions({ type, setTotalBidAuction, setTotalSellAuction }: HomeBidAuctionsProps){
  const [data, setData] = useState<{ result: { content: MyBidAuctionResponse[] } } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let res;
        if (type === "bid") {
          res = await api.get("/v1/auctions/mybid", {})
        } else {
          res = await api.get("/v1/auctions/me", {})
        }
        setData(res.data);
        
        // 갯수 설정
        const count = res.data.result.content.length;
        if (type === "bid") {
          setTotalBidAuction(count);
        } else {
          setTotalSellAuction(count);
        }
      } catch (err: any) {
        setError(err.message || "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

  if (loading) {
    return (
      <div>
        로딩 중...
      </div>
    )
  }

  if (error) {
    return (
      <div>
        에러: {error}
      </div>
    )
  }

  if (!data || data.result.content.length === 0) {
    return (
      <div>
        {type === "bid" ? "입찰 중인 경매가 없습니다." : "등록한 경매가 없습니다."}
      </div>
    )
  }

  return(
    <div className="grid grid-cols-4 gap-8">
      {data.result.content.map((item: MyBidAuctionResponse) => (
        <MyAuctionCard key={item.auctionId} item={item} />
      ))}
    </div>
  )
}
