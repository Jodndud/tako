import { useEffect, useState } from "react";
import { fetchNFThistory, History } from "@/lib/nft";

export function useNFThistory(tokenId?: number) {
  const [history, setHistory] = useState<History[]>([]);

  useEffect(() => {
    if (!tokenId) return;

    const handlerNFThistory = async () => {
      try {
        const res = await fetchNFThistory(tokenId);
        setHistory(res);
      } catch (err) {
        console.error(err);
        setHistory([]);
      }
    };

    handlerNFThistory();
  }, [tokenId]);

  return { history };
}
