// hooks/useERC721Approval.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAddress, Contract, ZeroAddress } from 'ethers';
import { getSigner, getAccount, getProvider } from '@/lib/bc/provider';
import { ERC721_MIN_ABI } from '@/lib/bc/contracts';

type UseERC721ApprovalOptions = {
  nftAddress: string;            // ERC721 컨트랙트 주소
  tokenId: bigint | number;      // 토큰 ID
  spender: string;               // 승인 대상(경매/에스크로 컨트랙트)
  requiredChainId?: number;      // ex) 11155111 (Sepolia)
};

const isZeroLike = (addr?: string) =>
  !addr || addr.toLowerCase() === ZeroAddress.toLowerCase();

const ZERO_BI = BigInt(0);

export function useERC721Approval({
  nftAddress,
  tokenId,
  spender,
  requiredChainId,
}: UseERC721ApprovalOptions) {
  const [loading, setLoading] = useState(false); // write action 로딩
  const [owner, setOwner] = useState<string>('');
  const [approved, setApproved] = useState<string>(ZeroAddress);
  const [approvedForAll, setApprovedForAll] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [account, setAccount] = useState<string>('');

  const tid = useMemo(() => (typeof tokenId === 'bigint' ? tokenId : BigInt(tokenId)), [tokenId]);
  const unminted = isZeroLike(nftAddress) || tid === ZERO_BI;
  const spenderIsValid = useMemo(() => isAddress(spender), [spender]);

  // 읽기 전용 검증(스펜더는 불필요) — UI에서 값 보여주기 위해 엄격히 막지 않음
  const validateRead = useCallback(() => {
    if (unminted) return; // 미발급이면 조회 스킵
    if (!isAddress(nftAddress)) throw new Error('잘못된 NFT 주소입니다.');
    // spender는 isApprovedForAll 호출 시에만 필요 → 유효 아닐 땐 건너뜀
  }, [nftAddress, unminted]);

  // 쓰기 전용 검증(approve/setApprovalForAll) — 엄격
  const validateWrite = useCallback(() => {
    if (unminted) throw new Error('NFT가 아직 발급되지 않았습니다.');
    if (!isAddress(nftAddress)) throw new Error('잘못된 NFT 주소입니다.');
    if (!isAddress(spender)) throw new Error('승인 대상(spender) 주소가 유효하지 않습니다.');
  }, [nftAddress, spender, unminted]);

  const refresh = useCallback(async () => {
    setError('');
    try {
      // ✅ 미발급이면 조회 스킵 (질문 주신 부분 반영)
      if (unminted) {
        setOwner('');
        setApproved(ZeroAddress);
        setApprovedForAll(false);
        return;
      }

      validateRead();

      // ✅ 읽기는 지갑 연결 없이 public provider로
      const provider = await getProvider();

      // (선택) 연결돼 있으면 내 계정 표시
      try {
        const addr = await getAccount();
        setAccount(addr);
      } catch {
        // 계정 연결 안 되어 있으면 무시
      }

      const erc721 = new Contract(nftAddress, ERC721_MIN_ABI, provider);

      const ownerOf: string = await erc721.ownerOf(tid);
      const currentApproved: string = await erc721.getApproved(tid);

      let isAll = false;
      if (spenderIsValid) {
        // ✅ spender가 유효할 때만 isApprovedForAll 호출
        isAll = await erc721.isApprovedForAll(ownerOf, spender);
      }

      setOwner(ownerOf);
      setApproved(currentApproved);
      setApprovedForAll(Boolean(isAll));
    } catch (e: any) {
      setError("소유권 이전 중 오류가 발생하였습니다. 잠시 후 다시 시도해주세요!");
    }
  }, [nftAddress, spender, tid, validateRead, unminted, spenderIsValid]);

  useEffect(() => {
    // spender가 아직 유효 주소가 아니더라도 읽기는 수행하여 owner/getApproved는 최신화
    if (!nftAddress || tokenId === undefined) return;
    void refresh();
  }, [nftAddress, tokenId, spender, refresh]);

  const approveToken = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      validateWrite();

      const signer = await getSigner(requiredChainId);
      const erc721 = new Contract(nftAddress, ERC721_MIN_ABI, signer);

      if (owner && spender && owner.toLowerCase() === spender.toLowerCase()) {
        throw new Error('소유자 주소로는 approve 할 수 없습니다. (ERC721 규칙)');
      }

      const tx = await erc721.approve(spender, tid);
      const receipt = await tx.wait();
      await refresh();
      return receipt;
    } catch (e: any) {
      setError("소유권 이전 중 오류가 발생하였습니다. 잠시 후 다시 시도해주세요!");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [nftAddress, spender, tid, owner, refresh, requiredChainId, validateWrite]);

  const setApprovalForAll = useCallback(async (enable: boolean) => {
    setLoading(true);
    setError('');
    try {
      validateWrite();

      const signer = await getSigner(requiredChainId);
      const erc721 = new Contract(nftAddress, ERC721_MIN_ABI, signer);

      if (owner && spender && owner.toLowerCase() === spender.toLowerCase()) {
        throw new Error('소유자 자신을 operator로 지정할 수 없습니다.');
      }

      const tx = await erc721.setApprovalForAll(spender, enable);
      const receipt = await tx.wait();
      await refresh();
      return receipt;
    } catch (e: any) {
      setError("소유권 이전 설정 중 오류가 발생하였습니다. 잠시 후 다시 시도해주세요!");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [nftAddress, spender, owner, refresh, requiredChainId, validateWrite]);

  const isAlreadyApproved =
    !unminted &&
    spenderIsValid &&
    (approved?.toLowerCase() === spender.toLowerCase() || approvedForAll);

  return {
    account,
    owner,
    approved,
    approvedForAll,
    isAlreadyApproved,
    loading,
    error,
    refresh,
    approveToken,
    setApprovalForAll,
    unminted,
  };
}
