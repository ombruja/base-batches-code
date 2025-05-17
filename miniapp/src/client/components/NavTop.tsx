import { Moon } from "lunarphase-js";
import { Popover } from "radix-ui";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

import { Icon, IconEnum, IconSize } from "~/client/components/Icons";
import { getZodiacSign } from "~/client/lib/utils";
import { ZodiacElement } from "~/client/types/client.types";

// Get the abbreviated month name (Jan, Feb, Mar, etc.)
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DateElement = ({ day, month }: { day: number; month: number }) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="flex flex-col items-center">
          <p className="text-4xl pb-1 select-none">{day}</p>
          <p className="text-xs select-none">{monthNames[month]}</p>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="ml-2 p-5 rounded-lg bg-slate-950/95 border border-slate-700 will-change-[transform,opacity] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
          sideOffset={5}
        >
          <div className="flex flex-col items-center gap-4 w-full">
            <DayPicker
              animate
              mode="single"
              captionLayout="dropdown"
              defaultMonth={new Date()}
              startMonth={new Date(1920, 1)}
              endMonth={new Date(2030, 1)}
              selected={new Date()}
              onSelect={() => {}}
            />
          </div>
          <Popover.Close
            className="absolute right-2 top-2 inline-flex size-[25px] cursor-default items-center justify-center rounded-full outline-none"
            aria-label="Close"
          >
            <Icon
              icon={IconEnum.RegularX}
              color={"text-white/80"}
              size={IconSize.Small}
            />
          </Popover.Close>
          <Popover.Arrow className="fill-slate-700" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const MoonElement = () => {
  const phaseEmoji = Moon.lunarPhaseEmoji();
  let phase: string = Moon.lunarPhase();

  // Convert lunar distance Earth radii to miles
  const distance: string = (Moon.lunarDistance() * 3963.1)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  phase =
    phase.toLowerCase() === "new"
      ? "New Moon"
      : phase.toLowerCase() === "full"
        ? "Full Moon"
        : phase;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="flex flex-col items-center">
          <p className="text-6xl select-none">{phaseEmoji}</p>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-56 mr-1 p-5 rounded-lg bg-slate-950/95 border border-slate-700 will-change-[transform,opacity] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
          sideOffset={5}
        >
          <div className="flex flex-col gap-2.5">
            <p className="mt-1 mb-0.5 text-base font-bold text-center select-none">
              Lunar Snapshot
            </p>
            <fieldset className="flex items-center justify-between">
              <p className="text-sm select-none">Phase:</p>
              <p className="text-sm select-none text-amber-400/80">{phase}</p>
            </fieldset>
            <fieldset className="flex items-center justify-between">
              <p className="text-sm select-none">Distance:</p>
              <p className="text-sm select-none text-amber-400/80">
                {distance} mi
              </p>
            </fieldset>
          </div>
          <Popover.Close
            className="absolute right-2 top-2 inline-flex size-[25px] cursor-default items-center justify-center rounded-full outline-none"
            aria-label="Close"
          >
            <Icon
              icon={IconEnum.RegularX}
              color={"text-white/80"}
              size={IconSize.Small}
            />
          </Popover.Close>
          <Popover.Arrow className="fill-slate-700" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const ZodiacSymbol = ({ currentSign }: { currentSign: ZodiacElement }) => (
  <Popover.Root>
    <Popover.Trigger asChild>
      <div className="flex flex-col items-center">
        <p className="text-4xl pb-1 select-none">{currentSign.symbol}</p>
        <p className="text-xs select-none">{currentSign.title}</p>
      </div>
    </Popover.Trigger>

    <Popover.Portal>
      <Popover.Content
        className="w-56 mr-2 p-5 rounded-lg bg-slate-950/95 border border-slate-700 will-change-[transform,opacity] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade"
        sideOffset={5}
      >
        <div className="flex flex-col gap-2.5">
          <p className="mt-1 mb-0.5 text-base font-bold text-center select-none">
            {currentSign.title} Season
          </p>
          <fieldset className="flex items-center justify-between">
            <p className="text-sm select-none text-amber-400/80">
              {monthNames[currentSign.startDate.month - 1]}{" "}
              {currentSign.startDate.day}
            </p>
            <p className="text-sm select-none">to</p>
            <p className="text-sm select-none text-amber-400/80">
              {monthNames[currentSign.endDate.month - 1]}{" "}
              {currentSign.endDate.day}
            </p>
          </fieldset>
        </div>
        <Popover.Close
          className="absolute right-2 top-2 inline-flex size-[25px] cursor-default items-center justify-center rounded-full outline-none"
          aria-label="Close"
        >
          <Icon
            icon={IconEnum.RegularX}
            color={"text-white/80"}
            size={IconSize.Small}
          />
        </Popover.Close>
        <Popover.Arrow className="fill-slate-700" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);

const NavTop = () => {
  const today = new Date();
  const month = today.getMonth(); // starts as 0-11
  const day = today.getDate(); // Gets the day of the month (1-31)

  const currentSign = getZodiacSign(month + 1, day);

  return (
    <nav className="flex justify-around py-6 items-center">
      <div className="flex flex-col items-center">
        <DateElement day={day} month={month} />
      </div>

      <div className="flex flex-col items-center">
        <MoonElement />
      </div>

      <div className="flex flex-col items-center">
        <ZodiacSymbol currentSign={currentSign} />
      </div>
    </nav>
  );
};

export default NavTop;
