"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type AudienceMode = "all" | "recruiter" | "client";

interface AudienceContextValue {
  mode: AudienceMode;
  setMode: (mode: AudienceMode) => void;
}

const STORAGE_KEY = "audience_mode";
const EVENT = "audience-change";

const AudienceContext = createContext<AudienceContextValue>({
  mode: "all",
  setMode: () => {},
});

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
  };
}

// Respaldo en memoria por si sessionStorage no está disponible.
let memoryMode: AudienceMode | null = null;

function getSnapshot(): AudienceMode {
  if (memoryMode) return memoryMode;
  try {
    const val = sessionStorage.getItem(STORAGE_KEY);
    if (val === "recruiter" || val === "client") return val;
  } catch {
    // sessionStorage puede no estar disponible (modo privado, bloqueos)
  }
  return "all";
}

function getServerSnapshot(): AudienceMode {
  return "all";
}

function setMode(newMode: AudienceMode) {
  memoryMode = newMode;
  try {
    sessionStorage.setItem(STORAGE_KEY, newMode);
  } catch {
    // Sin almacenamiento la elección dura solo esta vista
  }
  document.documentElement.dataset.audience = newMode;
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Audiencia de la visita (empresa / cliente). Se refleja en
 * `<html data-audience>`, que cambia el color de acento de todo el sitio.
 */
export function AudienceProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.dataset.audience = mode;
  }, [mode]);

  return <AudienceContext.Provider value={{ mode, setMode }}>{children}</AudienceContext.Provider>;
}

export function useAudience() {
  return useContext(AudienceContext);
}
