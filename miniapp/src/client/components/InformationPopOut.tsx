"use client";

import { Popover } from "radix-ui";

import { Icon, IconEnum, IconSize } from "~/client/components/Icons";

export const InformationPopOut = ({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) => {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="flex flex-col items-center mb-4">
          <Icon
            icon={IconEnum.Info}
            color={"text-amber-400/80"}
            size={IconSize.Small}
            isOutline
          />
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={`${fullWidth ? "w-[calc(100vw-1rem)] mx-[0.5rem]" : "w-64 mx-2 "} p-5 rounded-lg bg-slate-950/95 border border-slate-700 will-change-[transform,opacity] data-[state=open]:data-[side=bottom]:animate-slideUpAndFade data-[state=open]:data-[side=left]:animate-slideRightAndFade data-[state=open]:data-[side=right]:animate-slideLeftAndFade data-[state=open]:data-[side=top]:animate-slideDownAndFade`}
          sideOffset={5}
        >
          <div className="flex flex-col items-center gap-4 w-full pt-4">
            {children}
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
