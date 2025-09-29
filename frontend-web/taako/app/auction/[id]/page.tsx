// app/auction/[id]/page.tsx
import type { Metadata } from 'next';
import AuctionDetailClient from '@/components/sections/auction/AuctionDetailClient';

type PageProps = {
  params: { id: number };
  searchParams?: { historySize?: number };
};

export const metadata: Metadata = {
  title: '경매 상세',
};

export default function AuctionDetailPage({ params, searchParams }: PageProps) {
  const id = Number(params.id);
  const historySize = Number(searchParams?.historySize ?? 5);

  return <AuctionDetailClient auctionId={id} historySize={historySize} />;
}
