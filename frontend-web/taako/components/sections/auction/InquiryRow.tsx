'use client';

import type { InquiryListItem } from '@/types/inquiry';

export default function InquiryRow({
  item,
  canEdit = false,
  onOpenDetail,
  onEditClick,
  onDeleteClick,
}: {
  item: InquiryListItem;
  canEdit?: boolean;
  onOpenDetail: (inquiryId: number) => void;
  onEditClick?: (inquiryId: number) => void;
  onDeleteClick?: (inquiryId: number) => void;
}) {
  return (
    <div className="p-4 border border-[#353535] rounded-lg">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-base font-semibold line-clamp-1">{item.title}</h4>
        <span className="text-xs text-[#888] shrink-0">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      </div>

      <p className="mt-1 text-sm text-[#aaa]">작성자: {item.maskedNickname}</p>

      {item.answerId > 0 && (
        <p className="mt-2 text-sm text-[#7db7cd]">판매자 답변이 등록되었습니다.</p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          className="px-3 py-1.5 text-sm border border-[#353535] rounded hover:bg-[#1d2430]"
          onClick={() => onOpenDetail(item.id)}
        >
          상세보기
        </button>

        {canEdit && (
          <>
            <button
              className="px-3 py-1.5 text-sm border border-[#353535] rounded hover:bg-[#1d2430]"
              onClick={() => onEditClick?.(item.id)}
            >
              수정
            </button>
            <button
              className="px-3 py-1.5 text-sm border border-[#653e3e] text-[#ff9a9a] rounded hover:bg-[#2b1d1d]"
              onClick={() => onDeleteClick?.(item.id)}
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
