"use client";

import CircleLoader from "react-spinners/CircleLoader";

export default function LoadingPanel() {
  return (
    <div className="min-h-screen flex items-center flex-col justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center">
        <CircleLoader
          color={"#FFD700"}
          size={150}
          aria-label="Loading Spinner"
          data-testid="loader"
          loading
        />

        <h3 className="text-white text-xl font-normal text-center mt-4">
          Loading...
        </h3>
      </div>
    </div>
  );
}
