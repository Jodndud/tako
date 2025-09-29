// hooks/useBidLock.ts
'use client';

import { useEffect, useRef, useState } from 'react';

/** 내가 마지막 입찰자일 때 재입찰을 잠그는 훅 */
export function useBidLock(currentPrice: number) {
  const [iAmTop, setIAmTop] = useState(false);
  const myTopPriceRef = useRef<number | null>(null);

  // 다른 사용자가 가격을 올려서 currentPrice가 변하면 잠금 해제
  useEffect(() => {
    if (iAmTop && myTopPriceRef.current != null && currentPrice !== myTopPriceRef.current) {
      setIAmTop(false);
      myTopPriceRef.current = null;
    }
  }, [currentPrice, iAmTop]);

  /** 성공 직후 현재가를 기록하고 잠금 */
  const lockAsTop = (price: number) => {
    myTopPriceRef.current = price;
    setIAmTop(true);
  };

  /** 강제 해제(필요 시) */
  const resetLock = () => {
    myTopPriceRef.current = null;
    setIAmTop(false);
  };

  return { iAmTop, lockAsTop, resetLock, myTopPrice: myTopPriceRef.current };
}
