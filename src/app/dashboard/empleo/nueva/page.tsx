import { ManualJobForm } from "@/components/jobs/manual-job-form";

export default function NuevaVacantePage() {
  return (
    <div className="mt-8">
      <h2 className="font-display text-lg font-semibold text-ink">Pegar una vacante</h2>
      <p className="mt-2 max-w-2xl font-body text-sm text-ink-muted">
        Copia la vacante de LinkedIn, Computrabajo, elempleo, Indeed o la página de la empresa. Mientras más completa
        la descripción, más preciso el análisis.
      </p>
      <ManualJobForm />
    </div>
  );
}
