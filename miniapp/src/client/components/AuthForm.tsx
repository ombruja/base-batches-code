import { useCallback, useEffect, useState } from "react";

import { useAddFrame, useMiniKit } from "@coinbase/onchainkit/minikit";

import {
  AppStateActionEnum,
  useAppState,
} from "~/client/components/context/appstate.providers";
import { FancyButton } from "~/client/components/ui/fancy-button";

export function AuthForm() {
  const { dispatch } = useAppState();

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  const addFrame = useAddFrame();
  const { context } = useMiniKit();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setIsCheckingPassword(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({ type: AppStateActionEnum.SET_AUTH, payload: true });
      } else {
        setPasswordError("Invalid password");
      }
    } catch (err) {
      console.error("Password validation error:", err);
      setPasswordError("Error checking password");
    } finally {
      setIsCheckingPassword(false);
    }
  };

  // Usage
  const handleAddFrame = useCallback(async () => {
    const result = await addFrame();
    if (result) {
      console.log("Frame added:", result.url, result.token);
    }
  }, [addFrame]);

  useEffect(() => {
    if (!!context && !context.client.added) {
      handleAddFrame();
    }
  }, [context, handleAddFrame]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handlePasswordSubmit}
        className="flex flex-col items-center gap-4 p-8 border rounded-lg shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-4 select-none">Enter Password</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 rounded-md bg-slate-950 text-white h-[4rem] text-center text-lg border border-amber-400/50"
          placeholder="Password"
          disabled={isCheckingPassword}
        />
        {passwordError && (
          <p className="text-red-500 text-sm">{passwordError}</p>
        )}

        <FancyButton disabled={isCheckingPassword} type="submit" basic>
          {isCheckingPassword ? "Checking..." : "Submit"}
        </FancyButton>
      </form>
    </div>
  );
}

export default AuthForm;
