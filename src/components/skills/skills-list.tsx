"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSkill } from "@/actions/skills";
import type { Skill } from "@/lib/data/skills-queries";

export function SkillsList({ initialSkills }: { initialSkills: Skill[] }) {
  const router = useRouter();
  const [skills, setSkills] = useState(initialSkills);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const groups = skills.reduce<Record<string, Skill[]>>((result, skill) => {
    const category = skill.category || "sin categoría";
    (result[category] ??= []).push(skill);
    return result;
  }, {});

  function remove(id: string) {
    if (
      !window.confirm(
        "¿Eliminar esta skill? También se quitará de sus proyectos.",
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteSkill(id);
      setMessage(result.message ?? null);
      if (result.status === "success")
        setSkills((current) => current.filter((skill) => skill.id !== id));
      router.refresh();
    });
  }

  if (skills.length === 0)
    return (
      <p className="mt-8 font-body text-sm text-ink-muted">
        Todavía no hay skills registradas.
      </p>
    );
  return (
    <div className="mt-8 space-y-8">
      {Object.entries(groups).map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-3 font-mono text-sm text-ink">{category}</h2>
          <div className="divide-y divide-line border-y border-line">
            {items.map((skill) => (
              <div
                key={skill.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-display text-base font-semibold text-ink">
                    {skill.name}
                  </p>
                  {skill.description && (
                    <p className="mt-1 font-body text-sm text-ink-muted">
                      {skill.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/skills/${skill.id}/editar`}
                    className="font-mono text-xs text-signal hover:underline"
                  >
                    editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(skill.id)}
                    disabled={isPending}
                    className="font-mono text-xs text-red-600 hover:underline disabled:opacity-40"
                  >
                    eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {message && <p className="font-mono text-xs text-ink-muted">{message}</p>}
    </div>
  );
}
