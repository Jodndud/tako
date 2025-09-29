// 마이페이지 전용 사이드 메뉴
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import WithdrawModal from "@/components/modals/WithdrawModal";

export default function MypageSideMenu() {
	const [openWithdraw, setOpenWithdraw] = useState(false);
	const pathname = usePathname();
	// console.log(pathname)

	return (
		<div className="w-[200px]">
			<ul className="mypage-side-menu flex flex-col gap-8">
				<li>
					<h2>
						<Link href="/mypage">마이페이지</Link>
					</h2>
				</li>
				<li>
					<ul className="flex flex-col gap-2">
						<h3>경매이력</h3>
						<li>
							<Link href="/mypage/buyAuction" className={`text-sm transition-all duration-300 ${pathname === "/mypage/buyAuction" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								입찰 경매 조회
							</Link>
						</li>
						<li>
							<Link href="/mypage/sellAuction" className={`text-sm transition-all duration-300 ${pathname === "/mypage/sellAuction" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								판매 경매 조회
							</Link>
						</li>
						<li>
							<Link href="/mypage/wishAuction" className={`text-sm transition-all duration-300 ${pathname === "/mypage/wishAuction" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								관심 경매
							</Link>
						</li>
						<li>
							<Link href="/mypage/reviews" className={`text-sm transition-all duration-300 ${pathname === "/mypage/reviews" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								리뷰 쓰기
							</Link>
						</li>
					</ul>
				</li>
				<li>
					<ul className="flex flex-col gap-2">
						<h3>카드</h3>
						<li>
							<Link href="/mypage/wishItem" className={`text-sm transition-all duration-300 ${pathname === "/mypage/wishItem" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								관심 카드
							</Link>
						</li>
						<li>
							<Link href="/mypage/nftcard" className={`text-sm transition-all duration-300 ${pathname === "/mypage/nftcard" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								NFT 카드 등록
							</Link>
						</li>
					</ul>
				</li>
				<li>
					<ul className="flex flex-col gap-2">
						<h3>내 정보</h3>
						<li>
							<Link href="/mypage/edit" className={`text-sm transition-all duration-300 ${pathname === "/mypage/edit" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								프로필 관리
							</Link>
						</li>
						<li>
							<Link href="/mypage/address" className={`text-sm transition-all duration-300 ${pathname === "/mypage/payment" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								주소록
							</Link>
						</li>
						<li>
							<Link href="/mypage/notifications" className={`text-sm transition-all duration-300 ${pathname === "/mypage/notifications" ? "text-[#F2B90C]" : "text-[#A5A5A5] hover:text-[#F2B90C]"}`}>
								알림 설정
							</Link>
						</li>
						{/* <li>
							<button onClick={() => setOpenWithdraw(true)} className="text-[#A5A5A5] text-sm text-left w-full cursor-pointer hover:text-[#F2B90C] transition-all duration-300">
								회원탈퇴
							</button>
						</li> */}
					</ul>
				</li>
			</ul>

			<WithdrawModal
				isOpen={openWithdraw}
				onClose={() => setOpenWithdraw(false)}
				onConfirm={() => {
					// 회원 탈퇴 API 연동 지점 (구현 예정)
					setOpenWithdraw(false);
				}}
			/>
		</div>
	);
}
