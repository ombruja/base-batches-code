"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { BigNumber } from "alchemy-sdk";
import { Sheet, SheetRef } from "react-modal-sheet";
import { CircleLoader } from "react-spinners";
import {
  useAccount,
  useChainId,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { base } from "wagmi/chains";

import { useAddConnectedWallets } from "~/client/hooks/useAddConnectedWallets";
import { FancyButton } from "~/client/components/ui/fancy-button";
import { setOffConfetti } from "~/client/components/ui/success-confetti";
import { Icon, IconEnum, IconSize } from "~/client/components/Icons";
import { useCollectDailyHoroscope } from "~/client/hooks/useCollectDailyHoroscope";
import { useOutsideClick } from "~/client/hooks/use-outside-click";
import { useRequestDailyHoroscope } from "~/client/hooks/useRequestDailyHoroscope";
import { useUserBalance } from "~/client/hooks/useUserBalance.hook";
import {
  DAILY_HOROSCOPE_USDC_COST,
  DAILY_HOROSCOPE_CONTRACT_ADDRESS,
  USDC_ADDRESS,
  encodeApproveData,
  encodeMintDailyHoroscopeData,
} from "~/client/lib/constants.lib";
import { formatUsdcToDollars } from "~/client/lib/utils";

export function getPanelDetails({
  address,
  allowance,
  isAddressCopied,
  isLoadingApproval,
  isLoadingCollect,
  isLoadingRequestDailyHoroscope,
  isLoadingUserBalance,
  isReadyToCollect,
  isWagmiConnected,
  usdcBalance,
  clickApprove,
  clickCollect,
  clickCopyAddress,
  clickCbConnect,
  clickDisconnectAddress,
}: {
  address: string | undefined | null;
  allowance: BigNumber;
  isAddressCopied: boolean;
  isLoadingApproval: boolean;
  isLoadingCollect: boolean;
  isLoadingRequestDailyHoroscope: boolean;
  isLoadingUserBalance: boolean;
  isReadyToCollect: boolean;
  isWagmiConnected: boolean;
  usdcBalance: BigNumber;
  clickApprove: () => void;
  clickCollect: () => void;
  clickCopyAddress: () => void;
  clickCbConnect: () => void;
  clickDisconnectAddress: () => void;
}) {
  let panelTitle = "";
  let panelContent = null;

  if (isLoadingUserBalance || isLoadingRequestDailyHoroscope) {
    panelTitle = "Loading...";

    panelContent = (
      <div className="flex w-full h-full justify-center items-center">
        <CircleLoader
          color={"#FFD700"}
          size={100}
          aria-label="Loading Spinner"
          data-testid="loader"
          loading
        />
      </div>
    );
  } else if (isWagmiConnected) {
    const hasEnoughBalance =
      usdcBalance && usdcBalance.gte(DAILY_HOROSCOPE_USDC_COST);

    const hasEnoughAllowance =
      allowance && allowance.gte(DAILY_HOROSCOPE_USDC_COST);

    if ((hasEnoughBalance && hasEnoughAllowance) || isReadyToCollect) {
      panelTitle = "Daily Horoscope";

      // If the user has enough balance and allowance, show the picker and go straight to colleting
      // otherwise they either need to increase allowance and/or balance
      panelContent = (
        <div className="flex flex-col gap-8">
          <p className="text-white/80 max-w-xl text-center text-base/7 select-none">
            Your daily horoscope is revealed after collected.
          </p>

          <FancyButton
            onClick={clickCollect}
            disabled={isLoadingCollect}
            highlight
          >
            {isLoadingCollect
              ? "Collecting..."
              : `Collect for ${formatUsdcToDollars(DAILY_HOROSCOPE_USDC_COST)} USDC`}
          </FancyButton>
        </div>
      );
    } else if (!hasEnoughBalance) {
      panelTitle = "Insufficient Balance";

      panelContent = (
        <>
          <div className="text-white/80 text-base font-normal italic text-center mb-2">
            <h3>Send USDC to your wallet on Base:</h3>
            <h3>{address}</h3>
          </div>

          <div className="flex flex-row gap-2">
            <FancyButton onClick={clickCopyAddress}>
              {isAddressCopied ? "Copied!" : "Copy"}
            </FancyButton>
            <FancyButton onClick={clickDisconnectAddress}>
              Disconnect
            </FancyButton>
          </div>
        </>
      );
    } else {
      // } else if (!hasEnoughAllowance) {
      panelTitle = "Transfer Request";

      panelContent = (
        <div className="flex flex-col gap-8">
          <p className="text-white/80 max-w-xl text-center text-base/7 select-none">
            Approve the {formatUsdcToDollars(DAILY_HOROSCOPE_USDC_COST)} USDC
            transfer to collect.
          </p>

          <FancyButton
            onClick={clickApprove}
            disabled={isLoadingApproval}
            highlight
          >
            {isLoadingApproval ? "Approving..." : "Approve Transfer"}
          </FancyButton>
        </div>
      );
    }
  } else {
    panelTitle = "Connect Wallet";

    panelContent = (
      <ConnectWallet
        className="w-[calc(100vw-2rem)] p-0"
        onConnect={clickCbConnect}
        disconnectedLabel={
          <div className="w-full p-0">
            <FancyButton as="div">Connect Wallet</FancyButton>
          </div>
        }
      />
    );
  }

  return {
    panelTitle,
    panelContent,
  };
}

export default function CollectDailyHoroscopeSheet({
  isOpen,
  isSuccess,
  setInternalImage,
  setIsRootPageLoading,
  setIsSuccess,
  setOpen,
}: {
  isOpen: boolean;
  isSuccess: boolean;
  setInternalImage: (internalImage: string) => void;
  setIsRootPageLoading: (isRootPageLoading: boolean) => void;
  setIsSuccess: (success: boolean) => void;
  setOpen: (open: boolean) => void;
}) {
  const { address, isConnected: isWagmiConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, disconnect } = useDisconnect();
  const { context } = useMiniKit();
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<SheetRef>(null);
  const [isError, setIsError] = useState(false);
  const { switchChain } = useSwitchChain();

  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [isLoadingCollect, setIsLoadingCollect] = useState(false);
  const [isReadyToCollect, setIsReadyToCollect] = useState(false);

  const {
    requestUserBalance,
    isLoading: isLoadingUserBalance,
    usdcBalance,
    allowanceDailyHoroscope,
  } = useUserBalance();

  const {
    collectDailyHoroscope,
    isLoading: isLoadingCollectDailyHoroscope,
    error: errorCollectDailyHoroscope,
    dailyHoroscopeUrl,
  } = useCollectDailyHoroscope();

  const {
    sendTransaction: sendTransactionApprove,
    data: transactionDataPayloadApprove,
  } = useSendTransaction();

  const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } =
    useWaitForTransactionReceipt({
      hash: transactionDataPayloadApprove,
    });

  const clickDisconnectAddress = useCallback(async () => {
    // Disconnect all the connectors (wallets). Usually only one is connected
    connectors.map((connector) => disconnect({ connector }));
  }, [connectors, disconnect]);

  const clickClose = useCallback(() => {
    setOpen(false);
    setIsError(false);
    setIsRootPageLoading(false);
    setIsReadyToCollect(false);
    setIsLoadingCollect(false);
  }, [setOpen, setIsRootPageLoading, setIsError]);

  const {
    requestDailyHoroscope,
    tokenId: dailyHoroscopeTokenId,
    dataPayload: dailyHoroscopeDataPayload,
    isLoading: isLoadingRequestDailyHoroscope,
    isError: isRequestDailyHoroscopeError,
  } = useRequestDailyHoroscope();

  useEffect(() => {
    if (isOpen && address && !dailyHoroscopeTokenId) {
      requestDailyHoroscope({ address });
    }
  }, [isOpen, address, dailyHoroscopeTokenId, requestDailyHoroscope]);

  const {
    sendTransaction: sendTransactionCollect,
    data: transactionDataPayloadCollect,
  } = useSendTransaction();

  const {
    isLoading: isConfirmingCollect,
    isSuccess: isConfirmedCollect,
    isError: isErrorCollect,
  } = useWaitForTransactionReceipt({
    hash: transactionDataPayloadCollect,
  });

  const { addConnectedWallet: addConnectedWalletCollect } =
    useAddConnectedWallets();

  useEffect(() => {
    if (isAddressCopied) {
      setTimeout(() => {
        setIsAddressCopied(false);
      }, 1000);
    }
  }, [isAddressCopied]);

  // When the sheet is open, request the zodiac mint
  useEffect(() => {
    if (!isLoadingRequestDailyHoroscope && isRequestDailyHoroscopeError) {
      setIsError(true);
    }
  }, [isLoadingRequestDailyHoroscope, isRequestDailyHoroscopeError]);

  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    }
  }, [address, chainId, switchChain]);

  useEffect(() => {
    if (address) {
      requestUserBalance({ address });
    }
  }, [address, requestUserBalance]);

  useEffect(() => {
    if (!isConfirmingApprove && isConfirmedApprove && !isReadyToCollect) {
      setIsReadyToCollect(true);
    }
  }, [isConfirmedApprove, isConfirmingApprove, isReadyToCollect]);

  useEffect(() => {
    //
    if (!isLoadingCollectDailyHoroscope) {
      if (!!errorCollectDailyHoroscope) {
        setIsError(true);
        setIsLoadingCollect(false);
      } else if (!!dailyHoroscopeUrl) {
        setInternalImage(dailyHoroscopeUrl.url);
        setOffConfetti();
        clickClose();
      }
    }
  }, [
    dailyHoroscopeUrl,
    errorCollectDailyHoroscope,
    isLoadingCollectDailyHoroscope,
  ]);

  // SUCCESS
  useEffect(() => {
    if (!isConfirmingCollect && !isSuccess && !isErrorCollect) {
      if (isErrorCollect) {
        setIsError(true);
      } else if (
        isConfirmedCollect &&
        !isSuccess &&
        address &&
        dailyHoroscopeTokenId &&
        transactionDataPayloadCollect
      ) {
        setIsSuccess(true);
        collectDailyHoroscope({
          onchainId: dailyHoroscopeTokenId,
          mintedAddress: address,
          transactionHash: transactionDataPayloadCollect,
        });
      }
    }
  }, [
    address,
    dailyHoroscopeTokenId,
    isConfirmedCollect,
    isConfirmingCollect,
    isErrorCollect,
    isSuccess,
    transactionDataPayloadCollect,
    collectDailyHoroscope,
    setIsSuccess,
  ]);

  const clickCollect = useCallback(async () => {
    if (
      !address ||
      !DAILY_HOROSCOPE_CONTRACT_ADDRESS ||
      !dailyHoroscopeTokenId ||
      !dailyHoroscopeDataPayload
    ) {
      return;
    }

    setIsError(false);
    setIsLoadingCollect(true);

    const data = encodeMintDailyHoroscopeData(
      address,
      dailyHoroscopeTokenId,
      dailyHoroscopeDataPayload,
    );

    sendTransactionCollect(
      {
        to: DAILY_HOROSCOPE_CONTRACT_ADDRESS,
        data,
        chainId: base.id,
      },
      {
        onSuccess: (hash) => {
          console.log("--- --- --- hash");
          console.log(hash);
          // Connect wallet to user account
          addConnectedWalletCollect(address);
        },
        onError: (error) => {
          console.log("--- --- --- error");
          console.log(error);
          setIsError(true);
          setIsLoadingCollect(false);
        },
      },
    );
  }, [
    address,
    dailyHoroscopeTokenId,
    dailyHoroscopeDataPayload,
    addConnectedWalletCollect,
    collectDailyHoroscope,
    sendTransactionCollect,
  ]);

  const clickApprove = useCallback(async () => {
    if (!address || !USDC_ADDRESS || !DAILY_HOROSCOPE_CONTRACT_ADDRESS) {
      return;
    }

    setIsError(false);

    const data = encodeApproveData({
      spenderAddress: DAILY_HOROSCOPE_CONTRACT_ADDRESS,
      amountToApprove: DAILY_HOROSCOPE_USDC_COST,
    });

    sendTransactionApprove(
      {
        to: USDC_ADDRESS,
        data,
        chainId: base.id,
      },
      {
        onSuccess: (hash) => {
          console.log("--- --- --- hash");
          console.log(hash);
          requestUserBalance({ address });
        },
        onError: (error) => {
          console.log("--- --- --- error");
          console.log(error);
          setIsError(true);
        },
      },
    );
  }, [address, sendTransactionApprove, requestUserBalance]);

  const clickCbConnect = useCallback(async () => {
    requestUserBalance({ address });
  }, [address, requestUserBalance]);

  const clickCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(address ?? "");
    setIsAddressCopied(true);
  }, [address, setIsAddressCopied]);

  const { panelTitle, panelContent } = getPanelDetails({
    address,
    allowance: allowanceDailyHoroscope ?? BigNumber.from(0),
    isAddressCopied,
    isLoadingApproval: isConfirmingApprove,
    isLoadingCollect:
      isConfirmingCollect || isLoadingCollectDailyHoroscope || isLoadingCollect,
    usdcBalance: usdcBalance ?? BigNumber.from(0),
    isLoadingRequestDailyHoroscope,
    isLoadingUserBalance,
    isReadyToCollect,
    isWagmiConnected,
    clickApprove,
    clickCbConnect,
    clickCollect,
    clickCopyAddress,
    clickDisconnectAddress,
  });

  const isLoading = isLoadingRequestDailyHoroscope;

  useOutsideClick(containerRef, isLoading ? () => {} : clickClose);

  return (
    <Sheet
      ref={ref}
      isOpen={isOpen}
      onClose={isLoading ? () => {} : clickClose}
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
              <h1 className="text-2xl font-bold text-center">{panelTitle} </h1>
            </div>

            <div
              className="flex flex-col gap-4"
              style={{
                paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
              }}
            >
              {panelContent}

              {isError && (
                <div className="text-red-500 text-base font-normal italic text-center mt-2">
                  <h3>Error. Please try again.</h3>
                </div>
              )}
            </div>

            <div
              className={`absolute top-2 right-2 p-2 flex flex-col items-center`}
              onClick={isLoading ? () => {} : clickClose}
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
