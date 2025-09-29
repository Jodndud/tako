"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";
import { useMyInfo } from "@/hooks/useMyInfo";
import { fetchTrustScore, formatTrustScore, trustScoreImagePath, trustScoreColor } from "@/lib/mypage";
import WalletProfile from "@/components/wallet/WalletProfile";
// import ClaimButton from "@/components/nft/ClaimButton"
import HomeBidAuctions from "@/components/mypage/HomeBidAuctions";
import { useLoginRedirect } from "@/hooks/useAuthRedirect";
import SellerReviews from "@/components/mypage/SellerReviews";

export default function Mypage() {
	const { me, meLoading, meError } = useMyInfo();
	const [trustRaw, setTrustRaw] = useState<number | null>(null);
	const [trustLoading, setTrustLoading] = useState(false);
	const [trustError, setTrustError] = useState<string | null>(null);
	const [totalBidAuction, setTotalBidAuction] = useState<number>(0);
	const [totalSellAuction, setTotalSellAuction] = useState<number>(0);
	const tabs = [
		{ id: "myProfile", label: "기본정보" },
		{ id: "myBidAuction", label: "입찰 중 경매" },
		{ id: "mySellAuction", label: "등록 경매" },
		{ id: "myReview", label: "리뷰" },
	];
	const [status, setStatus] = useState(tabs[0].id);
	const activeIndex = tabs.findIndex((tab) => tab.id === status);

	useLoginRedirect(true, false);

	useEffect(() => {
		if (!me?.memberId) return;
		let cancelled = false;
		(async () => {
			try {
				setTrustLoading(true);
				const raw = await fetchTrustScore(me.memberId);
				if (!cancelled) setTrustRaw(raw);
			} catch (e: any) {
				if (!cancelled) setTrustError(e.message || "신뢰도 로드 실패");
			} finally {
				if (!cancelled) setTrustLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [me?.memberId]);

	return (
		<div className="flex flex-col gap-10">
			{/* 기본정보 */}
			{/* 상단 프로필 영역: backgroundImageUrl 있으면 해당 이미지로 대체 */}
			<div
				className="flex gap-10 p-8 rounded-xl relative bg-gradient-to-b from-[#073A4B] to-[#3B80FF]"
				style={
					me?.backgroundImageUrl
						? {
								backgroundImage: `url(${me.backgroundImageUrl})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
						  }
						: undefined
				}
			>
				{/* 색상만: 배경 이미지 있을 때 살짝 어둡게 (레이아웃 영향 X) */}
				{me?.backgroundImageUrl && <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-brightness-90 pointer-events-none" />}
				<div className="flex-2 aspect-square rounded-xl overflow-hidden relative z-1">
					{(() => {
						if (meLoading) {
							return <div className="w-full h-full flex items-center justify-center text-xs text-[#ccc] bg-[#222]">Loading...</div>;
						}
						if (meError) {
							return <div className="w-full h-full flex items-center justify-center text-xs text-red-400 bg-[#222]">Error</div>;
						}
						return <Image src={me?.profileImageUrl || "/basic-profile.png"} alt="profile" unoptimized fill style={{ objectFit: "cover" }} />;
					})()}
				</div>
				<div className="flex-7 pt-8 relative z-10">
					<p
						className="mb-1 text-lg font-semibold"
						style={{
							color: "#FFFFFF",
							textShadow: me?.backgroundImageUrl ? "0 2px 4px rgba(0,0,0,0.55)" : "none",
						}}
					>
						{meLoading ? "..." : me?.nickname || "닉네임 없음"}
					</p>
					<p
						className="text-sm whitespace-pre-line"
						style={{
							color: me?.backgroundImageUrl ? "#E5EAF0" : "#D2D2D2",
							textShadow: me?.backgroundImageUrl ? "0 1px 3px rgba(0,0,0,0.55)" : "none",
						}}
					>
						{(() => {
							if (meLoading) return "불러오는 중...";
							const intro = me?.introduction?.trim();
							return intro || "소개글이 없습니다.";
						})()}
					</p>
				</div>
				{/* Edit Profile: 링크를 Button 밖으로 감싸 구조 교정 및 클릭 문제 해결 */}
				<Link href="/mypage/edit" className="absolute top-10 right-10 z-20 cursor-pointer" aria-label="Edit Profile" style={{ pointerEvents: "auto" }}>
					<Button variant="outline" className="cursor-pointer">
						Edit Profile
					</Button>
				</Link>
				{/* 신뢰도 표시: Edit Profile 버튼 바로 아래 */}
				<div className="absolute right-10 top-32 z-20 flex items-center gap-4">
					{/* 밝기 개선: 더 밝은 글라스 + 얇은 경계 + 내부 그라데이션 */}
					<div className="flex items-center gap-4 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.30)] relative overflow-hidden">
						{/* subtle gradient overlay (더 투명하게 조정) */}
						<div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-white/5 to-transparent" />
						<div className="relative flex flex-col items-center leading-tight min-w-[70px]">
							<span className="text-[14px] tracking-wide text-white/70 font-medium mb-0.5 select-none">신뢰온도</span>
							<span
								className="text-xl font-semibold tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] tabular-nums transition-colors duration-300"
								style={{ color: trustScoreColor(trustRaw ?? undefined) }}
							>
								{(() => {
									if (trustLoading) return "…";
									if (trustError) return "ERR";
									return `${formatTrustScore(trustRaw)}ºC`;
								})()}
							</span>
						</div>
						{!trustLoading && !trustError && (
							// eslint-disable-next-line @next/next/no-img-element
							<img alt="trust-level" src={trustScoreImagePath(trustRaw)} className="relative h-16 w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)] contrast-125" />
						)}
					</div>
				</div>
				<div className="pl-8 flex gap-10 w-full bg-[#3D3D4D] absolute bottom-0 left-0 rounded-bl-xl rounded-br-xl overflow-hidden">
					<div className="flex-2"></div>
					<div className="flex-7 relative">
						<ul className={`grid grid-cols-4`}>
							{tabs.map((tab) => {
								const active = status === tab.id;
								return (
									<li key={tab.id} className="text-center py-1">
										<button
											type="button"
											onClick={() => setStatus(tab.id)}
											className={`w-full py-3 rounded focus:outline-none focus-visible:ring-2 ring-[#7DB7CD] transition-colors hover:text-white ${
												active ? "text-white font-medium" : "text-[#a5a5a5]"
											}`}
											aria-current={active ? "page" : undefined}
										>
											{tab.label}
										</button>
									</li>
								);
							})}
						</ul>
						{activeIndex !== -1 && (
							<div
								className="absolute -bottom-1.5 transition-all duration-300"
								style={{
									left: `calc(${activeIndex * (100 / tabs.length) + 50 / tabs.length}% - 15px)`,
								}}
							>
								<Image src="/icon/current-arrow.svg" alt="current" width={30} height={14} />
							</div>
						)}
					</div>
				</div>
			</div>

			{status === "myProfile" && (
				<div>
					<WalletProfile />
				</div>
			)}
			{status === "myBidAuction" && (
				<><h2>총 입찰 경매: {totalBidAuction}개</h2><div>
					<HomeBidAuctions type="bid" setTotalBidAuction={setTotalBidAuction} setTotalSellAuction={setTotalSellAuction} />
				</div></>
			)}
			{status === "mySellAuction" && (
				<><h2>총 등록 경매: {totalSellAuction}개</h2><div>
					<HomeBidAuctions type="sell" setTotalBidAuction={setTotalBidAuction} setTotalSellAuction={setTotalSellAuction} />
				</div></>
			)}
			{status === "myReview" && (
				<div>
					<SellerReviews />
				</div>
			)}
		</div>
	);
}
