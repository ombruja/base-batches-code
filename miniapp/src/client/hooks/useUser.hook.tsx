"use client";

import { useEffect, useState, useTransition } from "react";
import { usePrivy } from "@privy-io/react-auth";

import { ClientUserData } from "~/client/types/client.types";

type FetchUserResponse = {
  isAuthenticated: boolean;
  user: ClientUserData | null;
};

// Store for the cached data
let cachedUserData: {
  userDetails: FetchUserResponse | null;
  error: Error | null;
} | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

// Async function to fetch user data without caching it with React cache
async function fetchUserData(): Promise<{
  userDetails: FetchUserResponse | null;
  error: Error | null;
}> {
  try {
    const response = await fetch("/api/user/me");

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const userDetails = await response.json();

    // Update cache
    cachedUserData = { userDetails, error: null };
    lastFetchTime = Date.now();

    return cachedUserData;
  } catch (error) {
    console.error("Error fetching user:", error);
    const errorObj = {
      userDetails: null,
      error: error instanceof Error ? error : new Error("Unknown error"),
    };

    // Update cache with error
    cachedUserData = errorObj;
    lastFetchTime = Date.now();

    return errorObj;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { authenticated, ready } = usePrivy();

  useEffect(() => {
    if (authenticated && ready) {
      // Preload user data
      fetchUserData();
    }
  }, [authenticated, ready]);

  return children;
}

export function useUser() {
  const { authenticated, ready } = usePrivy();
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{
    userDetails: FetchUserResponse | null;
    error: Error | null;
  }>(() => cachedUserData || { userDetails: null, error: null });

  // Load data when component mounts
  useEffect(() => {
    if (ready) {
      // Check if we have valid cached data
      const now = Date.now();
      if (cachedUserData && now - lastFetchTime < CACHE_TTL) {
        setState(cachedUserData);
        setIsLoadingUser(false);
        return;
      }

      // Otherwise fetch new data
      if (authenticated) {
        setIsLoadingUser(true);
        fetchUserData().then((result) => {
          setState(result);
          setIsLoadingUser(false);
        });
      } else {
        setIsLoadingUser(false);
      }
    }
  }, [authenticated, ready]);

  // Define refetch function
  const refetch = () => {
    setIsLoadingUser(true);

    // Use startTransition to avoid blocking the UI
    startTransition(() => {
      fetchUserData().then((result) => {
        setState(result);
        setIsLoadingUser(false);
      });
    });
  };

  return {
    isLoadingUser: isLoadingUser || isPending,
    userDetails: state.userDetails,
    error: state.error,
    refetch,
  };
}
