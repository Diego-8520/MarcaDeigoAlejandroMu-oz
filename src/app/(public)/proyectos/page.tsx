import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPublishedProjects } from "@/lib/data/projects-queries";
import { PageHeader } from "@/components/site/page-header";
import { WorkIndex } from "@/components/site/work-index";
import { buttonVariants } from "@/components/ui/button";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Proyectos y casos de estudio",
  description:
    "Casos de estudio de aplicaciones web, e-commerce, herramientas e integraciones: el problema, la solución, el stack y el código o la demo cuando existen.",
  path: "/proyectos",
});

export default async function ProyectosPage() {
  const projects = await getPublishedProjects();

  return (
    <>
      <PageHeader
        index="02"
        eyebrow="Portafolio & código"
        title={
          <>
            Proyectos y <span className="font-serif">casos de estudio</span>
          </>
        }
        lede="Cada desarrollo responde a un problema concreto: análisis de riesgo geoespacial, comercio electrónico con base de datos, landing pages, paneles administrativos o integración funcional con APIs."
        notes={[
          { label: "Proyectos activos", value: String(projects.length).padStart(2, "0") },
          { label: "Stack", value: "Next.js · React · TypeScript · Supabase" },
        ]}
      />

      <section className="container-x pb-24 sm:pb-32">
        {projects.length > 0 ? (
          <WorkIndex projects={projects} showFilters />
        ) : (
          <p className="border-y border-line py-10 font-mono text-xs text-ink-muted">Todavía no hay proyectos publicados.</p>
        )}
      </section>

      <section className="container-x border-t border-line py-16 sm:py-20">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-4">
            <h2 className="display display-sm text-ink">
              ¿Quieres revisar el código o <span className="font-serif">discutir una solución?</span>
            </h2>
            <p className="mt-4 max-w-[56ch] text-ink-muted">
              La mayoría de proyectos cuentan con repositorios abiertos en GitHub y demostraciones en vivo verificables.
            </p>
          </div>
          <div className="lg:col-span-2 lg:justify-self-end">
            <Link href="/contacto" className={buttonVariants({ variant: "primary", size: "lg" })}>
              <span>Iniciar conversación</span>
              <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
