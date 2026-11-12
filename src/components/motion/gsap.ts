"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1 });
}

/** El movimiento solo corre si el script de arranque activó `js-motion`. */
export function motionEnabled() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("js-motion") &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
