// app/mypage/nftcard/page.tsx
"use client";

import ClaimButton from "@/components/nft/ClaimButton";
import { Button } from "@/components/ui/button";

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_TAKO_NFT as `0x${string}` | undefined;

export default function NFTCardPage() {
  const switchToSepolia = async () => {
    try {
      const eth = (window as any).ethereum;
      if (!eth) return alert("MetaMask가 필요합니다.");
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
      alert("Sepolia로 전환되었습니다.");
    } catch (e: any) {
      if (e?.code === 4902) {
        const eth = (window as any).ethereum;
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0xaa36a7",
            chainName: "Sepolia",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          }],
        });
        alert("Sepolia가 추가 및 전환되었습니다.");
      } else {
        alert(e?.message ?? "체인 전환 실패");
      }
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 space-y-6">
      {/* 경고 배너 */}
      {!CONTRACT_ADDR && (
        <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200">
          <strong>컨트랙트 주소 접근 불가</strong> - 서버에 오류가 있습니다.
          <div className="mt-1 opacity-90">잠시 후 서비스를 이용해주세요.</div>
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-gradient-to-br from-[#0B2030] to-[#1B3C88] p-4 shadow-md space-y-3">
        <h1 className="text-lg font-semibold text-white">NFT 카드 등록</h1>
        <p className="text-sm text-white/70">
          Sepolia 네트워크로 전환한 후 아래 패널을 실행하세요.
        </p>
        <p className="text-sm text-white/70">
          <strong>TokenId</strong>, <strong>Secret Code</strong>를 입력하고 카드를 차지해보세요!
        </p>
        <Button size="sm" variant="secondary" onClick={switchToSepolia}>
          Sepolia로 전환
        </Button>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#0F1117] shadow-md p-4">
        <h2 className="text-base font-semibold text-white mb-2">정보 입력</h2>
        {CONTRACT_ADDR ? (
          <ClaimButton contract={CONTRACT_ADDR} />
        ) : (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-200 text-sm">
            컨트랙트 주소가 설정되지 않았습니다.
          </div>
        )}
      </section>
    </div>
  );
}
