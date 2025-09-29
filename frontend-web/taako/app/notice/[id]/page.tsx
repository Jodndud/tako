import Link from "next/link";
import Image from "next/image";
import { fetchNoticeDetail } from "@/lib/notice";

export default async function NoticeDetailPage({ params }: { params: { id: string } }) {
	const detail = await fetchNoticeDetail(params.id);
	return (
		<div className="default-container">
			<div className="mb-6">
				<Link href="/notice" className="text-sm text-[#a5a5a5] hover:text-[#f2b90c]">
					← 공지 목록
				</Link>
			</div>
			<h1 className="text-xl font-semibold mb-2">{detail.title}</h1>
			<div className="text-xs text-[#a5a5a5] mb-6">
				{detail.nickname} · {new Date(detail.createdAt).toLocaleString()} · 조회 {detail.viewCount.toLocaleString()}
			</div>
			<div className="rounded-xl border border-[#353535] p-5 whitespace-pre-wrap leading-7">{detail.text}</div>

			{detail.imageUrls && detail.imageUrls.length > 0 && (
				<div className="mt-6">
					<h3 className="mb-2 text-sm text-[#a5a5a5]">이미지</h3>
					<div className="flex gap-3 overflow-x-auto p-2 border border-[#353535] rounded-xl">
						{detail.imageUrls.map((src, idx) => (
							<div key={idx} className="relative w-[300px] h-[200px] shrink-0 rounded-md overflow-hidden border border-[#353535] bg-[#222]">
								{/* 사용 중인 Next 설정에 맞춰 unoptimized 적용 */}
								<Image src={src} alt={`notice-image-${idx}`} fill style={{ objectFit: "contain" }} unoptimized />
							</div>
						))}
					</div>
				</div>
			)}

			{detail.attachmentUrls && detail.attachmentUrls.length > 0 && (
				<div className="mt-6">
					<h3 className="mb-2 text-sm text-[#a5a5a5]">첨부파일</h3>
					<ul className="rounded-xl border border-[#353535] divide-y divide-[#353535]">
						{detail.attachmentUrls.map((url, i) => (
							<li key={i} className="p-3">
								<a href={url} download className="text-[#f2b90c] hover:underline break-all">
									첨부 {i + 1}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
