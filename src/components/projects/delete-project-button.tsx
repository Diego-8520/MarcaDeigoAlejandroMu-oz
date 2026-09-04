"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProject } from "@/actions/projects";

export function DeleteProjectButton({
  id,
  redirectTo,
}: {
  id: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onDelete() {
    if (!window.confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProject(id);
      setMessage(result.message ?? null);

      if (result.status === "success") {
        if (redirectTo) {
          router.push(redirectTo);
        }
        router.refresh();
      }
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 transition-colors hover:border-red-600 disabled:opacity-50"
      >
        {isPending ? "eliminando..." : "eliminar"}
      </button>
      {message && <p className="font-mono text-xs text-red-600">{message}</p>}
    </div>
  );
}
