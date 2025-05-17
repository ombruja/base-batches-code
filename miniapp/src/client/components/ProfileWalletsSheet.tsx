"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

import { Sheet, SheetRef } from "react-modal-sheet";

import { Icon, IconEnum, IconSize } from "~/client/components/Icons";
import { FancyButton } from "~/client/components/ui/fancy-button";
import { useOutsideClick } from "~/client/hooks/use-outside-click";
import { ClientUserData } from "~/client/types/client.types";
import { CircleLoader } from "react-spinners";

export default function ProfileWalletsSheet({
  isLoading,
  isOpen,
  user,
  refetchHoroscopes,
  setOpen,
}: {
  isLoading: boolean;
  isOpen: boolean;
  user: ClientUserData | null;
  refetchHoroscopes: () => void;
  setOpen: (open: boolean) => void;
}) {
  const { address } = useAccount();
  const { connectors, disconnect } = useDisconnect();

  const { context } = useMiniKit();
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SheetRef>(null);
  const [isAddressCopied, setIsAddressCopied] = useState(false);

  useEffect(() => {
    if (isAddressCopied) {
      setTimeout(() => {
        setIsAddressCopied(false);
      }, 1000);
    }
  }, [isAddressCopied]);

  const clickClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const clickDisconnectAddress = useCallback(async () => {
    // Disconnect all the connectors (wallets). Usually only one is connected
    connectors.map((connector) => disconnect({ connector }));
  }, [connectors, disconnect]);

  const clickCbConnect = useCallback(async () => {
    refetchHoroscopes();
  }, [refetchHoroscopes]);

  const clickCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(address ?? "");
    setIsAddressCopied(true);
  }, [address, setIsAddressCopied]);

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
              <h1 className="text-2xl font-bold text-center">Wallets</h1>
            </div>

            <div
              className="flex flex-col gap-4"
              style={{
                paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
              }}
            >
              {isLoading ? (
                <div className="flex w-full h-full justify-center items-center">
                  <CircleLoader
                    color={"#FFD700"}
                    size={100}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    loading
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-white text-lg font-bold">
                      Active Address:
                    </h1>
                    <div className="flex flex-col gap-2">
                      {!!address ? (
                        <>
                          {address}
                          <div className="flex flex-row gap-2">
                            <FancyButton onClick={clickCopyAddress} small>
                              {isAddressCopied ? "Copied!" : "Copy"}
                            </FancyButton>
                            <FancyButton onClick={clickDisconnectAddress} small>
                              Disconnect
                            </FancyButton>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-white text-base italic text-center items-center justify-center">
                            No address connected
                          </p>

                          <ConnectWallet
                            className="w-[calc(100vw-2rem)] p-0"
                            onConnect={clickCbConnect}
                            disconnectedLabel={
                              <div className="w-full p-0">
                                <FancyButton as="div">
                                  Connect Wallet
                                </FancyButton>
                              </div>
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>

                  {!!user?.connectedWallets && (
                    <div className="flex flex-col gap-2">
                      <h2 className="text-white text-base font-bold">
                        Wallets connected to your account:
                      </h2>
                      <div className="flex flex-col gap-2">
                        {user.connectedWallets.map((wallet, index) => (
                          <p
                            key={index}
                            className="text-white text-base italic text-center items-center justify-center"
                          >
                            {wallet.walletAddress}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
