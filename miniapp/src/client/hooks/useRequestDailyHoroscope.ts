"use client";

import { useState, useCallback } from "react";

export type GetRequestDailyHoroscopeResponse =
  | {
      success: true;
      onchainId: `0x${string}`;
      dataPayload: `0x${string}`;
    }
  | {
      success: false;
      message?: string;
    };

export function useRequestDailyHoroscope() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [response, setResponse] =
    useState<GetRequestDailyHoroscopeResponse | null>(null);

  const requestDailyHoroscope = useCallback(
    async ({ address }: { address: string }) => {
      if (!address) {
        setIsError(true);
        setErrorMessage("Address is required");
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setResponse(null);
      setErrorMessage(undefined);

      try {
        // Build URL with query parameters
        const url = new URL(
          "/api/collect/daily_horoscope/request",
          window.location.origin,
        );
        if (!!address) {
          url.searchParams.append("address", address.toLowerCase());
        }

        const res = await fetch(url.toString());
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || data.message || "Failed to fetch zodiac request",
          );
        }

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch zodiac request");
        }

        setResponse(data as GetRequestDailyHoroscopeResponse);
      } catch (error) {
        setIsError(true);
        setErrorMessage(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
        setResponse({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    isError,
    errorMessage,
    response,
    tokenId: response?.success ? response.onchainId : undefined,
    dataPayload: response?.success ? response.dataPayload : undefined,
    requestDailyHoroscope,
  };
}
