"use client";

import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
// import { MiniKitProvider } from "~/client/components/local-minikit/minikit/MiniKitProvider";
import { PrivyProvider } from "@privy-io/react-auth";
import { type ReactNode } from "react";
import { base } from "viem/chains";

import { UserProvider } from "~/client/hooks/useUser.hook";

import { AppRoot } from "./approot";

export function MinikitWrapper({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";
  const clientId = process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID ?? "";
  const privyAccentColor = !!process.env.NEXT_PUBLIC_PRIVY_ACCENT_COLOR
    ? `#${process.env.NEXT_PUBLIC_PRIVY_ACCENT_COLOR}`
    : "#676FFF";
  const privyBackgroundColor = !!process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR
    ? `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`
    : "#110d1a";
  const privyIconUrl = process.env.NEXT_PUBLIC_PRIVY_ICON_URL ?? "";

  const minikitApiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY ?? "";
  const minikitProjectName =
    process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME ?? "";

  const logoUrl = process.env.NEXT_PUBLIC_ICON_URL ?? "";
  const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL ?? "";

  return (
    <MiniKitProvider
      apiKey={minikitApiKey}
      chain={base}
      config={{
        appearance: {
          mode: "dark",
          name: minikitProjectName,
          logo: logoUrl,
        },
        paymaster: paymasterUrl,
      }}
    >
      <PrivyProvider
        appId={appId}
        clientId={clientId}
        config={{
          // Customize Privy's appearance in your app
          appearance: {
            // theme: "dark",
            theme: privyBackgroundColor as `#${string}`,
            accentColor: privyAccentColor as `#${string}`,
            logo: privyIconUrl,
          },
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            createOnLogin: "all-users",
          },
          defaultChain: base,
          supportedChains: [base],
        }}
      >
        <AppRoot>
          <UserProvider>{children}</UserProvider>
        </AppRoot>
      </PrivyProvider>
    </MiniKitProvider>
  );
}
