"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Loading";
import RankElement from "@/components/atoms/RankElement";
import BidInputForm from "@/components/atoms/BidInputForm";
import AuctionDetailImages from "@/components/sections/auction/AuctionDetailImages";
import RemainingTime from "@/components/atoms/RemainingTime";
import { toKstDate, formatKSTFull } from "@/lib/formatKST";
import AuctionHistoryTable from "@/components/charts/parts/AuctionHistoryTable";
import AuctionWeeklyChart from "@/components/charts/parts/AuctionWeeklyChart";
import AuctionInquiry from "@/components/sections/auction/AuctionInquiry";
import { useAuctionDetail } from "@/hooks/useAuctionDetail";
import { useAuctionPrice } from "@/hooks/useAuctionPrice";
import { useMyInfo } from "@/hooks/useMyInfo";          // 추가
import { useNFThistory } from "@/hooks/useNFThistory";  // 이미 사용중
import { BadgeCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  auctionId: number;
  historySize?: number
};


export default function AuctionDetailClient({ auctionId, historySize = 5 }: Readonly<Props>) {
  // 1) 훅은 항상 같은 순서/개수로 최상단에서 호출
  const { data, loading, error, wished, pendingWish, wishError, toggleWish } =
    useAuctionDetail(auctionId, historySize);

  const { me: myInfo } = useMyInfo(); // 분기 이전(무조건 호출)

  // tokenId는 아직 없을 수도 있으니 null로 안전 처리
  const tokenId = Number(data?.tokenId);
  const { history } = useNFThistory(tokenId); // ⬅️ 훅은 호출, 내부에서 enabled로 요청 제어
  // console.log(history)

  // 문의 개수
	const [inqTotal, setInqTotal] = useState<number>(0);
	const handleTotalChange = (n: number) => {
		setInqTotal((prev) => (prev === n ? prev : n)); // 같은 값이면 렌더 스킵
	};


  // 현재가 초기값도 안전하게
  const initial = typeof data?.currentPrice === "number" ? data.currentPrice : 0;
  // 실시간 이벤트만 별도로 관리 (초기 서버 history는 그대로 chart에서 legacy로 사용)
	interface RealtimeBid {
		time: string;
		nickname: string;
		amount: number;
		type: "bid" | "buy_now";
	}
	const [realtimeEvents, setRealtimeEvents] = useState<RealtimeBid[]>([]);

	const pushRealtime = useCallback((ev: { type: "bid" | "buy_now"; auctionId: number; nickname: string; amount: string; time: string }) => {
		setRealtimeEvents((prev) => {
			const exists = prev.find((p) => p.time === ev.time && p.nickname === ev.nickname && p.amount === Number(ev.amount));
			if (exists) return prev;
			return [{ time: ev.time, nickname: ev.nickname, amount: Number(ev.amount), type: ev.type }, ...prev];
		});
	}, []);


  // useAuctionPrice도 분기 이전에 항상 호출 (요청은 pollUrl/sseUrl로 제어)
  const [currentPrice, setCurrentPrice] = useAuctionPrice(auctionId, initial, {
    sseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/auctions/${auctionId}/live`,
    pollUrl: `/v1/auctions/${auctionId}`,
    withCredentials: true,
    pollMs: 4000,
    getPrice: (j) => j?.result?.currentPrice ?? j?.currentPrice,
    debug: ["1", "true", "yes"].includes(String(process.env.NEXT_PUBLIC_DEBUG_SSE).toLowerCase()),
    onBid: (payload) => pushRealtime({ type: "bid", auctionId: payload.auctionId, nickname: payload.nickname, amount: payload.amount, time: payload.time }),
		onBuyNow: (payload) => pushRealtime({ type: "buy_now", auctionId: payload.auctionId, nickname: payload.nickname, amount: payload.amount, time: payload.time }),
	});

  // 2) 여기서부터 분기(렌더 가드)
  if (loading) {
    return (
      <div className="default-container pb-[80px]">
        <Loading />
      </div>
    );
  }
  if (error) {
    return (
      <div className="default-container pb-[80px]">
        <p className="text-red-400">경매 정보를 불러오는 중 오류가 발생했어요.</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="default-container pb-[80px]">
        <p>경매 정보를 찾을 수 없어요.</p>
      </div>
    );
  }

  const auc: any = data;
  if (!auc.card) {
    return (
      <div className="default-container pb-[80px]">
        <p>카드 정보가 없어요. 잠시 후 다시 시도해주세요.</p>
      </div>
    );
  }

  // 진행/내 경매 여부 계산
  const now = Date.now();
  const fmtDateTime = (iso?: string) => formatKSTFull(iso);
  const toInstantMs = (iso?: string | null) => toKstDate(iso)?.getTime() ?? 0;
  const startMs = toInstantMs(auc.startDatetime);
  const endMs   = toInstantMs(auc.endDatetime || auc.endTime);
  
  const isActive = startMs > 0 && endMs > 0 && startMs <= now && now < endMs;
  const isMyAuction = !!myInfo && !!auc?.seller?.id && myInfo.memberId === auc.seller.id;
  const displayPrice = currentPrice ?? auc.currentPrice;

  return (
    <div className="default-container relative">
      <div>
        <div className="pb-5 border-b border-[#353535]">
          <div className="flex gap-1 text-[#a5a5a5] mb-3">
            <Link href={`/search?categoryMajorId=${auc.card?.categoryMajorId ?? ""}`}>{auc.card?.categoryMajorName ?? "카테고리"}</Link>
            {` > `}
            <Link href={`/search?categoryMajorId=${auc.card?.categoryMajorId ?? ""}&categoryMediumId=${auc.card?.categoryMediumId ?? ""}`}>{auc.card?.categoryMediumName ?? "중분류"}</Link>
            {` > `}
            <Link href={`/search?categoryMajorId=${auc.card?.categoryMajorId ?? ""}&categoryMediumId=${auc.card?.categoryMediumId ?? ""}&cardId=${auc.card?.id ?? ""}`}>
              {auc.card?.name ?? "카드"}
            </Link>
          </div>
          <h2>{auc.title}</h2>
        </div>

        <div className="flex py-[60px]">
          {/* 이미지 */}
          <div className="w-[50%] px-[40px] flex justify-center flex-1 border-r border-[#353535] sticky top-[120px] z-10 self-start">
            <AuctionDetailImages props={auc} />
          </div>

          {/* 내용 */}
          <div className="w-[50%] pl-[40px] flex flex-col gap-8 relative">
            <div className="absolute top-0 right-0">
              <HoverCard>
                <HoverCardTrigger>
                  {data && data.tokenId && (
                    <div>
                      <Badge
                        variant="secondary"
                        className="py-1 px-5 bg-gradient-to-b from-green-400 to-green-900
                        border-1 border-green-900
                        rounded-full text-[14px] flex gap-1 items-center font-weight hover:bg-green-600"
                        >
                        NFT 인증
                        <BadgeCheckIcon className="w-5 translate-x-1" />
                      </Badge>
                    </div>
                  )}
                </HoverCardTrigger>
                <HoverCardContent className="">
                  <ScrollArea className="h-80 relative">
                    <div className="flex items-end mb-4">
                      <h3 className="px-2">NFT 거래 내역</h3>
                      <p className="text-sm text-[#a5a5a5]">{history.length}건</p>
                    </div>
                    <div className="flex flex-col gap-4">
                      {history && history.length > 0 ? (
                          history.map((item, index) => (
                              <div
                                className={`relative bg-[#222226] flex flex-col gap-1 rounded-lg p-3 border border-[#a5a5a5]
                                  ${index !== history.length - 1 ? "opacity-30 hover:opacity-100 transition-opacity duration-200" : ""}`}
                              >
                                {/* 연결선 */}
                                {index !== history.length - 1 && (
                                  <div className="absolute top-[100%] right-1/2 -translate-x-1/2 h-4 w-[2px] bg-[#a5a5a5]" />
                                )}

                                <div className="text-sm text-gray-300">#{index + 1}</div>
                                <div className="flex gap-1 text-xs">
                                  <p className="text-[#ddd]">판매자:</p>
                                  <p>{item.seller.nickname}</p>
                                </div>
                                <div className="flex gap-1 text-xs">
                                  <p className="text-[#ddd]">구매자:</p>
                                  <p>{item.buyer.nickname}</p>
                                </div>
                                <div className="flex gap-1 text-xs">
                                  <p className="text-[#ddd]">등급:</p>
                                  <p>{item.grade.gradeCode}</p>
                                </div>
                                <div className="flex gap-1 text-xs">
                                  <p className="text-[#ddd]">가격:</p>
                                  <p>{item.priceInEth} ETH</p>
                                </div>
                                <div className="flex gap-1 text-xs">
                                  <p className="text-[#ddd]">거래일:</p>
                                  <p>{formatKSTFull(item.timestamp)}</p>
                                </div>
                              </div>
                          ))
                        ) : (
                          <div className="text-sm text-[#a5a5a5] text-center py-5">NFT 거래 이력이 없습니다.</div>
                        )}
                    </div>
                  </ScrollArea>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div>
              <div>
                <p className="text-[#ddd]">현재 입찰가</p>
                {/* 통화 표기는 Sepolia ETH */}
                <p className="-mt-1 text-[40px]">{displayPrice} ETH</p>
              </div>

              {/* 경매 속성 */}
              <ul className="mt-6 mb-10 flex flex-col gap-4">
                <li className="flex items-end">
                  <p className="w-[90px] text-[#aaaaaa]">컨디션</p>
                  <RankElement rank={auc.card.grade} />
                </li>
                <li className="flex items-end">
                  <p className="w-[90px] text-[#aaaaaa]">시작(KST)</p>
                  <p>{fmtDateTime(auc.startDatetime)}</p>
                </li>
                <li className="flex items-end">
                  <p className="w-[90px] text-[#aaaaaa]">종료(KST)</p>
                  <p>{fmtDateTime(auc.endDatetime)}</p>
                </li>
                <li className="flex items-end">
                  <p className="w-[90px] text-[#aaaaaa]">남은 시간</p>
                  <RemainingTime start={auc.startDatetime} end={auc.endDatetime || auc.endTime} />
                </li>
              </ul>

              {/* 버튼 */}
              <div className="flex gap-4 place-items-center">
                {auc.buyNowFlag ? (
                  <button className="rounded-md flex-1 py-4 bg-[#7db7cd] text-[#000] hover:bg-[#5a9bb8] transition-colors duration-200 cursor-pointer">즉시구매</button>
                ) : (
                  <button className="rounded-md flex-1 py-4 bg-[#838383] text-[#D5D5D5] cursor-not-allowed" disabled>
                    즉시구매 불가
                  </button>
                )}
                <button
                  onClick={toggleWish}
                  disabled={pendingWish}
                  aria-pressed={wished}
                  className={`rounded-md border-1 border-[#353535] flex-1 py-4 flex gap-2 justify-center items-center transition
                  ${wished ? "bg-[#2a2a2a] border-[#ff5a5a]" : "hover:bg-white/5"}`}
                  title={wished ? "관심경매에서 제거" : "관심경매에 추가"}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={wished ? "#ff5a5a" : "none"}
                    stroke={wished ? "#ff5a5a" : "#ffffff"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <p>
                    {(() => {
                      if (wished) return pendingWish ? "추가 중..." : "관심경매";
                      return pendingWish ? "해제 중..." : "관심경매";
                    })()}
                  </p>
                </button>
              </div>

              {wishError && !wishError.canceled && <p className="mt-2 text-red-400 text-sm">{wishError.safeMessage || "관심상품 처리 중 오류가 발생했어요."}</p>}

              {/* 입찰 */}
              <div className="mt-4">
                <BidInputForm
                  auctionId={auctionId}
                  currentPrice={displayPrice}
                  minIncrement={Number(auc.bidUnit ?? 0.01)}
                  guards={{ isMyAuction, isActive }}       // 그대로 전달 OK
                  onBidApplied={(next) => setCurrentPrice(next)}
                />
              </div>
            </div>

            {/* 입찰 기록 / 주간 차트 분리 */}
            <div className="mt-10">
              <p className="text-[20px]">실시간 입찰 기록</p>
              <p className="text-sm text-[#a5a5a5] mt-2">실시간(LIVE) 과 과거 입찰 내역을 최신순으로 최대 15개까지 표시합니다.</p>
              <div className="mt-6">
                <AuctionHistoryTable auction={auc} realtimeBids={realtimeEvents} maxRows={15} />
              </div>
            </div>
            <div className="mt-14">
              <p className="text-[20px]">최근 7일 경매가 추이</p>
              <p className="text-sm text-[#a5a5a5] mt-2">동일 카드 등급의 일별 최대/평균/최소 낙찰가 추이를 보여줍니다.</p>
              <div className="mt-6">
                <AuctionWeeklyChart auction={auc} />
              </div>
            </div>

            {/* 판매자 정보 */}
            <div className="mt-10">
              <Link href={`/shop/${auc.seller.id}`}>
                <p className="text-[20px]">판매자 정보</p>
                <div className="mt-4 flex gap-4 items-center">
                  <div className="rounded-full overflow-hidden w-20 h-20">
                    <Image className="w-full h-full object-fit" src={`${auc.seller.profileImageUrl || "/no-image.jpg"}`} width={80} height={80} alt="profile-image" unoptimized />
                  </div>
                  <div>
                    <p>{auc.seller.nickname}</p>
                    <div className="flex gap-1 items-center mt-0.5">
                      <div>
                        <Image src="/icon/star.png" alt="review" width={20} height={20} />
                      </div>
                      <p className="text-[#aaa]">
                        {auc.seller.reviewStarAvg} ({auc.seller.reviewCount})
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 상세내용 */}
        <div className="py-15 border-t border-b border-[#353535]">
          <h2 className="text-[20px]">상세내용</h2>
          <p className="mt-7">{auc.detail}</p>
        </div>

        {/* 문의 */}
        <div className="pt-15">
          <h2 className="text-[20px]">경매문의 ({inqTotal})</h2>
          <div className="mt-3">
            <AuctionInquiry props={auc} onTotalChange={handleTotalChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
