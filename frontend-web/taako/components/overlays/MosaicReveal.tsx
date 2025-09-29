'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import SafePortal from '@/components/modals/SafePortal';

type MosaicRevealProps = {
  columns?: number;
  rows?: number;
  durationMs?: number;
};

export default function MosaicReveal({
  columns = 10,
  rows = 3,
  durationMs = 500,
}: MosaicRevealProps) {
  const pathname = usePathname();

  const [visible, setVisible] = useState(true);
  const [squares, setSquares] = useState<{ key: string; delayMs: number; color: string }[]>([]);
  const liveRef = useRef(true);
  const rafShowRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  // 라이프사이클 가드
  useEffect(() => {
    liveRef.current = true;
    return () => {
      liveRef.current = false;
      if (rafShowRef.current != null) cancelAnimationFrame(rafShowRef.current);
      if (hideTimerRef.current != null) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // 클라이언트에서 delay 계산 (columns/rows 바뀔 때만 재계산)
  useEffect(() => {
    const total = columns * rows;
    const order = Array.from({ length: total }, (_, i) => i);
    for (let i = total - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const arr: { key: string; delayMs: number; color: string }[] = [];
    const step = 15;
    const color = '#CA3813';

    let idx = 0;
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const position = order[idx++];
        arr.push({ key: `${x}-${y}`, delayMs: position * step, color });
      }
    }
    setSquares(arr);
  }, [columns, rows]);

  // 라우트 변경마다 표시 → 애니 종료 시 숨김 (다음 프레임으로 표시 시점 지연)
  useEffect(() => {
    if (!squares.length) return;

    // 이전 예약(cleanup)
    if (rafShowRef.current != null) cancelAnimationFrame(rafShowRef.current);
    if (hideTimerRef.current != null) clearTimeout(hideTimerRef.current);

    // 다음 프레임에 표시(하이드레이션/커밋 타이밍 분리)
    rafShowRef.current = requestAnimationFrame(() => {
      if (!liveRef.current) return;
      setVisible(true);

      const maxDelay = squares.reduce((m, s) => (s.delayMs > m ? s.delayMs : m), 0);
      const totalMs = maxDelay + durationMs + 50;

      hideTimerRef.current = window.setTimeout(() => {
        if (!liveRef.current) return;
        setVisible(false);
      }, totalMs);
    });

    return () => {
      if (rafShowRef.current != null) cancelAnimationFrame(rafShowRef.current);
      if (hideTimerRef.current != null) clearTimeout(hideTimerRef.current);
      rafShowRef.current = null;
      hideTimerRef.current = null;
    };
  }, [pathname, squares, durationMs]);

  if (!visible) return null;

  return (
    <SafePortal containerId="overlay-root">
      <div className="pointer-events-none fixed inset-0 z-[9999]">
        <div
          className="grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {squares.map((sq) => (
            <div
              key={sq.key}
              className="mosaic-square"
              style={{
                animationDuration: `${durationMs}ms`,
                animationDelay: `${sq.delayMs}ms`,
                backgroundColor: sq.color,
              }}
            />
          ))}
        </div>
      </div>
    </SafePortal>
  );
}
