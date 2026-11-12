import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Cuenta filas con la clave de servicio; si falla devuelve null y la tarjeta muestra "—". */
async function countRows(table: string, column?: string, value?: string | boolean): Promise<number | null> {
  const supabase = createAdminClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (column !== undefined && value !== undefined) query = query.eq(column, value);
  const { count, error } = await query;
  return error ? null : count;
}

// La medición de tráfico vive en GA4 (vía GTM). Este resumen solo muestra
// contenido y contactos, que sí están en Supabase.
export default async function DashboardPage() {
  const [newContacts, totalContacts, publishedProjects, publishedTestimonials] = await Promise.all([
    countRows("contacts", "status", "nuevo"),
    countRows("contacts"),
    countRows("projects", "published", true),
    countRows("testimonials", "published", true),
  ]);

  const metricItems = [
    { label: "contactos nuevos", value: newContacts, href: "/dashboard/contactos?status=nuevo" },
    { label: "contactos totales", value: totalContacts, href: "/dashboard/contactos" },
    { label: "proyectos publicados", value: publishedProjects, href: "/dashboard/proyectos" },
    { label: "testimonios publicados", value: publishedTestimonials, href: "/dashboard/testimonios" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">General</h1>
      <p className="mt-2 font-body text-sm text-ink-muted">Estado del contenido y de los contactos recibidos.</p>

      <div className="mt-8 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
        {metricItems.map((m) => (
          <Link key={m.label} href={m.href} className="bg-paper p-5 transition-colors hover:bg-surface">
            <p className="font-mono text-[11px] text-ink-muted">{m.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-ink">{m.value ?? "—"}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 border-t border-line pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">Tráfico y conversiones</p>
        <p className="mt-2 max-w-[60ch] text-sm text-ink-muted">
          Visitas, procedencia, descargas de CV y envíos del formulario se miden en Google Analytics 4 a través de Google Tag
          Manager.
        </p>
        <a
          href="https://analytics.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-ink hover:text-signal"
        >
          Abrir Google Analytics
          <ArrowUpRight aria-hidden="true" size={13} />
        </a>
      </div>
    </div>
  );
}
