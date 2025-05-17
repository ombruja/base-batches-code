export type ZodiacElement = {
  title: string;
  slug: ZodiacSlug;
  enum: ZodiacApiEnum;
  symbol: string;
  emoji: string;
  house: number;
  element: string;
  startDate: { month: number; day: number };
  endDate: { month: number; day: number };
  src: string;
  srcStamp: string;
  srcGlyph: string;
};

export type DailyHoroscopeUrlElement = {
  date: string;
  id: string;
  url: string;
};

export enum ZodiacSlug {
  ARIES = "zodiac-aries",
  TAURUS = "zodiac-taurus",
  GEMINI = "zodiac-gemini",
  CANCER = "zodiac-cancer",
  LEO = "zodiac-leo",
  VIRGO = "zodiac-virgo",
  LIBRA = "zodiac-libra",
  SCORPIO = "zodiac-scorpio",
  SAGITTARIUS = "zodiac-sagittarius",
  CAPRICORN = "zodiac-capricorn",
  AQUARIUS = "zodiac-aquarius",
  PISCES = "zodiac-pisces",
}

export enum ZodiacApiEnum {
  ARIES = "aries",
  TAURUS = "taurus",
  GEMINI = "gemini",
  CANCER = "cancer",
  LEO = "leo",
  VIRGO = "virgo",
  LIBRA = "libra",
  SCORPIO = "scorpio",
  SAGITTARIUS = "sagittarius",
  CAPRICORN = "capricorn",
  AQUARIUS = "aquarius",
  PISCES = "pisces",
}

export const zodiacApiEnumToZodiacSlug: Record<ZodiacApiEnum, ZodiacSlug> = {
  [ZodiacApiEnum.ARIES]: ZodiacSlug.ARIES,
  [ZodiacApiEnum.TAURUS]: ZodiacSlug.TAURUS,
  [ZodiacApiEnum.GEMINI]: ZodiacSlug.GEMINI,
  [ZodiacApiEnum.CANCER]: ZodiacSlug.CANCER,
  [ZodiacApiEnum.LEO]: ZodiacSlug.LEO,
  [ZodiacApiEnum.VIRGO]: ZodiacSlug.VIRGO,
  [ZodiacApiEnum.LIBRA]: ZodiacSlug.LIBRA,
  [ZodiacApiEnum.SCORPIO]: ZodiacSlug.SCORPIO,
  [ZodiacApiEnum.SAGITTARIUS]: ZodiacSlug.SAGITTARIUS,
  [ZodiacApiEnum.CAPRICORN]: ZodiacSlug.CAPRICORN,
  [ZodiacApiEnum.AQUARIUS]: ZodiacSlug.AQUARIUS,
  [ZodiacApiEnum.PISCES]: ZodiacSlug.PISCES,
};

export const zodiacList: ZodiacElement[] = [
  {
    title: "Aries",
    slug: ZodiacSlug.ARIES,
    enum: ZodiacApiEnum.ARIES,
    symbol: "♈︎",
    emoji: "♈️",
    house: 1,
    element: "Fire",
    startDate: { month: 3, day: 21 }, // March 21
    endDate: { month: 4, day: 19 }, // April 19
    src: "/images/zodiac/cover/aries.png",
    srcStamp: "/images/zodiac/stamp/aries.png",
    srcGlyph: "/images/zodiac/glyph/aries.png",
  },
  {
    title: "Taurus",
    slug: ZodiacSlug.TAURUS,
    enum: ZodiacApiEnum.TAURUS,
    symbol: "♉︎",
    emoji: "♉️",
    house: 2,
    element: "Earth",
    startDate: { month: 4, day: 20 }, // April 20
    endDate: { month: 5, day: 20 }, // May 20
    src: "/images/zodiac/cover/taurus.png",
    srcStamp: "/images/zodiac/stamp/taurus.png",
    srcGlyph: "/images/zodiac/glyph/taurus.png",
  },
  {
    title: "Gemini",
    slug: ZodiacSlug.GEMINI,
    enum: ZodiacApiEnum.GEMINI,
    symbol: "♊︎",
    emoji: "♊️",
    house: 3,
    element: "Air",
    startDate: { month: 5, day: 21 }, // May 21
    endDate: { month: 6, day: 20 }, // June 20
    src: "/images/zodiac/cover/gemini.png",
    srcStamp: "/images/zodiac/stamp/gemini.png",
    srcGlyph: "/images/zodiac/glyph/gemini.png",
  },
  {
    title: "Cancer",
    slug: ZodiacSlug.CANCER,
    enum: ZodiacApiEnum.CANCER,
    symbol: "♋︎",
    emoji: "♋️",
    house: 4,
    element: "Water",
    startDate: { month: 6, day: 21 }, // June 21
    endDate: { month: 7, day: 22 }, // July 22
    src: "/images/zodiac/cover/cancer.png",
    srcStamp: "/images/zodiac/stamp/cancer.png",
    srcGlyph: "/images/zodiac/glyph/cancer.png",
  },
  {
    title: "Leo",
    slug: ZodiacSlug.LEO,
    enum: ZodiacApiEnum.LEO,
    symbol: "♌︎",
    emoji: "♌️",
    house: 5,
    element: "Fire",
    startDate: { month: 7, day: 23 }, // July 23
    endDate: { month: 8, day: 22 }, // August 22
    src: "/images/zodiac/cover/leo.png",
    srcStamp: "/images/zodiac/stamp/leo.png",
    srcGlyph: "/images/zodiac/glyph/leo.png",
  },
  {
    title: "Virgo",
    slug: ZodiacSlug.VIRGO,
    enum: ZodiacApiEnum.VIRGO,
    symbol: "♍︎",
    emoji: "♍️",
    house: 6,
    element: "Earth",
    startDate: { month: 8, day: 23 }, // August 23
    endDate: { month: 9, day: 22 }, // September 22
    src: "/images/zodiac/cover/virgo.png",
    srcStamp: "/images/zodiac/stamp/virgo.png",
    srcGlyph: "/images/zodiac/glyph/virgo.png",
  },
  {
    title: "Libra",
    slug: ZodiacSlug.LIBRA,
    enum: ZodiacApiEnum.LIBRA,
    symbol: "♎︎",
    emoji: "♎️",
    house: 7,
    element: "Air",
    startDate: { month: 9, day: 23 }, // September 23
    endDate: { month: 10, day: 22 }, // October 22
    src: "/images/zodiac/cover/libra.png",
    srcStamp: "/images/zodiac/stamp/libra.png",
    srcGlyph: "/images/zodiac/glyph/libra.png",
  },
  {
    title: "Scorpio",
    slug: ZodiacSlug.SCORPIO,
    enum: ZodiacApiEnum.SCORPIO,
    symbol: "♏︎",
    emoji: "♏️",
    house: 8,
    element: "Water",
    startDate: { month: 10, day: 23 }, // October 23
    endDate: { month: 11, day: 21 }, // November 21
    src: "/images/zodiac/cover/scorpio.png",
    srcStamp: "/images/zodiac/stamp/scorpio.png",
    srcGlyph: "/images/zodiac/glyph/scorpio.png",
  },
  {
    title: "Sagittarius",
    slug: ZodiacSlug.SAGITTARIUS,
    enum: ZodiacApiEnum.SAGITTARIUS,
    symbol: "♐︎",
    emoji: "♐️",
    house: 9,
    element: "Fire",
    startDate: { month: 11, day: 22 }, // November 22
    endDate: { month: 12, day: 21 }, // December 21
    src: "/images/zodiac/cover/sagittarius.png",
    srcStamp: "/images/zodiac/stamp/sagittarius.png",
    srcGlyph: "/images/zodiac/glyph/sagittarius.png",
  },
  {
    title: "Capricorn",
    slug: ZodiacSlug.CAPRICORN,
    enum: ZodiacApiEnum.CAPRICORN,
    symbol: "♑︎",
    emoji: "♑️",
    house: 10,
    element: "Earth",
    startDate: { month: 12, day: 22 }, // December 22
    endDate: { month: 1, day: 19 }, // January 19
    src: "/images/zodiac/cover/capricorn.png",
    srcStamp: "/images/zodiac/stamp/capricorn.png",
    srcGlyph: "/images/zodiac/glyph/capricorn.png",
  },
  {
    title: "Aquarius",
    slug: ZodiacSlug.AQUARIUS,
    enum: ZodiacApiEnum.AQUARIUS,
    symbol: "♒︎",
    emoji: "♒️",
    house: 11,
    element: "Air",
    startDate: { month: 1, day: 20 }, // January 20
    endDate: { month: 2, day: 18 }, // February 18
    src: "/images/zodiac/cover/aquarius.png",
    srcStamp: "/images/zodiac/stamp/aquarius.png",
    srcGlyph: "/images/zodiac/glyph/aquarius.png",
  },
  {
    title: "Pisces",
    slug: ZodiacSlug.PISCES,
    enum: ZodiacApiEnum.PISCES,
    symbol: "♓︎",
    emoji: "♓️",
    house: 12,
    element: "Water",
    startDate: { month: 2, day: 19 }, // February 19
    endDate: { month: 3, day: 20 }, // March 20
    src: "/images/zodiac/cover/pisces.png",
    srcStamp: "/images/zodiac/stamp/pisces.png",
    srcGlyph: "/images/zodiac/glyph/pisces.png",
  },
];

export const zodiacMap = zodiacList.reduce(
  (acc, zodiac) => {
    acc[zodiac.slug] = zodiac;
    return acc;
  },
  {} as Record<ZodiacSlug, ZodiacElement>,
);

// Define enum for account login types
export enum AccountLoginType {
  EMAIL = "EMAIL",
  FARCASTER = "FARCASTER",
}

export type ConnectedWallet = {
  id: string;
  userId: string;
  walletAddress: string;
  createdAt: string;
  updatedAt: string;
};

// Define specific user type based on your database schema
export type ClientUserData = {
  id: string;
  // privy_id: string;
  accountLoginType: AccountLoginType;
  dob: string | null;
  isDobPublic: boolean;
  isOnboarded: boolean;
  farcasterAccountId: string | null;
  privyAccountId: string | null;
  name: string | null;

  connectedWallets: ConnectedWallet[];

  // Dates
  createdAt: string;
  updatedAt: string;
};

export type CastEmbedType = [] | [string] | [string, string];

export interface WesternZodiacPiece {
  artistFid: number;
  artistFolderName: string;
  artistHandle: string;
  artistId: string;
  collectionFolderName: string;
  count: number;
  createdAt: string;
  id: string;
  imageUrl: string;
  onchainId: string;
  updatedAt: string;
  westernZodiacCollectionId: string;
  westernZodiacSign: string;
}
