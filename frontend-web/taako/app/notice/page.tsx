import Link from "next/link";
import { fetchNoticePage } from "@/lib/notice";

export const dynamic = "force-dynamic";

export default async function NoticeListPage({ searchParams }: { searchParams: { page?: string; size?: string } }) {
	const page = Number(searchParams?.page ?? 0);
	const size = Number(searchParams?.size ?? 20);
	const data = await fetchNoticePage(isNaN(page) ? 0 : page, isNaN(size) ? 20 : size);

	return (
		<div className="default-container pt-3">
			<h2 className="mb-6 flex gap-2 items-center">공지사항</h2>
			<div className="rounded-xl border border-[#353535] overflow-hidden divide-y divide-[#353535]">
				{data.content.length === 0 ? (
					<div className="p-6 text-sm text-[#a5a5a5]">등록된 공지사항이 없습니다.</div>
				) : (
					data.content.map((n) => (
						<Link key={n.id} href={`/notice/${n.id}`} className="flex items-center justify-between p-4 hover:bg-[#f2b90c]/10 transition-colors">
							<div className="flex flex-col">
								<span className="font-medium">{n.title}</span>
								<span className="text-xs text-[#a5a5a5]">
									{n.nickname} · {new Date(n.createdAt).toLocaleString()}
								</span>
							</div>
							<div className="text-xs text-[#a5a5a5]">조회 {n.viewCount.toLocaleString()}</div>
						</Link>
					))
				)}
			</div>

			<Pager current={data.page} totalPages={data.totalPages} size={data.size} />
		</div>
	);
}

function Pager({ current, totalPages, size }: { current: number; totalPages: number; size: number }) {
	if (totalPages <= 1) return null;
	const make = (p: number, label?: string) => (
		<Link href={{ pathname: "/notice", query: { page: p, size } }} className={`px-3 py-2 rounded-md border border-[#353535] ${p === current ? "bg-[#f2b90c]/20" : "hover:bg-[#f2b90c]/10"}`}>
			{label ?? p + 1}
		</Link>
	);
	return (
		<div className="mt-6 flex gap-2 items-center">
			{current > 0 && make(current - 1, "이전")}
			<span className="text-xs text-[#a5a5a5]">
				{current + 1} / {totalPages}
			</span>
			{current < totalPages - 1 && make(current + 1, "다음")}
		</div>
	);
}
