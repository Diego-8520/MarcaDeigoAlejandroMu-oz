"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveJobAction } from "@/actions/jobs";
import type { NormalizedJob } from "@/lib/jobs/types";
import { Button, buttonVariants } from "@/components/ui/button";

export function SaveJobButton({ job, savedId }: { job: NormalizedJob; savedId?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (savedId) {
    return (
      <Link href={`/dashboard/empleo/${savedId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
        ver análisis
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        isLoading={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await saveJobAction(job);
            if (result.status === "success" && result.id) router.push(`/dashboard/empleo/${result.id}`);
            else setError(result.message ?? "No se pudo guardar.");
          })
        }
      >
        guardar y analizar
      </Button>
      {error && <p className="font-mono text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
