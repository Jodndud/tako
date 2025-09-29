import api from "./api";

// 대분류 카테고리 조회
export const getMajorCategories = async () => {
    const res = await api.get("/v1/categories/majors");
    return res.data;
};

// 중분류 카테고리 조회
export const getMinorCategories = async (majorId:number) => {
    const res = await api.get(`/v1/categories/mediums/${majorId}`);
    return res.data;
}