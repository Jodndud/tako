// lib/formatKST.ts

const KST_COMPACT_FMT = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Seoul",
});

const NO_TZ_DATETIME = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/;
const HAS_TZ = /(Z|[+-]\d{2}:?\d{2})$/i;

// ✅ 파싱에서는 ±9h 하지 않음
//    tz 없는 19자리는 UTC로 간주 → Date.UTC(...)
function safeParse(iso?: string | null): Date | null {
  if (!iso) return null;
  const s = iso.trim();

  if (NO_TZ_DATETIME.test(s) && !HAS_TZ.test(s)) {
    const m = NO_TZ_DATETIME.exec(s)!;
    const [, y, mo, d, hh, mm, ss] = m;
    const ts = Date.UTC(+y, +mo - 1, +d, +hh, +mm, +ss);
    return Number.isFinite(ts) ? new Date(ts) : null;
  }

  const d = new Date(s); // "…Z"나 "+09:00" 등은 표준 파서
  return isNaN(d.getTime()) ? null : d;
}

// 표시 시에만 KST 적용
export function formatKSTFull(iso?: string | null): string {
  const d = safeParse(iso);
  if (!d) return iso ? String(iso) : "-";
  const parts = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: "Asia/Seoul",
  }).formatToParts(d);
  const get = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  return `${get("year")}년 ${get("month")}월 ${get("day")}일 ${get("hour")}시 ${get("minute")}분 ${get("second")}초`;
}

/** 짧은 표기: MM-DD HH:mm:ss (KST) */
export function formatKSTCompact(iso?: string | null): string {
  const d = safeParse(iso);
  if (!d) return iso ? String(iso) : "-";
  const parts = KST_COMPACT_FMT.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** Date/타임스탬프를 KST로 표시 */
export function formatKSTFromDate(date: Date | number): string {
  const ts = date instanceof Date ? date.getTime() : date;
  if (!Number.isFinite(ts)) return "-";
  const d = new Date(ts);
  const parts = KST_COMPACT_FMT.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const y = parts.find((p) => p.type === "year")?.value ?? "";
  return `${y}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

/** 유닉스 초(second) → KST 표시 */
export function formatKSTFromUnixSeconds(sec?: number): string {
  if (sec == null || !Number.isFinite(sec)) return "-";
  return formatKSTFromDate(sec * 1000);
}

/** 문자열 시각을 “정확한 순간(instant)”의 Date로 파싱해서 반환 */
export function toKstDate(iso?: string | null): Date | null {
  return safeParse(iso);
}

export default {
  formatKSTFull,
  formatKSTCompact,
  formatKSTFromDate,
  formatKSTFromUnixSeconds,
  toKstDate,
};
