// hooks/useDelivery.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDelivery, postRecipientAddress } from "@/lib/delivery";
import type { DeliveryInfo, DeliveryStatus } from "@/types/delivery";

type Options = {
  poll?: boolean;            // 기본: true
  intervalMs?: number;       // 기본: 10s
  addressId?: number;        // 선택
  staleTime?: number;        // 기본: 10s
  gcTime?: number;           // 기본: 5m
};

const isTerminalStatus = (s?: DeliveryStatus) =>
  s === "CONFIRMED" || s === "COMPLETED" || s === "CANCELLED_BY_USER";

export function useDelivery(auctionId: number, opts: Options = {}) {
  const {
    poll = true,
    intervalMs = 10_000,
    addressId,
    staleTime = 10_000,
    gcTime = 5 * 60 * 1000,
  } = opts;

  const qc = useQueryClient();

  const deliveryQuery = useQuery<DeliveryInfo | undefined>({
    queryKey: ["delivery", auctionId, addressId],
    queryFn: async () => {
      const data = await getDelivery(auctionId, addressId);
      // types/delivery.ts에 맞춰 envelope -> result만 반환
      return data.result;
    },
    enabled: !!auctionId,
    // TanStack v4: refetchInterval은 (query) => number | false 형태
    refetchInterval: (query) => {
      if (!poll) return false;
      const data = query.state.data as DeliveryInfo | undefined;
      const s = data?.status as DeliveryStatus | undefined;
      return isTerminalStatus(s) ? false : intervalMs;
    },
    staleTime,
    gcTime,
  });

  const setRecipientMutation = useMutation({
    mutationFn: async (newAddressId: number) => {
      const data = await postRecipientAddress(auctionId, newAddressId);
      return data.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["delivery", auctionId, addressId] });
    },
  });

  const info = deliveryQuery.data;
  const status: DeliveryStatus = info?.status ?? "WAITING";

  const hasRecipient = !!info?.recipientAddress?.id;
  const hasSeller = !!info?.senderAddress?.id;
  const hasTracking = !!info?.trackingNumber;
  const needsRecipient = !hasRecipient;
  const isTerminal = isTerminalStatus(status);

  const errorMessage =
    deliveryQuery.error instanceof Error ? deliveryQuery.error.message : "";

  return {
    // 원본
    info,
    status,
    loading: deliveryQuery.isLoading,
    refetching: deliveryQuery.isRefetching,
    success: deliveryQuery.isSuccess,
    error: deliveryQuery.isError,
    errorMessage,
    refetch: deliveryQuery.refetch,

    // 파생 상태
    hasRecipient,
    hasTracking,
    hasSeller,
    needsRecipient,
    isTerminal,

    // 액션(구매자)
    setRecipient: setRecipientMutation.mutateAsync,
    settingRecipient: setRecipientMutation.isPending,
  };
}
