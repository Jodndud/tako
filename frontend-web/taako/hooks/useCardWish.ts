'use client';

import { useState, useCallback } from 'react';
import { addWishCard, removeWishCard, getWishCard, getAllWishCards } from '@/lib/wish';
import { getCard } from '@/lib/card';
import { normalizeAxiosError } from '@/lib/normalizeAxiosError';

export function useCardWish(cardId: number, initialWished: boolean = false) {
  const [wished, setWished] = useState<boolean>(initialWished);
  const [pendingWish, setPendingWish] = useState(false);
  const [wishError, setWishError] = useState<any>(null);

  const toggleWish = useCallback(async () => {
    if (!cardId) return;
    const next = !wished;

    setWished(next);
    setPendingWish(true);
    setWishError(null);

    const ctrl = new AbortController();

    try {
      if (next) await addWishCard(cardId, ctrl.signal);
      else await removeWishCard(cardId, ctrl.signal);
    } catch (e) {
      const ne = normalizeAxiosError(e);
      if (!ne.canceled) {
        setWished(!next); // 롤백
        setWishError(ne);
      }
    } finally {
      setPendingWish(false);
    }
  }, [cardId, wished]);

  return { wished, pendingWish, wishError, toggleWish };
}

export function useWishCard(cardId: number) {
  const [wishData, setWishData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchWishCard = useCallback(async () => {
    if (!cardId) return;

    setLoading(true);
    setError(null);

    const ctrl = new AbortController();

    try {
      const data = await getWishCard(cardId, ctrl.signal);
      setWishData(data);
    } catch (e) {
      const ne = normalizeAxiosError(e);
      if (!ne.canceled) {
        setError(ne);
      }
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  return { wishData, loading, error, fetchWishCard };
}

export function useAllWishCards(page: number = 0, size: number = 20) {
  const [wishCards, setWishCards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchAllWishCards = useCallback(async () => {
    setLoading(true);
    setError(null);

    const ctrl = new AbortController();

    try {
      const data = await getAllWishCards(page, size, ctrl.signal);
      if (data.isSuccess && data.result) {
        setWishCards(data.result.content || []);
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

  return {
    wishCards,
    loading,
    error,
    totalPages,
    totalElements,
    fetchAllWishCards
  };
}

export function useCardInfo(cardId: number) {
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchCardInfo = useCallback(async () => {
    if (!cardId) return;

    setLoading(true);
    setError(null);

    const ctrl = new AbortController();

    try {
      const data = await getCard(cardId, ctrl.signal);
      if (data.isSuccess && data.result) {
        setCardInfo(data.result);
      }
    } catch (e) {
      const ne = normalizeAxiosError(e);
      if (!ne.canceled) {
        setError(ne);
      }
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  return { cardInfo, loading, error, fetchCardInfo };
}