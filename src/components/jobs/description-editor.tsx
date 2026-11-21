"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateJobDescriptionAction } from "@/actions/jobs";
import { Button } from "@/components/ui/button";

/** Para fuentes que solo entregan un fragmento: pegar la descripción completa. */
export function DescriptionEditor({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        pegar descripción completa
      </Button>
    );
  }
  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={10}
        placeholder="Abre la vacante, copia toda la descripción y pégala aquí."
        className="w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          isLoading={isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await updateJobDescriptionAction(jobId, text);
              setMessage(result.message ?? null);
              if (result.status === "success") {
                setOpen(false);
                router.refresh();
              }
            })
          }
        >
          guardar y recalcular
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          cancelar
        </Button>
      </div>
      {message && <p className="font-mono text-[11px] text-ink-muted">{message}</p>}
    </div>
  );
}
