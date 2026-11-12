import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { NAV_ITEMS } from "@/lib/site";

/**
 * Cierre de página con enlaces contextuales a otras secciones. Reutiliza el
 * índice y la descripción del menú para no duplicar textos.
 */
export function NextSteps({ hrefs, title = "Sigue explorando" }: { hrefs: string[]; title?: string }) {
  const items = hrefs.map((href) => NAV_ITEMS.find((i) => i.href === href)).filter((i) => i !== undefined);
  if (items.length === 0) return null;

  return (
    <nav aria-label={title} className="container-x border-t border-line py-16 sm:py-20">
      <p className="eyebrow">{title}</p>
      <ul className="mt-6 border-t border-line">
        {items.map((item) => (
          <li key={item.href} className="border-b border-line">
            <Link href={item.href} className="group flex items-baseline gap-4 py-5 sm:gap-8 sm:py-6">
              <span className="font-mono text-[11px] text-ink-subtle">{item.index}</span>
              <span className="display stretch-hover text-[clamp(1.6rem,4vw,3rem)] text-ink transition-colors group-hover:text-signal">
                {item.label}
              </span>
              <span className="ml-auto hidden max-w-[32ch] text-right text-sm text-ink-muted md:block">{item.blurb}</span>
              <ArrowRight
                aria-hidden="true"
                size={18}
                className="flex-none self-center text-ink-muted transition-transform duration-500 ease-expo group-hover:translate-x-1 group-hover:text-signal"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
