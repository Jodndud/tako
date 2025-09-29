"use client";
import { useEffect, useRef } from "react";

export interface LiveEventBid {
	type: "bid" | "buy_now";
	auctionId: number;
	nickname: string;
	amount: string; // 수신 payload 그대로 (문자)
	time: string; // ISO 문자열
}

interface Props {
	readonly events: ReadonlyArray<LiveEventBid>;
	readonly max?: number;
}

// 단순 리스트 표현 컴포넌트 (스타일은 최소화, 필요시 확장)
export default function AuctionLiveEvents({ events, max = 20 }: Props) {
	const bottomRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// 새 이벤트가 추가되면 자동 스크롤
		bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
	}, [events.length]);

	return (
		<div className="mt-6">
			<h3 className="text-lg font-semibold mb-2">실시간 이벤트</h3>
			<div className="border border-[#353535] rounded-md h-48 overflow-auto text-sm bg-[#191924] p-3">
				{events.length === 0 && <p className="text-[#666]">아직 이벤트가 없습니다.</p>}
				<ul className="space-y-1">
					{events.slice(-max).map((ev, idx) => (
						<li key={`${ev.time}_${idx}`} className="flex gap-2">
							<span className={ev.type === "buy_now" ? "text-[#ffb347]" : "text-[#7DB7CD]"}>{ev.type === "buy_now" ? "[즉시구매]" : "[입찰]"}</span>
							<span className="text-[#ddd]">{ev.nickname}</span>
							<span className="text-[#aaa]">{ev.amount} ETH</span>
							<span className="text-[#555] ml-auto">{new Date(ev.time).toLocaleTimeString()}</span>
						</li>
					))}
					<div ref={bottomRef} />
				</ul>
			</div>
		</div>
	);
}
