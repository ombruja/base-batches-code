"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
// import { useMiniKit } from "~/client/components/local-minikit/minikit/hooks/useMiniKit";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, type ReactNode } from "react";

// import AuthForm from "~/client/components/AuthForm";
import LoadingPanel from "~/client/components/LoadingPanel";

// import { useAppState } from "~/client/components/context/appstate.providers";

export function AppRoot({ children }: { children: ReactNode }) {
  // const { state } = useAppState();
  const { ready } = usePrivy();

  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady && ready) {
      setFrameReady();
    }
  }, [isFrameReady, ready, setFrameReady]);

  if (!ready) {
    return <LoadingPanel />;
  }

  // if (!state.isAuth) {
  //   return <AuthForm />;
  // }

  return children;
}
