"use client";

// Deprecated: AuctionChart 는 입찰 테이블 + 주간 차트를 분리한
// AuctionHistoryTable / AuctionWeeklyChart 로 대체되었습니다.
// 추후 제거 예정. (임시로 하위 호환을 위해 남겨둠)

import AuctionHistoryTable from "./parts/AuctionHistoryTable";
import AuctionWeeklyChart from "./parts/AuctionWeeklyChart";
import { AuctionDetailProps } from "@/types/auction";

interface LegacyProps {
	props: AuctionDetailProps;
	realtimeBids?: ReadonlyArray<{ time: string; nickname: string; amount: number; type: "bid" | "buy_now" }>;
	maxRows?: number;
}

export default function AuctionChart({ props, realtimeBids = [], maxRows = 15 }: Readonly<LegacyProps>) {
	return (
		<div className="space-y-8">
			<AuctionHistoryTable auction={props} realtimeBids={realtimeBids} maxRows={maxRows} />
			<AuctionWeeklyChart auction={props} />
		</div>
	);
}
