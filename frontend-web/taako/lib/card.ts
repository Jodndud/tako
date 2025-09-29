import api from "./api";

// 경매 등록에서 카드 검색
export const searchAuctionCardCategory = async (categoryMajorId: number, categoryMediumId: number) => {
  const res = await api.get("/v1/cards", {
    params: {
      categoryMajorId: categoryMajorId,
      categoryMediumId: categoryMediumId,
      page: 0,
      size: 100,
    }
  });
  return res.data;
};

// 카드 검색페이지에서 검색
export const searchCard = async (categoryMajorId: number, categoryMediumId: number, name: string, description: string, page: number, size: number) => {
  const res = await api.get("/v1/cards", {
    params: {
      categoryMajorId: categoryMajorId,
      categoryMediumId: categoryMediumId,
      name: name,
      description: description,
      page: page,
      size: size
    }
  })
  return res.data
}

// 최근 1시간 인기 카드 목록
export const getHotCard = async (categoryId: number) => {
  const res = await api.get(`/v1/popularity/categories/${categoryId}/cards`)
  return res.data
}

export async function getCard(cardId: number | string, signal?: AbortSignal) {
  const res = await api.get(`/v1/cards/${cardId}`, { signal });
  return res.data;
}