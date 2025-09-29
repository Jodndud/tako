"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOverlaySpinStore } from "@/stores/useOverlaySpin";

import MainBanner from "@/components/sections/MainBanner";
import MainHotCardSection from "@/components/sections/MainHotCardSection";
import MainItemEndCloseSection from "@/components/sections/MainItemEndCloseSection";
import MainItemListSection from "@/components/sections/MainItemListSection";

export default function Home() {
	const router = useRouter();
	const triggerOverlay = useOverlaySpinStore((s) => s.trigger);
	useEffect(() => {
		// Easter egg: type 'dmgmgm' to navigate to /notice
		let buf = "";
		const target = "dmgmgm";
		const onKey = (e: KeyboardEvent) => {
			if (!e.key) return;
			const ch = e.key.length === 1 ? e.key : "";
			if (!ch) return;
			buf = (buf + ch).slice(-target.length);
			if (buf === target) triggerOverlay("/notice");
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [router]);

	return (
		<div>
			<MainBanner />

			{/* 인기 카테고리 */}
			<MainHotCardSection />

			{/* 마감 임박 경매 */}
			<MainItemEndCloseSection />

			{/* 전체 카테고리 */}

			{/* 포켓몬, 유희왕 경매 */}
			<div className="default-container pt-30">
				<Link href={`/search?categoryMajorId=1`}>
					<h2 className="mb-6 flex gap-1 items-center">
						진행중인 포켓몬 경매 <ChevronRight />
					</h2>
				</Link>
				<MainItemListSection id={3} />
			</div>
			<div className="default-container pt-30">
				<Link href={`/search?categoryMajorId=3`}>
					<h2 className="mb-6 flex gap-1 items-center">
						진행중인 유희왕 경매 <ChevronRight />
					</h2>
				</Link>
				<MainItemListSection id={1} />
			</div>
		</div>
	);
}
