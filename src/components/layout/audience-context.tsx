"use client";

import React, { createContext, useContext, useState, useSyncExternalStore } from "react";

export type AudienceMode = "all" | "recruiter" | "client";

interface AudienceContextValue {
  mode: AudienceMode;
  setMode: (mode: AudienceMode) => void;
}

const AudienceContext = createContext<AudienceContextValue>({
  mode: "all",
  setMode: () => {},
});

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(): AudienceMode {
  try {
    const val = sessionStorage.getItem("audience_mode");
    if (val === "recruiter" || val === "client") return val;
  } catch {
    // Ignore
  }
  return "all";
}

function getServerSnapshot(): AudienceMode {
  return "all";
}

export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const [internalMode, setInternalMode] = useState<AudienceMode>("all");

  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const currentMode = internalMode !== "all" ? internalMode : mode;

  const setMode = (newMode: AudienceMode) => {
    setInternalMode(newMode);
    try {
      sessionStorage.setItem("audience_mode", newMode);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
  };

  return (
    <AudienceContext.Provider value={{ mode: currentMode, setMode }}>
      {children}
    </AudienceContext.Provider>
  );
}

export function useAudience() {
  return useContext(AudienceContext);
}
