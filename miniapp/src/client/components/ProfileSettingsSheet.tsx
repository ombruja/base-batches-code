"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useCallback, useRef } from "react";

import { Sheet, SheetRef } from "react-modal-sheet";

import { Icon, IconEnum, IconSize } from "~/client/components/Icons";
import { FancyButton } from "~/client/components/ui/fancy-button";
import { useOutsideClick } from "~/client/hooks/use-outside-click";

export default function ProfileSettingsSheet({
  isOpen,
  setIsLoading,
  setOpen,
}: {
  isOpen: boolean;
  setIsLoading: (isLoading: boolean) => void;
  setOpen: (open: boolean) => void;
}) {
  const { context } = useMiniKit();
  const { logout } = usePrivy();

  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SheetRef>(null);

  const clickClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
  };

  useOutsideClick(containerRef, clickClose);

  return (
    <Sheet
      ref={ref}
      isOpen={isOpen}
      onClose={clickClose}
      //   snapPoints={[600, 400, 100, 0]}
      detent="content-height"
      disableDrag
      //   initialSnap={1}
      // onSnap={(snapIndex) =>
      //   console.log("> Current snap point index:", snapIndex)
      // }
    >
      <Sheet.Container
        ref={containerRef}
        style={{
          backgroundColor: "transparent",
          // width: buttonWidth ? `${buttonWidth}px` : "auto",
          // marginRight: buttonWidth ? `calc(50% - ${buttonWidth / 2}px)` : "auto",
          // right: "1rem",
          // marginBottom: `calc(1rem + ${context?.client.safeAreaInsets?.bottom ?? 0})`,
          // left: "unset",
        }}
      >
        <Sheet.Content>
          <div className="relative flex flex-col bg-slate-950/95 gap-8 px-4 py-8 rounded-t-xl border-t-2 border-slate-500/50">
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-center">Settings</h1>
            </div>

            <div
              className="flex flex-col gap-4"
              style={{
                paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
              }}
            >
              <Link href={"/dob"} prefetch={true}>
                <FancyButton>Change Birthday</FancyButton>
              </Link>

              <FancyButton onClick={() => handleLogout()}>Logout</FancyButton>
            </div>

            <div
              className={`absolute top-2 right-2 p-2 flex flex-col items-center`}
              onClick={clickClose}
            >
              <Icon
                icon={IconEnum.RegularX}
                color={"text-white/80"}
                size={IconSize.Small}
              />
            </div>
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}
