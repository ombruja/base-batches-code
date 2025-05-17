"use client";

import { useState, useEffect, useCallback } from "react";

import { HoroscopeDayParams } from "~/server/types/database.types";

interface UseHoroscopeDayResult {
  horoscope: HoroscopeDayParams | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (date?: string) => Promise<void>;
}

/**
 * Hook to fetch a user's horoscope for a specific day
 * @param initialDate - Optional date in YYYY-MM-DD format. If not provided, uses current date.
 * @returns Object containing the horoscope data, loading state, error state, and refetch function
 */
export function useHoroscopeDay(initialDate?: string): UseHoroscopeDayResult {
  const [horoscope, setHoroscope] = useState<HoroscopeDayParams | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [date, setDate] = useState<string | undefined>(initialDate);

  const fetchHoroscope = useCallback(
    async (dateParam?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Use provided date param, or fallback to the state date, or don't include a date (API will use today)
        const queryDate = dateParam || date;
        const queryString = queryDate ? `?date=${queryDate}` : "";

        const response = await fetch(`/api/horoscopes/day${queryString}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch horoscope");
        }

        const data = await response.json();
        setHoroscope(data.horoscope);

        // Update date state if a new date was provided
        if (dateParam && dateParam !== date) {
          setDate(dateParam);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setHoroscope(null);
      } finally {
        setIsLoading(false);
      }
    },
    [date],
  );

  // Initial fetch on mount or when date changes
  useEffect(() => {
    fetchHoroscope();
  }, [date, fetchHoroscope]);

  // Function to manually refetch with optional new date
  const refetch = async (newDate?: string) => {
    await fetchHoroscope(newDate);
  };

  return { horoscope, isLoading, error, refetch };
}
