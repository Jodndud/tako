"use client";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOverlaySpinStore } from "@/stores/useOverlaySpin";

/**
 * 화면 중앙에서 fcm 아이콘이 확대 회전 → 전체 화면 채움 → 라우팅 완료 후 축소 회전 → 사라짐
 */
export default function FcmSpinOverlay() {
	const { active, phase, targetPath, setPhase, clear } = useOverlaySpinStore();
	const router = useRouter();
	const pathname = usePathname();
	const containerRef = useRef<HTMLDivElement>(null);
	const [expandedArmed, setExpandedArmed] = useState(false); // expand 단계에서 scale 애니메이션 트리거

	// 트랜지션 시간 정의 (ms)
	const expandDuration = 700; // 커지기
	const shrinkDuration = 600; // 줄어들기

	// expand 시작 시 scale-0 -> scale-[18]으로 애니메이션 유도
	useEffect(() => {
		if (!active) return;
		if (phase === "expand") {
			setExpandedArmed(false);
			const id = requestAnimationFrame(() => setExpandedArmed(true));
			// expand 완료 후 full로 전환 + 라우팅 시작
			const t = setTimeout(() => {
				setPhase("full");
				if (targetPath) router.push(targetPath);
			}, expandDuration);
			return () => {
				cancelAnimationFrame(id);
				clearTimeout(t);
			};
		}
	}, [active, phase, router, targetPath, setPhase]);

	// 라우팅 완료 감지: 경로가 목표와 일치(또는 시작)하면 축소 단계로 진입
	useEffect(() => {
		if (!active) return;
		if (phase !== "full") return;
		if (!targetPath) return;
		const matched = pathname === targetPath || pathname?.startsWith(targetPath);
		if (matched) setPhase("shrink");
	}, [active, phase, pathname, targetPath, setPhase]);

	// 축소 종료 후 overlay 제거
	useEffect(() => {
		if (!active) return;
		if (phase !== "shrink") return;
		const t = setTimeout(() => clear(), shrinkDuration);
		return () => clearTimeout(t);
	}, [active, phase, clear]);

	// 루트 클래스 계산
	const rootClass = useMemo(() => {
		const base = "pointer-events-none fixed inset-0 z-[100] flex items-center justify-center";
		const visible = active ? "opacity-100" : "opacity-0";
		return `${base} ${visible}`;
	}, [active]);

	// 아이콘 transform + 회전: 확장/유지 시 정방향, 축소 시 역방향
	const iconClass = useMemo(() => {
		const common = "transition-transform ease-out will-change-transform";
		const spinForward = "animate-[spin_1s_linear_infinite]";
		if (phase === "expand") return `${common} ${spinForward} ${expandedArmed ? "scale-[18]" : "scale-0"}`;
		if (phase === "full") return `${common} ${spinForward} scale-[18]`;
		if (phase === "shrink") return `${common} scale-0`;
		return `${common} scale-0`;
	}, [phase, expandedArmed]);

	const iconStyle: React.CSSProperties = useMemo(() => {
		let duration = 0;
		if (phase === "expand") duration = expandDuration;
		if (phase === "full") duration = 150; // 유지 구간은 transform 고정, 회전만 동작
		if (phase === "shrink") duration = shrinkDuration;
		const base: React.CSSProperties = { transitionDuration: `${duration}ms` };
		// 축소 시 역방향 회전(확장/유지와 반대 방향) - inline animation으로 표현
		if (phase === "shrink") {
			return {
				...base,
				animation: `spinReverse 1s linear infinite`,
			} as React.CSSProperties;
		}
		// 확장/유지 시 정방향 회전
		if (phase === "expand" || phase === "full") {
			return {
				...base,
				animation: `spin 1s linear infinite`,
			} as React.CSSProperties;
		}
		return base;
	}, [phase]);

	if (!active) return null;

	return (
		<div ref={containerRef} className={rootClass}>
			<div className="absolute inset-0 bg-black/70" />
			<div className="relative w-16 h-16">
				<div className={iconClass} style={iconStyle}>
					<Image src="/icon/fcm_icon_192.png" alt="fcm-spin" width={64} height={64} priority />
				</div>
			</div>
		</div>
	);
}
