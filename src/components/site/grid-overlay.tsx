"use client";

import { useEffect, useState } from "react";

/** Rejilla de 12 columnas que se muestra con la tecla G (easter egg de diseño). */
export function GridOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) setVisible((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55]">
      <div className="container-x grid h-full grid-cols-4 gap-x-6 md:grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`h-full bg-signal/[0.06] outline outline-1 outline-signal/20 ${i >= 4 ? "hidden md:block" : ""}`} />
        ))}
      </div>
    </div>
  );
}
