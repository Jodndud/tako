"use client";

import React, { useState } from "react";
import { useNotifications, useNotificationMutations } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { NotificationListRow } from "@/types/notificationsPage";

export default function NotificationPage() {
	const [page, setPage] = useState(0);
	const size = 10;
	const { data, isLoading, isError } = useNotifications(page, size);
	const { readOne, readAll } = useNotificationMutations();
	const content = data?.content ?? [];

	return (
		<div className="mx-auto max-w-3xl p-4 space-y-4">
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">알림함</h1>
				<Button size="sm" variant="outline" disabled={!content.some((c) => !c.read) || readAll.isPending} onClick={() => readAll.mutate()}>
					모두 확인
				</Button>
			</header>

			{isLoading && <div className="py-10 text-center text-sm text-muted-foreground">불러오는 중...</div>}
			{isError && <div className="py-10 text-center text-sm text-red-500">알림을 불러오지 못했습니다.</div>}
			{!isLoading && !isError && content.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">알림이 없습니다.</div>}
			<ul className="rounded-md border border-[#2a2d3a] bg-[#1b1e29] divide-y divide-[#262a36]">
				{content.map((n: NotificationListRow) => (
					<li key={n.id} className={`flex flex-col gap-1 p-4 transition-colors ${n.read ? "opacity-60" : "bg-[#242836] border-l-4 border-l-[#f2b90c]"} hover:bg-[#2c3140]`}>
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-medium line-clamp-1 text-gray-100">{n.title}</p>
							{!n.read && (
								<button onClick={() => readOne.mutate(n.id)} className="text-xs text-blue-600 hover:underline disabled:text-gray-400" disabled={readOne.isPending}>
									확인
								</button>
							)}
						</div>
						<p className="text-xs text-gray-400 line-clamp-2">{n.message}</p>
						<div className="mt-1 flex items-center justify-between">
							<time className="text-[10px] text-gray-500" dateTime={n.createdAt}>
								{formatRelative(n.createdAt)}
							</time>
							{n.targetUrl && (
								<a
									href={n.targetUrl}
									className="text-[10px] text-blue-600 hover:underline"
									onClick={() => {
										if (!n.read) readOne.mutate(n.id);
									}}
								>
									바로가기 →
								</a>
							)}
						</div>
					</li>
				))}
			</ul>
			{data && data.totalPages > 1 && <Pagination page={page} totalPages={data.totalPages} onChange={(p) => setPage(p)} />}
		</div>
	);
}

function formatRelative(iso: string) {
	const date = new Date(iso);
	const now = new Date();
	const diff = (now.getTime() - date.getTime()) / 1000; // sec
	if (diff < 60) return `${Math.floor(diff)}초 전`;
	if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
	const d = date.toLocaleDateString();
	return d;
}

interface PaginationProps {
	readonly page: number;
	readonly totalPages: number;
	readonly onChange: (page: number) => void;
}

function Pagination({ page, totalPages, onChange }: Readonly<PaginationProps>) {
	const prevDisabled = page <= 0;
	const nextDisabled = page >= totalPages - 1;
	return (
		<div className="flex items-center justify-center gap-2 pt-2">
			<button disabled={prevDisabled} onClick={() => onChange(page - 1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">
				이전
			</button>
			<span className="text-xs text-muted-foreground">
				{page + 1} / {totalPages}
			</span>
			<button disabled={nextDisabled} onClick={() => onChange(page + 1)} className="rounded border px-2 py-1 text-xs disabled:opacity-40">
				다음
			</button>
		</div>
	);
}
