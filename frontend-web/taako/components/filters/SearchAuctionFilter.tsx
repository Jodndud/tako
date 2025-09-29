"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useMajorCategories } from "@/hooks/useMajorCategories";
import { useMinorCategories } from "@/hooks/useMinorCategories";

export default function SearchAuctionFilter() {
  const { majorCategories } = useMajorCategories();
  const {
    handleGetMinorCategories,
    minorCategories,
    setMinorCategoryId,
  } = useMinorCategories();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const selectedMajorId = Number(searchParams.get("categoryMajorId")) || null;
  const selectedMinorId = Number(searchParams.get("categoryMediumId")) || null;
  const currentSort = searchParams.get("sort") || "";

  // 기본값 true (쿼리에 없으면 true)
  const isEnded = searchParams.get("isEnded")
    ? searchParams.get("isEnded") === "true"
    : true;

  // SelectValue 상태 관리
  const [majorValue, setMajorValue] = useState<string>("");
  const [minorValue, setMinorValue] = useState<string>("");

  // 대분류 SelectValue 업데이트
  useEffect(() => {
    if (majorCategories.length && selectedMajorId) {
      const major = majorCategories.find(mc => mc.id === selectedMajorId);
      setMajorValue(major ? major.name : "");
    } else {
      setMajorValue("");
    }
  }, [majorCategories, selectedMajorId]);

  // 중분류 SelectValue 업데이트
  useEffect(() => {
    if (minorCategories.length && selectedMinorId) {
      const minor = minorCategories.find(mc => mc.id === selectedMinorId);
      setMinorValue(minor ? minor.name : "");
    } else {
      setMinorValue("");
    }
  }, [minorCategories, selectedMinorId]);

  // URL 업데이트 함수
  const updateQuery = (
    majorId?: number | null,
    minorId?: number | null,
    sort?: string | null,
    ended?: boolean | null
  ) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (majorId !== undefined) {
      majorId === null
        ? newParams.delete("categoryMajorId")
        : newParams.set("categoryMajorId", majorId.toString());
    }
    if (minorId !== undefined) {
      minorId === null
        ? newParams.delete("categoryMediumId")
        : newParams.set("categoryMediumId", minorId.toString());
    }
    if (sort !== undefined) {
      sort === null
        ? newParams.delete("sort")
        : newParams.set("sort", sort);
    }
    if (ended !== undefined) {
      ended === null
        ? newParams.delete("isEnded")
        : newParams.set("isEnded", String(ended));
    }

    newParams.set("page", "0");

    router.push(`${pathname}?${newParams.toString()}`);
    // 🔹 getAuctions 호출 제거
  };

  // 대분류 선택
  const handleMajorClick = (majorId: number) => {
    setMinorCategoryId(null);
    handleGetMinorCategories(majorId);
    updateQuery(majorId, null, currentSort, isEnded);
  };

  // 중분류 선택
  const handleMinorClick = (minorId: number) => {
    setMinorCategoryId(minorId);
    updateQuery(selectedMajorId, minorId, currentSort, isEnded);
  };

  // 페이지 로딩 시 대분류가 있으면 중분류 불러오기
  useEffect(() => {
    if (selectedMajorId) handleGetMinorCategories(selectedMajorId);
  }, [selectedMajorId]);

  return (
    <div className="flex gap-4">
      {/* 대분류 */}
      <Select
        value={majorValue}
        onValueChange={(value) => {
          const major = majorCategories.find(mc => mc.name === value);
          if (major) handleMajorClick(major.id);
        }}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="대분류" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {majorCategories.map(item => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 중분류 */}
      <Select
        value={minorValue}
        onValueChange={(value) => {
          const minor = minorCategories.find(mc => mc.name === value);
          if (minor) handleMinorClick(minor.id);
        }}
        disabled={!selectedMajorId}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="중분류" />
        </SelectTrigger>
        <SelectContent className="max-h-100 overflow-y-auto">
          <SelectGroup>
            {minorCategories.map(item => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* 체크박스 정렬 */}
      <div className="flex items-center space-x-1.5">
        <Checkbox
          id="endtime"
          className="border-[#353535] rounded-[4px]"
          checked={currentSort === "ENDTIME_ASC"}
          onCheckedChange={(checked) => {
            updateQuery(
              selectedMajorId,
              selectedMinorId,
              checked ? "ENDTIME_ASC" : null,
              isEnded
            );
          }}
        />
        <Label htmlFor="endtime" className="text-md text-[#a5a5a5]">
          마감임박순
        </Label>
      </div>

      <div className="flex items-center space-x-1.5">
        <Checkbox
          id="bidcount"
          className="border-[#353535] rounded-[4px]"
          checked={currentSort === "BIDCOUNT_DESC"}
          onCheckedChange={(checked) => {
            updateQuery(
              selectedMajorId,
              selectedMinorId,
              checked ? "BIDCOUNT_DESC" : null,
              isEnded
            );
          }}
        />
        <Label htmlFor="bidcount" className="text-md text-[#a5a5a5]">
          입찰많은순
        </Label>
      </div>

      <p className="bg-[#a5a5a5] mt-2 w-[1px] h-5"></p>

      {/* 마감 경매 제외 */}
      <div className="flex items-center space-x-1.5">
        <Checkbox
          id="endauction"
          className="border-[#353535] rounded-[4px]"
          checked={!isEnded}
          onCheckedChange={(checked) => {
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.set("isEnded", String(!checked));
            newParams.set("page", "0");
            router.push(`${pathname}?${newParams.toString()}`);
          }}
        />
        <Label htmlFor="endauction" className="text-md text-[#a5a5a5]">
          마감경매제외
        </Label>
      </div>
    </div>
  );
}
