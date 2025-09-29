"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { AuctionNewCalendarProps } from "@/types/createAuction";

export default function AuctionNewCalendar({
  onChange,
}: AuctionNewCalendarProps) {
  // 시작일시
  const [startDate, setStartDate] = React.useState<Date>();
  const [startTime, setStartTime] = React.useState("10:00:00");

  // 종료일시
  const [endDate, setEndDate] = React.useState<Date>();
  const [endTime, setEndTime] = React.useState("10:00:00");
  const [startPopoverOpen, setStartPopoverOpen] = React.useState(false);
  const [endPopoverOpen, setEndPopoverOpen] = React.useState(false);

  // '오늘'의 시작 (00:00:00)을 계산
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 한 번에 전달
  React.useEffect(() => {
    onChange?.({ startDate, startTime, endDate, endTime });
  }, [startDate, startTime, endDate, endTime]);

  return (
    <div className="flex flex-col gap-4">
      {/* 시작 */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-[#a5a5a5]">경매 시작</Label>
        <div className="flex gap-2">
          {/* 시작 날짜 */}
          <Popover open={startPopoverOpen} onOpenChange={setStartPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[150px] h-[50px] justify-between"
              >
                {startDate ? startDate.toLocaleDateString() : "시작 날짜"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[300px] overflow-hidden p-0 z-91"
              align="start"
            >
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  setStartDate(date);
                  setStartPopoverOpen(false); // 선택 후 닫기
                }}
                disabled={(date) => date < today}
              />
            </PopoverContent>
          </Popover>

          {/* 시작 시간 */}
          <Input
            type="time"
            step="1"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="h-[50px] bg-[#191924] w-[140px] appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>

      {/* 종료 */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-[#a5a5a5]">경매 종료</Label>
        <div className="flex gap-2">
          {/* 종료 날짜 */}
          <Popover open={endPopoverOpen} onOpenChange={setEndPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[150px] h-[50px] justify-between"
                disabled={!startDate}
              >
                {endDate ? endDate.toLocaleDateString() : "종료 날짜"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[300px] overflow-hidden p-0 z-91"
              align="start"
            >
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  setEndDate(date);
                  setEndPopoverOpen(false); // 선택 후 닫기
                }}
                disabled={(date) => date < (startDate ?? today)} // 시작일 이후만 선택
              />
            </PopoverContent>
          </Popover>

          {/* 종료 시간 */}
          <Input
            type="time"
            step="1"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="h-[50px] bg-[#191924] w-[140px] appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
