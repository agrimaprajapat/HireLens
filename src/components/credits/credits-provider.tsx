"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

interface CreditsContextValue {
  /** Current balance, or null while unknown / signed out. */
  credits: number | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  /** Re-fetch the balance from the server. */
  refresh: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

/**
 * Holds the signed-in user's credit balance for the whole app, so the navbar and
 * generation sections stay in sync. Fetches on load and exposes `refresh()` to
 * call after a successful generation.
 */
export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!isSignedIn) {
      setCredits(null);
      return;
    }
    try {
      const res = await fetch("/api/credits");
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.credits === "number") setCredits(data.credits);
    } catch {
      // Leave the last known balance in place on transient failures.
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isLoaded) refresh();
  }, [isLoaded, isSignedIn, refresh]);

  return (
    <CreditsContext.Provider
      value={{ credits, isSignedIn: !!isSignedIn, isLoaded, refresh }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within a CreditsProvider");
  return ctx;
}

export interface GenerationGateState {
  /** True when the user cannot currently generate. */
  blocked: boolean;
  needsSignIn: boolean;
  outOfCredits: boolean;
}

/** Derive whether AI generation is currently allowed. */
export function useGenerationGate(): GenerationGateState {
  const { isLoaded, isSignedIn, credits } = useCredits();
  const needsSignIn = isLoaded && !isSignedIn;
  const outOfCredits = isSignedIn && credits === 0;
  return {
    blocked: needsSignIn || outOfCredits,
    needsSignIn,
    outOfCredits,
  };
}
