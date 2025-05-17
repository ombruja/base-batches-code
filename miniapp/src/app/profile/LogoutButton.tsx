"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { authenticated, ready, logout } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready) {
      if (!authenticated) {
        router.push("/login");
      }
    }
  }, [authenticated, ready, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    await logout();
  };

  return (
    <button
      className="text-white flex flex-row items-center"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <h3
        className={`flex ${
          isLoading ? "text-slate-400" : "text-amber-400"
        } text-base text-center items-center`}
      >
        Logout
      </h3>
    </button>
  );
}

{
  /* <div className="flex flex-col items-center w-full pt-4">
<FancyButton onClick={() => handleLogout()}>Logout</FancyButton>
</div> */
}
