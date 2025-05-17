"use client";

import { useState } from "react";

import { DailyHoroscopeUrlElement } from "~/client/types/client.types";

interface DailyHoroscopeResponse {
  success: boolean;
  date: string;
  id: string;
  url: string;
}

interface UseCollectDailyHoroscopeProps {
  onSuccess?: (response: DailyHoroscopeResponse) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useCollectDailyHoroscope(
  props?: UseCollectDailyHoroscopeProps,
) {
  const { onSuccess, onError, onComplete } = props || {};
  const [dailyHoroscopeUrl, setDailyHoroscopeUrl] =
    useState<DailyHoroscopeUrlElement | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Collect a daily horoscope
   */
  const collectDailyHoroscope = async ({
    onchainId,
    mintedAddress,
    transactionHash,
  }: {
    onchainId: string;
    mintedAddress: string;
    transactionHash: string;
  }) => {
    if (!onchainId || !mintedAddress || !transactionHash) {
      const error = new Error(
        "Missing required parameters: onchainId, mintedAddress, or transactionHash",
      );
      setError(error);
      onError?.(error);
      onComplete?.();
      return null;
    }

    setIsLoading(true);
    setError(null);
    setDailyHoroscopeUrl(null);

    try {
      const response = await fetch("/api/collect/daily_horoscope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          onchainId: onchainId.toLowerCase(),
          mintedAddress: mintedAddress.toLowerCase(),
          transactionHash: transactionHash.toLowerCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to collect daily horoscope");
      }

      setDailyHoroscopeUrl({
        date: result.date,
        id: result.id,
        url: result.url,
      });
      setIsLoading(false);
      if (onSuccess && result) {
        onSuccess(result as DailyHoroscopeResponse);
      }
      onComplete?.();

      return result as DailyHoroscopeResponse;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);

      onError?.(error);
      onComplete?.();

      return null;
    }
  };

  return {
    dailyHoroscopeUrl,
    isLoading,
    error,
    collectDailyHoroscope,
  };
}
