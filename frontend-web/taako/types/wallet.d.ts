// types/wallet.d.ts

export interface WalletState {
  walletAddress: string;      // 현재 연결된 지갑 주소, 없으면 빈 문자열
  error: string;        // 오류 메시지, 없으면 빈 문자열
}

export interface WalletConnectResponse {
  walletAddress: string;      // 연결 성공 시 사용자 지갑 주소
}

export interface WalletConnectError {
  code?: number;        // 오류 코드 (예: 4001 - 사용자 거절)
  message: string;      // 오류 메시지
}
