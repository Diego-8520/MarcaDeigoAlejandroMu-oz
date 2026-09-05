"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteExperience } from "@/actions/experiences";
import type { Experience } from "@/lib/data/experiences-queries";

function formatDate(value: string | null) {
  if (!value) return "presente";
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

export function ExperiencesList({
  initialExperiences,
}: {
  initialExperiences: Experience[];
}) {
  const router = useRouter();
  const [experiences, setExperiences] = useState(initialExperiences);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function removeExperience(id: string) {
    if (!window.confirm("¿Eliminar esta experiencia?")) return;
    startTransition(async () => {
      const result = await deleteExperience(id);
      setMessage(result.message ?? null);
      if (result.status === "success")
        setExperiences((current) => current.filter((item) => item.id !== id));
      router.refresh();
    });
  }

  if (experiences.length === 0)
    return (
      <p className="mt-8 font-body text-sm text-ink-muted">
        Todavía no hay experiencias registradas.
      </p>
    );

  return (
    <div className="mt-8">
      <div className="overflow-x-auto border-y border-line">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-xs text-ink-muted">
              <th className="py-3 pr-4 font-normal">empresa</th>
              <th className="px-4 py-3 font-normal">cargo</th>
              <th className="px-4 py-3 font-normal">periodo</th>
              <th className="py-3 pl-4 font-normal">acciones</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((experience) => (
              <tr
                key={experience.id}
                className="border-b border-line last:border-b-0"
              >
                <td className="py-4 pr-4 font-body text-sm text-ink">
                  {experience.company}
                </td>
                <td className="px-4 py-4 font-body text-sm text-ink">
                  {experience.position}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                  {formatDate(experience.startDate)} —{" "}
                  {formatDate(experience.endDate)}
                </td>
                <td className="py-4 pl-4">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/dashboard/experiencia/${experience.id}/editar`}
                      className="font-mono text-xs text-signal hover:underline"
                    >
                      editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeExperience(experience.id)}
                      disabled={isPending}
                      className="font-mono text-xs text-red-600 hover:underline disabled:opacity-40"
                    >
                      eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && (
        <p className="mt-4 font-mono text-xs text-ink-muted">{message}</p>
      )}
    </div>
  );
}
