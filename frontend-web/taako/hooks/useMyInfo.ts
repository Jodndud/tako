// hooks/useMyInfo.ts
import { useMemo } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { getMyBidAuction, getMySellAutcion, getInfoMe } from "@/lib/mypage";
import type { MyInfo, MyBidAuctions, MySellAuctions } from "@/types/auth";

type Page<T> = {
  content: T[];
  // totalElements?: number; totalPages?: number; number?: number; size?: number;
};

/** 이 훅이 실제로 제공하는 값들을 전부 명시 */
export type UseMyInfoResult = {
  /** /v1/members/me 쿼리의 원본 결과 객체 (원하면 여기서 data/error 등 원형 접근) */
  meQuery: UseQueryResult<MyInfo>;

  /** 편의 접근자들 */
  me: MyInfo | undefined;
  meLoading: boolean;
  meError: unknown;

  /** @deprecated use `me` instead */
  myInfo: MyInfo | undefined;
  /** @deprecated use `meLoading` instead */
  myInfoLoading: boolean;
  /** @deprecated use `meError` instead */
  myInfoError: unknown;

  /** 빈 문자열/공백 → undefined 로 정규화된 저장 지갑 주소 */
  storedWallet?: string;

  /** 내가 입찰한 경매들 */
  ongoingAuctions: MyBidAuctions[];
  endedAuctions: MyBidAuctions[];
  myBidAuctions: MyBidAuctions[]; // ongoing + ended 합본
  countOngoing: number;
  countEnded: number;
  myBidLoading: boolean;
  myBidError: unknown;

  /** 내가 판매한 경매들 */
  ongoingSellAuctions: MySellAuctions[];
  endedSellAuctions: MySellAuctions[];
  mySellLoading: boolean;
  mySellError: unknown;
};

export function useMyInfo(): UseMyInfoResult {
  // 내 정보(지갑 주소 포함): 표준 소스는 getInfoMe
  const meQuery = useQuery<MyInfo>({
    queryKey: ["myInfo"],
    queryFn: getInfoMe,
    staleTime: 5 * 60 * 1000,
  });

  const me = meQuery.data;
  const meLoading = meQuery.isLoading;
  const meError = meQuery.error;

  const storedWallet =
    me?.walletAddress && me.walletAddress.trim() !== "" ? me.walletAddress : undefined;

  // 내가 입찰한 경매 (진행 중)
  const {
    data: ongoingPage,
    isLoading: ongoingLoading,
    error: ongoingError,
  } = useQuery<Page<MyBidAuctions>, Error>({
    queryKey: ["myBidAuctions", { ended: false, page: 0, size: 20 }],
    queryFn: () => getMyBidAuction({ ended: false, page: 0, size: 20 }),
  });

  // 내가 입찰한 경매 (종료)
  const {
    data: endedPage,
    isLoading: endedLoading,
    error: endedError,
  } = useQuery<Page<MyBidAuctions>, Error>({
    queryKey: ["myBidAuctions", { ended: true, page: 0, size: 20 }],
    queryFn: () => getMyBidAuction({ ended: true, page: 0, size: 20 }),
  });

  const ongoingAuctions = ongoingPage?.content ?? [];
  const endedAuctions = endedPage?.content ?? [];

  const myBidAuctions = useMemo(
    () => [...ongoingAuctions, ...endedAuctions],
    [ongoingAuctions, endedAuctions]
  );

  // 내 판매 경매
  const {
    data: mySellAuctionsData,
    isLoading: mySellLoading,
    error: mySellError,
  } = useQuery<{ result: { content: MySellAuctions[] } }>({
    queryKey: ["mySellAuctions"],
    queryFn: getMySellAutcion, // ← 실제 함수명이 이렇다면 그대로 두세요
  });

  const mySellAuctions = mySellAuctionsData?.result?.content ?? [];
  const ongoingSellAuctions = mySellAuctions.filter((a) => !a.isEnd);
  const endedSellAuctions = mySellAuctions.filter((a) => a.isEnd);

  return {
    // me
    meQuery,
    me,
    meLoading,
    meError,

    myInfo: me,
    myInfoLoading: meLoading,
    myInfoError: meError,
    storedWallet,

    // bids
    ongoingAuctions,
    endedAuctions,
    myBidAuctions,
    countOngoing: ongoingAuctions.length,
    countEnded: endedAuctions.length,
    myBidLoading: ongoingLoading || endedLoading,
    myBidError: ongoingError || endedError,

    // sells
    ongoingSellAuctions,
    endedSellAuctions,
    mySellLoading,
    mySellError,
  };
}
