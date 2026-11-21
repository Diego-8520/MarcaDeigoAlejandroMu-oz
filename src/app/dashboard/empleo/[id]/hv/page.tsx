import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/jobs/print-button";
import { getLatestAgentOutputsAdmin, getSavedJobAdmin } from "@/lib/data/jobs-queries";
import { tailoredCvSchema } from "@/lib/jobs/agent/schemas";
import { cvFingerprint, getMasterCv } from "@/lib/jobs/master-cv";

export const dynamic = "force-dynamic";

function period(start: string | null, end: string | null) {
  const fmt = (v: string) => new Intl.DateTimeFormat("es-CO", { month: "short", year: "numeric" }).format(new Date(v));
  if (!start) return "";
  return `${fmt(start)} – ${end ? fmt(end) : "actual"}`;
}

// Al imprimir solo se ve la hoja de vida (se oculta el panel).
const PRINT_CSS = `
@media print {
  @page { margin: 14mm; }
  body * { visibility: hidden !important; }
  #hv-print, #hv-print * { visibility: visible !important; }
  #hv-print { position: absolute; inset: 0 auto auto 0; width: 100%; border: 0 !important; padding: 0 !important; color: #000 !important; background: #fff !important; }
  #hv-print * { color: #000 !important; }
}`;

export default async function HvAdaptadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [job, cv, agent] = await Promise.all([getSavedJobAdmin(id), getMasterCv(), getLatestAgentOutputsAdmin(id)]);
  if (!job) notFound();
  const parsed = agent.hv ? tailoredCvSchema.safeParse(agent.hv.content) : null;

  if (!parsed?.success) {
    return (
      <div className="mt-8 space-y-3">
        <p className="font-body text-sm text-ink-muted">
          Aún no hay HV adaptada para esta vacante. En Claude Code, dentro del repo, ejecuta{" "}
          <code className="font-mono text-ink">/adaptar-hv {id}</code>.
        </p>
        <Link href={`/dashboard/empleo/${id}`} className="font-mono text-xs text-signal hover:underline">
          ← volver al análisis
        </Link>
      </div>
    );
  }

  const hv = parsed.data;
  const stale = agent.hv?.cvFingerprint !== cvFingerprint(cv);
  const contact = [cv.email, cv.phone, cv.location, cv.linkedinUrl].filter(Boolean);
  const experiences = hv.experiences
    .map((e) => ({ tailored: e, source: cv.experiences.find((x) => x.id === e.id) }))
    .filter((e) => e.source);
  const projects = hv.projects
    .map((p) => ({ tailored: p, source: cv.projects.find((x) => x.id === p.id) }))
    .filter((p) => p.source);
  const education = hv.educationIds.map((eid) => cv.education.find((e) => e.id === eid)).filter(Boolean);
  const certifications = hv.certificationIds.map((cid) => cv.certifications.find((c) => c.id === cid)).filter(Boolean);

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_300px]">
      <style>{PRINT_CSS}</style>

      <article id="hv-print" className="mx-auto w-full max-w-[800px] border border-line bg-paper p-8 font-body text-[13px] leading-relaxed text-ink">
        <header>
          <h2 className="font-display text-2xl font-semibold">{cv.fullName}</h2>
          <p className="mt-1 text-sm">{hv.headline}</p>
          {contact.length > 0 && <p className="mt-1 text-xs text-ink-muted">{contact.join(" · ")}</p>}
        </header>

        <section className="mt-5">
          <h3 className="border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.08em]">Perfil</h3>
          <p className="mt-2">{hv.summary}</p>
        </section>

        {experiences.length > 0 && (
          <section className="mt-5">
            <h3 className="border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.08em]">
              Experiencia relevante
            </h3>
            {experiences.map(({ tailored, source }) => (
              <div key={tailored.id} className="mt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">
                    {source!.position} · {source!.company}
                  </p>
                  <p className="text-xs text-ink-muted">{period(source!.startDate, source!.endDate)}</p>
                </div>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {tailored.bullets.map((b, i) => (
                    <li key={i}>{b.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {projects.length > 0 && (
          <section className="mt-5">
            <h3 className="border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.08em]">Proyectos</h3>
            {projects.map(({ tailored, source }) => (
              <div key={tailored.id} className="mt-3">
                <p className="font-semibold">{source!.title}</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {tailored.bullets.map((b, i) => (
                    <li key={i}>{b.text}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {hv.skills.length > 0 && (
          <section className="mt-5">
            <h3 className="border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.08em]">Habilidades</h3>
            <p className="mt-2">{hv.skills.join(" · ")}</p>
          </section>
        )}

        {education.length > 0 && (
          <section className="mt-5">
            <h3 className="border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.08em]">Educación</h3>
            <ul className="mt-2 space-y-1">
              {education.map((e) => (
                <li key={e!.id}>
                  <span className="font-semibold">{e!.program}</span> · {e!.institution}
                  {e!.status ? ` (${e!.status})` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}

        {certifications.length > 0 && (
          <section className="mt-5">
            <h3 className="border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.08em]">
              Certificaciones
            </h3>
            <ul className="mt-2 space-y-1">
              {certifications.map((c) => (
                <li key={c!.id}>
                  {c!.name}
                  {c!.issuer ? ` · ${c!.issuer}` : ""}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <aside className="space-y-4 xl:sticky xl:top-8 xl:h-fit">
        <div className="space-y-3 border border-line p-4">
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">hv para</p>
          <p className="font-display text-sm font-semibold text-ink">{job.title}</p>
          <PrintButton />
          <Link href={`/dashboard/empleo/${id}`} className="block font-mono text-xs text-signal hover:underline">
            ← volver al análisis
          </Link>
          {stale && (
            <p className="font-mono text-[11px] text-amber">
              Tu HV cambió después de generar esta versión. Ejecuta de nuevo /adaptar-hv {id}.
            </p>
          )}
        </div>
        {hv.changes.length > 0 && (
          <div className="border border-line p-4">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">cambios realizados</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-xs text-ink">
              {hv.changes.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {hv.keywordsNotAdded.length > 0 && (
          <div className="border border-line p-4">
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-ink-subtle">no se agregaron</p>
            <ul className="mt-2 space-y-1 font-body text-xs text-ink">
              {hv.keywordsNotAdded.map((k, i) => (
                <li key={i}>
                  <strong className="font-semibold">{k.term}</strong>: {k.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
