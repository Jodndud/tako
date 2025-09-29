'use client'

import Link from "next/link";
import SimpleCard from "@/components/cards/SimpleCard";
import { useAllWishCards } from "@/hooks/useCardWish";
import { useEffect, useState } from "react";
import api from "@/lib/api";

// API 응답 타입 정의
type WishCard = {
  cardId: number;
  name: string;
  cardImage: string;
};

// 카드 타입 매핑 (categoryId -> cardType)
const cardTypes = {
  1: "YuGiOh", 
  2: "Pokémon", 
  3: "CookeRun", 
  4: "MTG"
} as const;

// 카드 정보를 포함한 위시 카드 타입
type WishCardWithInfo = WishCard & {
  cardType?: keyof typeof cardTypes;
  categoryId?: number;
};

export default function WishItemPage() {
  const { wishCards, loading, error, fetchAllWishCards } = useAllWishCards();
  const [cardsWithInfo, setCardsWithInfo] = useState<WishCardWithInfo[]>([]);
  const [loadingCardInfo, setLoadingCardInfo] = useState(false);

  useEffect(() => {
    fetchAllWishCards();
  }, [fetchAllWishCards]);

  // 각 카드의 상세 정보를 조회해서 cardType을 결정
  useEffect(() => {
    if (wishCards.length > 0) {
      fetchCardInfos();
    }
  }, [wishCards]);

  const fetchCardInfos = async () => {
    setLoadingCardInfo(true);
    try {
      const cardsWithInfoPromises = wishCards.map(async (card) => {
        try {
          const response = await api.get(`/v1/cards/${card.cardId}`);
          const data = response.data;
          
          if (data.isSuccess && data.result) {
            const categoryId = data.result.categoryId;
            const cardType = cardTypes[categoryId as keyof typeof cardTypes];
            
            return {
              ...card,
              cardType,
              categoryId
            };
          }
        } catch (error) {
          console.error(`Error fetching card info for card ${card.cardId}:`, error);
        }
        
        // 기본값으로 Pokémon 설정
        return {
          ...card,
          cardType: 2, // Pokémon
          categoryId: 2
        };
      });

      const cardsWithInfo = await Promise.all(cardsWithInfoPromises);
      setCardsWithInfo(cardsWithInfo);
    } catch (error) {
      console.error('Error fetching card infos:', error);
    } finally {
      setLoadingCardInfo(false);
    }
  };

  const column = 5;
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${column}, 1fr)`,
    gap: '3rem 2rem',
    padding: '1rem'
  };

  if (loading || loadingCardInfo) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>관심 카드를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>관심 카드를 불러오는 중 오류가 발생했습니다.</p>
        <button onClick={fetchAllWishCards}>다시 시도</button>
      </div>
    );
  }

  if (wishCards.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>관심 카드가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ padding: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        관심 카드
      </h1>
      <div style={gridStyle}>
        {cardsWithInfo.map((card) => (
          <Link key={card.cardId} href={`/category/${card.categoryId || 1}/${card.cardId}`}>
            <div style={{ cursor: 'pointer' }}>
              <SimpleCard 
                imageUrl={card.cardImage || '/no-image.jpg'} 
                cardType={cardTypes[card.cardType || 2]}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
