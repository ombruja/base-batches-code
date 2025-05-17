import { useState } from "react";

import { motion } from "framer-motion";
import Image from "next/image";
import { Dialog } from "radix-ui";

import { FancyButton } from "~/client/components/ui/fancy-button";
import { HoroscopeDayParams } from "~/server/types/database.types";

const ShowHoroscope = ({
  horoscope,
  index,
}: {
  horoscope: HoroscopeDayParams;
  index: number;
}) => {
  const [isShowingInternal, setIsShowingInternal] = useState(false);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              duration: 0.25,
              delay: 0.15 * index,
              ease: "easeOut",
              once: true,
            },
          }}
          key={"card" + index}
          className="rounded-md flex flex-col w-1/5"
        >
          <div className="relative w-full aspect-square">
            <Image
              src={`/images/horoscope/mini/${horoscope.date}.png`}
              alt="Zodiac Sign"
              className="border rounded-lg shadow-lg border-slate-500/50 select-none"
              fill
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        </motion.div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/85 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-0 shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="m-0 hidden">Daily Horoscope</Dialog.Title>
          <div className="mb-5 mt-2.5">
            <div className="relative w-full aspect-square">
              <div className="flex flex-col items-center justify-center relative w-full aspect-square">
                <Image
                  src={
                    isShowingInternal
                      ? horoscope.image_url
                      : `/images/horoscope/cover/${horoscope.date}.png`
                  }
                  alt="Daily Horoscope"
                  className={`border rounded-lg shadow-lg border-neutral-200/30 select-none ${"opacity-100"}`}
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>

            <div className="mt-[25px] flex justify-end">
              <FancyButton
                onClick={() => setIsShowingInternal(!isShowingInternal)}
              >
                {isShowingInternal ? "See Front" : "See Message"}
              </FancyButton>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ShowHoroscope;
