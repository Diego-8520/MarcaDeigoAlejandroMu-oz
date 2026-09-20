import { getAllCvDocumentsAdmin } from "@/lib/data/cv-queries";
import { CvManager } from "@/components/cv/cv-manager";

export const dynamic = "force-dynamic";

export default async function DashboardCvPage() {
  const documents = await getAllCvDocumentsAdmin();

  return (
    <div>
      <p className="font-mono text-xs text-ink-muted">dashboard / cv</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Gestión de Hoja de Vida (CV)
      </h1>
      <p className="mt-2 font-body text-sm text-ink-muted">
        Administra las versiones en PDF de tu hoja de vida. Sube nuevos documentos, controla su visibilidad pública en /cv y define el orden de prioridad.
      </p>

      <CvManager
        key={documents.map((d) => `${d.id}:${d.isVisible}:${d.sortOrder}`).join(":")}
        initialDocuments={documents}
      />
    </div>
  );
}
