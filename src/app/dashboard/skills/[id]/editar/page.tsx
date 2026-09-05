import Link from "next/link";
import { notFound } from "next/navigation";
import { updateSkill } from "@/actions/skills";
import { SkillForm } from "@/components/skills/skill-form";
import { getSkillsAdmin } from "@/lib/data/skills-queries";

export const dynamic = "force-dynamic";

export default async function EditarSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = (await getSkillsAdmin()).find((item) => item.id === id);
  if (!skill) notFound();
  return (
    <div>
      <Link
        href="/dashboard/skills"
        className="font-mono text-xs text-ink-muted hover:text-signal"
      >
        ← volver
      </Link>
      <p className="mt-6 font-mono text-xs text-ink-muted">
        dashboard / skills
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Editar skill
      </h1>
      <SkillForm
        action={updateSkill.bind(null, skill.id)}
        skill={skill}
        submitLabel="guardar cambios"
      />
    </div>
  );
}
