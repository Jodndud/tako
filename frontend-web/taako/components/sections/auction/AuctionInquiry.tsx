'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AuctionDetailProps } from '@/types/auction';
import { useInquiries } from '@/hooks/useInquiries';
import CreateInquiryModal from '../../modals/CreateInquiryModal';
import InquiryRow from '@/components/sections/auction/InquiryRow';
import InquiryDetailModal from '@/components/modals/InquiryDetailModal';

type Props = {
  props: AuctionDetailProps;
  onTotalChange?: (n: number) => void;
};

export default function AuctionInquiry({ props, onTotalChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { list, loading, error, addInquiry, fetchList } = useInquiries(props.id);

  // ====== 총 개수 부모 반영: 실제 변경시에만 + 첫 프레임 스킵 + 다음 프레임에 호출 ======
  const prevTotalRef = useRef<number | null>(null);
  const isFirstRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  const total = list?.totalElements ?? 0;

  useEffect(() => {
    // 첫 마운트 프레임은 스킵 (초깃값 0 -> 0 업데이트로 인한 상위 즉시 리렌더 방지)
    if (isFirstRef.current) {
      isFirstRef.current = false;
      prevTotalRef.current = total; // 현재 값을 기준점으로 기록
      return;
    }

    // 값이 실제로 바뀐 경우에만
    if (prevTotalRef.current === total) return;
    prevTotalRef.current = total;

    if (!onTotalChange) return;

    // 다음 프레임으로 미뤄 커밋 타이밍 충돌 방지
    rafRef.current = window.requestAnimationFrame(() => {
      onTotalChange(total);
    });

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [total]); // onTotalChange는 deps에서 제외 (불필요 재실행 방지)

  // ====== 모달 상호배타 ======
  const openDetail = useCallback((id: number) => {
    setShowForm(false);
    setDetailId(id);
  }, []);
  const closeDetail = useCallback(() => setDetailId(null), []);

  const openForm = useCallback(() => {
    setDetailId(null);
    setShowForm(true);
  }, []);
  const closeForm = useCallback(() => setShowForm(false), []);

  return (
    <div className="space-y-4">
      {loading && <div className="py-10 text-center text-[#999]">불러오는 중...</div>}
      {error && <div className="py-10 text-center text-red-400">{error}</div>}

      {!loading && !error && (list?.content?.length ?? 0) === 0 && (
        <div className="py-10 text-center text-[#999]">등록된 문의글이 없습니다.</div>
      )}

      {!loading && !error && (list?.content?.length ?? 0) > 0 && (
        <div className="space-y-3">
          {list!.content.map((it) => (
            <InquiryRow
              key={it.id}
              item={it}
              canEdit={false}
              onOpenDetail={openDetail}
              onEditClick={openDetail}
              onDeleteClick={openDetail}
            />
          ))}
        </div>
      )}

      <button
        className="w-full py-3 text-sm text-[#cfd8e3] border border-[#353535] rounded-lg cursor-pointer hover:bg-[#1d2430]"
        onClick={openForm}
      >
        판매자에게 문의하기
      </button>

      {showForm && (
        <CreateInquiryModal
          props={props}
          onClose={closeForm}
          onSaved={fetchList}
          onCreate={addInquiry}
        />
      )}

      {detailId !== null && (
        <InquiryDetailModal
          key={detailId}
          inquiryId={detailId}
          onClose={closeDetail}
          onChanged={fetchList}
        />
      )}
    </div>
  );
}
