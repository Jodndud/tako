export type NoticeSummary = {
	id: number;
	title: string;
	nickname: string;
	viewCount: number;
	createdAt: string; // ISO
};

export type NoticeDetail = {
	id: number;
	title: string;
	text: string;
	nickname: string;
	viewCount: number;
	imageUrls: string[];
	attachmentUrls: string[];
	createdAt: string;
	updatedAt: string;
};

export type Page<T> = {
	content: T[];
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
};
