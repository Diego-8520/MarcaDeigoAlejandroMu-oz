"use client";

import { Children, isValidElement, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { loadSplitText, useMotion } from "./gsap";
import { cn } from "@/lib/utils";

type RevealProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  /**
   * Contenido visible al cargar (hero, cabeceras). Se anima con CSS y solo se
   * desplaza: está pintado desde el primer frame (no retrasa el LCP) y no
   * espera a que llegue JavaScript.
   */
  immediate?: boolean;
  id?: string;
};

/** ¿Todos los hijos son bloques (`className` con "block")? Entonces se escalonan línea a línea. */
function hasBlockLines(children: ReactNode) {
  const items = Children.toArray(children).filter((c) => !(typeof c === "string" && c.trim() === ""));
  return (
    items.length > 1 &&
    items.every((c) => isValidElement<{ className?: string }>(c) && /\bblock\b/.test(c.props.className ?? ""))
  );
}

const riseStyle = (delay: number, y?: string) =>
  ({ "--rise-delay": `${delay}s`, ...(y ? { "--rise-y": y } : {}) }) as CSSProperties;

/**
 * Titular revelado línea a línea tras una máscara (al entrar en vista).
 * Con `immediate` sube con CSS sin ocultarse. Sin movimiento se pinta tal cual.
 */
export function SplitReveal({ as: Tag = "h2", children, className, delay = 0, immediate, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useMotion(
    ({ gsap }) => {
      const el = ref.current;
      if (!el || immediate) return;
      let split: { revert: () => void } | undefined;
      let cancelled = false;
      loadSplitText().then((SplitText) => {
        if (cancelled) return;
        split = SplitText.create(el, {
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
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          },
        });
      });
      return () => {
        cancelled = true;
        split?.revert();
      };
    },
    [immediate, delay],
    { trigger: ref },
  );

  if (immediate) {
    return (
      <Tag
        id={id}
        className={cn(hasBlockLines(children) ? "rise-lines" : "rise", className)}
        style={riseStyle(delay, hasBlockLines(children) ? "0.42em" : "0.32em")}
      >
        {children}
      </Tag>
    );
  }

  return (
    // Sin movimiento la clase `js-motion` no existe y el CSS no oculta nada.
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

  useMotion(
    ({ gsap }) => {
      const el = ref.current;
      if (!el || immediate) return;
      const targets = stagger ? Array.from(el.children) : el;
      el.dataset.revealReady = "";
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          delay,
          stagger: stagger ? 0.07 : 0,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        },
      );
    },
    [immediate, stagger, y, delay],
    { trigger: ref },
  );

  if (immediate) {
    return (
      <Tag id={id} className={cn(stagger ? "rise-children" : "rise", className)} style={riseStyle(delay, `${y}px`)}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} id={id} data-reveal="" className={className}>
      {children}
    </Tag>
  );
}
