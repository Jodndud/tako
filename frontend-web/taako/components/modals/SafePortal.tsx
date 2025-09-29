// components/common/SafePortal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function SafePortal({
  children,
  containerId = 'modal-root', // 기본은 모달 루트. 오버레이는 'overlay-root'로 지정해서 사용
}: {
  children: React.ReactNode;
  containerId?: string;
}) {
  const hostRef = useRef<HTMLElement | null>(null);
  const elRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hostRef.current = document.getElementById(containerId) || document.body;

    // 이미 같은 렌더 사이클에서 두 번 마운트될 수 있어 StrictMode 대비
    const el = document.createElement('div');
    el.setAttribute('data-safe-portal', containerId);
    hostRef.current.appendChild(el);
    elRef.current = el;
    setMounted(true);

    return () => {
      if (elRef.current && elRef.current.parentNode) {
        elRef.current.parentNode.removeChild(elRef.current);
      }
      elRef.current = null;
      hostRef.current = null;
    };
  }, [containerId]);

  if (!mounted || !hostRef.current || !elRef.current) return null;
  return createPortal(children, elRef.current);
}
