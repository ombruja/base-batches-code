"use client";

import { useState, useEffect, useCallback } from "react";

import { WesternZodiacPiece, ZodiacApiEnum } from "~/client/types/client.types";

export type GetZodiacPiecesResponse =
  | {
      success: true;
      zodiacSignCounts: Record<ZodiacApiEnum, number>;
      zodiacSignToPieceListingMap: Record<ZodiacApiEnum, WesternZodiacPiece[]>;
      pieceIdMap: Record<string, WesternZodiacPiece>;
    }
  | {
      success: false;
      message?: string;
    };

export function useZodiacPieces(zodiacSign?: string) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [zodiacSignCounts, setZodiacSignCounts] = useState<
    Record<ZodiacApiEnum, number>
  >({
    [ZodiacApiEnum.ARIES]: 0,
    [ZodiacApiEnum.TAURUS]: 0,
    [ZodiacApiEnum.GEMINI]: 0,
    [ZodiacApiEnum.CANCER]: 0,
    [ZodiacApiEnum.LEO]: 0,
    [ZodiacApiEnum.VIRGO]: 0,
    [ZodiacApiEnum.LIBRA]: 0,
    [ZodiacApiEnum.SCORPIO]: 0,
    [ZodiacApiEnum.SAGITTARIUS]: 0,
    [ZodiacApiEnum.CAPRICORN]: 0,
    [ZodiacApiEnum.AQUARIUS]: 0,
    [ZodiacApiEnum.PISCES]: 0,
  });
  const [zodiacSignToPieceListingMap, setZodiacSignToPieceListingMap] =
    useState<Record<ZodiacApiEnum, WesternZodiacPiece[]>>({
      [ZodiacApiEnum.ARIES]: [],
      [ZodiacApiEnum.TAURUS]: [],
      [ZodiacApiEnum.GEMINI]: [],
      [ZodiacApiEnum.CANCER]: [],
      [ZodiacApiEnum.LEO]: [],
      [ZodiacApiEnum.VIRGO]: [],
      [ZodiacApiEnum.LIBRA]: [],
      [ZodiacApiEnum.SCORPIO]: [],
      [ZodiacApiEnum.SAGITTARIUS]: [],
      [ZodiacApiEnum.CAPRICORN]: [],
      [ZodiacApiEnum.AQUARIUS]: [],
      [ZodiacApiEnum.PISCES]: [],
    });
  const [pieceIdMap, setPieceIdMap] = useState<
    Record<string, WesternZodiacPiece>
  >({});

  const fetchZodiacPieces = useCallback(async (passedZodiacSign?: string) => {
    setLoading(true);
    setError(null);

    try {
      // Build URL with optional zodiac sign filter
      const url = passedZodiacSign
        ? `/api/art/zodiac?zodiac_sign=${passedZodiacSign}`
        : "/api/art/zodiac";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: GetZodiacPiecesResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Unknown error fetching zodiac pieces");
      }

      setPieceIdMap(data.pieceIdMap);
      setZodiacSignCounts(data.zodiacSignCounts);
      setZodiacSignToPieceListingMap(data.zodiacSignToPieceListingMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Error fetching zodiac pieces:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZodiacPieces(zodiacSign).catch((err) => {
      // Already handled in fetchZodiacPieces
      console.debug("Initial fetch failed:", err);
    });
  }, [fetchZodiacPieces, zodiacSign]);

  return {
    error,
    loading,
    pieceIdMap,
    zodiacSignCounts,
    zodiacSignToPieceListingMap,
    refetch: fetchZodiacPieces,
  };
}
