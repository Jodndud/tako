// components/nft/ClaimButton.tsx
"use client";

import { useState } from "react";
import { claimTakoNft } from "@/hooks/useClaim";

export default function ClaimButton({ contract }: { contract: `0x${string}` }) {
  const [tokenId, setTokenId] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const onClaim = async () => {
    try {
      if (!tokenId || !secret) return alert("tokenId와 secret을 모두 입력하세요.");
      setLoading(true);
      await claimTakoNft({ contract, tokenId, secret });
      alert("Claim 성공!");
    } catch (e: any) {
      console.error(e);
      alert("claim 실패");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 flex flex-col gap-3 p-6 border rounded-xl bg-[#1a1a1a] max-w-md">
      <label className="flex flex-col gap-1 text-sm text-white/70">
        Token ID
        <input
          type="number"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="예: 968614190"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-white/70">
        Secret
        <input
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          placeholder="정확히 일치해야 함"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
      </label>

      <button
        onClick={onClaim}
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? "⏳ Claim 중..." : "🚀 Claim 실행"}
      </button>
    </div>
  );
}
