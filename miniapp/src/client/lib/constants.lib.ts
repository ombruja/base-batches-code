"use client";

import { BigNumber } from "alchemy-sdk";
import { encodeFunctionData } from "viem";

export const USDC_PADDING = BigNumber.from(10).pow(6);
export const HUNDREDS_PLACE_PADDING = BigNumber.from(10).pow(2);

export const DAILY_HOROSCOPE_USDC_COST = BigNumber.from(USDC_PADDING)
  .mul(process.env.NEXT_PUBLIC_COLLECT_DAILY_HOROSCOPE_COST_STRING ?? "1")
  .div(HUNDREDS_PLACE_PADDING);

export const MINT_ZODIAC_USDC_COST = BigNumber.from(USDC_PADDING)
  .mul(process.env.NEXT_PUBLIC_MINT_ZODIAC_COST_STRING ?? "1")
  .div(HUNDREDS_PLACE_PADDING);

export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  "") as `0x${string}`;

export const DAILY_HOROSCOPE_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_DAILY_HOROSCOPE_CONTRACT_ADDRESS ?? "") as `0x${string}`;

export const ZODIAC_CONTRACT_ADDRESS = (process.env
  .NEXT_PUBLIC_ZODIAC_CONTRACT_ADDRESS ?? "") as `0x${string}`;

export const encodeApproveData = ({
  spenderAddress,
  amountToApprove,
}: {
  spenderAddress: `0x${string}`;
  amountToApprove: BigNumber;
}) => {
  return encodeFunctionData({
    abi: [
      {
        name: "approve",
        type: "function",
        inputs: [
          { name: "spender", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "approve",
    args: [spenderAddress, amountToApprove.toBigInt()],
  });
};

export const encodeMintDailyHoroscopeData = (
  account: `0x${string}`,
  id: `0x${string}`,
  dataPayload?: `0x${string}`,
) => {
  return encodeFunctionData({
    abi: [
      {
        name: "mint",
        type: "function",
        inputs: [
          { name: "to", type: "address" },
          { name: "tokenId", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "mint",
    args: [
      // address to,
      account,
      // uint256 tokenId,
      id as unknown as bigint, // force type interpretation as bigint
      // bytes memory data
      !!dataPayload ? (dataPayload as `0x${string}`) : "0x",
    ],
  });
};

export const encodeMintWesternZodiacBatchData = (
  account: `0x${string}`,
  // ids: `0x${string}`[],
  ids: bigint[],
  amounts: bigint[],
  dataPayload: `0x${string}`,
) => {
  return encodeFunctionData({
    abi: [
      {
        name: "mintBatch",
        type: "function",
        inputs: [
          { name: "account", type: "address" },
          { name: "ids", type: "uint256[]" },
          { name: "amounts", type: "uint256[]" },
          { name: "data", type: "bytes" },
        ],
        outputs: [],
        stateMutability: "nonpayable",
      },
    ],
    functionName: "mintBatch",
    args: [
      // address account,
      account,
      // uint256[] memory ids,
      ids, // force type interpretation as bigint
      // uint256[] memory amounts,
      amounts,
      // bytes memory data
      dataPayload,
    ],
  });
};
