import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "inicio" },
  { href: "/proyectos", label: "proyectos" },
  { href: "/servicios", label: "servicios" },
  { href: "/sobre-mi", label: "sobre mí" },
  { href: "/experiencia", label: "experiencia" },
  { href: "/cv", label: "cv" },
  { href: "/arquitectura", label: "arquitectura" },
  { href: "/contacto", label: "contacto" },
];

export function SiteRail() {
  return (
    <>
      {/* Riel lateral fijo — desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:justify-between lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-r lg:border-line lg:px-8 lg:py-10">
        <div>
          <Link href="/" className="block">
            <span className="font-display text-lg font-semibold leading-tight text-ink">
              Diego Alejandro
              <br />
              Muñoz
            </span>
          </Link>
          <p className="mt-2 font-mono text-[11px] tracking-tight text-ink-muted">
            software engineer
            <br />
            ai · automation
          </p>

          <nav className="mt-12 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-baseline gap-2 py-1.5 font-mono text-sm text-ink-muted transition-colors hover:text-ink"
              >
                <span className="inline-block h-1 w-1 flex-none rounded-full bg-line transition-colors group-hover:bg-signal" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="font-mono text-[11px] text-ink-muted">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
            </span>
            disponible para proyectos
          </div>
          <p>Bogotá, Colombia</p>
        </div>
      </aside>

      {/* Barra superior — mobile */}
      <header className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
        <Link
          href="/"
          className="font-display text-base font-semibold text-ink"
        >
          Diego Alejandro Muñoz
        </Link>
        <nav className="flex gap-4 overflow-x-auto font-mono text-xs text-ink-muted">
          {NAV_ITEMS.slice(1).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
