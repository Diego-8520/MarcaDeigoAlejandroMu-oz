"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTestimonial, reorderTestimonials } from "@/actions/testimonials";
import type { Testimonial } from "@/lib/data/testimonials-queries";

export function TestimonialsList({
  initialTestimonials,
}: {
  initialTestimonials: Testimonial[];
}) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function moveTestimonial(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const nextTestimonials = [...testimonials];
    [nextTestimonials[index], nextTestimonials[targetIndex]] = [
      nextTestimonials[targetIndex],
      nextTestimonials[index],
    ];
    setTestimonials(nextTestimonials);

    startTransition(async () => {
      const result = await reorderTestimonials(
        nextTestimonials.map((item) => item.id),
      );
      setMessage(result.message ?? null);
      router.refresh();
    });
  }

  function removeTestimonial(id: string) {
    if (!window.confirm("¿Eliminar este testimonio?")) return;

    startTransition(async () => {
      const result = await deleteTestimonial(id);
      setMessage(result.message ?? null);
      if (result.status === "success") {
        setTestimonials((current) => current.filter((item) => item.id !== id));
      }
      router.refresh();
    });
  }

  if (testimonials.length === 0) {
    return (
      <p className="mt-8 font-body text-sm text-ink-muted">
        Todavía no hay testimonios.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <div className="overflow-x-auto border-y border-line">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line font-mono text-xs text-ink-muted">
              <th className="py-3 pr-4 font-normal">autor</th>
              <th className="px-4 py-3 font-normal">empresa</th>
              <th className="px-4 py-3 font-normal">proyecto</th>
              <th className="px-4 py-3 font-normal">estado</th>
              <th className="py-3 pl-4 font-normal">acciones</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((testimonial, index) => (
              <tr
                key={testimonial.id}
                className="border-b border-line last:border-b-0"
              >
                <td className="py-4 pr-4">
                  <p className="font-body text-sm text-ink">
                    {testimonial.authorName}
                  </p>
                  {testimonial.authorRole && (
                    <p className="mt-1 font-mono text-[11px] text-ink-muted">
                      {testimonial.authorRole}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                  {testimonial.authorCompany ?? "—"}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-ink-muted">
                  {testimonial.projectTitle ?? "sin vincular"}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex border border-line px-2 py-0.5 font-mono text-[11px] text-ink-muted">
                    {testimonial.published ? "publicado" : "borrador"}
                  </span>
                </td>
                <td className="py-4 pl-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/dashboard/testimonios/${testimonial.id}/editar`}
                      className="font-mono text-xs text-signal hover:underline"
                    >
                      editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => moveTestimonial(index, -1)}
                      disabled={index === 0 || isPending}
                      className="font-mono text-xs text-ink-muted hover:text-signal disabled:opacity-40"
                    >
                      subir
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTestimonial(index, 1)}
                      disabled={index === testimonials.length - 1 || isPending}
                      className="font-mono text-xs text-ink-muted hover:text-signal disabled:opacity-40"
                    >
                      bajar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTestimonial(testimonial.id)}
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
