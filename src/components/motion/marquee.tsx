"use client";

import { useRef } from "react";
import { useMotion } from "./gsap";

/**
 * Cinta infinita cuya velocidad y dirección siguen al scroll.
 * Sin JS se desplaza con CSS; con movimiento reducido queda quieta.
 */
export function Marquee({ items, separator = "/" }: { items: string[]; separator?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useMotion(({ gsap, ScrollTrigger }) => {
    const track = trackRef.current;
    if (!track) return;
    // GSAP toma el relevo de la animación CSS desde la posición actual.
    const offset = new DOMMatrix(getComputedStyle(track).transform).m41;
    const progress = track.offsetWidth ? Math.min(Math.abs(offset) / (track.offsetWidth / 2), 1) : 0;
    track.style.animation = "none";

    const loop = gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 42, ease: "none", repeat: -1 });
    loop.progress(progress);
    let direction = 1;

    const st = ScrollTrigger.create({
      onUpdate(self) {
        direction = self.direction;
        const boost = gsap.utils.clamp(1, 7, 1 + Math.abs(self.getVelocity()) / 350);
        gsap.to(loop, {
          timeScale: boost * direction,
          duration: 0.3,
          overwrite: true,
          onComplete: () => {
            gsap.to(loop, { timeScale: direction, duration: 1.4, ease: "power2.out" });
          },
        });
      },
    });

    return () => {
      st.kill();
      loop.kill();
      track.style.animation = "";
    };
  }, [], { media: "(pointer: fine)" }); // En táctil basta la animación CSS.

  const sequence = (copy: number) =>
    items.map((item) => (
      <span key={`${copy}-${item}`} className="flex items-center gap-[0.5em]">
        <span>{item}</span>
        <span className="font-serif text-signal">{separator}</span>
      </span>
    ));

  return (
    <div className="relative overflow-hidden border-y border-line py-5 sm:py-8">
      <p className="sr-only">Stack: {items.join(", ")}</p>
      <div
        ref={trackRef}
        aria-hidden="true"
        className="marquee-track display flex w-max gap-[0.5em] whitespace-nowrap pr-[0.5em] text-[clamp(2.25rem,6.5vw,6rem)] text-ink"
      >
        {sequence(0)}
        {sequence(1)}
      </div>
    </div>
  );
}
