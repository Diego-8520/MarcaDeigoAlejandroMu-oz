import { notFound } from "next/navigation";
import { AgentPanel } from "@/components/jobs/agent-panel";
import { ApplicationControls } from "@/components/jobs/application-controls";
import { JobAnalysisView } from "@/components/jobs/job-analysis-view";
import { getLatestAgentOutputsAdmin, getSavedJobAdmin } from "@/lib/data/jobs-queries";
import { cvFingerprint, getMasterCv } from "@/lib/jobs/master-cv";
import { ensureFreshAnalysis } from "@/lib/jobs/store";

export const dynamic = "force-dynamic";

export default async function VacantePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [job, cv, agent] = await Promise.all([getSavedJobAdmin(id), getMasterCv(), getLatestAgentOutputsAdmin(id)]);
  if (!job) notFound();
  const analysis = await ensureFreshAnalysis(job, cv);

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-8">
        <JobAnalysisView job={job} analysis={analysis} />
        <AgentPanel jobId={job.id} evaluation={agent.evaluacion} hv={agent.hv} fingerprint={cvFingerprint(cv)} />
      </div>
      <aside className="space-y-4 xl:sticky xl:top-8 xl:h-fit">
        <ApplicationControls jobId={job.id} status={job.status} notes={job.notes} />
        <p className="font-body text-xs text-ink-subtle">
          El análisis se recalcula automáticamente cuando cambias tu experiencia, skills, educación o perfil.
        </p>
      </aside>
    </div>
  );
}
