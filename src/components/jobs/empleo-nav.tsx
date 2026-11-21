"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard/empleo", label: "buscar" },
  { href: "/dashboard/empleo/nueva", label: "pegar vacante" },
  { href: "/dashboard/empleo/postulaciones", label: "mis vacantes" },
  { href: "/dashboard/empleo/palabras-clave", label: "palabras clave" },
];

export function EmpleoNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard/empleo"
      ? pathname === href
      : pathname.startsWith(href);
  return (
    <nav aria-label="Secciones del buscador" className="mt-6 flex flex-wrap gap-2 border-b border-line pb-4 font-mono text-xs">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "px-3 py-1.5",
            isActive(item.href) ? "bg-ink text-paper" : "text-ink-muted hover:text-signal",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
