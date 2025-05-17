"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnalyticsBrowser } from "@segment/analytics-next";

import { useUser } from "~/client/hooks/useUser.hook";

export const analytics = AnalyticsBrowser.load({
  writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY!,
});

export default function Analytics() {
  const { userDetails, isLoadingUser } = useUser();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    analytics.page();
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isLoadingUser && userDetails?.user) {
      analytics.identify(userDetails.user.privyAccountId, {
        accountLoginType: userDetails.user.accountLoginType,
        farcasterAccountId: userDetails.user.farcasterAccountId,
        id: userDetails.user.id,
        isAuthenticated: userDetails.isAuthenticated,
        isOnboarded: userDetails.user.isOnboarded,
        name: userDetails.user.name,
        privyAccountId: userDetails.user.privyAccountId,
      });
    }
  }, [isLoadingUser, userDetails]);

  return null;
}
