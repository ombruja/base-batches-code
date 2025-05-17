"use client";

import { useCallback, useEffect, useState } from "react";

import {
  useMiniKit,
  useOpenUrl,
  useViewProfile,
} from "@coinbase/onchainkit/minikit";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { sdk } from "@farcaster/frame-sdk";
import { BigNumber } from "alchemy-sdk";
import Link from "next/link";
import Image from "next/image";
import CircleLoader from "react-spinners/CircleLoader";
import {
  useAccount,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from "wagmi";
import { base } from "wagmi/chains";

import TopBarWithBack from "~/client/components/TopBarWithBack";
import { FancyButton } from "~/client/components/ui/fancy-button";
import { setOffConfetti } from "~/client/components/ui/success-confetti";
import { useAddConnectedWallets } from "~/client/hooks/useAddConnectedWallets";
import {
  useGetArtMetadata,
  ArtMetadata,
} from "~/client/hooks/useGetArtMetadata.hook";
import { useRequestZodiacCollect } from "~/client/hooks/useRequestZodiacCollect";
import { useUserBalance } from "~/client/hooks/useUserBalance.hook";
import {
  encodeApproveData,
  encodeMintWesternZodiacBatchData,
  MINT_ZODIAC_USDC_COST,
  USDC_ADDRESS,
  ZODIAC_CONTRACT_ADDRESS,
} from "~/client/lib/constants.lib";
import {
  zodiacMap,
  CastEmbedType,
  ZodiacSlug,
} from "~/client/types/client.types";

export default function App({ slug, title }: { slug: string; title?: string }) {
  const [isError, setIsError] = useState(false);
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [artMetadata, setArtMetadata] = useState<ArtMetadata | null>(null);

  const [isLoadingApproval, setIsLoadingApproval] = useState(false);
  const [isReadyToCollect, setIsReadyToCollect] = useState(false);

  const { context } = useMiniKit();
  const openUrl = useOpenUrl();
  const viewProfile = useViewProfile();

  const { address, isConnected: isWagmiConnected } = useAccount();

  const isInvalidSlug = !(slug in zodiacMap);

  const {
    pieces,
    dataPayload,
    isLoading: isLoadingRequestZodiacMint,
    requestZodiacMint,
  } = useRequestZodiacCollect();

  const {
    fetchArtMetadata,
    isLoading: isLoadingArtMetadata,
    artMetadata: fetchedArtMetadata,
  } = useGetArtMetadata();

  useEffect(() => {
    if (address && !dataPayload && !isInvalidSlug) {
      requestZodiacMint({
        zodiacSign: zodiacMap[slug as ZodiacSlug].enum,
        address,
        amount: 1,
      });
    }
  }, [address, dataPayload, isInvalidSlug, requestZodiacMint]);

  // Fetch art metadata when pieces are available
  useEffect(() => {
    if (pieces && pieces.length > 0) {
      if (pieces[0]) {
        fetchArtMetadata({ pieceOnchainId: pieces[0] });
      }
    }
  }, [pieces, fetchArtMetadata]);

  // Update local state when metadata is fetched
  useEffect(() => {
    if (fetchedArtMetadata) {
      setArtMetadata(fetchedArtMetadata);
    }
  }, [fetchedArtMetadata]);

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

  const { switchChain } = useSwitchChain();

  const hasEnoughBalance =
    usdcBalance && usdcBalance.gte(MINT_ZODIAC_USDC_COST);

  const hasEnoughAllowance =
    allowanceZodiac && allowanceZodiac.gte(MINT_ZODIAC_USDC_COST);

  useEffect(() => {
    switchChain({ chainId: base.id });
  }, [switchChain]);

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
  }, [isConfirmedApprove, isConfirmingApprove]);

  // SUCCESS
  useEffect(() => {
    if (!isConfirmingCollect) {
      if (isErrorCollect) {
        setIsError(true);
      } else if (isConfirmedCollect) {
        setIsSuccess(true);
        setOffConfetti();
        setIsLoadingTransaction(false);
      }
    }
  }, [isConfirmedCollect, isConfirmingCollect, isErrorCollect]);

  const clickCbConnect = useCallback(async () => {
    requestUserBalance({ address });
  }, [address, requestUserBalance]);

  const clickCollect = useCallback(async () => {
    if (!address || !ZODIAC_CONTRACT_ADDRESS) {
      return;
    }

    setIsLoadingTransaction(true);

    const data = encodeMintWesternZodiacBatchData(
      address,
      // [BigInt(2)],
      // [BigInt(1)],
      pieces.map((piece) => BigInt(piece)),
      pieces.map(() => BigInt(1)),
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
          setIsLoadingTransaction(false);
        },
      },
    );
  }, [
    address,
    pieces,
    dataPayload,
    setIsLoadingTransaction,
    sendTransactionCollect,
  ]);

  const clickShare = async () => {
    const embeds: CastEmbedType = ["", ""];
    if (artMetadata?.image) {
      embeds[0] = artMetadata.image;
    }

    // mini appUrl
    if (process.env.NEXT_PUBLIC_URL) {
      embeds[1] = `${process.env.NEXT_PUBLIC_URL}/collection`;
    } else {
      // remove the second embed
      embeds.pop();
    }

    // Customize the share text with metadata if available
    let shareText = `Just collected @ombruja artwork!`;
    if (artMetadata) {
      shareText = `Just collected the zodiac art " ${artMetadata.zodiacSign} by @${artMetadata.artistFarcasterHandle} " on Astrology by @ombruja. Collect and share yours too! ${zodiacMap[slug as ZodiacSlug]?.emoji || ""} /ombruja`;
    }

    await sdk.actions.composeCast({
      text: shareText,
      embeds,
      close: false,
    });
  };

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
        onSuccess: (hash) => {
          console.log("--- --- --- hash");
          console.log(hash);

          addConnectedWalletApprove(address);
          requestUserBalance({ address });
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

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const isLoading =
    isLoadingUserBalance ||
    isLoadingRequestZodiacMint ||
    isLoadingTransaction ||
    isLoadingArtMetadata;

  const isLoadingCompleteApproval = isLoadingApproval || isConfirmingApprove;

  return (
    <div className="min-h-screen flex items-center flex-col w-full h-full px-4">
      <TopBarWithBack
        title={
          isInvalidSlug
            ? ""
            : isSuccess
              ? `${zodiacMap[slug as ZodiacSlug].title} Collected!`
              : !!title
                ? title
                : `Collect ${zodiacMap[slug as ZodiacSlug].title}`
        }
        hideRightSideConnection={isInvalidSlug}
        isLoading={isLoading}
        backButtonHref={isSuccess ? "/collect" : "/"}
        backButtonText={isSuccess ? "Collect More" : "Back"}
      />

      <div className={`relative w-full${isSuccess ? " mb-16" : ""}`}>
        <div className="flex flex-col items-center justify-center relative w-full aspect-square">
          {isInvalidSlug ? (
            <h2 className="text-white/80 text-2xl font-bold text-center">
              Invalid Collection Option
            </h2>
          ) : isSuccess ? (
            artMetadata?.image ? (
              <Image
                src={artMetadata.image}
                alt="Zodiac Sign"
                className="border rounded-lg shadow-lg border-neutral-200/30 select-none"
                style={{
                  objectFit: "cover",
                }}
                fill
              />
            ) : (
              <h2 className="text-white/80 text-2xl font-bold text-center">
                Unable to display artwork
              </h2>
            )
          ) : (
            <>
              <Image
                className={`absolute inset-0 w-[120%] h-[120%] object-cover rounded-lg shadow-lg border border-white select-none ${
                  isLoading ? "opacity-20" : "opacity-100"
                }`}
                alt="Zodiac Sign"
                src={zodiacMap[slug as ZodiacSlug].src}
                onLoad={imageLoaded}
                loading="eager"
                decoding="sync"
                fill
              />
              {isLoading && (
                <CircleLoader
                  color={"#FFD700"}
                  size={150}
                  aria-label="Loading Spinner"
                  data-testid="loader"
                  loading
                />
              )}
            </>
          )}
        </div>
        {!isSuccess && !isInvalidSlug && (
          <div className="text-white text-base font-normal italic text-center mt-4">
            {isWagmiConnected &&
            !isLoading &&
            !hasEnoughAllowance &&
            !isReadyToCollect ? (
              <>
                {!hasEnoughBalance ? (
                  <h3>Insufficient balance.</h3>
                ) : (
                  <h3>Approve the $1 USDC transfer to collect.</h3>
                )}
              </>
            ) : (
              <>
                <h3>Display image is a placeholder.</h3>
                <h3>Collect for $1 USDC to reveal the zodiac artwork.</h3>
              </>
            )}
          </div>
        )}
      </div>

      <div className="absolute flex flex-row items-center bottom-10 w-full gap-4 px-4">
        <div className="flex flex-col gap-4 w-full">
          {isSuccess ? (
            <>
              <Link href="/">
                <FancyButton highlight>
                  Collect Your Daily Horoscope
                </FancyButton>
              </Link>
              {!!artMetadata && (
                <FancyButton
                  onClick={
                    !!context
                      ? () => viewProfile(artMetadata.artistFid)
                      : () =>
                          openUrl(
                            `${process.env.NEXT_PUBLIC_FARCASTER_URL}/${artMetadata.artistFarcasterHandle}`,
                          )
                  }
                >
                  View Artist
                </FancyButton>
              )}
              {!!context && (
                <FancyButton basic onClick={clickShare}>
                  Share
                </FancyButton>
              )}
            </>
          ) : (
            !isInvalidSlug &&
            (isWagmiConnected ? (
              isLoading ? (
                <FancyButton disabled>Loading...</FancyButton>
              ) : !hasEnoughBalance ? (
                <>
                  <div className="text-white/80 text-base font-normal italic text-center mb-2">
                    <h3>Send USDC to your wallet on Base:</h3>
                    <h3>{address}</h3>
                  </div>

                  <FancyButton
                    onClick={() => {
                      navigator.clipboard.writeText(address ?? "");
                    }}
                  >
                    Copy Address
                  </FancyButton>
                </>
              ) : isLoadingTransaction ? (
                <FancyButton disabled>Collecting...</FancyButton>
              ) : isReadyToCollect ||
                (hasEnoughBalance && hasEnoughAllowance) ? (
                <>
                  {isError && (
                    <div className="text-red-500 text-base font-normal italic text-center mb-2">
                      <h3>Error. Please try again.</h3>
                    </div>
                  )}
                  <FancyButton onClick={clickCollect}>Collect</FancyButton>
                </>
              ) : !hasEnoughAllowance ? (
                <FancyButton
                  onClick={clickApprove}
                  disabled={isLoadingCompleteApproval}
                >
                  {isLoadingCompleteApproval
                    ? "Approving..."
                    : "Approve Transfer"}
                </FancyButton>
              ) : null
            ) : (
              <ConnectWallet
                className="w-full p-0"
                onConnect={clickCbConnect}
                disconnectedLabel={
                  <div className="w-full p-0">
                    <FancyButton as="div">Connect Wallet</FancyButton>
                  </div>
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
