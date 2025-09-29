// lib/inquiries.ts
import api from './api';
import type {
  ApiEnvelope,
  CreateInquiryRequest,
  CreateInquiryResponse,
  DeleteInquiryResponse,
  GetInquiryDetailResponse,
  GetInquiryListResponse,
  InquiryDetail,
  InquiryListResult,
  UpdateInquiryRequest,
  UpdateInquiryResponse,
} from '@/types/inquiry';

/** 공통: ApiEnvelope 해제 및 성공 검사 */
function unwrap<T>(env: ApiEnvelope<T>): T {
  if (!env.isSuccess) {
    throw new Error(env.message || 'Request failed');
  }
  return env.result;
}

/** 1) 문의 목록 조회: /v1/inquiries/auctions/{auctionId}?page=&size=&sort= */
export async function getInquiriesByAuction(params: {
  auctionId: number;
  page?: number;
  size?: number;
  sort?: string; // 예: 'createdAt,desc'
}): Promise<InquiryListResult> {
  const { auctionId, page = 0, size = 10, sort } = params;

  const { data } = await api.get<GetInquiryListResponse>(
    `/v1/inquiries/auctions/${auctionId}`,
    { params: { page, size, ...(sort ? { sort } : {}) } }
  );
  return unwrap(data);
}

/** 2) 문의 등록(POST): /v1/inquiries/auctions/{auctionId} → result = 생성된 inquiryId(number) */
export async function createInquiry(auctionId: number, body: CreateInquiryRequest): Promise<number> {
  const { data } = await api.post<CreateInquiryResponse>(`/v1/inquiries/auctions/${auctionId}`, body);
  return unwrap(data);
}

/** 3) 문의 상세 조회(GET): /v1/inquiries/{inquiryId} */
export async function getInquiryDetail(inquiryId: number): Promise<InquiryDetail> {
  const { data } = await api.get<GetInquiryDetailResponse>(`/v1/inquiries/${inquiryId}`);
  return unwrap(data);
}

/** 4) 문의 삭제(DELETE): /v1/inquiries/{inquiryId} */
export async function deleteInquiry(inquiryId: number): Promise<void> {
  const { data } = await api.delete<DeleteInquiryResponse>(`/v1/inquiries/${inquiryId}`);
  unwrap(data);
}

/** 5) 문의 수정(PATCH): /v1/inquiries/{inquiryId} */
export async function updateInquiry(inquiryId: number, body: UpdateInquiryRequest): Promise<void> {
  const { data } = await api.patch<UpdateInquiryResponse>(`/v1/inquiries/${inquiryId}`, body);
  unwrap(data);
}
