"use client";

import {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";

import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Image, { ImageProps } from "next/image";

import { useOutsideClick } from "~/client/hooks/use-outside-click";
import { cn } from "~/client/lib/utils";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
  emptyBlock?: JSX.Element;
  clickedIndex: number;
  setClickedIndex: (index: number) => void;
  disabled?: boolean;
  hideButtons?: boolean;
}

type CardContent = {
  src: string;
  srcSelected: string;
  title?: string;
  category?: string;
  content?: ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const CarouselTight = ({
  items,
  initialScroll = 0,
  emptyBlock = (
    <div className="text-center text-white/80 py-4 italic">No items</div>
  ),
  setClickedIndex,
  hideButtons = false,
  disabled = false,
}: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    return window && window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto pb-4 scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div
            className={cn("h-auto w-[5%] overflow-hidden bg-gradient-to-l")}
          ></div>

          <div
            className={cn(
              "flex flex-row justify-start gap-4 pl-4",
              "max-w-7xl mx-auto", // remove max-w-4xl if you want the carousel to span the full width of its container
            )}
          >
            {items.length > 0
              ? items.map((item, index) => (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.4,
                        delay: 0.1 * index,
                        ease: "easeOut",
                        once: true,
                      },
                    }}
                    key={"card" + index}
                    className="last:pr-[5%]  rounded-3xl"
                    onClick={
                      disabled ? undefined : () => setClickedIndex(index)
                    }
                  >
                    {item}
                  </motion.div>
                ))
              : emptyBlock}
          </div>
        </div>

        {!hideButtons && (
          <div className="flex justify-end gap-2 mr-10">
            <button
              className="relative h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
              onClick={scrollLeft}
              disabled={!canScrollLeft || disabled}
            >
              <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
            </button>
            <button
              className="relative h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
              onClick={scrollRight}
              disabled={!canScrollRight || disabled}
            >
              <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </CarouselContext.Provider>
  );
};

export const CarouselCard = ({
  card,
  index,
  layout = false,
  hideTextOnPopUp = false,
  hideTextOnCarousel = false,
  isSelected = false,
  disabled = false,
}: {
  card: CardContent;
  index: number;
  layout?: boolean;
  hideTextOnPopUp?: boolean;
  hideTextOnCarousel?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  const handleOpen = () => {
    if (!!card.content) {
      setOpen(true);
    }
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    onCardClose(index);
  }, [index, onCardClose]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  useOutsideClick(containerRef, () => handleClose());

  return (
    <>
      <AnimatePresence>
        {open && !!card.content && (
          <div className="fixed inset-0 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/80 backdrop-blur-lg h-full w-full fixed inset-0"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={containerRef}
              layoutId={layout ? `card-${index}` : undefined}
              className="max-w-5xl mx-auto bg-white h-fit my-10 p-4 rounded-3xl font-sans relative"
            >
              <button
                className="sticky top-4 h-8 w-8 right-0 ml-auto bg-black rounded-full flex items-center justify-center"
                onClick={handleClose}
              >
                <IconX className="h-6 w-6 text-neutral-100" />
              </button>
              <p className="select-none">{card.title}</p>
              {!hideTextOnPopUp && !!card.category && (
                <motion.p
                  layoutId={layout ? `category-${index}` : undefined}
                  className="text-base font-medium text-black"
                >
                  {card.category}
                </motion.p>
              )}
              {!hideTextOnPopUp && !!card.title && (
                <motion.p
                  layoutId={layout ? `title-${index}` : undefined}
                  className="text-2xl font-semibold text-neutral-700 mt-4 select-none"
                >
                  {card.title}
                </motion.p>
              )}
              {!!card.content && <div className="py-10">{card.content}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${index}` : undefined}
        onClick={!!card.content ? handleOpen : undefined}
        className={cn(
          "rounded-full bg-slate-300/0 overflow-hidden flex flex-col items-start justify-start relative border-2",
          isSelected
            ? ` ${disabled ? "border-slate-500" : "border-white"}`
            : " border-transparent",
        )}
      >
        <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="relative p-8">
          {!hideTextOnCarousel && card.category && (
            <motion.p
              layoutId={layout ? `category-${card.category}` : undefined}
              className="text-white text-sm font-medium font-sans text-left"
            >
              {card.category}
            </motion.p>
          )}
          {!hideTextOnCarousel && card.title && (
            <motion.p
              layoutId={layout ? `title-${index}` : undefined}
              className="text-white text-xl font-semibold max-w-xs text-left [text-wrap:balance] font-sans mt-2"
            >
              {card.title}
            </motion.p>
          )}
        </div>
        <BlurImage
          src={isSelected ? card.srcSelected : card.src}
          alt={card.title ?? ""}
          className="object-cover absolute inset-0 select-none"
          height={65}
          width={65}
        />
      </motion.button>

      <p
        className={`text-sm text-center mt-2 select-none ${
          isSelected && !disabled ? "text-white" : "text-white/70"
        }`}
      >
        {card.title}
      </p>
    </>
  );
};

export const BlurImage = ({
  height,
  width,
  src,
  className,
  alt,
  ...rest
}: ImageProps) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <Image
      className={cn(
        "transition duration-300 select-none",
        isLoading ? "blur-sm" : "blur-0",
        className,
      )}
      onLoad={() => setLoading(false)}
      src={src}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      blurDataURL={typeof src === "string" ? src : undefined}
      alt={alt ? alt : "Background image"}
      {...rest}
    />
  );
};
