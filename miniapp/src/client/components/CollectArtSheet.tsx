"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { BigNumber } from "alchemy-sdk";
import Picker from "react-mobile-picker";
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
import { useOutsideClick } from "~/client/hooks/use-outside-click";
import { useRequestZodiacCollect } from "~/client/hooks/useRequestZodiacCollect";
import { useUserBalance } from "~/client/hooks/useUserBalance.hook";
import {
  encodeApproveData,
  encodeMintWesternZodiacBatchData,
  MINT_ZODIAC_USDC_COST,
  USDC_ADDRESS,
  ZODIAC_CONTRACT_ADDRESS,
} from "~/client/lib/constants.lib";
import { formatUsdcToDollars } from "~/client/lib/utils";
import { ZodiacElement } from "~/client/types/client.types";

export function getPanelDetails({
  address,
  allowance,
  hasSelectedAmount,
  isAddressCopied,
  isLoadingApproval,
  isLoadingCollect,
  isLoadingRequestZodiacMint,
  isLoadingUserBalance,
  isReadyToCollect,
  isWagmiConnected,
  pickerValue,
  title,
  totalPiecesCollectedCount,
  totalPiecesCount,
  usdcBalance,
  clickApprove,
  clickCollect,
  clickCopyAddress,
  clickCbConnect,
  clickDisconnectAddress,
  clickSelectAmount,
  setPickerValue,
}: {
  address: string | undefined | null;
  allowance: BigNumber;
  hasSelectedAmount: boolean;
  isAddressCopied: boolean;
  isLoadingApproval: boolean;
  isLoadingCollect: boolean;
  isLoadingRequestZodiacMint: boolean;
  isLoadingUserBalance: boolean;
  isReadyToCollect: boolean;
  isWagmiConnected: boolean;
  pickerValue: { amount: string };
  title: string;
  totalPiecesCollectedCount: number;
  totalPiecesCount: number;
  usdcBalance: BigNumber;
  clickApprove: () => void;
  clickCollect: () => void;
  clickCopyAddress: () => void;
  clickCbConnect: () => void;
  clickDisconnectAddress: () => void;
  clickSelectAmount: () => void;
  setPickerValue: (pickerValue: { amount: string }) => void;
}) {
  let panelTitle = "";
  let panelContent = null;

  if (isLoadingUserBalance || isLoadingRequestZodiacMint) {
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
    const allSelectionAmount =
      totalPiecesCollectedCount >= totalPiecesCount
        ? totalPiecesCount
        : totalPiecesCount - totalPiecesCollectedCount;

    const projectedCost =
      pickerValue.amount === "all"
        ? MINT_ZODIAC_USDC_COST.mul(BigNumber.from(allSelectionAmount))
        : MINT_ZODIAC_USDC_COST.mul(BigNumber.from(pickerValue.amount));

    const hasEnoughBalance = usdcBalance && usdcBalance.gte(projectedCost);

    const hasEnoughAllowance = allowance && allowance.gte(projectedCost);

    if (isReadyToCollect) {
      panelTitle = "Collect Zodiac";

      // If the user has enough balance and allowance, show the picker and go straight to colleting
      // otherwise they either need to increase allowance and/or balance
      panelContent = (
        <div className="flex flex-col gap-8">
          <p className="text-white/80 max-w-xl text-center text-base/7 select-none">
            Art is randomly selected and revealed after collected.
          </p>

          <FancyButton
            onClick={clickCollect}
            disabled={isLoadingCollect}
            highlight
          >
            {isLoadingCollect
              ? "Collecting..."
              : `Collect for ${formatUsdcToDollars(projectedCost)} USDC`}
          </FancyButton>
        </div>
      );
    } else if (
      !hasSelectedAmount ||
      (hasEnoughBalance && hasEnoughAllowance) ||
      isReadyToCollect
    ) {
      const allText =
        totalPiecesCollectedCount >= totalPiecesCount
          ? "All Pieces"
          : "All Uncollected";

      const allString = `${allText} (${allSelectionAmount})`;

      const selections = ["all"];

      // Add on to the selections array
      for (let i = 1; i <= totalPiecesCount; i++) {
        selections.push(i.toString());
      }

      panelTitle = title;

      // If the user has enough balance and allowance, show the picker and go straight to colleting
      // otherwise they either need to increase allowance and/or balance
      panelContent = (
        <div className="flex flex-col">
          <p className="text-white/80 max-w-xl text-center text-base/7 select-none">
            Art is randomly selected and revealed after collected.
          </p>

          <div className="flex flex-row gap-4">
            <Picker
              value={pickerValue}
              onChange={setPickerValue}
              itemHeight={50}
              height={140}
              style={{
                width: "100%",
              }}
            >
              <Picker.Column name="amount">
                {selections.map((option: string) => (
                  <Picker.Item key={option} value={option}>
                    <h1
                      className={`text-center ${
                        pickerValue.amount === option
                          ? "text-amber-500 font-bold text-2xl"
                          : "text-white/80 text-xl font-normal"
                      }`}
                    >
                      {option === "all" ? allString : option}
                    </h1>
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>

          <FancyButton
            onClick={clickSelectAmount}
            disabled={isLoadingCollect}
            highlight
          >
            {isLoadingCollect
              ? "Collecting..."
              : `Collect for ${formatUsdcToDollars(projectedCost)} USDC`}
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
            Approve the {formatUsdcToDollars(projectedCost)} USDC transfer to
            collect.
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

export default function CollectArtSheet({
  isOpen,
  selectedZodiacElement,
  totalPiecesCollectedCount,
  totalPiecesCount,
  setIsRootPageLoading,
  setIsSuccess,
  setOpen,
}: {
  isOpen: boolean;
  selectedZodiacElement: ZodiacElement;
  totalPiecesCollectedCount: number;
  totalPiecesCount: number;
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

  const [pickerValue, setPickerValue] = useState({
    amount: "all",
  });
  const [hasSelectedAmount, setHasSelectedAmount] = useState(false);

  const [isAddressCopied, setIsAddressCopied] = useState(false);

  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [isLoadingCollect, setIsLoadingCollect] = useState(false);
  const [isReadyToCollect, setIsReadyToCollect] = useState(false);

  const {
    requestUserBalance,
    isLoading: isLoadingUserBalance,
    usdcBalance,
    allowanceZodiac,
  } = useUserBalance();

  const {
    sendTransaction: sendTransactionApprove,
    data: transactionDataPayloadApprove,
  } = useSendTransaction();

  const { isLoading: isConfirmingApprove, isSuccess: isConfirmedApprove } =
    useWaitForTransactionReceipt({
      hash: transactionDataPayloadApprove,
    });

  const {
    pieces,
    dataPayload,
    isLoading: isLoadingRequestZodiacMint,
    isError: isRequestZodiacMintError,
    forceClearState,
    requestZodiacMint,
  } = useRequestZodiacCollect();

  const clickClose = useCallback(() => {
    setOpen(false);
    setIsError(false);
    setHasSelectedAmount(false);
    setPickerValue({
      amount: "all",
    });
    setIsLoadingApproval(false);
    setIsLoadingCollect(false);
    setIsRootPageLoading(false);
    setIsReadyToCollect(false);
    forceClearState();
  }, [
    forceClearState,
    setOpen,
    setIsLoadingApproval,
    setIsLoadingCollect,
    setIsRootPageLoading,
    setIsError,
    setHasSelectedAmount,
    setPickerValue,
  ]);

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

  const clickDisconnectAddress = useCallback(async () => {
    // Disconnect all the connectors (wallets). Usually only one is connected
    connectors.map((connector) => disconnect({ connector }));
  }, [connectors, disconnect]);

  const { addConnectedWallet: addConnectedWalletCollect } =
    useAddConnectedWallets();

  useEffect(() => {
    if (isAddressCopied) {
      setTimeout(() => {
        setIsAddressCopied(false);
      }, 1000);
    }
  }, [isAddressCopied]);

  useEffect(() => {
    if (!isLoadingRequestZodiacMint) {
      if (isRequestZodiacMintError) {
        setIsError(true);
        setHasSelectedAmount(false);
      } else if (!!dataPayload && !!allowanceZodiac && !!usdcBalance) {
        const allSelectionAmount =
          totalPiecesCollectedCount >= totalPiecesCount
            ? totalPiecesCount
            : totalPiecesCount - totalPiecesCollectedCount;

        const projectedCost =
          pickerValue.amount === "all"
            ? MINT_ZODIAC_USDC_COST.mul(BigNumber.from(allSelectionAmount))
            : MINT_ZODIAC_USDC_COST.mul(BigNumber.from(pickerValue.amount));

        const hasEnoughBalance = usdcBalance && usdcBalance.gte(projectedCost);

        const hasEnoughAllowance =
          allowanceZodiac && allowanceZodiac.gte(projectedCost);

        if (hasEnoughBalance && hasEnoughAllowance) {
          clickCollect(true);
        } else if (!hasSelectedAmount) {
          setHasSelectedAmount(true);
        }

        // const amount =
        //   pickerValue.amount === "all"
        //     ? allSelectionAmount
        //     : parseInt(pickerValue.amount);

        // // Request a new signature
        // if (!dataPayload) {
        //   await requestZodiacMint({
        //     zodiacSign: selectedZodiacElement.enum,
        //     amount,
        //     address,
        //   });
        // }
        // clickCollect();
      }
    }
  }, [
    allowanceZodiac,
    dataPayload,
    hasSelectedAmount,
    isLoadingRequestZodiacMint,
    isRequestZodiacMintError,
    pickerValue.amount,
    totalPiecesCollectedCount,
    totalPiecesCount,
    usdcBalance,
    setIsError,
    setHasSelectedAmount,
  ]);

  useEffect(() => {
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
    }
  }, [address, chainId, switchChain]);

  // //
  // useEffect(() => {
  //   if (!dataPayload) {
  //   const projectedCost =
  //   pickerValue.amount === "all"
  //     ? MINT_ZODIAC_USDC_COST.mul(BigNumber.from(allSelectionAmount))
  //     : MINT_ZODIAC_USDC_COST.mul(BigNumber.from(pickerValue.amount));

  // const hasEnoughBalance = usdcBalance && usdcBalance.gte(projectedCost);
  // console.log("--- --- --- hasEnoughBalance");
  // console.log(hasEnoughBalance);

  // const hasEnoughAllowance = allowance && allowance.gte(projectedCost);

  //   if (hasEnoughBalance && hasEnoughAllowance) {

  //   }
  //   }

  // }, [dataPayload, hasSelectedAmount]);

  // The user has just connected their wallet
  useEffect(() => {
    if (address) {
      requestUserBalance({ address });
    }
  }, [address, requestUserBalance]);

  // The user has just approved the transfer of USDC to the contract
  useEffect(() => {
    if (!isConfirmingApprove && isConfirmedApprove && !isReadyToCollect) {
      setIsReadyToCollect(true);
    }
  }, [isConfirmedApprove, isConfirmingApprove, isReadyToCollect]);

  // SUCCESS
  useEffect(() => {
    if (!isConfirmingCollect) {
      if (isErrorCollect) {
        setIsError(true);
      } else if (isConfirmedCollect) {
        setIsSuccess(true);
        setOffConfetti();
        clickClose();
      }
    }
  }, [isConfirmedCollect, isConfirmingCollect, isErrorCollect]);

  const clickCollect = useCallback(
    async (bypassHasCheck = false) => {
      if (
        !address ||
        !ZODIAC_CONTRACT_ADDRESS ||
        (!bypassHasCheck && !hasSelectedAmount)
      ) {
        return;
      }

      setIsLoadingCollect(true);
      setIsError(false);

      const amounts = pieces.map(() => BigInt(1));

      const data = encodeMintWesternZodiacBatchData(
        address,
        // [BigInt(2)],
        pieces.map((piece) => BigInt(piece)),
        amounts,
        dataPayload ?? "0x",
      );

      sendTransactionCollect(
        {
          to: ZODIAC_CONTRACT_ADDRESS,
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
    },
    [
      address,
      pieces,
      dataPayload,
      hasSelectedAmount,
      addConnectedWalletCollect,
      sendTransactionCollect,
    ],
  );

  const { addConnectedWallet: addConnectedWalletApprove } =
    useAddConnectedWallets({
      onComplete: () => {
        setIsLoadingApproval(false);
      },
    });

  const clickApprove = useCallback(async () => {
    if (
      !address ||
      !USDC_ADDRESS ||
      !ZODIAC_CONTRACT_ADDRESS ||
      !pieces.length
    ) {
      return;
    }

    setIsLoadingApproval(true);
    setIsError(false);

    const data = encodeApproveData({
      spenderAddress: ZODIAC_CONTRACT_ADDRESS,
      amountToApprove: MINT_ZODIAC_USDC_COST.mul(BigNumber.from(pieces.length)),
    });

    sendTransactionApprove(
      {
        to: USDC_ADDRESS,
        data,
        chainId: base.id,
      },
      {
        onSuccess: () => {
          addConnectedWalletApprove(address);
          requestUserBalance({ address });
          setIsLoadingApproval(false);
        },
        onError: (error) => {
          console.log("--- --- --- error");
          console.log(error);
          setIsError(true);
          setIsLoadingApproval(false);
        },
      },
    );
  }, [
    address,
    pieces,
    setIsLoadingApproval,
    sendTransactionApprove,
    requestUserBalance,
  ]);

  const clickSelectAmount = useCallback(async () => {
    if (!address) {
      return;
    }
    setIsError(false);
    // If the amount is all, we don't need to include the amount in the signature request
    const amount =
      pickerValue.amount === "all" ? null : parseInt(pickerValue.amount);

    // After the user selects an amount, we need to request a new signature
    await requestZodiacMint({
      zodiacSign: selectedZodiacElement.enum,
      amount,
      address,
    });
  }, [
    address,
    isRequestZodiacMintError,
    pickerValue.amount,
    requestZodiacMint,
    selectedZodiacElement.enum,
    setIsError,
  ]);

  const clickCbConnect = useCallback(async () => {
    requestUserBalance({ address });
  }, [address, requestUserBalance]);

  const clickCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(address ?? "");
    setIsAddressCopied(true);
  }, [address, setIsAddressCopied]);

  const { panelTitle, panelContent } = getPanelDetails({
    address,
    allowance: allowanceZodiac ?? BigNumber.from(0),
    isAddressCopied,
    isLoadingApproval: isLoadingApproval || isConfirmingApprove,
    isLoadingCollect: isLoadingCollect || isConfirmingCollect,
    title: `How many ${selectedZodiacElement.title}?`,
    usdcBalance: usdcBalance ?? BigNumber.from(0),
    hasSelectedAmount,
    isLoadingRequestZodiacMint,
    isLoadingUserBalance,
    isReadyToCollect,
    isWagmiConnected,
    pickerValue,
    totalPiecesCollectedCount,
    totalPiecesCount,
    clickApprove,
    clickCbConnect,
    clickCollect,
    clickCopyAddress,
    clickDisconnectAddress,
    clickSelectAmount,
    setPickerValue,
  });

  const isLoading =
    isLoadingCollect || isLoadingApproval || isLoadingRequestZodiacMint;

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
