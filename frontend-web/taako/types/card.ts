export interface Card {
  id: number;
  name: string;
  grade: string;
  rarity: string;
  categoryMajorId: number;
  categoryMajorName: string;
  categoryMediumId: number;
  categoryMediumName: string,
}

export const CARD_SIZE = {
  YuGiOh: { width: 59, height: 86 },
  Pokémon: { width: 63, height: 88 },
  MTG: { width: 63, height: 88 },
  CookeRun: { width: 63, height: 88 },
} as const;

export type CharacterCardProps = {
  imageUrl: string,
  cardType: keyof typeof CARD_SIZE
}

export type singleCard = {
  id: number
  name: string
  code: string
  attribute: string | null
  rarity: string
  score: number
  wished: boolean
  imageUrls: string[]
}