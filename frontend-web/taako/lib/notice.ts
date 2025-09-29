import api from "@/lib/api";
import type { NoticeSummary, NoticeDetail, Page } from "@/types/notice";

type ApiEnvelope<T> = {
	httpStatus: any;
	isSuccess: boolean;
	message: string;
	code: number;
	result: T;
};

export async function fetchNoticePage(page = 0, size = 20): Promise<Page<NoticeSummary>> {
	const res = await api.get<ApiEnvelope<Page<NoticeSummary>>>("/v1/notices", { params: { page, size } });
	return res.data.result;
}

export async function fetchNoticeDetail(id: number | string): Promise<NoticeDetail> {
	const res = await api.get<ApiEnvelope<NoticeDetail>>(`/v1/notices/${id}`);
	return res.data.result;
}
