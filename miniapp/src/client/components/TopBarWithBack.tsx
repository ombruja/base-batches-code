"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Icon, IconEnum, IconSize } from "~/client/components/Icons";
import { InformationPopOut } from "~/client/components/InformationPopOut";
import { TopBarConnectionButton } from "~/client/components/TopBarConnectionButton";

export default function TopBarWithBack({
  title,
  backButtonText = "Back",
  backButtonHref = "/",
  hideLeftSide,
  hideRightSideConnection,
  isLoading,
  rightSideElement,
  leftSideElement,
  subtitle,
  titleInformationPopOut,
}: {
  title: string;
  backButtonText?: string;
  backButtonHref?: string;
  hideLeftSide?: boolean;
  hideRightSideConnection?: boolean;
  isLoading?: boolean;
  rightSideElement?: ReactNode;
  leftSideElement?: ReactNode;
  subtitle?: string;
  titleInformationPopOut?: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="relative w-full flex flex-col my-10 px-4">
      <div
        className={`w-full flex flex-row items-center ${!leftSideElement && hideLeftSide ? "justify-end" : "justify-between"}`}
      >
        {!!leftSideElement
          ? leftSideElement
          : !hideLeftSide && (
              <button
                className="text-white flex flex-row items-center gap-2"
                onClick={
                  backButtonHref
                    ? () => router.push(backButtonHref)
                    : () => router.back()
                }
                disabled={isLoading}
              >
                <Icon
                  icon={IconEnum.ChevronLeft}
                  size={IconSize.Small}
                  color={isLoading ? "text-slate-400" : "text-amber-400"}
                  isOutline
                />
                <h3
                  className={`flex ${
                    isLoading ? "text-slate-400" : "text-amber-400"
                  } text-base text-center items-center`}
                >
                  {backButtonText}
                </h3>
              </button>
            )}

        {!!rightSideElement ? (
          rightSideElement
        ) : !hideRightSideConnection ? (
          <TopBarConnectionButton isLoading={isLoading} />
        ) : null}
      </div>

      <div className="w-full flex flex-col items-center justify-center ">
        <div className="flex flex-row items-center gap-2">
          <h2 className="text-white text-2xl font-bold text-center mt-4">
            {title}
          </h2>
          {titleInformationPopOut && (
            <InformationPopOut>{titleInformationPopOut}</InformationPopOut>
          )}
        </div>
        {subtitle && (
          <h3
            className={`text-white text-base font-normal text-center mt-2 ${
              isLoading ? "text-slate-400" : "text-amber-400"
            }`}
          >
            {subtitle}
          </h3>
        )}
      </div>
    </div>
  );
}
