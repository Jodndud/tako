"use client";

import { formatKSTCompact } from "@/lib/formatKST";
import { AuctionDetailProps } from "@/types/auction";

export interface AuctionHistoryTableProps {
	auction: AuctionDetailProps;
	realtimeBids?: ReadonlyArray<{ time: string; nickname: string; amount: number; type: "bid" | "buy_now" }>;
	maxRows?: number;
	className?: string;
}

export default function AuctionHistoryTable({ auction, realtimeBids = [], maxRows = 15, className }: Readonly<AuctionHistoryTableProps>) {
	const parsedRealtime = realtimeBids
		.map((r) => ({
			time: r.time,
			nickname: r.nickname,
			amount: r.amount,
			type: r.type,
			isRealtime: true as const,
		}))
		.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

	const legacy = (auction.history || []).map((h) => ({
		time: h.createdAt,
		nickname: h.bidderNickname,
		amount: h.amount,
		type: "bid" as const,
		isRealtime: false as const,
	}));

	const merged = [...parsedRealtime, ...legacy].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, maxRows);

	return (
		<div className={className}>
			<div className="flex py-2 px-2 border-b border-[#353535] text-[#a5a5a5] text-md">
				<div className="flex-[1.6] text-left">시간</div>
				<div className="flex-1 text-right">유형</div>
				<div className="flex-1 text-right">입찰액(ETH)</div>
				<div className="flex-1 text-right">입찰자</div>
			</div>
			<div className="flex flex-col gap-2 py-3 border-b border-[#353535] px-2 text-sm">
				{merged.length === 0 && <div className="text-[#666]">표시할 입찰 내역이 없습니다.</div>}
				{merged.map((row, idx) => {
					const label = formatKSTCompact(row.time);
					return (
						<div key={`${row.time}_${row.nickname}_${idx}`} className={`flex items-center ${row.isRealtime ? "text-[#e2f6ff]" : "text-[#a5a5a5]"}`}>
							<div className="flex-[1.6] text-left tabular-nums">{label}</div>
							<div className="flex-1 text-right">
								<span className={row.type === "buy_now" ? "text-[#ffb347] font-medium" : "text-[#7DB7CD]"}>{row.type === "buy_now" ? "즉시구매" : "입찰"}</span>
								{row.isRealtime && <span className="ml-1 text-[10px] bg-[#1e3a46] text-[#7DB7CD] px-1 py-[1px] rounded">LIVE</span>}
							</div>
							<div className="flex-1 text-right tabular-nums font-medium">
								{row.amount} <span className="text-[#888] text-[11px]">ETH</span>
							</div>
							<div className="flex-1 text-right truncate" title={row.nickname}>
								{row.nickname}
							</div>
						</div>
					);
				})}
			</div>
			<p className="mt-2 text-[#555] text-xs">최신 {maxRows}개 (실시간 포함). 실시간 행은 LIVE 표시.</p>
		</div>
	);
}
