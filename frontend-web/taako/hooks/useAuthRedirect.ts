import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMyInfo } from "@/hooks/useMyInfo";

// 전역 리다이렉트 상태 관리
let isRedirecting = false;
const redirectQueue: (() => void)[] = [];

const executeRedirect = (redirectFn: () => void) => {
  if (isRedirecting) {
    redirectQueue.push(redirectFn);
    return;
  }

  isRedirecting = true;
  redirectFn();

  // 리다이렉트 후 상태 초기화
  setTimeout(() => {
    isRedirecting = false;
    const nextRedirect = redirectQueue.shift();
    if (nextRedirect) {
      executeRedirect(nextRedirect);
    }
  }, 100);
};

/**
 * 로그인 상태를 확인하고 미인증 시 로그인 페이지로 리다이렉트하는 훅
 * @param redirect - 리다이렉트할지 여부 (기본값: true)
 * @param reversed - 로그인한 사용자의 접근을 차단할지 여부 (기본값: false)
 * @param priority - 리다이렉트 우선순위 (낮을수록 높은 우선순위, 기본값: 1)
 */
export const useLoginRedirect = (redirect: boolean = true, reversed: boolean = false, _priority: number = 1) => {
  const router = useRouter();
  const { token } = useAuthStore();
  const hasRedirected = useRef(false);
  const initialToken = useRef(token);
  const [isHydrated, setIsHydrated] = useState(false);

  // Zustand persist 미들웨어의 hydration 완료를 기다림
  useEffect(() => {
    // 약간의 지연을 두어 localStorage에서 토큰이 로드될 시간을 제공
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // hydration이 완료된 후에만 인증 체크 실행
    if (!isHydrated) return;

    if (redirect && !hasRedirected.current) {
      if (!reversed && !token) {
        // 일반적인 경우: 로그인하지 않은 사용자를 로그인 페이지로 리다이렉트
        hasRedirected.current = true;
        executeRedirect(() => {
          alert("로그인 후 이용해주세요.");
          router.push("/login");
        });
      } else if (reversed && token && initialToken.current !== null) {
        // reversed 모드: 로그인한 사용자를 루트로 리다이렉트
        // 단, 페이지 로드 시 토큰이 없었던 경우는 제외 (로그인 성공으로 인한 토큰 변경 방지)
        hasRedirected.current = true;
        executeRedirect(() => {
          alert("잘못된 접근입니다.");
          router.push("/");
        });
      }
    }
  }, [router, redirect, token, reversed, isHydrated]);

  return {
    isAuthenticated: !!token,
  };
};

/**
 * 지갑 주소 연동 상태를 확인하고 미연동 시 마이페이지로 리다이렉트하는 훅
 * @param redirect - 리다이렉트할지 여부 (기본값: true)
 * @param priority - 리다이렉트 우선순위 (낮을수록 높은 우선순위, 기본값: 2)
 */
export const useWalletRedirect = (redirect: boolean = true, _priority: number = 2) => {
  const router = useRouter();
  const { storedWallet } = useMyInfo();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (redirect && !storedWallet && !hasRedirected.current) {
      hasRedirected.current = true;
      executeRedirect(() => {
        alert("지갑 주소가 연동되어 있지 않습니다. 마이페이지에서 등록 후 다시 시도해주세요.");
        router.push("/mypage");
      });
    }
  }, [router, storedWallet, redirect]);

  return {
    hasWallet: !!storedWallet,
  };
};

/**
 * 로그인과 지갑 주소를 모두 확인하고 미인증/미연동 시 리다이렉트하는 훅
 * @param redirectToLogin - 로그인 페이지로 리다이렉트할지 여부 (기본값: true)
 * @param redirectToMypage - 마이페이지로 리다이렉트할지 여부 (기본값: true)
 * @param reversed - 로그인한 사용자의 접근을 차단할지 여부 (기본값: false)
 */
export const useAuthRedirect = (
  redirectToLogin: boolean = true,
  redirectToMypage: boolean = true,
  reversed: boolean = false
) => {
  const loginStatus = useLoginRedirect(redirectToLogin, reversed, 1);
  const walletStatus = useWalletRedirect(redirectToMypage, 2);

  return {
    isAuthenticated: loginStatus.isAuthenticated,
    hasWallet: walletStatus.hasWallet,
  };
};
