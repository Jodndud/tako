'use client'

import { GetAuction } from "@/types/auction"
import Image from "next/image"
import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import RankElement from "../atoms/RankElement";
import { Heart, CircleCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge"
import { addWishAuction, removeWishAuction } from '@/lib/wish'
import { normalizeAxiosError } from '@/lib/normalizeAxiosError'

type Props = {
  item: GetAuction
  onWishChange?: (id: number, wished: boolean) => void
}

export default function AuctionCard({ item, onWishChange }: Props){
  const KST_OFFSET_MS = 9 * 3600 * 1000;

  const startAtMs = useMemo<number | undefined>(() => {
  if (!item.startDatetime) return undefined;
    const t = Date.parse(item.startDatetime); // UTC epoch
    return Number.isFinite(t) ? t + KST_OFFSET_MS : undefined;
  }, [item.startDatetime]);

  const [remainingTime, setRemainingTime] = useState<number>(
    Math.max(0, Math.floor(item.remainingSeconds ?? 0))
  );

  const [startLeft, setStartLeft] = useState<number | undefined>(() => {
    if (!startAtMs) return undefined;
    return Math.max(0, Math.ceil((startAtMs - Date.now()) / 1000));
  });

  // console.log(`now ${Date.now()}`)
  // console.log(`remain ${remainingTime}`)
  // console.log(`left ${startLeft}`)

  // 아이템 갱신 시 재초기화
  useEffect(() => {
    setRemainingTime(Math.max(0, Math.floor(item.remainingSeconds ?? 0)));
    if (startAtMs) setStartLeft(Math.max(0, Math.ceil((startAtMs - Date.now()) / 1000)));
    else setStartLeft(undefined);
  }, [item.id, item.remainingSeconds, startAtMs]);

  // 1초 타이머
  useEffect(() => {
    const t = setInterval(() => {
      setRemainingTime(prev => (prev > 0 ? prev - 1 : 0));
      if (startAtMs) setStartLeft(Math.max(0, Math.ceil((startAtMs - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [startAtMs]);

  // ---- 관심 토글 ----
  const [wished, setWished] = useState<boolean>(item.wished);
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggleWish = useCallback(async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (pending) return;

    const next = !wished;
    setWished(next);
    setPending(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      if (next) await addWishAuction(item.id, ctrl.signal);
      else await removeWishAuction(item.id, ctrl.signal);
      onWishChange?.(item.id, next);
    } catch (err) {
      const ne = normalizeAxiosError(err);
      if (!ne.canceled) setWished(!next); // 롤백
      console.error('WISH_TOGGLE_FAIL', ne.status, ne.code, ne.url, ne.data);
    } finally {
      setPending(false);
    }
  }, [item.id, wished, pending, onWishChange]);

  // ---- 표시용 ----
  const formatTime = (s: number) => {
    if (s <= 0) return '마감';
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts: string[] = [];
    if (d) parts.push(`${d}일`);
    if (h) parts.push(`${h}시간`);
    if (m) parts.push(`${m}분`);
    if (sec) parts.push(`${sec}초`);
    return parts.slice(0, 2).join(' ');
  };

  const formatStartSoon = (s: number) => {
    if (s <= 0) return '시작';
    if (s < 3600) return `시작 ${Math.ceil(s / 60)}분 전`;
    const h = Math.floor(s / 3600);
    return `시작 ${h}시간 전`;
  };

  // 단계 판정: 시작 전 → 진행 중 → 마감
  const phase: 'before' | 'running' | 'ended' = useMemo(() => {
    if ((startLeft ?? 0) > 0) return 'before';
    if (remainingTime > 0) return 'running';
    return 'ended';
  }, [startLeft, remainingTime]);

  const timeText = useMemo(() => {
    if (phase === 'before') return formatStartSoon(startLeft ?? 0);
    if (phase === 'running') return formatTime(remainingTime);
    return '마감';
  }, [phase, startLeft, remainingTime]);

  return (
    <Link href={`/auction/${item.id}`}>
      <div className="relative border rounded-lg h-80 flex items-end overflow-hidden">
        <div className="absolute top-2 right-2 z-1">
          <RankElement rank={item.grade} />
        </div>

        <div className="absolute top-0 left-0 w-full h-full">
          <Image
            src={item.primaryImageUrl || '/no-image.jpg'}
            alt={item.title}
            width={200}
            height={300}
            className="w-full h-full object-cover rounded"
            unoptimized
          />
        </div>

        {item.tokenId && (
          <Badge
            variant="secondary"
            className="absolute top-2 left-1 pl-2 pr-1 bg-gradient-to-b from-green-400 to-green-900 rounded-full flex items-center gap-1 leading-tight"
          >
            NFT
            <CircleCheck className="w-5 -translate-y-[0px]" />
          </Badge>
        )}

        <div className="w-full p-4 relative flex flex-col gap-2 bg-white/50 backdrop-blur-lg text-black rounded-lg">
          <h3 className="h-13">
            {item.title.length > 18 ? item.title.slice(0, 18) + "..." : item.title}
          </h3>

          <div className="text-[20px] font-semibold">{item.currentPrice} TKC</div>

          <div className="text-sm text-[#242424]">
            <span>입찰 {item.bidCount}회 | </span>
            <span className={phase === "ended" ? "text-red-500 font-semibold" : ""}>
              {timeText}
            </span>
          </div>

          <button
            onClick={toggleWish}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleWish(e); }}
            aria-pressed={wished}
            aria-label={wished ? '관심경매 해제' : '관심경매 추가'}
            disabled={pending}
            className={`absolute bottom-4 right-4 rounded-full cursor-pointer ${pending ? 'opacity-60 cursor-wait' : ''}`}
          >
            <Heart className="w-5 h-5" stroke={wished ? '#ff5a5a' : '#242424'} fill={wished ? '#ff5a5a' : 'none'} />
          </button>
        </div>
      </div>
    </Link>
  );
}
