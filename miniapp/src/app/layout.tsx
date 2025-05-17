import "~/app/globals.css";
// import "./theme.css";
// import "@coinbase/onchainkit/styles.css";

import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { Suspense } from "react";

import { getSession } from "~/auth";
import { AppStateProvider } from "~/client/components/context/appstate.providers";
import { MinikitWrapper } from "~/client/components/context/minikit.wrapper";
import LoadingPanel from "~/client/components/LoadingPanel";
import { Starfield } from "~/client/components/ui/starfield";
import { ShootingStars } from "~/client/components/ui/shooting-stars";
import Analytics from "~/client/lib/analytics.lib";

// Initialize the Roboto font with selected weights
const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Astrology",
  description: "Unlock your cosmic identity",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className={`overflow-hidden ${roboto.className}`}>
        <Starfield
          starCount={1500}
          starColor={[255, 255, 255]}
          speedFactor={0.05}
          starSize={3}
          backgroundColor="black"
        />

        <ShootingStars />

        <div className="absolute inset-0">
          <AppStateProvider session={session}>
            <MinikitWrapper>
              <Suspense fallback={<LoadingPanel />}>{children}</Suspense>

              <Analytics />
            </MinikitWrapper>
          </AppStateProvider>
        </div>
      </body>
    </html>
  );
}
