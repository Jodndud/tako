// types/wallet.ts

/** 지갑 관련 UI 에러 포맷 */
export type UiError = {
  title: string;
  detail?: string;
};

/** 네트워크 전환 드롭다운에서 쓰는 키 */
export type NetworkTarget = 'mainnet' | 'sepolia';
