"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { CircleLoader } from "react-spinners";

import AuthenticatedLayout from "~/client/components/layout/AuthenticatedLayout";
import CollectArtSheet from "~/client/components/CollectArtSheet";
import ShowArtPiece from "~/client/components/ShowArtPiece";
import {
  CarouselTight,
  CarouselCard,
} from "~/client/components/ui/carousel-tight";
import { FancyButton } from "~/client/components/ui/fancy-button";
import { useZodiacPieces } from "~/client/hooks/useZodiacPieces";
import { WesternZodiacPiece, zodiacList } from "~/client/types/client.types";

export function DisplayCollectionCarousel({
  disabled,
  selectedElementIndex,
  setSelectedElementIndex,
}: {
  disabled: boolean;
  selectedElementIndex: number;
  setSelectedElementIndex: (index: number) => void;
}) {
  // Calculate initial scroll position based on selected index
  // This calculation needs to account for card width and gap
  const getInitialScrollPosition = () => {
    // Card width and gap from carousel-tight.tsx
    const cardWidth = 68;
    const gap = 16;

    // // Account for the 5% padding and left padding
    // const leftPadding =
    //   typeof window !== "undefined" ? window.innerWidth * 0.05 : 0;

    // Calculate position (accounting for card width, gap, and any offsets)
    return Math.max(
      0,
      selectedElementIndex * (cardWidth + gap) - (cardWidth + gap) / 2,
    );
  };

  // Convert pieces to card format expected by CarouselCard
  const cards = zodiacList
    .map((element, index) => ({
      category: element.title,
      title: `${element.title}`,
      src: element.srcStamp,
      srcSelected: element.srcStamp,
      id: index,
    }))
    .map((card, index) => (
      <CarouselCard
        key={card.id || index}
        card={card}
        index={index}
        hideTextOnCarousel
        isSelected={index === selectedElementIndex}
        disabled={disabled}
      />
    ));

  return (
    <div className="w-full h-full">
      <CarouselTight
        items={cards}
        clickedIndex={selectedElementIndex}
        setClickedIndex={setSelectedElementIndex}
        disabled={disabled}
        hideButtons
        initialScroll={getInitialScrollPosition()}
      />
    </div>
  );
}

export default function App({ initialZodiac }: { initialZodiac?: string }) {
  const { context } = useMiniKit();
  const [isOpen, setOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Get initial zodiac index if provided and valid
  const getInitialZodiacIndex = (): number => {
    if (!initialZodiac) return 0;

    // Try to find the zodiac in the list (case insensitive)
    const normalizedZodiac = initialZodiac.toLowerCase();
    const index = zodiacList.findIndex(
      (zodiac) =>
        zodiac.title.toLowerCase() === normalizedZodiac ||
        zodiac.enum.toLowerCase() === normalizedZodiac,
    );

    // Return found index or default to 0 if not found
    return index >= 0 ? index : 0;
  };

  const [selectedElementIndex, setSelectedElementIndex] = useState<number>(
    getInitialZodiacIndex(),
  );
  const selectedElement = zodiacList[selectedElementIndex];

  const {
    loading: isLoadingPiecesMine,
    zodiacSignToPieceListingMap,
    zodiacSignCounts,
    refetch: refetchZodiacPieces,
  } = useZodiacPieces();

  const [isRootPageLoading, setIsRootPageLoading] = useState(false);
  const [successIndex, setSuccessIndex] = useState(0);

  const incrementSuccessIndex = useCallback(() => {
    setSuccessIndex(successIndex + 1);
  }, [successIndex]);

  const [pieces, setPieces] = useState<WesternZodiacPiece[]>([]);

  useEffect(() => {
    if (!isLoadingPiecesMine) {
      // Start fresh so that the animation can work again
      setPieces([]);
      setPieces(zodiacSignToPieceListingMap[selectedElement.enum]);
    }
  }, [
    isLoadingPiecesMine,
    selectedElement.enum,
    selectedElementIndex,
    zodiacSignToPieceListingMap,
  ]);

  useEffect(() => {
    refetchZodiacPieces();
  }, [successIndex, refetchZodiacPieces]);

  const isLoading = isRootPageLoading || isLoadingPiecesMine;

  const totalPiecesCollectedCount =
    zodiacSignToPieceListingMap[selectedElement.enum].length;

  const totalPiecesCount = zodiacSignCounts[selectedElement.enum];

  return (
    <>
      <AuthenticatedLayout disableNavigation={isLoading}>
        <div className="w-[100vw]">
          {/* <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-2">Collection</h1>
        </div> */}

          <DisplayCollectionCarousel
            selectedElementIndex={selectedElementIndex}
            setSelectedElementIndex={setSelectedElementIndex}
            disabled={isLoading}
          />

          <div className="flex flex-row justify-between p-4 w-full">
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold">
                {/* {selectedElement.symbol}{" "} */}
                {selectedElement.title}
              </h1>
            </div>
            {!isLoading && (
              <div className="flex flex-col justify-center">
                <h3 className="text-base font-normal text-neutral-200">
                  Collected {totalPiecesCollectedCount} of {totalPiecesCount}
                </h3>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex w-full h-full justify-center items-center pt-4">
              <CircleLoader
                color={"#FFD700"}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
                loading
              />
            </div>
          ) : pieces.length === 0 ? null : (
            <div className="flex flex-col gap-2 w-full px-4 pb-16">
              {Array.from({ length: Math.ceil(pieces.length / 3) }).map(
                (_, rowIndex) => (
                  <div key={rowIndex} className="flex flex-row gap-2 w-full">
                    {[0, 1, 2].map((colIndex) => {
                      const pieceIndex = rowIndex * 3 + colIndex;
                      return pieceIndex < pieces.length ? (
                        <ShowArtPiece
                          key={pieceIndex}
                          piece={pieces[pieceIndex]}
                          index={pieceIndex}
                        />
                      ) : (
                        <div
                          key={`empty-${colIndex}`}
                          className="flex flex-col w-1/3"
                        />
                      );
                    })}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {!isLoading && (
          <div
            className={`fixed bottom-4 ${pieces.length === 0 ? "left-4 right-4" : "right-4"}`}
            style={{
              marginBottom: context?.client.safeAreaInsets?.bottom ?? 0,
            }}
          >
            <div className="mb-16" ref={buttonRef}>
              <FancyButton
                className={`px-6`}
                onClick={() => setOpen(true)}
                disabled={isLoading}
                highlight
              >
                Collect{pieces.length > 0 ? "  More " : " "}
                {selectedElement.title}
              </FancyButton>
            </div>
          </div>
        )}
        {!isLoading && pieces.length === 0 && (
          <div className="flex flex-col gap-4 w-full px-4 mt-8 justify-center items-center">
            <h1 className="text-center text-slate-200/80">
              No artwork collected
            </h1>
          </div>
        )}
      </AuthenticatedLayout>

      <CollectArtSheet
        isOpen={isOpen}
        selectedZodiacElement={selectedElement}
        totalPiecesCollectedCount={totalPiecesCollectedCount}
        totalPiecesCount={totalPiecesCount}
        setOpen={setOpen}
        setIsRootPageLoading={setIsRootPageLoading}
        setIsSuccess={incrementSuccessIndex}
      />
    </>
  );
}
