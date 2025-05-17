"use client";

import { Suspense, useCallback, useState } from "react";

import CollectDailyHoroscopeSheet from "~/client/components/CollectDailyHoroscopeSheet";
import AuthenticatedLayout from "~/client/components/layout/AuthenticatedLayout";
import { InformationPopOut } from "~/client/components/InformationPopOut";
import LoadingPanelAuth from "~/client/components/LoadingPanelAuth";
import { useUser } from "~/client/hooks/useUser.hook";

import DailyHoroscopePanel from "./DailyHoroscopePanel";

export default function App() {
  const [isOpen, setOpen] = useState(false);
  const [isRootPageLoading, setIsRootPageLoading] = useState(false);
  const [internalImage, setInternalImage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { userDetails } = useUser();

  const clickCollect = useCallback(() => {
    setIsRootPageLoading(true);
    setOpen(true);
  }, []);

  return (
    <Suspense fallback={<LoadingPanelAuth />}>
      <AuthenticatedLayout disableNavigation={isRootPageLoading}>
        <div className="flex flex-col gap-10 px-4 pb-4">
          <div className="flex flex-col gap-4 px-0 py-0 border rounded-lg shadow-lg bg-transparent border-transparent">
            <div className="relative w-full">
              <div className="flex flex-row items-center justify-center gap-2">
                <h2 className="text-xl text-center font-bold mb-0">
                  Daily Horoscope
                </h2>

                <InformationPopOut fullWidth>
                  <>
                    <p className="text-sm text-white/80">
                      <b>Disclaimer:</b> BRUJAI is an AI agent in training,
                      generating your horoscope. The Mini App is currently in
                      its v1 experimental phase.
                    </p>
                    <p className="text-sm text-white/80">
                      For feedback or issue reports, please contact us at
                      support@ombruja.com
                    </p>
                  </>
                </InformationPopOut>
              </div>

              {!isRootPageLoading && !isSuccess && (
                <div className="text-white/60 text-base font-normal italic text-center mt-0">
                  <h3>
                    {!userDetails?.user?.dob
                      ? "Add birthday to collect"
                      : "Collect to reveal horoscope"}
                  </h3>
                </div>
              )}
            </div>

            <DailyHoroscopePanel
              internalImage={internalImage}
              isRootPageLoading={isRootPageLoading}
              isSuccess={isSuccess}
              clickCollect={clickCollect}
              setInternalImage={setInternalImage}
              setIsSuccess={setIsSuccess}
            />
          </div>
        </div>
      </AuthenticatedLayout>

      <CollectDailyHoroscopeSheet
        isOpen={isOpen}
        isSuccess={isSuccess}
        setOpen={setOpen}
        setInternalImage={setInternalImage}
        setIsRootPageLoading={setIsRootPageLoading}
        setIsSuccess={setIsSuccess}
      />
    </Suspense>
  );
}
