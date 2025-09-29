'use client';

import { useEffect, useState, useCallback } from 'react';
import type { InquiryDetail } from '@/types/inquiry';
import { getInquiryDetail, updateInquiry, deleteInquiry } from '@/lib/inquiries';
import { useAuthStore } from '@/stores/useAuthStore';
import SafePortal from '@/components/modals/SafePortal';

export default function InquiryDetailModal({
  inquiryId,
  onClose,
  onChanged,
}: {
  inquiryId: number;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [secret, setSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = useAuthStore((s) => s.token);
  const canEdit = !!token;

  const [closed, setClosed] = useState(false);
  const safeClose = useCallback(() => { setClosed(true); onClose(); }, [onClose]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setErr(null);
      const d = await getInquiryDetail(inquiryId);
      if (closed) return;
      setDetail(d);
      setTitle(d.title);
      setContent(d.content);
      // setSecret(d.secret ?? false);
    } catch (e: any) {
      if (closed) return;
      setErr(e?.message ?? '상세 조회 실패');
    } finally {
      if (!closed) setLoading(false);
    }
  }, [inquiryId, closed]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const d = await getInquiryDetail(inquiryId);
        if (!alive) return;
        setDetail(d);
        setTitle(d.title);
        setContent(d.content);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message ?? '상세 조회 실패');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; setClosed(true); };
  }, [inquiryId]);

  const onSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    try {
      setSubmitting(true);
      await updateInquiry(detail.id, { title: title.trim(), content: content.trim(), secret });
      await onChanged?.();
      if (!closed) {
        await refetch();
        setEditing(false);
      }
    } catch (e: any) {
      alert(e?.message ?? '수정 실패 (본인만 수정할 수 있습니다)');
    } finally {
      if (!closed) setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!detail) return;
    if (!confirm('정말 삭제하시겠어요?')) return;
    try {
      setSubmitting(true);
      await deleteInquiry(detail.id);
      await onChanged?.();
      safeClose();
    } catch (e: any) {
      alert(e?.message ?? '삭제 실패 (본인만 삭제할 수 있습니다)');
    } finally {
      if (!closed) setSubmitting(false);
    }
  };

  return (
    <SafePortal>
      {/* 바깥 클릭 1곳만 닫기 */}
      <div className="fixed inset-0 z-[220]" onClick={safeClose} role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/50" />
        {/* 내부 클릭은 닫지 않음 */}
        <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-[720px] max-h-[80vh] bg-[#141420] border border-[#353535] rounded-xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#353535]">
              <p className="text-[18px]">문의 상세</p>
              <button
                className="text-[#bbb] hover:text-white"
                onClick={(e) => { e.stopPropagation(); safeClose(); }}
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 57px)' }}>
              {loading && <div className="py-10 text-center text-[#999]">불러오는 중…</div>}
              {err && <div className="py-10 text-center text-red-400">{err}</div>}

              {!loading && !err && detail && !editing && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">{detail.title}</h3>
                    <span className="text-xs text-[#888]">{new Date(detail.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="mt-1 text-sm text-[#aaa]">작성자: {detail.authorNickname}</div>
                  <div className="mt-4 whitespace-pre-wrap text-[#ddd]">{detail.content}</div>

                  {detail.imageUrls?.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {detail.imageUrls.map((src, i) => (
                        <img key={i} src={src} alt={`inq-img-${i}`} className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  )}

                  {detail.answerId > 0 && (
                    <div className="mt-6 p-3 rounded bg-[#1b1b27] border border-[#353535]">
                      <div className="text-xs text-[#7db7cd] font-semibold mb-1">판매자 답변 · {detail.answerAuthorNickname}</div>
                      <div className="text-sm text-[#ddd] whitespace-pre-wrap">{detail.answerContent}</div>
                      <div className="mt-1 text-[11px] text-[#888]">{new Date(detail.answerCreatedAt).toLocaleString()}</div>
                    </div>
                  )}

                  <div className="mt-6 flex gap-2 justify-end">
                    {canEdit && (
                      <>
                        <button className="px-4 py-2 text-sm border border-[#353535] rounded hover:bg-[#1d2430]" onClick={() => setEditing(true)}>
                          수정
                        </button>
                        <button className="px-4 py-2 text-sm border border-[#653e3e] text-[#ff9a9a] rounded hover:bg-[#2b1d1d]" onClick={onDelete} disabled={submitting}>
                          삭제
                        </button>
                      </>
                    )}
                    <button className="px-4 py-2 text-sm border border-[#353535] rounded hover:bg-[#1d2430]" onClick={safeClose}>
                      닫기
                    </button>
                  </div>
                </>
              )}

              {!loading && !err && detail && editing && (
                <form onSubmit={onSubmitEdit} className="flex flex-col gap-5">
                  <div>
                    <label className="block mb-2">제목</label>
                    <input
                      type="text"
                      className="w-full p-3 border border-[#353535] rounded-md"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2">내용</label>
                    <textarea
                      className="w-full p-3 border border-[#353535] rounded-md"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={8}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">비밀글 여부</label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={secret} onChange={(e) => setSecret(e.target.checked)} className="w-4 h-4" />
                      <span className="text-sm text-[#a5a5a5]">비밀글로 수정</span>
                    </div>
                    <p className="text-xs text-[#888] mt-1">* 현재 상세 응답에 secret 필드가 없어 기본값으로 처리합니다.</p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm border border-[#353535] rounded hover:bg-[#1d2430]"
                      onClick={() => setEditing(false)}
                      disabled={submitting}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-[#3e4c63] text-[#7db7cd] rounded hover:bg-[#7db7cd] hover:text-[#3e4c63] disabled:opacity-60"
                      disabled={submitting}
                    >
                      {submitting ? '수정 중…' : '저장'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </SafePortal>
  );
}
