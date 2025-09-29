// lib/normalizeAxiosError.ts
import type { AxiosError } from 'axios';

export type NormalizedHttpError = {
  name: string;                 // 'AxiosError' 등
  message: string;              // 원본 메시지(개발용)
  safeMessage: string;          // 사용자에게 보여줄 안전한 문구
  status?: number;              // 4xx/5xx
  code?: string;                // 'ERR_CANCELED', 'ECONNABORTED' 등
  data?: unknown;               // 서버에서 보낸 에러 바디(개발용)
  url?: string;                 // 최종 요청 URL
  method?: string;              // GET/POST...
  canceled?: boolean;           // 취소 여부
  timeout?: boolean;            // 타임아웃 여부
  network?: boolean;            // 네트워크(응답 없음) 오류
  retryable?: boolean;          // 재시도 추천 여부
  unauthorized?: boolean;       // 401
  forbidden?: boolean;          // 403
  notFound?: boolean;           // 404
};

export function normalizeAxiosError(err: unknown): NormalizedHttpError {
  // AbortController 취소
  if (err instanceof DOMException && err.name === 'AbortError') {
    return {
      name: 'AbortError',
      message: 'Request aborted',
      safeMessage: '요청이 취소되었어요.',
      canceled: true,
      retryable: false,
    };
  }

  // AxiosError
  if (typeof err === 'object' && err !== null && 'isAxiosError' in err) {
    const e = err as AxiosError<any>;

    const status = e.response?.status;
    const code = e.code;
    const method = (e.config?.method || '').toUpperCase();
    const url = e.config?.baseURL
      ? `${e.config.baseURL}${e.config.url ?? ''}`
      : e.config?.url;

    const isCanceled = code === 'ERR_CANCELED' || e.message === 'canceled';
    const isTimeout = code === 'ECONNABORTED' || /timeout/i.test(e.message || '');
    const isNetwork = !e.response && !!e.request && !isCanceled && !isTimeout;

    // 서버가 주는 메시지 우선
    const serverMsg =
      (typeof e.response?.data?.message === 'string' && e.response?.data?.message) ||
      (typeof e.response?.data?.error === 'string' && e.response?.data?.error) ||
      '';

    // 사용자용 안전 문구
    let safe = '요청을 처리하지 못했어요.';
    if (isCanceled) safe = '요청이 취소되었어요.';
    else if (isTimeout) safe = '응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.';
    else if (isNetwork) safe = '네트워크 연결을 확인해주세요.';
    else if (status && status >= 500) safe = '서버 오류가 발생했어요. 잠시 후 다시 시도해주세요.';
    else if (status === 404) safe = '요청하신 정보를 찾을 수 없어요.';
    else if (status === 403) safe = '접근 권한이 없어요.';
    else if (status === 401) safe = '로그인이 필요하거나 세션이 만료됐어요.';
    else if (serverMsg) safe = serverMsg;

    const retryable =
      (!status && !isCanceled) ||               // 네트워크 계열
      isTimeout ||
      (status ? (status >= 500 || status === 429 || status === 408) : false);

    return {
      name: e.name || 'AxiosError',
      message: serverMsg || e.message || 'Request failed',
      safeMessage: safe,
      status,
      code,
      data: e.response?.data,
      url,
      method,
      canceled: isCanceled,
      timeout: isTimeout,
      network: isNetwork,
      retryable,
      unauthorized: status === 401,
      forbidden: status === 403,
      notFound: status === 404,
    };
  }

  // 일반 Error
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      safeMessage: '처리 중 문제가 발생했어요.',
      retryable: false,
    };
  }

  // 알 수 없음
  return {
    name: 'Error',
    message: 'Unknown error',
    safeMessage: '알 수 없는 오류가 발생했어요.',
    retryable: false,
  };
}
