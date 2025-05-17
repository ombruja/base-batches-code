"use client";

import { useCallback, useEffect } from "react";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/frame-sdk";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import CircleLoader from "react-spinners/CircleLoader";

import { useHoroscopeDay } from "~/client/hooks/useHoroscopeDay";
import { FancyButton } from "~/client/components/ui/fancy-button";
import { useUser } from "~/client/hooks/useUser.hook";
import { CastEmbedType } from "~/client/types/client.types";

export default function DailyHoroscopePanel({
  isSuccess,
  isRootPageLoading,
  clickCollect,
  internalImage = null,
  setInternalImage,
  setIsSuccess,
}: {
  isSuccess: boolean;
  isRootPageLoading: boolean;
  internalImage?: string | null;
  clickCollect: () => void;
  setInternalImage: (imageUrl: string) => void;
  setIsSuccess: (isSuccess: boolean) => void;
}) {
  const { context } = useMiniKit();

  // Get today's date in YYYY-MM-DD format
  const now = new Date();
  // Adjust for GMT-4 by adding 4 hours to UTC time
  // UTC-4 = UTC + (-4 hours)
  const gmtMinus4Offset = -4 * 60 * 60 * 1000; // -4 hours in milliseconds
  const nowInGMT4 = new Date(
    // First convert to UTC, then apply GMT-4 offset
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
    ) + gmtMinus4Offset,
  );

  const todayDateString = format(nowInGMT4, "yyyy-MM-dd");

  // Use the hook to fetch today's horoscope
  const {
    isLoading: isLoadingHoroscope,
    error: horoscopeError,
    horoscope,
  } = useHoroscopeDay();

  useEffect(() => {
    if (!isLoadingHoroscope && horoscope) {
      setInternalImage(horoscope.image_url);
      setIsSuccess(true);
    }
  }, [horoscope, isLoadingHoroscope]);

  const { userDetails } = useUser();

  // Default fallback images
  const coverImage = `/images/horoscope/cover/${todayDateString}.png`;

  const clickShare = useCallback(async () => {
    const embeds: CastEmbedType = ["", ""];

    embeds[0] = !!internalImage ? internalImage : coverImage;

    // mini appUrl
    if (process.env.NEXT_PUBLIC_URL) {
      // embeds[0] = `${process.env.NEXT_PUBLIC_URL}/profile`;
      embeds[1] = `${process.env.NEXT_PUBLIC_URL}/profile`;
    } else {
      // remove the second embed
      embeds.pop();
    }

    await sdk.actions.composeCast({
      text: "Just collected my AI-driven Daily Horoscope from Astrology by @ombruja . Collect and share yours too! /ombruja 🔮",
      embeds,
      close: false,
    });
  }, [internalImage]);

  let buttonContent = null;

  if (isLoadingHoroscope) {
    buttonContent = <FancyButton disabled>Loading...</FancyButton>;
  } else if (isRootPageLoading) {
    buttonContent = <FancyButton disabled>Collecting...</FancyButton>;
  } else if (!userDetails?.user?.dob) {
    buttonContent = (
      <Link href="/dob">
        <FancyButton>Add Birthday</FancyButton>
      </Link>
    );
  } else if (isSuccess && context) {
    buttonContent = <FancyButton onClick={clickShare}>Share</FancyButton>;
  } else if (isSuccess && !context) {
    buttonContent = null;
  } else {
    buttonContent = <FancyButton onClick={clickCollect}>Collect</FancyButton>;
  }

  return (
    <>
      <div className="relative w-full aspect-square">
        <div className="flex flex-col items-center justify-center relative w-full aspect-square">
          <Image
            src={isSuccess && !!internalImage ? internalImage : coverImage}
            alt="Daily Horoscope"
            className={`border rounded-lg shadow-lg border-neutral-200/30 select-none ${
              isRootPageLoading ? "opacity-80" : "opacity-100"
            }`}
            fill
            style={{
              objectFit: "cover",
            }}
          />

          {(isLoadingHoroscope || isRootPageLoading) && (
            <CircleLoader
              color={"#FFD700"}
              size={150}
              aria-label="Loading Spinner"
              data-testid="loader"
              loading
            />
          )}
        </div>
      </div>

      {horoscopeError && (
        <div className="text-amber-500 text-base font-normal italic text-center mt-2">
          <h3>Could not load today&apos;s horoscope. Using default images.</h3>
        </div>
      )}

      {buttonContent}
    </>
  );
}
