"use client";

import { useEffect, useState } from "react";

import { useMiniKit, useOpenUrl } from "@coinbase/onchainkit/minikit";
// import { useMiniKit } from "~/client/components/local-minikit/minikit/hooks/useMiniKit";
import { usePrivy } from "@privy-io/react-auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleLoader } from "react-spinners";

import LoadingPanelAuth from "~/client/components/LoadingPanelAuth";
import AuthenticatedLayout from "~/client/components/layout/AuthenticatedLayout";
import { FancyButton } from "~/client/components/ui/fancy-button";
import ErrorPanel from "~/client/components/ErrorPanel";
import ProfileSettingsSheet from "~/client/components/ProfileSettingsSheet";
import ProfileWalletsSheet from "~/client/components/ProfileWalletsSheet";
import ShowHoroscope from "~/client/components/ShowHoroscope";
import { useHoroscopeAll } from "~/client/hooks/useHoroscopeAll";
import { useUser } from "~/client/hooks/useUser.hook";
import { getZodiacSign } from "~/client/lib/utils";

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { context } = useMiniKit();
  const { authenticated, ready } = usePrivy();
  const { userDetails, error, isLoadingUser } = useUser();
  const [isOpenProfileSettings, setOpenProfileSettings] =
    useState<boolean>(false);
  const [isOpenWalletSettings, setOpenWalletSettings] =
    useState<boolean>(false);
  const openUrl = useOpenUrl();
  const router = useRouter();

  const handleOpenProfileSettings = (nextValue: boolean) => {
    if (nextValue && isOpenWalletSettings) {
      // Close the wallet settings sheet
      setOpenWalletSettings(false);
    }
    setOpenProfileSettings(nextValue);
  };

  const handleOpenWalletSettings = (nextValue: boolean) => {
    if (nextValue && isOpenProfileSettings) {
      // Close the profile settings sheet
      setOpenProfileSettings(false);
    }
    setOpenWalletSettings(nextValue);
  };

  const {
    isLoading: isLoadingHoroscope,
    error: horoscopeError,
    horoscopes,
    refetch: refetchHoroscopes,
  } = useHoroscopeAll();

  useEffect(() => {
    if (ready) {
      if (!authenticated) {
        router.push("/login");
      }
    }
  }, [authenticated, ready, router]);

  const handleInterestForm = async () => {
    openUrl(process.env.NEXT_PUBLIC_ARTIST_INTEREST_FORM_URL || "");
  };

  if (isLoading || isLoadingUser) {
    return <LoadingPanelAuth />;
  }

  if (error) {
    return <ErrorPanel errorMessage={error.message} />;
  }

  // Determine the zodiac sign based on the user's birthday
  let zodiacSignUrl = null;

  if (userDetails?.user?.dob) {
    const [, month, day] = userDetails?.user?.dob.split("-").map(Number);
    zodiacSignUrl = getZodiacSign(month, day).src;
  }

  const returnedHoroscopes = horoscopes ? horoscopes : [];

  return (
    <>
      <AuthenticatedLayout>
        <div className="flex flex-col p-4 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
              <div
                className="relative aspect-square"
                style={{
                  width: "5rem",
                  height: "5rem",
                }}
              >
                <img
                  src={context?.user.pfpUrl ? context.user.pfpUrl : "/icon.png"}
                  alt="Profile Image"
                  className="border rounded-lg shadow-lg border-transparent select-none"
                  style={{
                    aspectRatio: "1/1",
                    width: "100%",
                    height: "100%",
                    borderRadius: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div className="flex flex-col">
                <h2 className="text-xl mb-0">
                  {context?.user.username
                    ? `@${context?.user.username}`
                    : userDetails?.user?.name
                      ? userDetails?.user?.name
                      : "Unknown"}
                  {/* {user?.name || privyUser?.email?.address || "Your Profile"} */}
                </h2>

                {userDetails?.user?.dob ? (
                  <p className="text-base mt-1 text-white/60 select-none">
                    {(() => {
                      const today = new Date();
                      const dob = new Date(userDetails.user.dob);
                      const birthday = new Date(
                        today.getFullYear(),
                        dob.getMonth(),
                        dob.getDate(),
                      );

                      const isBirthdayToday =
                        today.getMonth() === dob.getMonth() &&
                        today.getDate() === dob.getDate();

                      // If birthday has passed this year, use next year's birthday
                      if (today > birthday) {
                        birthday.setFullYear(today.getFullYear() + 1);
                      }

                      const diffTime = birthday.getTime() - today.getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      );

                      return `${isBirthdayToday ? "Happy Birthday!" : `${diffDays} days till your birthday!`}`;
                    })()}
                  </p>
                ) : (
                  <Link href="/dob">
                    <button
                      className="text-white flex flex-row items-center"
                      disabled={isLoading}
                    >
                      <h3
                        className={`flex select-none ${
                          isLoading ? "text-slate-400" : "text-amber-400"
                        } text-base text-center items-center`}
                      >
                        Add Birthday
                      </h3>
                    </button>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex flex-row justify-between gap-2 w-full">
              <FancyButton
                onClick={() => handleOpenProfileSettings(true)}
                small
              >
                Settings
              </FancyButton>
              <FancyButton onClick={() => handleOpenWalletSettings(true)} small>
                Wallets
              </FancyButton>
            </div>
          </div>

          {userDetails?.user?.dob && (
            <div className="flex flex-col gap-4 px-0 py-0 border rounded-lg shadow-lg bg-transparent border-transparent">
              <h2 className="text-xl text-center font-bold mb-0 select-none">
                Cosmic Identity
              </h2>
              {zodiacSignUrl && (
                <div className="flex flex-row gap-4 w-full justify-center">
                  <div className="flex flex-col w-1/3">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={zodiacSignUrl}
                        alt="Zodiac Sign"
                        className="border rounded-lg shadow-lg border-transparent select-none"
                        fill
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 w-full justify-center">
                <p className="text-white text-center select-none">
                  Your Cosmic Identity is the unique signature the universe
                  gifted you at birth — a map written in the language of stars.
                </p>
                <p className="text-white text-center select-none">
                  It begins with your Zodiac Sign, a key that unlocks the first
                  doorway into who you are and who you can become. As you
                  explore it, you step into the infinite possibilities of your
                  own magic, your own becoming.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full items-center">
            <div className="relative w-full">
              <h2 className="text-xl text-center font-bold mb-0 select-none">
                Collected Horoscopes
              </h2>
              {/* {returnedHoroscopes.length > 0 && (
              <div className="text-white/60 text-base font-normal italic text-center mt-0 select-none">
                <h3>Click to see the horoscope</h3>
              </div>
            )} */}
            </div>

            <div className="flex flex-col gap-4 w-full mb-4">
              {isLoadingHoroscope ? (
                <div className="flex w-full h-full justify-center items-center pt-4">
                  <CircleLoader
                    color={"#FFD700"}
                    size={150}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    loading
                  />
                </div>
              ) : horoscopeError ? (
                <div className="flex flex-col gap-4 w-full px-4 justify-center items-center">
                  <h1 className="text-center text-slate-200/80">
                    Error loading horoscopes
                  </h1>
                </div>
              ) : returnedHoroscopes.length === 0 ? (
                <div className="flex flex-col gap-4 w-full px-4 justify-center items-center">
                  <h1 className="text-center text-slate-200/80">
                    No horoscopes collected
                  </h1>
                </div>
              ) : (
                Array.from({
                  length: Math.ceil(returnedHoroscopes.length / 5),
                }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex flex-row gap-4 w-full">
                    {[0, 1, 2, 3, 4].map((colIndex) => {
                      const pieceIndex = rowIndex * 5 + colIndex;
                      return pieceIndex < returnedHoroscopes.length ? (
                        <ShowHoroscope
                          key={pieceIndex}
                          horoscope={returnedHoroscopes[pieceIndex]}
                          index={pieceIndex}
                        />
                      ) : (
                        <div
                          key={`empty-${colIndex}`}
                          className="flex flex-col w-1/5"
                        />
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col items-center w-full pt-4 gap-4">
            <h2 className="text-xl text-center font-bold mb-0 select-none">
              Are you an artist?
            </h2>
            <FancyButton onClick={() => handleInterestForm()} highlight>
              Artist Interest Form
            </FancyButton>
          </div>
        </div>
      </AuthenticatedLayout>

      <ProfileSettingsSheet
        isOpen={isOpenProfileSettings}
        setIsLoading={setIsLoading}
        setOpen={handleOpenProfileSettings}
      />

      <ProfileWalletsSheet
        isOpen={isOpenWalletSettings}
        isLoading={isLoading || isLoadingUser}
        user={userDetails?.user || null}
        refetchHoroscopes={refetchHoroscopes}
        setOpen={handleOpenWalletSettings}
      />
    </>
  );
}
