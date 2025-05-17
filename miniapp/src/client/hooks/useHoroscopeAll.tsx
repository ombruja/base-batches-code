"use client";

import { useState, useEffect, useCallback } from "react";

import { HoroscopeDayParams } from "~/server/types/database.types";

interface UseHoroscopeAllResult {
  horoscopes: HoroscopeDayParams[] | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch a user's horoscope for a specific day
 * @param initialDate - Optional date in YYYY-MM-DD format. If not provided, uses current date.
 * @returns Object containing the horoscope data, loading state, error state, and refetch function
 */
export function useHoroscopeAll(): UseHoroscopeAllResult {
  const [horoscopes, setHoroscopes] = useState<HoroscopeDayParams[] | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHoroscope = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/horoscopes`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch horoscope");
      }

      const data = await response.json();
      setHoroscopes(data.horoscopes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setHoroscopes(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch on mount or when date changes
  useEffect(() => {
    fetchHoroscope();
  }, [fetchHoroscope]);

  // Function to manually refetch with optional new date
  const refetch = async () => {
    await fetchHoroscope();
  };

  return { horoscopes, isLoading, error, refetch };
}
