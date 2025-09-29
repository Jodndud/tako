'use client';

import { AuctionDetailProps } from '@/types/auction';
import { useState } from 'react';
import type { CreateInquiryRequest } from '@/types/inquiry';
import SafePortal from '@/components/modals/SafePortal';

interface InquiryProps {
  props: AuctionDetailProps;
  onClose?: () => void;
  onSaved?: () => void | Promise<void>;
  onCreate?: (body: CreateInquiryRequest) => Promise<number>;
}

export default function CreateInquiryModal({ onClose, onSaved, onCreate }: InquiryProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [secret, setSecret] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreate) return;
    try {
      setSubmitting(true);
      setErr(null);
      await onCreate({ title, content, secret });
      alert('문의가 등록되었습니다.');
      await onSaved?.();
      onClose?.();
    } catch (e: any) {
      setErr(e.message ?? '문의 등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafePortal>
      <div className="fixed inset-0 z-[200]" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-[560px] bg-[#141420] border border-[#353535] rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#353535]">
              <p className="text-[18px]">판매자에게 문의</p>
              <button className="text-[#bbb]" onClick={(e) => { e.stopPropagation(); onClose?.(); }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-6">
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
                />
              </div>

              <div>
                <label className="block mb-2">비밀글 여부</label>
                <input type="checkbox" checked={secret} onChange={(e) => setSecret(e.target.checked)} />{' '}
                비밀글 작성
              </div>

              {err && <div className="text-red-400 text-sm">{err}</div>}

              <div className="grid grid-cols-2 gap-2 mt-4">
                <button type="button" onClick={onClose} className="px-4 py-3 border border-[#353535] rounded">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-3 bg-[#3e4c63] text-[#7db7cd] rounded hover:bg-[#7db7cd] hover:text-[#3e4c63]"
                >
                  {submitting ? '등록 중...' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SafePortal>
  );
}
