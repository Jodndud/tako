"use client";

import { useEffect } from "react";
import { useNotificationToastStore, NotificationToastItem } from "@/stores/useNotificationToastStore";
import Link from "next/link";
import { resolveNotificationPath } from "@/lib/notificationRoute";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

function ToastCard({ t, onClose }: { readonly t: NotificationToastItem; readonly onClose: (id: string) => void }) {
	const router = useRouter();
	useEffect(() => {
		const ms = t.durationMs ?? 5000;
		const timer = setTimeout(() => onClose(t.id), ms);
		return () => clearTimeout(timer);
	}, [t.id, t.durationMs, onClose]);

	const inner = (
		<output
			className={`relative overflow-hidden w-80 max-w-[88vw] bg-[#111] text-white rounded-md shadow-xl border-l-4 border-yellow-500 ring-1 ring-inset ring-yellow-500/25 p-3 pointer-events-auto block`}
			aria-live="polite"
		>
			{/* subtle yellow glow */}
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-yellow-500/8 to-transparent" />
			<div className="relative flex items-start gap-3">
				<div className="shrink-0 mt-[2px] rounded-sm p-0.5">
					<Image src="/icon/fcm_icon_72.png" alt="알림" width={36} height={36} className="rounded-[2px]" />
				</div>
				<div className="min-w-0 flex-1">
					{t.title && <div className="text-sm font-semibold mb-1 truncate text-yellow-300">{t.title}</div>}
					{t.message && <div className="text-sm opacity-90 whitespace-pre-wrap break-words">{t.message}</div>}
					<div className="mt-2 text-right">
						<button className="text-xs text-gray-300 hover:text-white focus:outline-none" onClick={() => onClose(t.id)} aria-label="닫기">
							닫기
						</button>
					</div>
				</div>
			</div>
		</output>
	);

	// 1) 서버에서 직접 link를 준 경우 우선 사용
	if (t.link) {
		return (
			<Link href={t.link} onClick={() => onClose(t.id)} className="block">
				{inner}
			</Link>
		);
	}

	// 2) link가 없으면 rawType+causeId로 경로를 계산해서 클릭 시 이동
	const computed = resolveNotificationPath(t.rawType, t.causeId ?? null);
	if (computed) {
		return (
			<button
				type="button"
				onClick={() => {
					onClose(t.id);
					router.push(computed);
				}}
				className="block"
				aria-label="알림 이동"
			>
				{inner}
			</button>
		);
	}
	return inner;
}

export default function NotificationToaster() {
	const toasts = useNotificationToastStore((s) => s.toasts);
	const remove = useNotificationToastStore((s) => s.remove);

	return (
		<div className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-3 items-end pointer-events-none" aria-live="polite" aria-relevant="additions removals">
			<AnimatePresence initial={false}>
				{toasts.map((t) => (
					<motion.div
						key={t.id}
						layout
						initial={{ x: 60, opacity: 0 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: 60, opacity: 0 }}
						transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.6 }}
						className="translate-x-0 will-change-transform pointer-events-auto"
					>
						<ToastCard t={t} onClose={remove} />
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
