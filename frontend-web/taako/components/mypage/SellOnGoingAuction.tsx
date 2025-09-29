'use client';

import Image from "next/image";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  LabelList, ReferenceLine, ReferenceArea
} from "recharts";
import { MySellAuctions, Bids } from "@/types/auth";
import React from "react";
import { useMyInfo } from "@/hooks/useMySellInfo";

/** ---------- 날짜/시간 유틸 ---------- */
// ISO면 그대로, 아니면 'YYYY/MM/DD HH:mm:ss' 혹은 'YYYY-MM-DD HH:mm:ss'를 KST로 파싱
function parseUTCDate(input: string): Date {
  if (!input) return new Date(NaN);
  const s = input.replace(/\//g, "-").trim();

  // 이미 타임존이 명시된 경우 (예: 2025-09-30T18:00:00Z, 2025-09-30T18:00+00:00)
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);

  // 'YYYY-MM-DD[ T]HH:mm[:ss]' 패턴을 UTC로 해석
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const [_, y, mo, d, h, mi, sec] = m;
    const ms = Date.UTC(
      Number(y), Number(mo) - 1, Number(d),
      Number(h), Number(mi), Number(sec ?? "00")
    );
    return new Date(ms);
  }

  // ISO처럼 보이는데 tz가 없으면 Z(UTC)로 처리
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return new Date(s + "Z");

  // 그 외 포맷은 브라우저 파서에 위임 (권장하진 않지만 폴백)
  return new Date(s);
}

function getRemaining(end: Date, nowMs: number) {
  const diff = end.getTime() - nowMs;
  const left = Math.max(diff, 0);
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor((left % 86_400_000) / 3_600_000);
  const minutes = Math.floor((left % 3_600_000) / 60_000);
  return { days, hours, minutes };
}

/** ---------- 예측/차트 유틸 ---------- */
function predictNextBid(auction: MySellAuctions): number {
  const bids = [...(auction.bids ?? [])]
    .filter(b => b.data && b.price != null)
    .sort((a, b) => parseUTCDate(a.data!).getTime() - parseUTCDate(b.data!).getTime());

  if (bids.length < 2) return auction.currentPrice ?? 0;

  // 평균 상승폭
  let totalDiff = 0;
  for (let i = 1; i < bids.length; i++) {
    totalDiff += (bids[i].price! - bids[i - 1].price!);
  }
  const avgPriceInc = totalDiff / (bids.length - 1);

  const endTime = parseUTCDate(auction.endDatetime!);
  const lastBidTime = parseUTCDate(bids[bids.length - 1].data!);
  const remainingDays = Math.max(0, (endTime.getTime() - lastBidTime.getTime()) / 86_400_000);

  // 평균 간격(일)
  let avgDays = 0;
  for (let i = 1; i < bids.length; i++) {
    avgDays += (parseUTCDate(bids[i].data!).getTime() - parseUTCDate(bids[i - 1].data!).getTime()) / 86_400_000;
  }
  avgDays = (avgDays / (bids.length - 1)) || 1; // 0 분모 방지

  const remainingBids = Math.ceil(remainingDays / avgDays);
  return Math.round((bids[bids.length - 1].price ?? 0) + avgPriceInc * Math.max(0, remainingBids));
}

const formatDateForXAxis = (ts: number) => {
  const d = new Date(ts); // 로컬(KST) 기준 표시
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const bids: Bids[] = payload[0].payload.bids as Bids[];
    const price: number = payload[0].value as number;
    return (
      <div className="bg-[#191924] border border-[#353535] text-white p-3 rounded shadow-lg min-w-[140px]">
        {bids && bids.length > 0 ? (
          bids.map((bid, idx) => (
            <div key={`${bid.data ?? ''}-${bid.nickname ?? ''}-${idx}`} className="flex flex-col gap-1">
              <p>nickname: “{bid.nickname ?? 'unknown'}”</p>
              <p className="text-green-500">price: {bid.price ?? 0} TKC</p>
            </div>
          ))
        ) : (
          <p className="text-[#f2b90c]">예상 낙찰가: {price} TKC</p>
        )}
      </div>
    );
  }
  return null;
};

function getChartData(auction: MySellAuctions) {
  if (!auction.bids || auction.bids.length === 0) return [];

  const dailyMaxMap = new Map<number, { bids: Bids[]; price: number }>();

  auction.bids.forEach((bid) => {
    if (!bid.data || bid.price == null) return;
    const ts = parseUTCDate(bid.data).getTime();

    // ✔ 로컬(KST) 기준 일자 버킷
    const dayKey = new Date(new Date(ts).setHours(0, 0, 0, 0)).getTime();
    // 👉 만약 UTC 기준으로 묶고 싶다면 아래 한 줄로 교체:
    // const dayKey = Date.UTC(new Date(ts).getUTCFullYear(), new Date(ts).getUTCMonth(), new Date(ts).getUTCDate());

    const existing = dailyMaxMap.get(dayKey);
    if (!existing) {
      dailyMaxMap.set(dayKey, { bids: [bid], price: bid.price! });
    } else if ((bid.price ?? 0) > existing.price) {
      dailyMaxMap.set(dayKey, { bids: [bid], price: bid.price! });
    } else {
      existing.bids.push(bid);
    }
  });

  const chartData = Array.from(dailyMaxMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dayKey, { bids, price }]) => ({ date: dayKey, bids, price }));

  const predictedPrice = predictNextBid(auction);
  const endDate = parseUTCDate(auction.endDatetime!);

  // 종료일의 자정(로컬 기준) 위치에 예측값 한 점 추가
  chartData.push({
    date: new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime(),
    // 👉 UTC 기준으로 찍고 싶다면:
    // date: Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()),
    bids: [],
    price: predictedPrice,
  });

  return chartData;
}

const CustomLabel = (props: any) => {
  const { x, y, value, index, data } = props;
  if (index === data.length - 1) {
    return (
      <text x={x} y={y - 12} fill="#f2b90c" fontSize={14} textAnchor="middle">
        예상: {value}TKC
      </text>
    );
  }
  return null;
};

/** ---------- 카드 (아이템 단위) ---------- */
function SellCard({ item, nowMs, mounted }: { item: MySellAuctions; nowMs: number; mounted: boolean }) {
  const end = React.useMemo(() => parseUTCDate(item.endDatetime!), [item.endDatetime]);
  const remaining = React.useMemo(() => getRemaining(end, nowMs), [end, nowMs]);
  const chartData = React.useMemo(() => getChartData(item), [item.bids, item.endDatetime]);

  // ✔ '오늘' 영역(로컬/KST 자정 기준)
  const today = new Date(nowMs);
  const todayTs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

  // ✔ 종료일 자정(로컬/KST 기준)
  const endDateTs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

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
              <p className="text-xl mb-1">입찰가: {item.currentPrice} TKC</p>
              {mounted && (
                <p className="text-sm">
                  남은 시간: {remaining.days}일 {remaining.hours}시간 {remaining.minutes}분
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <LineChart width={540} height={164} data={chartData} margin={{ top: 20, right: 40 }}>
        <CartesianGrid stroke="#222" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          type="number"
          domain={['dataMin', 'dataMax']}
          tickFormatter={formatDateForXAxis}
          tick={{ fill: "#a5a5a5", fontSize: 14, dy: 8 }}
          axisLine={false}
        />
        <YAxis tick={{ fill: "#aaa", fontSize: 12, dx: -4 }} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {endDateTs >= todayTs && (
          <ReferenceArea x1={todayTs} x2={endDateTs} fill="#353535" fillOpacity={0.3} />
        )}
        <ReferenceLine
          x={todayTs}
          stroke="#00ff00"
          strokeWidth={2}
          label={{ position: "top", value: "오늘", fill: "#00ff00", dy: -2, fontSize: 12 }}
        />
        <Line type="monotone" dataKey="price" name="입찰가" stroke="#ffffff" strokeWidth={2} dot>
          <LabelList content={(props) => <CustomLabel {...props} data={chartData} />} />
        </Line>
      </LineChart>
    </div>
  );
}

/** ---------- 메인 ---------- */
export default function SellOnGoingAuction() {
  const { ongoingSellAuctions = [] } = useMyInfo();

  // 1개의 타이머로 전체 nowMs 갱신 (1분)
  const [nowMs, setNowMs] = React.useState<number>(Date.now());
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (ongoingSellAuctions.length === 0) {
    return <p className="text-center text-sm text-[#a5a5a5] py-20">판매 중인 경매가 없습니다.</p>;
  }

  return (
    <div>
      {ongoingSellAuctions.map((item) => (
        <SellCard key={String(item.auctionId)} item={item} nowMs={nowMs} mounted={mounted} />
      ))}
    </div>
  );
}