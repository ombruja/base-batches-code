"use client";

import { useEffect, useState, useCallback, ChangeEvent } from "react";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { FancyButton } from "~/client/components/ui/fancy-button";
import ErrorPanel from "~/client/components/ErrorPanel";
import LoadingPanel from "~/client/components/LoadingPanel";
import TopBarWithBack from "~/client/components/TopBarWithBack";
import { useUser } from "~/client/hooks/useUser.hook";
import { useCreateUser } from "~/client/hooks/useCreateUser.hook";
import { useOnboardUser } from "~/client/hooks/useOnboardUser.hook";
import { AccountLoginType } from "~/client/types/client.types";

enum Page {
  NAME = "NAME",
  DOB = "DOB",
}

export default function App() {
  const { createUser } = useCreateUser();
  const { onboardUser, isOnboarding } = useOnboardUser();
  const { authenticated, ready, user: privyUser, logout } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);
  const { isLoadingUser, userDetails, refetch } = useUser();
  const { context } = useMiniKit();

  const [nameText, setNameText] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [onboardingErrorMessage, setOnboardingErrorMessage] = useState<
    string | null
  >(null);
  const [page, setPage] = useState<Page>(Page.NAME);

  const isFarcasterUser =
    userDetails?.user?.accountLoginType === AccountLoginType.FARCASTER;

  const handleCreateUser = useCallback(async () => {
    setIsCreatingUser(true);
    setErrorMessage(null);

    // Check if user already exists
    if (userDetails?.user) {
      router.push("/login");
      return;
    }

    try {
      // Create the user with default account type
      const result = await createUser();

      if (result.success) {
        // Refresh user data after creation
        refetch();
      } else {
        setErrorMessage(
          `Failed to create user. Please refresh the page and try again. If the problem persists, please contact support.`,
        );
      }
    } catch {
      setErrorMessage(
        `Please refresh the page and try again. If the problem persists, please contact support.`,
      );
    } finally {
      setIsCreatingUser(false);
    }
  }, [router, userDetails, createUser, refetch]);

  useEffect(() => {
    if (ready && !isLoadingUser && !errorMessage) {
      if (authenticated) {
        // The user has completed the privy flow
        if (!userDetails?.user) {
          // User does not have an account
          if (!isCreatingUser) {
            // User does not have an account create one
            handleCreateUser();
          }
        } else if (userDetails.user.isOnboarded) {
          // User is onboarded. Send the user to the home page
          router.push("/");
        } else {
          // User has an account but is not onboarded.
          if (isFarcasterUser) {
            setPage(Page.DOB);
          }
          // If the user has a name from Farcaster, pre-fill it
          if (isFarcasterUser && privyUser?.farcaster?.username) {
            setNameText(privyUser.farcaster.username);
          }
          setIsLoading(false);
        }
      } else {
        // The user is not authenticated
        router.push("/login");
      }
    }
  }, [
    authenticated,
    errorMessage,
    handleCreateUser,
    isCreatingUser,
    isFarcasterUser,
    isLoadingUser,
    router,
    ready,
    userDetails,
    privyUser,
  ]);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
  };

  const handleNext = () => {
    if (page === Page.NAME) {
      setPage(Page.DOB);
    }
  };

  const handleBack = () => {
    if (page === Page.DOB) {
      setPage(Page.NAME);
    }
  };

  const handleFinish = async (isSkippingDob: boolean = false) => {
    if (!nameText.trim()) {
      setOnboardingErrorMessage("Please enter your name");
      return;
    }
    if (!isSkippingDob) {
      if (!selectedDate) {
        setOnboardingErrorMessage("Please select your date of birth");
        return;
      }
      // Check if the user is under 16
      if (selectedDate > new Date(new Date().getFullYear() - 16, 0, 1)) {
        setOnboardingErrorMessage("You must be at least 16 years old");
        return;
      }
    }

    try {
      // Format date as ISO string for the API if it exists
      const dobIso =
        !isSkippingDob && selectedDate ? selectedDate.toISOString() : null;

      const result = await onboardUser({
        name: nameText.trim(),
        dob: dobIso,
      });

      if (result.success) {
        // Redirect to home page on successful onboarding
        router.push("/");
      } else {
        setOnboardingErrorMessage(result.message);
      }
    } catch {
      setOnboardingErrorMessage(
        "Failed to complete onboarding. Please refresh the page and try again. If the problem persists, please contact support.",
      );
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    // Don't allow the user to select a date that is in the future
    if (!date || date > new Date()) {
      setSelectedDate(new Date());
    } else {
      setSelectedDate(date);
    }
  };

  if (isLoading || isLoadingUser || isCreatingUser || isOnboarding) {
    return <LoadingPanel />;
  }

  if (errorMessage) {
    return <ErrorPanel errorMessage={errorMessage} />;
  }

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow letters and numbers (alphanumeric characters)
    const newValue = e.target.value;

    // Use regex to filter out non-alphanumeric characters
    const filteredValue = newValue.replace(/[^a-zA-Z0-9\s]/g, "");

    // Update state with the filtered value
    setNameText(filteredValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // When the user presses enter, move to the next page
    if (e.key === "Enter") {
      handleNext();
    }
  };

  return (
    <div
      className="items-center w-full px-4"
      style={{
        // Set up a flex column layout
        display: "flex",
        flexDirection: "column",
        // Make sure it takes the full viewport height
        height: "100dvh",
        // Ensure content doesn't overflow
        overflow: "hidden",

        // Counteract what the MiniKitProvider does
        marginTop: context?.client.safeAreaInsets?.top
          ? -context.client.safeAreaInsets.top
          : 0,
        marginBottom: context?.client.safeAreaInsets?.bottom
          ? -context.client.safeAreaInsets.bottom
          : 0,
        marginLeft: context?.client.safeAreaInsets?.left
          ? -context.client.safeAreaInsets.left
          : 0,
        marginRight: context?.client.safeAreaInsets?.right
          ? -context.client.safeAreaInsets.right
          : 0,
      }}
    >
      <TopBarWithBack
        title={
          page === Page.NAME
            ? "What is your name?"
            : "When is your date of birth?"
        }
        titleInformationPopOut={
          <p className="text-sm text-white/80">
            None of your personal information will be sent onchain.
          </p>
        }
        leftSideElement={
          page === Page.DOB && !isFarcasterUser ? (
            <button
              className="text-white flex flex-row items-center"
              onClick={handleBack}
              disabled={isLoading}
            >
              <h3
                className={`flex ${
                  isLoading ? "text-slate-400" : "text-amber-400"
                } text-base text-center items-center`}
              >
                Back
              </h3>
            </button>
          ) : null
        }
        rightSideElement={
          <button
            className="text-white flex flex-row items-center"
            onClick={handleLogout}
            disabled={isLoading}
          >
            <h3
              className={`flex ${
                isLoading ? "text-slate-400" : "text-amber-400"
              } text-base text-center items-center`}
            >
              Logout
            </h3>
          </button>
        }
        hideLeftSide
      />
      {page === Page.NAME ? (
        <div className="relative w-full">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 rounded-md bg-slate-950 text-white h-[4rem] text-center text-lg border border-amber-400/50"
              value={nameText}
              onChange={handleTextChange}
              onKeyDown={handleKeyPress}
              pattern="[a-zA-Z0-9\s]+"
              title="Only letters, numbers, and spaces are allowed"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full">
          <DayPicker
            animate
            mode="single"
            captionLayout="dropdown"
            defaultMonth={new Date(2000, 0, 1)}
            startMonth={new Date(1920, 1)}
            endMonth={new Date(2025, 0, 1)}
            selected={selectedDate}
            onSelect={(date) => handleDateSelect(date)}
            className="border border-amber-400/20 rounded-md p-2 bg-black/20"
          />
        </div>
      )}
      {onboardingErrorMessage && (
        <div className="flex flex-row justify-center w-full gap-4 px-4 mt-4">
          <h3 className="text-red-400 text-center text-lg">
            {onboardingErrorMessage}
          </h3>
        </div>
      )}
      <div className="absolute flex flex-col items-center bottom-10 w-full gap-4 px-4">
        {page === Page.DOB ? (
          <>
            <FancyButton onClick={() => handleFinish()}>Finish</FancyButton>
            <FancyButton onClick={() => handleFinish(true)} basic>
              Skip
            </FancyButton>
          </>
        ) : (
          <FancyButton
            onClick={nameText.length > 0 ? handleNext : null}
            disabled={nameText.length === 0}
          >
            Next
          </FancyButton>
        )}
      </div>
    </div>
  );
}
