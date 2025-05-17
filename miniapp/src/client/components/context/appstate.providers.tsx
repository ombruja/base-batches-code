"use client";

import { createContext, useContext, useReducer } from "react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export enum NavPanel {
  HOME = "HOME",
  PROFILE = "PROFILE",
  COLLECTION = "COLLECTION",
}

export enum AppStateActionEnum {
  SET_AUTH = "SET_AUTH",
  SET_NAV_PANEL = "SET_NAV_PANEL",
}

type AppStateAction =
  | { type: AppStateActionEnum.SET_AUTH; payload: boolean }
  | { type: AppStateActionEnum.SET_NAV_PANEL; payload: NavPanel };

interface AppState {
  isAuth: boolean;
  navPanel: NavPanel;
}

// Create context with initial state
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppStateAction>;
} | null>(null);

const initialState: AppState = {
  isAuth: false,
  navPanel: NavPanel.HOME,
};

// Reducer
function appStateReducer(state: AppState, action: AppStateAction) {
  switch (action.type) {
    case AppStateActionEnum.SET_AUTH:
      return { ...state, isAuth: action.payload };
    case AppStateActionEnum.SET_NAV_PANEL:
      return { ...state, navPanel: action.payload };
    default:
      return state;
  }
}

// Provider component
export function AppStateProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      <SessionProvider session={session}>{children}</SessionProvider>
    </AppStateContext.Provider>
  );
}

// Custom hook
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context)
    throw new Error("useAppState must be used within AppStateProvider");
  return context;
}
