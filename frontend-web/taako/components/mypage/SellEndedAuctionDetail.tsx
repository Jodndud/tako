'use client'

import Image from "next/image";
import { useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ReferenceArea, ResponsiveContainer
} from "recharts";
import SellerPayoutPanel from "@/components/nft/SellerPanel";
import { useMyInfo } from "@/hooks/useMySellInfo";
import useWallet from "@/hooks/useWallet";
import { useDelivery } from "@/hooks/useSellDelivery";
import { useDelivery as sellerInfo } from "@/hooks/useDelivery";
import AddTracking from "./delivery/AddTracking";
import SellDeliveryForm from "./delivery/SellDeliveryForm";
import { MySellAuctions, Bids } from "@/types/auth";

interface Props {
  item: MySellAuctions;
  modalType: "delivery" | "tracking" | null;
  onOpenModal: (type: "delivery" | "tracking") => void;
  onCloseModal: () => void;
}

const statusMap: Record<string, string> = {
  WAITING: "배송준비중",
  IN_PROGRESS: "배송중",
  COMPLETED: "배송완료",
  CONFIRMED: "구매확정",
};

// X축 포맷 함수
const formatDateForXAxis = (ts: number) => {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

// 커스텀 툴팁
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const bids: Bids[] = payload[0].payload.bids as Bids[];
    return (
      <div className="bg-[#191924] border border-[#353535] text-white p-3 rounded shadow-lg min-w-[120px]">
        {bids && bids.length > 0 ? (
          bids.map((bid, index) => (
            <div key={index} className="flex flex-col gap-1">
              <p>nickname : "{bid.nickname}"</p>
              <p className="text-green-500">price : {bid.price} TKC</p>
            </div>
          ))
        ) : (
          <p className="text-[#f2b90c] ml-auto">입찰 정보 없음</p>
        )}
      </div>
    );
  }
  return null;
};

// 차트 데이터 생성
const getChartData = (auction: MySellAuctions) => {
  if (!auction.bids || auction.bids.length === 0) return [];

  const dailyMaxMap = new Map<number, { bids: Bids[]; price: number }>();

  auction.bids.forEach((bid) => {
    if (!bid.data || bid.price === null) return;
    const ts = new Date(bid.data).getTime();
    const dayKey = new Date(ts).setHours(0, 0, 0, 0);

    if (!dailyMaxMap.has(dayKey)) {
      dailyMaxMap.set(dayKey, { bids: [bid], price: bid.price });
    } else {
      const current = dailyMaxMap.get(dayKey)!;
      if (bid.price > current.price) {
        dailyMaxMap.set(dayKey, { bids: [bid], price: bid.price });
      } else {
        current.bids.push(bid);
      }
    }
  });

  return Array.from(dailyMaxMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dayKey, { bids, price }]) => ({ date: dayKey, bids, price }));
};

export default function SellEndedAuctionDetail({ item, modalType, onOpenModal, onCloseModal }: Props) {
  const { myInfo } = useMyInfo();
  const { auctionDelivery, handlerGetAuctionDelivery } = useDelivery();
  const { hasSeller } = sellerInfo(item.auctionId);
  const { walletAddress } = useWallet();

  const today = new Date();
  const todayTs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  const chartData = getChartData(item);
  const endDate = new Date(item.endDatetime!);
  const endDateTs = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();

  const safeChartData = chartData.length > 0 ? chartData : [{ date: endDateTs, price: 0, bids: [] }];

  const _sellerWallet =
    (myInfo as any)?.walletAddress?.startsWith("0x")
      ? ((myInfo as any).walletAddress as `0x${string}`)
      : (walletAddress?.startsWith("0x") ? (walletAddress as `0x${string}`) : undefined);

  useEffect(()=> {
    handlerGetAuctionDelivery(item.auctionId);
  }, [])

  // console.log(auctionDelivery)

  return (
    <div className="grid grid-cols-2 gap-3 py-5 pt-8 border-b border-[#353535]">
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1 px-4">
          <p className="text-sm text-[#a5a5a5]">경매 번호: {item.code}</p>
          <h3 className="bid">{item.title}</h3>
        </div>
        <div className="py-4 px-4 flex justify-between">
          <div className="flex items-center gap-5">
            <div className="rounded-lg overflow-hidden w-25 h-25">
              <Image
                className="w-full h-full object-cover"
                src={item.imageUrl || "/no-image.jpg"}
                alt="thumbnail"
                width={100}
                height={100}
                unoptimized
              />
            </div>
            <div>
              <p className="text-xl mb-1">입찰가: {item.currentPrice} ETH</p>
              {auctionDelivery?.status ? (
                <p className="text-sm text-green-500">
                  {statusMap[auctionDelivery?.status ?? ""]}
                </p>
              ) : (
                <p className="text-sm text-red-500">배송지 입력 대기</p>
              )}
            </div>
          </div>

          {/* 배송/송장 버튼 */}
          <div className="flex flex-col justify-center gap-2">
            <button
              className="px-8 py-3 text-sm rounded-md border-1 border-[#353535] bg-[#191924]"
              onClick={() => onOpenModal("delivery")}
            >
              {hasSeller ? "배송지 선택 완료" : "배송지 선택"}
            </button>
            <button
              className="px-8 py-3 text-sm rounded-md border-1 border-[#353535] bg-[#191924]"
              onClick={() => onOpenModal("tracking")}
            >
              송장번호입력
            </button>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <div>
        <p className="text-sm text-[#eee]">입찰 히스토리</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={safeChartData} margin={{ top: 20, right: 40 }}>
              <CartesianGrid stroke="#222" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatDateForXAxis}
                tick={{ fill: "#a5a5a5", fontSize: 12 }}
                axisLine={false}
                label={{ value: "날짜", position: "insideRight", fontSize: 12, offset: 0, fill: "#a5a5a5" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#aaa", fontSize: 12 }}
                axisLine={false}
                label={{ value: "가격", position: "top", fontSize: 12, offset: 0, fill: "#a5a5a5" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceArea x1={todayTs} x2={endDateTs} fill="#353535" fillOpacity={0.3} />
              <ReferenceLine
                x={todayTs}
                stroke="#00ff00"
                strokeWidth={2}
                label={{ position: "top", value: "오늘", fill: "#00ff00", dy: -2, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="price"
                name="입찰가"
                stroke="#ffffff"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-sm h-full flex items-center justify-center pb-5 text-[#a5a5a5]">
            입찰 히스토리가 없습니다.
          </div>
        )}
      </div>

      <div className="col-span-2 mt-4 pt-4 border-t border-[#2b2b2b]">
          <SellerPayoutPanel
            auctionId={item.auctionId}
            sellerWallet={_sellerWallet}
            preferForAll={true}
          />
      </div>

      {/* 모달 */}
      {modalType === "delivery" && <SellDeliveryForm auctionId={item.auctionId} onClose={onCloseModal} />}
      {modalType === "tracking" && <AddTracking auctionId={item.auctionId} item={auctionDelivery} onClose={onCloseModal} />}
    </div>
  );
}
