import {
  CakeIcon as CakeIconOutline,
  ChevronDownIcon as ChevronDownIconOutline,
  ChevronLeftIcon as ChevronLeftIconOutline,
  ChevronRightIcon as ChevronRightIconOutline,
  ChevronUpIcon as ChevronUpIconOutline,
  CheckCircleIcon as CheckCircleIconOutline,
  XCircleIcon as XCircleIconOutline,
  Cog8ToothIcon as Cog8ToothIconOutline,
  GiftIcon as GiftIconOutline,
  HomeIcon as HomeIconOutline,
  InformationCircleIcon as InformationCircleIconOutline,
  RectangleStackIcon as RectangleStackIconOutline,
  SparklesIcon as SparklesIconOutline,
  Squares2X2Icon as Squares2X2IconOutline,
  UserCircleIcon as UserCircleIconOutline,
  UserGroupIcon as UserGroupIconOutline,
  WalletIcon as WalletIconOutline,
} from "@heroicons/react/24/outline";
import {
  CakeIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog8ToothIcon,
  GiftIcon,
  HomeIcon,
  InformationCircleIcon,
  RectangleStackIcon,
  SparklesIcon,
  Squares2X2Icon,
  UserCircleIcon,
  UserGroupIcon,
  XMarkIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

enum IconEnum {
  // Navigation
  Home = "Home",
  Community = "Community",
  Collection = "Collection",
  Profile = "Profile",

  // Direction
  CircleCheck = "CircleCheck",
  CircleX = "CircleX",
  RegularX = "RegularX",

  // Direction
  ChevronUp = "ChevronUp",
  ChevronRight = "ChevronRight",
  ChevronDown = "ChevronDown",
  ChevronLeft = "ChevronLeft",

  // Misc
  Gift = "Gift",
  Info = "Info",
  Mint = "Mint",
  Stack = "Stack",
  Settings = "Settings",
  Wallet = "Wallet",
  Wish = "Wish",
}

type IHeroIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string;
    titleId?: string;
  } & RefAttributes<SVGSVGElement>
>;

const iconMap: Record<IconEnum, IHeroIcon> = {
  [IconEnum.ChevronUp]: ChevronUpIcon,
  [IconEnum.ChevronRight]: ChevronRightIcon,
  [IconEnum.ChevronDown]: ChevronDownIcon,
  [IconEnum.ChevronLeft]: ChevronLeftIcon,
  [IconEnum.CircleCheck]: CheckCircleIcon,
  [IconEnum.CircleX]: XCircleIcon,
  [IconEnum.Collection]: Squares2X2Icon,
  [IconEnum.Community]: UserGroupIcon,
  [IconEnum.Gift]: GiftIcon,
  [IconEnum.Home]: HomeIcon,
  [IconEnum.Info]: InformationCircleIcon,
  [IconEnum.Mint]: SparklesIcon,
  [IconEnum.Profile]: UserCircleIcon,
  [IconEnum.RegularX]: XMarkIcon,
  [IconEnum.Settings]: Cog8ToothIcon,
  [IconEnum.Stack]: RectangleStackIcon,
  [IconEnum.Wallet]: WalletIcon,
  [IconEnum.Wish]: CakeIcon,
};

const iconMapOutline: Record<IconEnum, IHeroIcon> = {
  [IconEnum.ChevronUp]: ChevronUpIconOutline,
  [IconEnum.ChevronRight]: ChevronRightIconOutline,
  [IconEnum.ChevronDown]: ChevronDownIconOutline,
  [IconEnum.ChevronLeft]: ChevronLeftIconOutline,
  [IconEnum.CircleCheck]: CheckCircleIconOutline,
  [IconEnum.CircleX]: XCircleIconOutline,
  [IconEnum.Collection]: Squares2X2IconOutline,
  [IconEnum.Community]: UserGroupIconOutline,
  [IconEnum.Gift]: GiftIconOutline,
  [IconEnum.Home]: HomeIconOutline,
  [IconEnum.Info]: InformationCircleIconOutline,
  [IconEnum.Mint]: SparklesIconOutline,
  [IconEnum.Profile]: UserCircleIconOutline,
  [IconEnum.RegularX]: XMarkIcon,
  [IconEnum.Settings]: Cog8ToothIconOutline,
  [IconEnum.Stack]: RectangleStackIconOutline,
  [IconEnum.Wallet]: WalletIconOutline,
  [IconEnum.Wish]: CakeIconOutline,
};

enum IconSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

const iconSizeMap: Record<IconSize, string> = {
  [IconSize.Small]: "size-5",
  [IconSize.Medium]: "size-7",
  [IconSize.Large]: "size-10",
};

const getIcon: ({
  color,
  icon,
  isOutline,
  size,
}: {
  icon: IconEnum;
  color?: string;
  isOutline?: boolean;
  size?: IconSize;
}) => React.ReactNode = ({
  icon,
  color = "text-white",
  isOutline = false,
  size = IconSize.Medium,
}) => {
  const IconComponent = isOutline ? iconMapOutline[icon] : iconMap[icon];

  return <IconComponent className={`${iconSizeMap[size]} ${color}`} />;
};

function Icon({
  icon,
  color,
  isOutline,
  size,
}: {
  icon: IconEnum;
  color?: string;
  isOutline?: boolean;
  size?: IconSize;
}) {
  return getIcon({ isOutline, icon, size, color });
}

export { Icon, IconEnum, IconSize };
