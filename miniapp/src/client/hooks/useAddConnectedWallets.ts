"use client";

import { useState } from "react";

interface ConnectedWallet {
  id: string;
  user_id: string;
  wallet_address: string;
  created_at: string;
}

interface UseAddConnectedWalletsProps {
  onSuccess?: (wallet: ConnectedWallet) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export function useAddConnectedWallets(props?: UseAddConnectedWalletsProps) {
  const { onSuccess, onError, onComplete } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Connect a wallet address to a user
   */
  const addConnectedWallet = async (walletAddress: string) => {
    if (!walletAddress) {
      const error = new Error("Missing required parameters: walletAddress");
      setError(error);
      onError?.(error);
      onComplete?.();
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/connected-wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: walletAddress.toLowerCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to connect wallet");
      }

      setIsLoading(false);

      if (onSuccess && result.data) {
        onSuccess(result.data as ConnectedWallet);
      }
      onComplete?.();

      return result.data as ConnectedWallet;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);

      onError?.(error);
      onComplete?.();

      return null;
    }
  };

  return {
    addConnectedWallet,
    isLoading,
    error,
  };
}
