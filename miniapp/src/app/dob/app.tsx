"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { FancyButton } from "~/client/components/ui/fancy-button";
import LoadingPanelAuth from "~/client/components/LoadingPanelAuth";
import AuthenticatedLayout from "~/client/components/layout/AuthenticatedLayout";
import { useUser } from "~/client/hooks/useUser.hook";
import { useUpdateUserDob } from "~/client/hooks/useUpdateUserDob.hook";

export default function App() {
  const { updateUserDob, isUpdating } = useUpdateUserDob();
  const { authenticated, ready } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isLoadingUser, userDetails } = useUser();

  const [selectedDate, setSelectedDate] = useState<Date>();

  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (ready && !isLoadingUser) {
      if (userDetails?.user?.dob) {
        setSelectedDate(new Date(userDetails?.user?.dob));
      }
    }
  }, [ready, authenticated, isLoadingUser, userDetails]);

  const handleUpdate = async () => {
    setIsLoading(true);
    if (!selectedDate) {
      setUpdateErrorMessage("Please select your date of birth");
      setIsLoading(false);
      return;
    }
    // Check if the user is under 16
    if (selectedDate > new Date(new Date().getFullYear() - 16, 0, 1)) {
      setUpdateErrorMessage("You must be at least 16 years old");
      setIsLoading(false);
      return;
    }

    try {
      // Format date as ISO string for the API if it exists
      const dobIso = selectedDate ? selectedDate.toISOString() : null;

      const result = await updateUserDob({
        dob: dobIso,
      });

      if (result.success) {
        // Redirect to home page on successful onboarding
        router.push("/");
      } else {
        setUpdateErrorMessage(result.message);
        setIsLoading(false);
      }
    } catch {
      setUpdateErrorMessage(
        "Failed to complete onboarding. Please refresh the page and try again. If the problem persists, please contact support.",
      );
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    // Don't allow the user to select a date that is in the future
    if (!date || date > new Date(2025, 0, 1)) {
      setSelectedDate(new Date(2025, 0, 1));
    } else {
      setSelectedDate(date);
    }
  };

  if (isLoadingUser || isUpdating) {
    return <LoadingPanelAuth />;
  }

  return (
    <AuthenticatedLayout disableNavigation={isLoading}>
      <div className="flex flex-col">
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

        {updateErrorMessage && (
          <div className="flex flex-row justify-center w-full gap-4 px-4 mt-4">
            <h3 className="text-red-400 text-center text-lg">
              {updateErrorMessage}
            </h3>
          </div>
        )}

        <div className="absolute flex flex-col items-center bottom-10 w-full gap-4 px-4">
          <FancyButton onClick={() => handleUpdate()}>Update</FancyButton>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
