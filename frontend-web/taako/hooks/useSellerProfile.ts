import { Seller } from "@/types/seller";
import { useState } from "react";

import { useEffect } from "react";
import { getSellerProfile } from "@/lib/profile";

export function useSellerProfile(sellerId: number) {
  const [sellerProfile, setSellerProfile] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      const response = await getSellerProfile(sellerId);
      const data = await response.result;
      setSellerProfile(data);
      setLoading(false);
    };
    fetchSellerProfile();
  }, [sellerId]);

  return { sellerProfile, loading, error };
}
