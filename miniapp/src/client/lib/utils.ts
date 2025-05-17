import { BigNumber } from "alchemy-sdk";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { zodiacList } from "~/client/types/client.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getZodiacSign = (month: number, day: number) => {
  // Check each zodiac sign
  for (const sign of zodiacList) {
    // Special case for Capricorn (spans December to January)
    if (sign.title === "Capricorn") {
      if (
        (month === 12 && day >= sign.startDate.day) ||
        (month === 1 && day <= sign.endDate.day)
      ) {
        return sign;
      }
    }
    // All other signs
    else if (
      (month === sign.startDate.month && day >= sign.startDate.day) ||
      (month === sign.endDate.month && day <= sign.endDate.day)
    ) {
      return sign;
    }
  }

  // Default fallback (should never reach here if dates are correct)
  return zodiacList[0];
};

export const formatUsdcToDollars = (amount: BigNumber): string => {
  try {
    // Handle zero
    if (amount.isZero()) {
      return "$0";
    }

    // Handle negative numbers
    const isNegative = amount.lt(0);
    const absoluteAmount = isNegative ? amount.mul(-1) : amount;

    // Convert to string
    const amountString = absoluteAmount.toString();

    let dollars, cents;

    if (amountString.length <= 6) {
      // Less than 1 dollar (need to handle partial cents)
      dollars = "0";

      // Pad with leading zeros to get to 6 digits (USDC decimals)
      const paddedAmount = amountString.padStart(6, "0");

      // Take first two digits for cents
      cents = paddedAmount.slice(0, 2);
    } else {
      // 1 dollar or more
      dollars = amountString.slice(0, -6);
      cents = amountString.slice(-6, -4);
    }

    // Return whole dollar amount if cents are zero
    if (cents === "00") {
      return `${isNegative ? "-$" : "$"}${dollars}`;
    }

    // Add dollar sign, decimal, and cents
    return `${isNegative ? "-$" : "$"}${dollars}.${cents}`;
  } catch (error) {
    console.error("Error formatting USDC amount:", error);
    return "$0";
  }
};
