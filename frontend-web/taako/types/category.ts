export interface CreateAuctionCategoriesProps {
  onChange: (
    majorId: number|null,
    majorName: string|null,
    minorId: number|null,
    minorName: string|null,
    cardId:number|null,
    cardName:string|null,
    cardImageUrl:string|null,
  ) => void;
  onReset?: () => void;
}

export interface CategoryPageProps {
  params: {
    categoryId: number,
    categoryName: string
  }
}

export interface MajorCategories {
  id: number;
  name: string;
  description: string;
}

export interface MinorCategories {
  id: number;
  name: string;
  categoryMajorId: number;
  description: string;
}
