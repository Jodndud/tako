import { useQuery } from "@tanstack/react-query";
import { getInfo, getMyBidAuction, getMySellAutcion } from "@/lib/mypage";
import { MyInfo, MyBidAuctions, MySellAuctions } from "@/types/auth";

export function useMyInfo() {
  // 내 프로필 조회
  const {
    data: myInfo, isLoading: myInfoLoading, error: myInfoError,
  } = useQuery<{ result: MyInfo }>({
    queryKey: ["myInfo"],
    queryFn: getInfo,
  });

  // 내 판매 경매 조회
  const {
    data: mySellAuctionsData, isLoading: mySellLoading, error: mySellError,
  } = useQuery<{ result: { content: MySellAuctions[] } }>({
    queryKey: ["mySellAuctions"],
    queryFn: getMySellAutcion,
  });
  const mySellAuctions = mySellAuctionsData?.result?.content ?? [];

  const ongoingSellAuctions = mySellAuctions.filter(auction => !auction.isEnd);
  const endedSellAuctions = mySellAuctions.filter(auction => auction.isEnd);

  return {
    myInfo: myInfo?.result ?? null, myInfoLoading, myInfoError,
    mySellAuctionsData, ongoingSellAuctions, endedSellAuctions
  };
}
