"use client";

import { useState } from "react";

import { useUser } from "~/client/hooks/useUser.hook";
import { ClientUserData } from "~/client/types/client.types";

interface UpdateUserDobInput {
  dob: string | null; // ISO string format or null
}

type UpdateUserDobResponse = {
  success: boolean;
  user: ClientUserData | null;
  message: string;
};

export function useUpdateUserDob() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [updatedUser, setUpdatedUser] = useState<ClientUserData | null>(null);
  const { refetch } = useUser();

  const updateUserDob = async ({
    dob = null,
  }: UpdateUserDobInput): Promise<UpdateUserDobResponse> => {
    if (!dob) {
      setError(new Error("Date of birth is required"));
      return {
        success: false,
        user: null,
        message: "Date of birth is required",
      };
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch("/api/user/dob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
      setUpdatedUser(data.user);

      // Refresh user data in the global context
      await refetch();

      return {
        success: true,
        user: data.user,
        message: "User dob updated successfully",
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
      setIsUpdating(false);
    }
  };

  return {
    updateUserDob,
    isUpdating,
    error,
    updatedUser,
  };
}
