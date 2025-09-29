'use client';

import { useState, useCallback, useEffect } from 'react';
import { getAllWishAuctions, removeWishAuction } from '@/lib/wish';
import { normalizeAxiosError } from '@/lib/normalizeAxiosError';

export interface WishAuctionItem {
  auctionId: number;
  imageKey: string;
  title: string;
  currentPrice: number;
  endDatetime: string;
}

export interface WishAuctionsResponse {
  content: WishAuctionItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export function useWishAuctions(page: number = 0, size: number = 20) {
  const [wishAuctions, setWishAuctions] = useState<WishAuctionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchWishAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const ctrl = new AbortController();

    try {
      const data = await getAllWishAuctions(page, size, ctrl.signal);
      if (data.isSuccess && data.result) {
        setWishAuctions(data.result.content || []);
        setTotalPages(data.result.totalPages || 0);
        setTotalElements(data.result.totalElements || 0);
      }
    } catch (e) {
      const ne = normalizeAxiosError(e);
      if (!ne.canceled) {
        setError(ne);
      }
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  // 진행중/종료 경매 분류
  const ongoingAuctions = wishAuctions.filter(item => {
    const endDate = new Date(item.endDatetime);
    const now = new Date();
    return endDate.getTime() > now.getTime();
  });

  const endedAuctions = wishAuctions.filter(item => {
    const endDate = new Date(item.endDatetime);
    const now = new Date();
    return endDate.getTime() <= now.getTime();
  });

  const removeWish = useCallback(async (auctionId: number) => {
    try {
      await removeWishAuction(auctionId);
      // 목록에서 제거
      setWishAuctions(prev => prev.filter(item => item.auctionId !== auctionId));
      setTotalElements(prev => prev - 1);
    } catch (e) {
      const ne = normalizeAxiosError(e);
      setError(ne);
    }
  }, []);

  useEffect(() => {
    fetchWishAuctions();
  }, [fetchWishAuctions]);

  return {
    wishAuctions,
    ongoingAuctions,
    endedAuctions,
    loading,
    error,
    totalPages,
    totalElements,
    fetchWishAuctions,
    removeWish
  };
}
