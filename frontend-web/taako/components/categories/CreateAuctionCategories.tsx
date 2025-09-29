"use client";

import * as React from "react";
import { CreateAuctionCategoriesProps } from "@/types/category";
import { useAuctionCategory } from "@/hooks/useAuctionCategory";
import { Button } from "../ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react"

export default function CreateAuctionCategories({ onChange, onReset }: CreateAuctionCategoriesProps) {
  const {
    majorCategories, majorLoading, minorCategories, minorLoading, cards, loadingCards,
    selectedMajor, selectedMinor, selectedCard,
    handleMajorClick, handleMinorClick, handleCardClick, resetSelection,
  } = useAuctionCategory();

  return (
    <div className="flex flex-col">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        {selectedMajor &&
          <Button
            className="w-6 h-6 rounded-sm text-sm text-[#eee] bg-gray-600 cursor-pointer hover:text-[#333]"
            type="button"
            onClick={() => {
              resetSelection();
              onReset?.();
            }}><RotateCcw /></Button>
        }
        <div className="text-[#a5a5a5]">
          전체 {"> "}
          {selectedMajor && <span>{majorCategories.find(m => m.id === selectedMajor)?.name} </span>}
          {selectedMinor && <span>{">"} {minorCategories.find(m => m.id === selectedMinor)?.name} </span>}
          {selectedCard && <span>{">"} {cards.find(c => c.id === selectedCard)?.name}</span>}
        </div>
      </div>

      {/* 대분류 */}
      {!selectedMajor && (
        <div className="flex flex-col items-start">
          <div className="py-2 px-5 text-sm rounded-full bg-[#353535]">카테고리</div>
          <ScrollArea className="h-[200px] w-full mt-2 overflow-auto border-1 border-[#353535] rounded-lg">
            <ul className="w-full">
              {majorLoading ? (
                <li className="p-4 text-gray-500">카테고리를 불러오는 중입니다...</li>
              ) : (
                majorCategories.map((major) => (
                  <li
                    key={major.id}
                    onClick={() => handleMajorClick(major, onChange)}
                    className="py-4 px-7 cursor-pointer hover:text-[#f2b90c] hover:bg-[#191924]"
                  >
                    {major.name}
                  </li>
                ))
              )}
            </ul>
          </ScrollArea>
        </div>
      )}

      {/* 소분류 */}
      {selectedMajor && !selectedMinor && (
        <div className="flex items-start flex-col">
          <div className="py-2 px-5 text-sm rounded-full bg-[#353535]">카드팩</div>
          <ScrollArea className="h-[200px] w-full mt-2 overflow-auto border-1 border-[#353535] rounded-lg">
            <ul className="w-full">
              {minorLoading ? (
                <li className="p-4 text-gray-500">카드팩 불러오는 중입니다...</li>
              ) : minorCategories.length > 0 ? (
                minorCategories.map((minor) => (
                  <li
                    key={minor.id}
                    onClick={() => handleMinorClick(minor, onChange)}
                    className="py-4 px-7 cursor-pointer hover:text-[#f2b90c] hover:bg-[#191924]"
                  >
                    {minor.name}
                  </li>
                ))
              ) : (
                <li className="p-4 text-gray-500">추가된 카드팩이 없습니다</li>
              )}
            </ul>
          </ScrollArea>
        </div>
      )}

      {/* 카드 */}
      {selectedMinor && !selectedCard && (
        <div className="flex flex-col items-start">
          <div className="py-2 px-5 text-sm rounded-full bg-[#353535]">카드</div>
          <ScrollArea className="h-[200px] w-full mt-2 overflow-auto border-1 border-[#353535] rounded-lg">
            <ul className="w-full">
              {loadingCards ? (
                <li className="p-4 text-gray-500">카드를 불러오는 중입니다...</li>
              ) : cards.length > 0 ? (
                cards.map((card) => (
                  <li
                    key={card.id}
                    onClick={() => handleCardClick(card, onChange)}
                    className="py-4 px-7 cursor-pointer hover:text-[#f2b90c] hover:bg-[#191924]"
                  >
                    {card.name}
                  </li>
                ))
              ) : (
                <li className="p-4 text-gray-500">카드가 없습니다</li>
              )}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
