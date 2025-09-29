export interface AuthState {
    token: string | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    refreshAccessToken: () => Promise<string | null>;
    logout: () => void;
  }

  // 내 프로필 조회
export interface MyInfo {
  backgroundImageUrl: string|null;
  email: string|null;
  introduction: string|null;
  memberId: number;
  nickname: number;
  // notificationsSetting: Object|null;
  profileImageUrl: string|null;
  walletAddress: string|null;
}

// 내 입찰 경매 목록 조회
export interface MyBidAuctions {
  auctionId: number;
  code: string|null;
  title: string|null;
  startDatetime: string|null;
  endDatetime: string|null;
  isEnd: boolean|null;
  closeReason: string|null;
  currentPrice: number|null;
  myTopBidAmount: number|null;
  imageUrl: string|null;
  bids: [
    {
      time: string|null;
      nickname: string|null;
      price: number|null;
    }
  ],
  delivery: {
    status: string|null;
    existTrackingNumber: boolean;
    existRecipientAddress: boolean;
    existSenderAddress: boolean;
  }

}

// 판매 경매 조회
export interface MySellAuctions {
  auctionId: number;
  code: string|null;
  title: string|null;
  startDatetime: string|null;
  endDatetime: string|null;
  isEnd: boolean|null;
  idDelivery: boolean| null;
  currentPrice: number|null;
  imageUrl: string|null;
  bids: Bids[];
  delivery: {
    status: string|null;
    existTrackingNumber: boolean|null;
    existRecipientAddress: boolean|null;
    existSenderAddress: boolean|null;
  }
}
export interface Bids {
  data: string|null;
  nickname: string|null;
  price: number|null;
}