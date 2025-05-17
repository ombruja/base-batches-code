"use client";

import { ElementType, ReactNode, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";

import { cn } from "~/client/lib/utils";

export function FancyButton({
  borderRadius = "3rem",
  disabled = false,
  basic = false,
  highlight = false,
  small = false,
  square = false,
  // borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: {
  borderRadius?: string;
  disabled?: boolean;
  basic?: boolean;
  highlight?: boolean;
  small?: boolean;
  square?: boolean;
  children: ReactNode;
  as?: ElementType;
  containerClassName?: string;
  borderClassName?: string;
  duration?: number;
  className?: string;
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | React.ReactNode
    | React.CSSProperties
    | React.ElementType
    | ((event: React.MouseEvent<HTMLElement>) => void);
}) {
  if (disabled) {
    return (
      <button
        className={cn(
          `relative w-full bg-slate-400/20 border border-slate-800 ${square ? "aspect-square text-base font-bold" : small ? "h-8 text-sm" : "h-12 text-base font-bold"} `,
          className,
        )}
        disabled
        style={{
          borderRadius: borderRadius,
        }}
      >
        {children}
      </button>
    );
  } else if (basic) {
    return (
      <button
        className={cn(
          `relative w-full bg-slate-950/80 border-slate-800 focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${square ? "aspect-square text-base font-bold" : small ? "h-8 text-sm border" : "h-12 text-base font-bold border"} `,
          className,
        )}
        {...otherProps}
        style={{
          borderRadius: borderRadius,
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <Component
      className={cn(
        `relative w-full overflow-hidden bg-transparent p-[1px] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${square ? "aspect-square text-xl" : small ? "h-8 text-base" : "h-12 text-xl"}`,
        containerClassName,
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx="30%" ry="30%">
          <div
            className={cn(
              "h-20 w-20 bg-[radial-gradient(#0ea5e9_40%,transparent_60%)] opacity-[0.8]",
              borderClassName,
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          // "relative flex h-full w-full items-center justify-center border border-slate-800 text-base text-white antialiased backdrop-blur-xl bg-amber-500/5 border-amber-200 font-bold",
          `relative flex h-full w-full items-center justify-center border border-slate-800 text-base text-white antialiased backdrop-blur-xl ${highlight ? "bg-amber-500/50" : "bg-slate-950/80"} border-amber-200 font-bold`,
          className,
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
}

export const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | null
    | React.ReactNode
    | React.CSSProperties
    | React.ElementType;
}) => {
  const pathRef = useRef<SVGPathElement | null>(null);
  const progress = useMotionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x,
  );
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y,
  );

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <rect
          fill="none"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry}
          ref={pathRef as React.RefObject<SVGRectElement>}
        />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  );
};
