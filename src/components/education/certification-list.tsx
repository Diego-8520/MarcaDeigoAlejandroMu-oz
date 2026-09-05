"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCertification } from "@/actions/certifications";
import type { Certification } from "@/lib/data/education-queries";

function formatDate(value: string | null) {
  if (!value) return "sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`));
}

export function CertificationList({
  initialCertifications,
}: {
  initialCertifications: Certification[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialCertifications);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function remove(id: string) {
    if (!window.confirm("¿Eliminar esta certificación?")) return;
    startTransition(async () => {
      const result = await deleteCertification(id);
      setMessage(result.message ?? null);
      if (result.status === "success")
        setItems((current) => current.filter((item) => item.id !== id));
      router.refresh();
    });
  }

  if (items.length === 0)
    return (
      <p className="mt-6 font-body text-sm text-ink-muted">
        Todavía no hay certificaciones registradas.
      </p>
    );
  return (
    <div className="mt-6 overflow-x-auto border-y border-line">
      <table className="w-full min-w-[680px] border-collapse text-left">
        <thead>
          <tr className="border-b border-line font-mono text-xs text-ink-muted">
            <th className="py-3 pr-4 font-normal">nombre</th>
            <th className="px-4 py-3 font-normal">emisor</th>
            <th className="px-4 py-3 font-normal">fecha</th>
            <th className="py-3 pl-4 font-normal">acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-line last:border-b-0">
              <td className="py-4 pr-4 font-body text-sm text-ink">
                {item.name}
              </td>
              <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                {item.issuer ?? "—"}
              </td>
              <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                {formatDate(item.issueDate)}
              </td>
              <td className="py-4 pl-4">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/educacion/certificaciones/${item.id}/editar`}
                    className="font-mono text-xs text-signal hover:underline"
                  >
                    editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
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
      {message && (
        <p className="p-4 font-mono text-xs text-ink-muted">{message}</p>
      )}
    </div>
  );
}
