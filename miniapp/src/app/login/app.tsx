"use client";

import { useCallback, useEffect, useState } from "react";

import sdk from "@farcaster/frame-sdk";
import { useAddFrame, useMiniKit } from "@coinbase/onchainkit/minikit";
// import {
//   // useAuthenticate,
//   useMiniKit,
// } from "~/client/components/local-minikit/minikit";
import { usePrivy } from "@privy-io/react-auth";
import { useLoginToFrame } from "@privy-io/react-auth/farcaster";
import Image from "next/image";
import { useRouter } from "next/navigation";

import LoadingPanel from "~/client/components/LoadingPanel";
import { FancyButton } from "~/client/components/ui/fancy-button";
import { Vortex } from "~/client/components/ui/vortex";
import { useUser } from "~/client/hooks/useUser.hook";

export default function App() {
  const [showLoading, setShowLoading] = useState(true);
  // const { signIn } = useAuthenticate();
  // const { userDetails, isLoading, error, refetch } = useSuspendedUser();
  const { isLoadingUser, userDetails } = useUser();
  const addFrame = useAddFrame();
  const { context } = useMiniKit();

  // Usage
  const handleAddFrame = useCallback(async () => {
    const result = await addFrame();
    if (result) {
      console.log("Frame added:", result.url, result.token);
    }
  }, [addFrame]);

  // const { isModalOpen, ready, login } = usePrivy();
  const { authenticated, isModalOpen, ready, login } = usePrivy();
  const router = useRouter();
  const { initLoginToFrame, loginToFrame } = useLoginToFrame();

  useEffect(() => {
    if (ready) {
      if (!!context && !context.client.added) {
        handleAddFrame();
      }

      if (!isLoadingUser) {
        if (isModalOpen) {
          setShowLoading(true);
        } else if (authenticated) {
          // The user has completed the privy flow
          if (!userDetails?.user || !userDetails.user.isOnboarded) {
            // User does not have an account or they are not onboarded. Send the user to the onboarding page
            router.push("/onboarding");
          } else {
            // User has an account and is onboarded send them to the home page
            router.push("/");
          }
        } else {
          // The user has not completed the privy flow
          setShowLoading(false);
        }
      }
    }
  }, [
    authenticated,
    context,
    isLoadingUser,
    isModalOpen,
    ready,
    router,
    userDetails,
    handleAddFrame,
  ]);

  const handleSignIn = async () => {
    // If the user is in farcaster, we need to login to frame
    if (!!context) {
      try {
        const { nonce } = await initLoginToFrame();

        // const result = await signIn({ nonce });

        const result = await sdk.actions.signIn({ nonce });

        if (result) {
          // Send the received signature from Warpcast to Privy for authentication
          await loginToFrame({
            message: result.message,
            signature: result.signature,
          });
        }
      } catch (error) {
        console.log("--- --- --- error");
        console.log(error);
      }
    } else {
      login();
    }
  };

  const handleCollect = () => {
    setShowLoading(true);
    router.push("/collect");
  };

  if (showLoading || isModalOpen || isLoadingUser) {
    return <LoadingPanel />;
  }

  return (
    <div
      className="items-center justify-center w-full"
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
      <Vortex
        backgroundColor="transparent"
        baseHue={35}
        rangeHue={15}
        baseSpeed={1}
        rangeSpeed={0.5}
        rangeY={1000}
        particleCount={50}
      />

      <div className="flex flex-col flex-1 items-center justify-end">
        <Image
          className="object-cover select-none"
          alt="Logo"
          src="/icon.png"
          loading="eager"
          decoding="sync"
          width={120}
          height={120}
        />
      </div>

      <div className="flex flex-col flex-1 items-center justify-center">
        <h2 className="text-white text-2xl font-bold text-center mb-2 select-none">
          Welcome to Astrology
        </h2>
        <h4 className="text-white text-lg text-center select-none">
          by OMBRUJA
        </h4>
      </div>

      <div className="flex flex-col items-center mb-10 w-full px-4 gap-4">
        <p className="text-white/80 max-w-xl text-center mb-4 text-base/7 select-none">
          Collect curated zodiac art and your AI-driven daily horoscope to
          unlock your cosmic identity.
        </p>
        <FancyButton onClick={handleSignIn}>Get Started</FancyButton>
        <FancyButton onClick={handleCollect} basic>
          Collect Zodiacs
        </FancyButton>
      </div>
    </div>
  );
}
