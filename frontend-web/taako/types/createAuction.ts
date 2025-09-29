export interface AuctionNewCalendarChange  {
    startDate?: Date;
    startTime?: string;
    endDate?: Date;
    endTime?: string;
};

export type AuctionNewCalendarProps = {
  onChange: (v: AuctionNewCalendarChange) => void;
};