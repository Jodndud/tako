"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchAuctionFilter from "@/components/filters/SearchAuctionFilter";
import AuctionCard from "@/components/auction/AuctionCard";
import PaginationComponent from "@/components/atoms/PaginationComponent";
import { useAuctionsQuery } from "@/hooks/useAuctionsQuery";
import { GetAuction } from "@/types/auction";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(0);

  // URL 쿼리에서 값 읽기
  const params = useMemo(() => {
    return {
      title: searchParams.get("title") || "",
      categoryMajorId: Number(searchParams.get("categoryMajorId")) || undefined,
      categoryMediumId: Number(searchParams.get("categoryMediumId")) || undefined,
      currentPriceMin: Number(searchParams.get("currentPriceMin")) || undefined,
      currentPriceMax: Number(searchParams.get("currentPriceMax")) || undefined,
      sort: searchParams.get("sort") || "",
      isEnded: searchParams.get("isEnded")
        ? searchParams.get("isEnded") === "true"
        : true,
    };
  }, [searchParams]);

  // 쿼리가 바뀔 때 페이지 초기화
  useEffect(() => {
    setCurrentPage(0);
  }, [params.categoryMajorId, params.categoryMediumId, params.title, params.currentPriceMin, params.currentPriceMax, params.isEnded]);

  const { data, isLoading, isFetching, isError } = useAuctionsQuery({ ...params, page: currentPage });

  const auctions: GetAuction[] = (data?.result?.content ?? []) as GetAuction[];
  const totalPages: number = (data?.result?.totalPages ?? 1) as number;
  const totalElement = data?.result?.totalElements;

  // console.log(auctions)
  return (
    <div>
      <div className="default-container">
        <div className="flex items-center gap-2 mb-4">
          <h2>{params.title ? `${params.title}` : ""} 검색결과</h2>
          <span className="text-sm text-[#a5a5a5]">총 {totalElement}개</span>
        </div>

        <SearchAuctionFilter />

        <div className="mt-15 relative">
          {/* 첫 로딩 시 전체 화면 로딩 */}
          {isLoading && (
            <p className="flex justify-center items-center text-[#a5a5a5] h-40">
              <img src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExejdwd2k3eGE3eXZoaWh3OHFyeTlmY2d6NDVwaDFpY2c5OW95NjNtdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/KWXqZV8niKZRtGooKz/giphy.gif" alt="" />
            </p>
          )}

          {/* 에러 처리 */}
          {isError && <p className="text-red-500">검색 중 오류가 발생했습니다.</p>}

          {/* 검색 결과가 없을 때 */}
          {!isLoading && auctions.length === 0 && (
            <p className="flex justify-center items-center text-[#a5a5a5] h-40">
              검색 결과가 없습니다.
            </p>
          )}

          {/* 검색 결과가 있을 때 */}
          {!isLoading && auctions.length > 0 && (
            <>
              {isFetching && (
                <div className="absolute top-0 left-0 w-full h-full bg-white/50 flex justify-center items-center z-10">
                  <span className="text-gray-500">업데이트 중...</span>
                </div>
              )}
              <ul className="grid grid-cols-5 gap-8 relative">
                {auctions.map((item) => (
                  <li key={item.id}>
                    <AuctionCard item={item} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="mt-8">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page: number) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
}
