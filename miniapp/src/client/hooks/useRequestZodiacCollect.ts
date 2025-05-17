"use client";

import { useState, useCallback } from "react";

import { ZodiacApiEnum } from "~/client/types/client.types";

export type GetRequestZodiacCollectResponse =
  | {
      success: true;
      pieces: `0x${string}`[];
      dataPayload: `0x${string}`;
    }
  | {
      success: false;
      message?: string;
    };

export function useRequestZodiacCollect() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [response, setResponse] =
    useState<GetRequestZodiacCollectResponse | null>(null);

  const forceClearState = useCallback(() => {
    setIsLoading(false);
    setIsError(false);
    setResponse(null);
    setErrorMessage(undefined);
  }, []);

  const requestZodiacMint = useCallback(
    async ({
      zodiacSign,
      address,
      amount = null,
    }: {
      zodiacSign: ZodiacApiEnum;
      address: string;
      amount?: number | null;
    }) => {
      if (!zodiacSign) {
        setIsError(true);
        setErrorMessage("Zodiac sign is required");
        return;
      }
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
          "/api/collect/western_zodiac/request",
          window.location.origin,
        );

        url.searchParams.append("zodiac", zodiacSign);
        url.searchParams.append("address", address.toLowerCase());

        if (!!amount) {
          url.searchParams.append("amount", amount.toString());
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

        setResponse(data as GetRequestZodiacCollectResponse);
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
    pieces: response?.success ? response.pieces : [],
    dataPayload: response?.success ? response.dataPayload : undefined,
    forceClearState,
    requestZodiacMint,
  };
}
