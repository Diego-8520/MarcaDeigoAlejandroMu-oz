"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP, motionEnabled } from "./gsap";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Revela al montar en lugar de esperar a que entre en vista (hero). */
  immediate?: boolean;
  id?: string;
};

/**
 * Titular revelado línea a línea tras una máscara. Sin movimiento el texto
 * se pinta tal cual desde el servidor.
 */
export function SplitReveal({ as: Tag = "h2", children, className, delay = 0, immediate, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (!motionEnabled()) {
        el.dataset.revealReady = "";
        return;
      }
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "splitline",
        autoSplit: true,
        onSplit(self) {
          el.dataset.revealReady = "";
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.15,
            stagger: 0.085,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-split="" className={className}>
      {children}
    </Tag>
  );
}

/** Aparición con desplazamiento suave para bloques; `stagger` anima los hijos en cascada. */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  immediate,
  stagger,
  y = 32,
  id,
}: RevealProps & { stagger?: boolean; y?: number }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      el.dataset.revealReady = "";
      if (!motionEnabled()) return;
      const targets = stagger ? Array.from(el.children) : el;
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          delay,
          stagger: stagger ? 0.07 : 0,
          scrollTrigger: immediate ? undefined : { trigger: el, start: "top 90%", once: true },
        },
      );
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
