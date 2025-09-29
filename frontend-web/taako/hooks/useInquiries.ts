// hooks/useInquiries.ts
import { useCallback, useEffect, useState } from 'react';
import type { InquiryListResult, InquiryDetail } from '@/types/inquiry';
import {
  getInquiriesByAuction,
  createInquiry,
  getInquiryDetail,
  updateInquiry,
  deleteInquiry,
} from '@/lib/inquiries';
import type { CreateInquiryRequest, UpdateInquiryRequest } from '@/types/inquiry';

export function useInquiries(auctionId: number) {
  const [list, setList] = useState<InquiryListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(
    async (page = 0, size = 10, sort = 'createdAt,desc') => {
      try {
        setLoading(true);
        setError(null);
        const result = await getInquiriesByAuction({ auctionId, page, size, sort });
        setList(result);
      } catch (e: any) {
        setError(e.message ?? '목록 조회 실패');
      } finally {
        setLoading(false);
      }
    },
    [auctionId]
  );

  const addInquiry = async (body: CreateInquiryRequest) => {
    const id = await createInquiry(auctionId, body);
    await fetchList(); // 최신화
    return id;
  };

  const getDetail = async (inquiryId: number): Promise<InquiryDetail> => {
    return await getInquiryDetail(inquiryId);
  };

  const patchInquiry = async (inquiryId: number, body: UpdateInquiryRequest) => {
    await updateInquiry(inquiryId, body);
    await fetchList();
  };

  const removeInquiry = async (inquiryId: number) => {
    await deleteInquiry(inquiryId);
    await fetchList();
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    list,
    loading,
    error,
    fetchList,
    addInquiry,
    getDetail,
    patchInquiry,
    removeInquiry,
  };
}
