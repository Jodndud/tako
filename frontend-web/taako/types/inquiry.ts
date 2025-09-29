// types/inquiry.ts

/** 서버 공통 응답 래퍼 */
export interface HttpStatusMeta {
  error: boolean;
  is4xxClientError: boolean;
  is5xxServerError: boolean;
  is1xxInformational: boolean;
  is2xxSuccessful: boolean;
  is3xxRedirection: boolean;
}

export interface ApiEnvelope<T> {
  httpStatus: HttpStatusMeta;
  isSuccess: boolean;
  message: string;
  code: number;
  result: T;
}

/** 목록 응답 내부 페이징/정렬 메타 */
export interface SortMeta {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface PageableMeta {
  offset: number;
  sort: SortMeta;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

/** 1) 문의 목록 조회: 단일 아이템 스키마 */
export interface InquiryListItem {
  id: number;
  answerId: number;            // 0 또는 답변 id
  title: string;
  maskedNickname: string;      // 작성자 닉네임 마스킹
  createdAt: string;           // ISO8601
}

/** 1) 문의 목록 조회: result 스키마 */
export interface InquiryListResult {
  totalElements: number;
  totalPages: number;
  size: number;
  content: InquiryListItem[];
  number: number;              // 현재 페이지 번호
  sort: SortMeta;
  numberOfElements: number;
  pageable: PageableMeta;
  last: boolean;
  first: boolean;
  empty: boolean;
}

/** 1) 목록 조회 최종 응답 */
export type GetInquiryListResponse = ApiEnvelope<InquiryListResult>;

/** 2) 문의 등록: 요청 바디 */
export interface CreateInquiryRequest {
  title: string;
  content: string;
  secret: boolean;
}

/** 2) 문의 등록: 응답(result는 생성된 inquiryId 숫자) */
export type CreateInquiryResponse = ApiEnvelope<number>;

/** 3) 문의 상세 조회: result */
export interface InquiryDetail {
  id: number;
  title: string;
  content: string;
  imageUrls: string[];           // 첨부 이미지 URL 목록
  authorNickname: string;
  createdAt: string;             // ISO8601
  answerId: number;              // 0 또는 답변 id
  answerContent: string;         // 없으면 빈 문자열을 줄 수도 있음(서버 계약대로)
  answerAuthorNickname: string;  // 답변자 닉네임(판매자)
  answerCreatedAt: string;       // ISO8601
}

/** 3) 상세 조회 최종 응답 */
export type GetInquiryDetailResponse = ApiEnvelope<InquiryDetail>;

/** 4) 문의 삭제: 응답(result는 빈 객체) */
export type DeleteInquiryResponse = ApiEnvelope<Record<string, never>>;

/** 5) 문의 수정: 요청 바디 */
export interface UpdateInquiryRequest {
  title: string;
  content: string;
  secret: boolean;
}

/** 5) 문의 수정: 응답(result는 빈 객체) */
export type UpdateInquiryResponse = ApiEnvelope<Record<string, never>>;
