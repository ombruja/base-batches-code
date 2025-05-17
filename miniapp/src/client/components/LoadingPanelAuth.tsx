"use client";

import CircleLoader from "react-spinners/CircleLoader";

import NavBottom from "~/client/components/NavBottom";
import NavTop from "~/client/components/NavTop";

// import { Vortex } from "~/client/components/ui/vortex";

export default function LoadingPanelAuth() {
  return (
    <div
      style={{
        // Set up a flex column layout
        display: "flex",
        flexDirection: "column",
        // Make sure it takes the full viewport height
        height: "100vh",
        // Ensure content doesn't overflow
        overflow: "hidden",
      }}
    >
      <NavTop />
      <div className="flex flex-col flex-1 w-full items-center justify-center">
        {/* <Vortex
        backgroundColor="transparent"
        baseHue={35}
        rangeHue={15}
        baseSpeed={1}
        rangeSpeed={0.5}
        rangeY={1000}
        particleCount={50}
      /> */}

        <CircleLoader
          color={"#FFD700"}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
          loading
        />

        <h3 className="text-white text-xl font-normal text-center mt-4">
          Loading...
        </h3>
      </div>

      {/* Bottom nav stays at natural height */}
      <NavBottom disableNavigation />
    </div>
  );
}
