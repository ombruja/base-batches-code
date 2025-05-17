"use client";

import Link from "next/link";

import { FancyButton } from "~/client/components/ui/fancy-button";
import { Vortex } from "~/client/components/ui/vortex";

export default function ErrorPanel({ errorMessage }: { errorMessage: string }) {
  return (
    <div className="min-h-screen flex items-center flex-col justify-center w-full h-full">
      <Vortex
        backgroundColor="transparent"
        baseHue={35}
        rangeHue={15}
        baseSpeed={1}
        rangeSpeed={0.5}
        rangeY={1000}
        particleCount={50}
      />

      <div className="flex flex-col items-center justify-center">
        <h1 className="text-white text-4xl font-normal text-center">Error!</h1>

        <h3 className="text-white text-xl font-normal text-center mt-4 px-4">
          {errorMessage}
        </h3>
      </div>

      <div className="absolute flex flex-col items-center bottom-10 w-full gap-4 px-4">
        <Link className="w-full" href="/">
          <FancyButton>Home</FancyButton>
        </Link>
      </div>
    </div>
  );
}
