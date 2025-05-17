"use client";

import { useState } from "react";
import Link from "next/link";

import { Carousel } from "~/client/components/ui/carousel";
import { FancyButton } from "~/client/components/ui/fancy-button";
import TopBarWithBack from "~/client/components/TopBarWithBack";
import { zodiacList } from "~/client/types/client.types";

export default function App() {
  const [current, setCurrent] = useState(0);

  return (
    <div className="min-h-screen flex items-center flex-col w-full h-full">
      <TopBarWithBack title="Select a Zodiac Sign" backButtonHref="/" />

      <div className="relative overflow-hidden w-full h-full">
        <Carousel
          current={current}
          setCurrent={setCurrent}
          slides={zodiacList}
          showBorder
        />
      </div>

      <div className="absolute flex flex-row items-center bottom-10 w-full gap-4 px-4">
        <Link className="w-full" href={`/collect/${zodiacList[current].slug}`}>
          <FancyButton>Select</FancyButton>
        </Link>
      </div>
    </div>
  );
}
