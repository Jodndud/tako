// lib/bc/escrowAbi.ts
export const ESCROW_ABI = [
  // 입금/확정/정산
  "function deposit() external payable",
  "function confirmReceipt() external",
  "function releaseFunds() external",

  // takoNFT, tokenId 체크
  "function takoNFT() view returns (address)",
  "function tokenId() view returns (uint256)",
  
  // currentState 읽기
  "function currentState() view returns (uint8)",
] as const;

// 상태 헬퍼(선택)
export const ESCROW_STATE = {
  AwaitingPayment: 0,
  AwaitingConfirmation: 1,
  Complete: 2, // 구매자 confirmReceipt 완료 이후
  Canceled: 3,
} as const;