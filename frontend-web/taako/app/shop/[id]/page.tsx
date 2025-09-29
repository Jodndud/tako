"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useSellerProfile } from "@/hooks/useSellerProfile";
import { fetchTrustScore, formatTrustScore, trustScoreImagePath, trustScoreColor } from "@/lib/mypage";
import { useRouter } from "next/navigation";
import AuctionCard from "@/components/auction/AuctionCard";
import { GetAuction } from "@/types/auction";
import SellerReviews from "@/components/shop/SellerReviews";

export default function ShopPage({ params }: Readonly<{ params: { id: string } }>) {
	const id = Number(params.id);
	const router = useRouter();
	const tabs = [
		{ id: "mySellAuction", label: "판매경매" },
		{ id: "myReview", label: "리뷰" },
	];

	const [status, setStatus] = useState(tabs[0].id);
	const activeIndex = tabs.findIndex((tab) => tab.id === status);

	const { sellerProfile, loading, error } = useSellerProfile(id);
	const [trustRaw, setTrustRaw] = useState<number | null>(null);
	const [trustLoading, setTrustLoading] = useState(false);
	const [trustError, setTrustError] = useState<string | null>(null);

	// sellAuctions 데이터를 GetAuction 형식으로 변환하는 함수
	const convertToGetAuction = (sellAuction: any): GetAuction => {
		return {
			id: sellAuction.id,
			grade: sellAuction.grade,
			title: sellAuction.title,
			currentPrice: typeof sellAuction.currentPrice === "string" ? parseFloat(sellAuction.currentPrice) : sellAuction.currentPrice,
			bidCount: sellAuction.bidCount,
			remainingSeconds: sellAuction.remainingSeconds,
			primaryImageUrl: sellAuction.primaryImageUrl,
			wished: sellAuction.wished || false,
			tokenId: Boolean(sellAuction.tokenId),
		};
	};

	useEffect(() => {
		if (!loading && sellerProfile === null) {
			alert("잘못된 판매자입니다.");
			router.push("/");
		}
	}, [sellerProfile, loading, router]);

	// 신뢰도 조회 로직 추가
	useEffect(() => {
		if (!id) return;
		let cancelled = false;
		(async () => {
			try {
				setTrustLoading(true);
				const raw = await fetchTrustScore(id);
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
	}, [id]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	if (!sellerProfile) {
		return <div>판매자 정보를 찾을 수 없습니다.</div>;
	}

	// {
	//   "httpStatus": "OK",
	//   "isSuccess": true,
	//   "message": "요청에 성공하였습니다.",
	//   "code": 200,
	//   "result": {
	//     "memberId": 21,
	//     "email": "9526yu@naver.com",
	//     "nickname": "정서기",
	//     "introduction": "",
	//     "profileImageUrl": null,
	//     "backgroundImageUrl": null,
	//     "sellAuctions": [
	//       {
	//         "id": 202,
	//         "grade": "S",
	//         "title": "으흐흐흐 경매",
	//         "currentPrice": "0.00010000",
	//         "bidCount": 0,
	//         "remainingSeconds": 3621,
	//         "primaryImageUrl": "https://bukadong-bucket.s3.ap-northeast-2.amazonaws.com/media/auction/item/3ec63d92-356c-427b-9334-c1a4e7880655.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250927T105845Z&X-Amz-SignedHeaders=host&X-Amz-Credential=AKIA5FCD6IRKIHWOTRVH%2F20250927%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Expires=300&X-Amz-Signature=737f52e55469b0e59af67df7bc41e63860ef4812b723dffb152b4dcd82870286",
	//         "wished": false,
	//         "tokenId": null
	//       },
	//       {
	//         "id": 201,
	//         "grade": "S",
	//         "title": "이히히히히",
	//         "currentPrice": "0.00010000",
	//         "bidCount": 0,
	//         "remainingSeconds": 0,
	//         "primaryImageUrl": "https://bukadong-bucket.s3.ap-northeast-2.amazonaws.com/media/auction/item/be174ce0-2905-48c4-8457-d80281e91eae.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250927T105512Z&X-Amz-SignedHeaders=host&X-Amz-Credential=AKIA5FCD6IRKIHWOTRVH%2F20250927%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Expires=300&X-Amz-Signature=c0ce7906ed00fb265518ecfc3cb77823da69946265e507bfe8e6fef6dd5b28d1",
	//         "wished": false,
	//         "tokenId": null
	//       }
	//     ]
	//   }
	// }
	return (
		<div className="default-container">
			<div className="flex flex-col gap-10">
				{/* 상단 프로필 영역 */}
				<div
					className="flex gap-10 p-8 rounded-xl relative bg-gradient-to-b from-[#073A4B] to-[#3B80FF]"
					style={{
						backgroundImage: `url(${sellerProfile.backgroundImageUrl || "/demo-bg.jpg"})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				>
					<div className="absolute inset-0 rounded-xl bg-black/40 backdrop-brightness-90 pointer-events-none" />
					<div className="flex-2 aspect-square rounded-xl overflow-hidden relative z-1">
						<Image src={sellerProfile.profileImageUrl || "/basic-profile.png"} alt="profile" fill unoptimized style={{ objectFit: "cover" }} />
					</div>
					<div className="flex-7 pt-8 relative z-10">
						<p
							className="mb-1 text-lg font-semibold"
							style={{
								color: "#FFFFFF",
								textShadow: "0 2px 4px rgba(0,0,0,0.55)",
							}}
						>
							{sellerProfile.nickname}
						</p>
						<p
							className="text-sm whitespace-pre-line"
							style={{
								color: "#E5EAF0",
								textShadow: "0 1px 3px rgba(0,0,0,0.55)",
							}}
						>
							{sellerProfile.introduction || "소개글이 없습니다."}
						</p>
					</div>
					{/* 신뢰도 */}
					<div className="absolute right-10 top-32 z-20 flex items-center gap-4">
						<div className="flex items-center gap-4 px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.30)] relative overflow-hidden">
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
							<ul className={`grid grid-cols-2`}>
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

				{status === "mySellAuction" && (
					<div>
						{loading && (
							<div className="absolute top-0 left-0 w-full h-full bg-white/50 flex justify-center items-center z-10">
								<span className="text-gray-500">업데이트 중...</span>
							</div>
						)}
						<div className="pb-5 border-b border-[#353535] mb-8 text-center">
							<h2>총 등록 경매: {sellerProfile.sellAuctions.length}개</h2>
						</div>
						<ul className="grid grid-cols-5 gap-x-7 gap-y-15 relative">
							{sellerProfile.sellAuctions.length === 0 && (
								<li>
									<div className="text-center text-gray-500">등록한한 경매가 없습니다.</div>
								</li>
							)}
							{sellerProfile.sellAuctions.map((item) => (
								<li key={item.id}>
									<AuctionCard item={convertToGetAuction(item)} />
								</li>
							))}
						</ul>
					</div>
				)}
				{status === "myReview" && (
					<div>
						<SellerReviews sellerId={id} />
					</div>
				)}
			</div>
		</div>
	);
}
