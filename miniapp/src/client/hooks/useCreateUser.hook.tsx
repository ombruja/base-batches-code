"use client";

import { useState, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { ClientUserData } from "~/client/types/client.types";

type CreateUserResponse = {
  success: boolean;
  user: ClientUserData | null;
  message: string;
};

export function useCreateUser() {
  const { user: privyUser } = usePrivy();
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [newUser, setNewUser] = useState<ClientUserData | null>(null);

  const createUser = useCallback(async (): Promise<CreateUserResponse> => {
    if (!privyUser) {
      setError(new Error("User must be authenticated to create an account"));
      return {
        success: false,
        user: null,
        message: "User must be authenticated to create an account",
      };
    }

    setIsCreatingUser(true);
    setError(null);

    try {
      const response = await fetch("/api/user/create", {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create user: ${response.status} ${errorText}`,
        );
      }

      const data = await response.json();
      setNewUser(data.user);

      return {
        success: true,
        user: data.user,
        message: "User created successfully",
      };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error creating user");
      setError(error);

      return {
        success: false,
        user: null,
        message: error.message,
      };
    } finally {
      setIsCreatingUser(false);
    }
  }, [privyUser]);

  return {
    createUser,
    isCreatingUser,
    error,
    newUser,
  };
}
