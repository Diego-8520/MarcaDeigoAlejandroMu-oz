import Link from "next/link";
import { notFound } from "next/navigation";
import { updateCertification } from "@/actions/certifications";
import { CertificationForm } from "@/components/education/certification-form";
import { getCertificationByIdAdmin } from "@/lib/data/education-queries";

export const dynamic = "force-dynamic";

export default async function EditarCertificacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const certification = await getCertificationByIdAdmin(id);
  if (!certification) notFound();
  return (
    <div>
      <Link
        href="/dashboard/educacion"
        className="font-mono text-xs text-ink-muted hover:text-signal"
      >
        ← volver
      </Link>
      <p className="mt-6 font-mono text-xs text-ink-muted">
        dashboard / educación / certificaciones
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Editar certificación
      </h1>
      <CertificationForm
        action={updateCertification.bind(null, certification.id)}
        certification={certification}
        submitLabel="guardar cambios"
      />
    </div>
  );
}
