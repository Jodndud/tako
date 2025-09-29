import { useState, useEffect } from "react";
import { toKstDate } from "@/lib/formatKST";

interface Props {
	readonly start?: string; // ISO
	readonly end?: string; // ISO
	readonly endTsOverride?: number; // SSE로 갱신되는 epoch(ms) or seconds
	readonly className?: string;
}

export default function RemainingTime({ start, end, endTsOverride, className }: Props) {
  const [now, setNow] = useState<number>(Date.now()); // UTC ms

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ✅ tz 없는 문자열은 UTC로 파싱 → UTC ms
  const parseInstantMs = (iso?: string): number | undefined => {
    if (!iso) return undefined;
    const d = toKstDate(iso); // 내부에서 safeParse 사용
    return d ? d.getTime() : undefined;
  };

  // endTsOverride가 초면 ms로 환산. 없으면 end(ISO) 사용
  const endMs =
    typeof endTsOverride === "number"
      ? (endTsOverride > 1e12 ? endTsOverride : endTsOverride * 1000)
      : parseInstantMs(end);

  const startMs = parseInstantMs(start);

  // 진행 상태 (UTC ms 기준으로 비교)
  let phase: "before" | "running" | "ended" = "running";
  if (startMs != null && now < startMs) phase = "before";
  if (endMs != null && now >= endMs) phase = "ended";

  const diff = endMs != null ? endMs - now : 0;
  const remain = diff > 0 ? diff : 0;

  const totalSeconds = Math.floor(remain / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const segs: string[] = [];
  if (days > 0) segs.push(`${days}일`);
  if (hours > 0) segs.push(`${hours}시간`);
  if (minutes > 0) segs.push(`${minutes}분`);
  segs.push(`${seconds}초`);

  let text: string;
  if (phase === "before") text = `시작 전 (${segs.join(" ")})`;
  else if (phase === "ended") text = "종료됨";
  else text = segs.join(" ");

  return <span className={className ?? "text-[#7db7cd]"}>{text}</span>;
}