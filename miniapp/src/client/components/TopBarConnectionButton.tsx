"use client";

import { useCallback } from "react";
import { Address } from "@coinbase/onchainkit/identity";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useDisconnect } from "wagmi";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/client/components/ui/dropdown-menu";
import { Icon, IconEnum, IconSize } from "~/client/components/Icons";

export function TopBarConnectionButton({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const { connectors, disconnect } = useDisconnect();
  const { address, isConnected: isWagmiConnected } = useAccount();
  const { authenticated, logout } = usePrivy();
  // const isConnected = isWagmiConnected || authenticated;

  const handleDisconnect = useCallback(async () => {
    // Disconnect all the connectors (wallets). Usually only one is connected
    connectors.map((connector) => disconnect({ connector }));
    if (authenticated) {
      await logout();
    }
  }, [authenticated, connectors, disconnect, logout]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="bg-transparent"
        disabled={isLoading}
      >
        <div className="flex flex-row items-center gap-2">
          <Icon
            icon={isWagmiConnected ? IconEnum.CircleCheck : IconEnum.CircleX}
            size={IconSize.Small}
            color={isLoading ? "text-slate-400" : "text-amber-400"}
          />

          <h3
            className={`flex select-none ${
              isLoading ? "text-slate-400" : "text-amber-400"
            } text-base justify-center items-center`}
          >
            {isWagmiConnected ? "Connected" : "Not Connected"}
          </h3>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-slate-950 w-56 border-neutral-200 rounded-lg mr-4 p-0">
        {isWagmiConnected ? (
          <>
            <DropdownMenuItem className="bg-transparent text-white text-sm font-bold w-56 p-2 select-none justify-center">
              Address:
            </DropdownMenuItem>
            <DropdownMenuItem className="bg-transparent text-white text-base w-56 p-2 select-none justify-center">
              {!!address ? (
                <Address address={address} />
              ) : (
                <p className="text-white text-base w-full italic text-center items-center select-none justify-center">
                  No address
                </p>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDisconnect}
              className="bg-transparent text-amber-400 text-base font-bold w-56 p-2  justify-center"
            >
              Disconnect
            </DropdownMenuItem>
          </>
        ) : (
          <ConnectWallet
            className="bg-transparent w-56 p-2"
            disconnectedLabel={
              <div className="bg-transparent w-56 p-0 justify-center">
                <DropdownMenuItem className="bg-transparent text-white text-base w-56 p-0 justify-center">
                  Connect Wallet
                </DropdownMenuItem>
              </div>
            }
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
