import Link from "next/link";

const DASHBOARD_ITEMS = [
  { href: "/dashboard", label: "general" },
  { href: "/dashboard/proyectos", label: "proyectos" },
  { href: "/dashboard/servicios", label: "servicios" },
  { href: "/dashboard/experiencia", label: "experiencia" },
  { href: "/dashboard/educacion", label: "educación" },
  { href: "/dashboard/skills", label: "skills" },
  { href: "/dashboard/cv", label: "cv" },
  { href: "/dashboard/perfil", label: "perfil" },
  { href: "/dashboard/testimonios", label: "testimonios" },
  { href: "/dashboard/contactos", label: "contactos" },
  { href: "/dashboard/analytics", label: "analytics" },
  { href: "/dashboard/configuracion", label: "configuración" },
];

export function DashboardNav() {
  return (
    <aside className="hidden w-56 flex-none border-r border-line px-6 py-8 lg:block">
      <p className="font-mono text-xs text-ink-muted">
        panel de administración
      </p>
      <nav className="mt-8 flex flex-col gap-1">
        {DASHBOARD_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="py-1.5 font-mono text-sm text-ink-muted transition-colors hover:text-signal"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
