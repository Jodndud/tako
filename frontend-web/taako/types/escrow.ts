export type EscrowAddressResp = {
  httpStatus: any;
  isSuccess: boolean;
  message: string;
  code: number;
  result: {
    escrowAddress: `0x${string}`;
  };
};
