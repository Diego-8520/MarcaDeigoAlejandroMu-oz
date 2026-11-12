"use client";

import { useSyncExternalStore } from "react";
import { CONTACT } from "@/lib/site";

const formatter = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: CONTACT.timezone,
});

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 15_000);
  return () => window.clearInterval(id);
}

/** Hora local de Cali en vivo. En servidor muestra un marcador para evitar desajustes de hidratación. */
export function CaliClock({ className }: { className?: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => formatter.format(Date.now()),
    () => "--:--",
  );

  return (
    <span className={className}>
      <span className="text-ink-subtle">CLO</span> <time suppressHydrationWarning>{time}</time>{" "}
      <span className="text-ink-subtle">GMT-5</span>
    </span>
  );
}
