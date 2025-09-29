// types/bid.ts
export type BidQueueRequest = {
  amount: number;
  requestId: string;
};

export type BidStatus = "VALID" | "QUEUED" | "FAILED" | string;

// types/bid.ts
export type BidQueueResponse = {
  httpStatus?: {
    error?: boolean;
    is1xxInformational?: boolean;
    is2xxSuccessful?: boolean;
    is3xxRedirection?: boolean;
    is4xxClientError?: boolean;
    is5xxServerError?: boolean;
  };
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    bidId: number;
    auctionId: number;
    currentPrice: number;
    bidAt: string;
    status: BidStatus;
  };
};

