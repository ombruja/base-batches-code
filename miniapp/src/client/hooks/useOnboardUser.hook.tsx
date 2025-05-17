"use client";

import { useState } from "react";

import { useUser } from "~/client/hooks/useUser.hook";
import { ClientUserData } from "~/client/types/client.types";

interface OnboardUserInput {
  name?: string | null;
  dob?: string | null; // ISO string format or null
}

type OnboardUserResponse = {
  success: boolean;
  user: ClientUserData | null;
  message: string;
};

export function useOnboardUser() {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [onboardedUser, setOnboardedUser] = useState<ClientUserData | null>(
    null,
  );
  const { refetch } = useUser();

  const onboardUser = async ({
    name = null,
    dob = null,
  }: OnboardUserInput): Promise<OnboardUserResponse> => {
    if (!name) {
      setError(new Error("Name is required"));
      return {
        success: false,
        user: null,
        message: "Name is required",
      };
    }

    setIsOnboarding(true);
    setError(null);

    try {
      const response = await fetch("/api/user/onboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          dob,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to onboard user: ${response.status} ${errorText}`,
        );
      }

      const data = await response.json();
      setOnboardedUser(data.user);

      // Refresh user data in the global context
      await refetch();

      return {
        success: true,
        user: data.user,
        message: "User onboarded successfully",
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error onboarding user");
      setError(error);

      return {
        success: false,
        user: null,
        message: error.message,
      };
    } finally {
      setIsOnboarding(false);
    }
  };

  return {
    onboardUser,
    isOnboarding,
    error,
    onboardedUser,
  };
}
