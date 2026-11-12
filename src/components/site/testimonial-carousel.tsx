"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface TestimonialItem {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string | null;
  authorCompany: string | null;
}

/** Una cita a la vez, en serif grande, con navegación accesible. */
export function TestimonialCarousel({ items }: { items: TestimonialItem[] }) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  const current = items[index];
  const go = (delta: number) => setIndex((i) => (i + delta + items.length) % items.length);

  return (
    <figure className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="lg:col-span-9 lg:col-start-4">
        <blockquote key={current.id} aria-live="polite" className="font-serif text-[clamp(1.8rem,3.6vw,3.6rem)] italic leading-[1.12] text-ink">
          <span aria-hidden="true" className="text-signal">“</span>
          {current.quote}
          <span aria-hidden="true" className="text-signal">”</span>
        </blockquote>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-6">
          <figcaption className="font-mono text-xs uppercase tracking-[0.08em]">
            <span className="text-ink">{current.authorName}</span>
            {(current.authorRole || current.authorCompany) && (
              <span className="block text-ink-muted">{[current.authorRole, current.authorCompany].filter(Boolean).join(" · ")}</span>
            )}
          </figcaption>
          {items.length > 1 && (
            <div className="flex items-center gap-4 font-mono text-xs text-ink-muted">
              <span>
                {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button type="button" onClick={() => go(-1)} aria-label="Testimonio anterior" className="border border-line p-2 text-ink hover:border-signal hover:text-signal">
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Testimonio siguiente" className="border border-line p-2 text-ink hover:border-signal hover:text-signal">
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
