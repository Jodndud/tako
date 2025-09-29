"use client";

import { AuctionDetailProps, WeeklyAuctions } from "@/types/auction";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface CustomTooltipProps {
	active?: boolean;
	payload?: any[];
	label?: string;
}

function CustomTooltip({ active, payload, label }: Readonly<CustomTooltipProps>) {
	if (!active || !payload?.length) return null;
	return (
		<div className="bg-gray-900 text-white p-3 rounded shadow-lg min-w-[140px]">
			<p className="font-semibold mb-1">{label}</p>
			{payload.map((entry: any) => (
				<p
					key={entry.dataKey}
					className={`text-md mb-1 ${entry.dataKey === "avgPrice" ? "text-gray-400" : "text-white"}`}
				>
					{entry.name}: {entry.value}
				</p>
			))}
		</div>
	);
}

export interface AuctionWeeklyChartProps {
	auction: AuctionDetailProps;
	width?: number;
	height?: number;
	className?: string;
}

export default function AuctionWeeklyChart({
	auction,
	width = 600,
	height = 200,
	className,
}: Readonly<AuctionWeeklyChartProps>) {
	const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	// Tooltip용: "Mon(9/29)" 포맷
	const formatTooltipLabel = (date: Date) => {
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${weekDays[date.getDay()]}(${month}/${day})`;
	};

	// X축용: "9/29" 포맷
	const formatXAxisLabel = (date: Date) => {
		const month = date.getMonth() + 1;
		const day = date.getDate();
		return `${month}/${day}`;
	};

	// 데이터 가공
	const weeklyData =
		auction.weeklyAuctions
			?.filter((d) => d?.date)
			?.map((d) => {
				const date = new Date(d.date);
				if (isNaN(date.getTime())) return null;
				return {
					...d,
					tooltipLabel: formatTooltipLabel(date),
					xAxisLabel: formatXAxisLabel(date),
				};
			})
			.filter(Boolean) ?? [];

	// 시작일 기준 0원 데이터
	const startDate = auction.startDatetime ? new Date(auction.startDatetime) : null;
	const startData = startDate
		? {
				date: startDate.toISOString(),
				tooltipLabel: formatTooltipLabel(startDate),
				xAxisLabel: formatXAxisLabel(startDate),
				minPrice: 0,
				avgPrice: 0,
				maxPrice: 0,
		  }
		: null;

	const chartData = startData ? [startData, ...weeklyData] : weeklyData;

	return (
		<div className={className}>
			{chartData.length > 0 ? (
				<LineChart width={width} height={height} data={chartData}>
					<CartesianGrid stroke="#222" strokeDasharray="3 3" />
					<XAxis dataKey="xAxisLabel" tick={{ fill: "#aaa" }} axisLine={false} />
					<YAxis tick={{ fill: "#aaa" }} axisLine={false} />
					<Tooltip content={<CustomTooltip />} labelFormatter={(label, payload) => {
						const item = chartData.find(d => d?.xAxisLabel === label);
						return item?.tooltipLabel || label;
					}} />
					<Line type="monotone" dataKey="maxPrice" name="최대경매가" stroke="#ffffff" strokeWidth={2} dot={false} />
					<Line type="monotone" dataKey="avgPrice" name="평균경매가" stroke="#888888" strokeWidth={2} dot={false} />
					<Line type="monotone" dataKey="minPrice" name="최소경매가" stroke="#ffffff" strokeWidth={2} dot={false} />
				</LineChart>
			) : (
				<div className="w-[600px] h-[200px] flex items-center justify-center bg-gray-800 rounded border border-gray-700">
					<p className="text-gray-400 text-sm">지난 7일간의 거래 데이터가 없습니다.</p>
				</div>
			)}
		</div>
	);
}
