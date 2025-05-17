import {
  useMiniKit,
  useOpenUrl,
  useViewProfile,
} from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/frame-sdk";
import { motion } from "framer-motion";
import Image from "next/image";
import { Dialog } from "radix-ui";

import { FancyButton } from "~/client/components/ui/fancy-button";
import {
  CastEmbedType,
  WesternZodiacPiece,
  ZodiacApiEnum,
  zodiacApiEnumToZodiacSlug,
  zodiacMap,
} from "~/client/types/client.types";

const ShowArtPiece = ({
  piece,
  index,
}: {
  piece: WesternZodiacPiece;
  index: number;
}) => {
  const { context } = useMiniKit();
  const openUrl = useOpenUrl();
  const viewProfile = useViewProfile();

  const clickShare = async () => {
    const embeds: CastEmbedType = [piece.imageUrl, ""];

    // mini appUrl
    if (process.env.NEXT_PUBLIC_URL) {
      embeds[1] = `${process.env.NEXT_PUBLIC_URL}/collection`;
      // embeds[1] = `${process.env.NEXT_PUBLIC_URL}/collection`;
    } else {
      // remove the second embed
      embeds.pop();
    }

    const pieceZodiac = piece.westernZodiacSign.toLowerCase() as ZodiacApiEnum;
    await sdk.actions.composeCast({
      text: `Just collected the zodiac art " ${zodiacMap[zodiacApiEnumToZodiacSlug[pieceZodiac]].title} by @${piece.artistHandle} " on Astrology by @ombruja. Collect and share yours too! ${zodiacMap[zodiacApiEnumToZodiacSlug[pieceZodiac]]?.emoji || ""} /ombruja`,
      embeds,
      close: false,
    });
  };

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
              duration: 0.2,
              delay: 0.05 * index,
              ease: "easeOut",
              once: true,
            },
          }}
          key={"card" + index}
          className="rounded-md flex flex-col w-1/3"
        >
          <div className="relative w-full aspect-square">
            <Image
              src={piece.imageUrl}
              alt="Zodiac Sign"
              className="border rounded-lg shadow-lg border-slate-800 select-none"
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
          <Dialog.Title className="m-0 hidden">
            {piece.westernZodiacSign} by {piece.artistHandle}
          </Dialog.Title>
          <div className="mb-5 mt-2.5">
            <div className="relative w-full aspect-square">
              <div className="flex flex-col items-center justify-center relative w-full aspect-square">
                <Image
                  src={piece.imageUrl}
                  alt="Daily Horoscope"
                  className={`border rounded-lg shadow-lg border-neutral-200/30 select-none ${"opacity-100"}`}
                  fill
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 my-4">
              <FancyButton
                onClick={
                  !!context
                    ? () => viewProfile(piece.artistFid)
                    : () =>
                        openUrl(
                          `${process.env.NEXT_PUBLIC_FARCASTER_URL}/${piece.artistHandle}`,
                        )
                }
              >
                View Artist
              </FancyButton>
              {!!context && (
                <FancyButton onClick={clickShare}>Share</FancyButton>
              )}
            </div>

            {/* <div className="flex flex-col items-center justify-center">
              <p className="text-sm text-neutral-400 italic text-center mb-2 select-none">
                Collected by 10,000+ people
              </p>
            </div> */}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ShowArtPiece;
