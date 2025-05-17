"use client";

import { BigNumber } from "alchemy-sdk";
import { useState, useCallback } from "react";

export type GetUserBalanceResponse =
  | {
      success: true;
      allowanceDailyHoroscope: string;
      allowanceZodiac: string;
      usdcBalance: string;
    }
  | {
      success: false;
      message?: string;
    };

export function useUserBalance() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [allowanceDailyHoroscope, setAllowanceDailyHoroscope] =
    useState<BigNumber | null>(null);
  const [allowanceZodiac, setAllowanceZodiac] = useState<BigNumber | null>(
    null,
  );
  const [usdcBalance, setUsdcBalance] = useState<BigNumber | null>(null);

  const fetchUserBalance = useCallback(
    async ({ address = null }: { address?: string | null }) => {
      if (!address) {
        setIsError(true);
        setErrorMessage("Address is required");
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setErrorMessage(undefined);

      try {
        // Build URL with query parameters
        const url = new URL("/api/user/balance", window.location.origin);
        url.searchParams.append("address", address.toLowerCase());

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error("Failed to fetch user balance");
        }

        const data = await response.json();
        setAllowanceDailyHoroscope(
          BigNumber.from(data.allowanceDailyHoroscope),
        );
        setAllowanceZodiac(BigNumber.from(data.allowanceZodiac));
        setUsdcBalance(BigNumber.from(data.usdcBalance));
      } catch (error) {
        setIsError(true);
        setAllowanceDailyHoroscope(null);
        setAllowanceZodiac(null);
        setUsdcBalance(null);
        setErrorMessage(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
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
    usdcBalance,
    allowanceDailyHoroscope,
    allowanceZodiac,
    requestUserBalance: fetchUserBalance,
  };
}
