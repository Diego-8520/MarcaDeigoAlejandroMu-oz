import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CONTACT, NAV_ITEMS } from "@/lib/site";

/** Pie editorial global: CTA a todo el ancho y colofón técnico. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-line bg-paper">
      <div className="container-x pt-20 sm:pt-28">
        <p className="eyebrow">¿Tienes un proyecto o una vacante?</p>
        <Link
          href="/contacto"
          className="group mt-6 block focus-visible:outline-offset-8"
          aria-label="Ir a contacto: ¿Construimos algo?"
        >
          <span className="display relative block text-[clamp(1.75rem,8.6vw,10rem)] text-ink">
            {/* Capa de acento que se revela de izquierda a derecha */}
            <span
              aria-hidden="true"
              className="absolute inset-0 text-signal [clip-path:inset(0_100%_0_0)] transition-[clip-path] duration-[900ms] ease-expo group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]"
            >
              ¿Construimos <span className="font-serif">algo?</span>
            </span>
            ¿Construimos <span className="font-serif">algo?</span>
          </span>
        </Link>
      </div>

      <div className="container-x mt-20 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line py-12 font-mono text-xs md:grid-cols-4">
        <div>
          <p className="eyebrow mb-4">Contacto</p>
          <ul className="space-y-7 text-ink sm:space-y-2">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="link-draw tap break-all">
                {CONTACT.email}
              </a>
            </li>
            <li>
              <a href={CONTACT.whatsappUrl()} target="_blank" rel="noreferrer" className="link-draw tap">
                {CONTACT.phoneDisplay}
              </a>
            </li>
            <li className="text-ink-muted">Respuesta &lt; 24 h laborables</li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-4">Redes</p>
          <ul className="space-y-7 text-ink sm:space-y-2">
            <li>
              <a href={CONTACT.linkedin} target="_blank" rel="noreferrer" className="link-draw tap inline-flex items-center gap-1">
                LinkedIn <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={CONTACT.github} target="_blank" rel="noreferrer" className="link-draw tap inline-flex items-center gap-1">
                GitHub <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>

        <nav aria-label="Mapa del sitio">
          <p className="eyebrow mb-4">Índice</p>
          <ul className="grid grid-cols-1 gap-x-2 gap-y-7 text-ink sm:grid-cols-2 sm:gap-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="link-draw tap inline-block min-w-11">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-4">Colofón</p>
          <p className="leading-relaxed text-ink-muted">
            Archivo, Instrument Serif y JetBrains Mono. Next.js 16, Supabase y GSAP.{" "}
            <Link href="/arquitectura" className="link-draw tap text-ink">
              Ver arquitectura
            </Link>
          </p>
        </div>
      </div>

      <div className="container-x flex flex-wrap items-center justify-between gap-3 border-t border-line py-5 font-mono text-[10px] uppercase tracking-[0.08em] text-ink-subtle">
        <span>© {year} Diego Alejandro Muñoz Arcos</span>
        <span>{CONTACT.location}</span>
        <span className="hidden sm:inline">Atajos: / menú · G rejilla</span>
      </div>
    </footer>
  );
}
