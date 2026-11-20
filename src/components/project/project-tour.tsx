"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { BrowserFrame, type FrameImage } from "./frames";

export type TourItem = FrameImage & { id: string; caption?: string | null };

/**
 * «Recorrido»: las secciones clave del proyecto en secuencia editorial
 * (columnas alternas) con un visor a pantalla completa navegable por teclado.
 */
export function ProjectTour({ items, domain }: { items: TourItem[]; domain?: string | null }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <>
      <ol className="space-y-16 sm:space-y-24">
        {items.map((item, i) => {
          const alternate = i % 2 === 1;
          return (
            <li key={item.id} className="grid grid-cols-1 gap-5 sm:grid-cols-12 sm:gap-6">
              <Reveal className={alternate ? "sm:col-span-9 sm:col-start-4" : "sm:col-span-9"}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Ampliar: ${item.alt}`}
                  className="group relative block w-full text-left"
                >
                  <BrowserFrame image={item} domain={domain} sizes="(min-width: 1600px) 1180px, (min-width: 640px) 75vw, 100vw" />
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-12 flex h-9 w-9 items-center justify-center border border-line bg-paper/80 text-ink opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <Maximize2 size={14} />
                  </span>
                </button>
              </Reveal>
              <p
                className={`font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted sm:row-start-1 sm:self-end ${
                  alternate ? "sm:col-span-3 sm:col-start-1" : "sm:col-span-3 sm:col-start-10"
                }`}
              >
                <span className="text-signal">{String(i + 1).padStart(2, "0")} —</span>{" "}
                <span className="text-ink">{item.caption ?? item.alt}</span>
              </p>
            </li>
          );
        })}
      </ol>
      <Lightbox items={items} index={open} onChange={setOpen} />
    </>
  );
}

/** Visor modal con <dialog> nativo: Esc cierra, ← → navegan, el foco queda dentro. */
function Lightbox({
  items,
  index,
  onChange,
}: {
  items: TourItem[];
  index: number | null;
  onChange: (index: number | null) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const item = index !== null ? items[index] : null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (index !== null && !dialog.open) dialog.showModal();
    if (index === null && dialog.open) dialog.close();
  }, [index]);

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onChange((index + delta + items.length) % items.length);
    },
    [index, items.length, onChange],
  );

  return (
    <dialog
      ref={ref}
      aria-label={item ? item.alt : "Visor de imágenes"}
      onClose={() => onChange(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onChange(null);
      }}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-paper/95 p-0 text-ink backdrop:bg-paper/90"
    >
      {item && (
        <div className="flex h-full flex-col">
          <div className="container-x flex h-[var(--header-h)] items-center justify-between font-mono text-[11px] uppercase tracking-[0.08em]">
            <span className="text-ink-muted">
              <span className="text-signal">{String((index ?? 0) + 1).padStart(2, "0")}</span> / {String(items.length).padStart(2, "0")}
              <span className="ml-3 hidden text-ink sm:inline">{item.caption ?? item.alt}</span>
            </span>
            <button type="button" onClick={() => onChange(null)} className="tap flex items-center gap-2 text-ink hover:text-signal">
              Cerrar <X size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="relative min-h-0 flex-1 px-4 pb-4 sm:px-16">
            <Image src={item.src} alt={item.alt} fill sizes="100vw" className="object-contain p-4 sm:p-8" />
          </div>
          {items.length > 1 && (
            <div className="container-x flex items-center justify-between pb-5">
              <button type="button" onClick={() => step(-1)} aria-label="Imagen anterior" className="tap flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink hover:text-signal">
                <ArrowLeft size={14} aria-hidden="true" /> Anterior
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Imagen siguiente" className="tap flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink hover:text-signal">
                Siguiente <ArrowRight size={14} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
