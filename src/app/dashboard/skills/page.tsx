import Link from "next/link";
import { createSkill } from "@/actions/skills";
import { SkillForm } from "@/components/skills/skill-form";
import { SkillsList } from "@/components/skills/skills-list";
import { getSkillsAdmin } from "@/lib/data/skills-queries";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const skills = await getSkillsAdmin();
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink-muted">dashboard / skills</p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Skills
          </h1>
        </div>
        <Link
          href="#nueva-skill"
          className="inline-flex items-center bg-ink px-4 py-2 font-mono text-sm text-paper transition-colors hover:bg-signal"
        >
          nueva skill
        </Link>
      </div>
      <section id="nueva-skill" className="mt-10 border-t border-line pt-8">
        <h2 className="font-display text-xl font-semibold text-ink">
          Añadir skill
        </h2>
        <SkillForm action={createSkill} submitLabel="crear skill" />
      </section>
      <SkillsList
        key={skills.map((skill) => skill.id).join(":")}
        initialSkills={skills}
      />
    </div>
  );
}
