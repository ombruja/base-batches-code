"use client";

import { useEffect, useState, Suspense } from "react";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

import LoadingPanel from "~/client/components/LoadingPanel";
// import LoadingPanelAuth from "~/client/components/LoadingPanelAuth";
import NavBottom from "~/client/components/NavBottom";
import NavTop from "~/client/components/NavTop";
import { PageTransition } from "~/client/components/ui/page-transition";
import { ScrollArea } from "~/client/components/ui/scroll-area";
import { useUser } from "~/client/hooks/useUser.hook";

export default function AuthenticatedLayout({
  children,
  disableNavigation = false,
}: {
  children: React.ReactNode;
  disableNavigation?: boolean;
}) {
  const [showLoading, setShowLoading] = useState(true);
  const { authenticated, ready } = usePrivy();
  const { context } = useMiniKit();
  const router = useRouter();
  const { isLoadingUser, userDetails } = useUser();

  useEffect(() => {
    if (ready) {
      if (!authenticated) {
        router.push("/login");
      } else if (!isLoadingUser) {
        if (!userDetails?.user || !userDetails.user.isOnboarded) {
          // User does not have an account or they are not onboarded. Send the user to the onboarding page
          router.push("/onboarding");
        } else {
          setShowLoading(false);
        }
      }
    }
  }, [authenticated, ready, router, userDetails, isLoadingUser]);

  if (!ready || showLoading) {
    return <LoadingPanel />;
  }

  return (
    <Suspense fallback={<LoadingPanel />}>
      <div
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
        {/* Top nav stays at natural height */}
        <NavTop />

        {/* Scrollable area grows to fill available space */}
        <ScrollArea className="flex-1 w-full">
          <PageTransition>{children}</PageTransition>
        </ScrollArea>

        {/* Bottom nav stays at natural height */}
        <NavBottom disableNavigation={disableNavigation} />
      </div>
    </Suspense>
  );
}
