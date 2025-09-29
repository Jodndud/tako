import { useMemo } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getAuctions } from "@/lib/auction";
import { GetAuction, GetHotCards } from "@/types/auction";

type AuctionsResponse = { result: { content: GetAuction[]; totalPages: number } } | any;

type Options = Omit<UseQueryOptions<AuctionsResponse>, "queryKey" | "queryFn"> & {
  keepPreviousData?: boolean;
};

export function useAuctionsQuery(
  params: Partial<GetHotCards>,
  options?: Options
) {
  const merged = useMemo<Partial<GetHotCards>>(
    () => ({ ...params }),
    [params]
  );

  const queryKey = useMemo(() => ["auctions", merged], [merged]);

  return useQuery<AuctionsResponse>({
    queryKey,
    queryFn: () => getAuctions(merged as GetHotCards),
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 30, // 30초 동안 fresh 상태
    gcTime: 1000 * 60 * 5, // 5분 후 캐시 GC
    keepPreviousData: true, // 🔥 이전 데이터 유지해서 깜빡임 방지
    ...options,
  });
}
