import Link from "next/link";
import { createTestimonial } from "@/actions/testimonials";
import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import { getAllProjectsAdmin } from "@/lib/data/projects-queries";

export const dynamic = "force-dynamic";

export default async function NuevoTestimonioPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div>
      <Link
        href="/dashboard/testimonios"
        className="font-mono text-xs text-ink-muted hover:text-signal"
      >
        ← volver
      </Link>
      <p className="mt-6 font-mono text-xs text-ink-muted">
        dashboard / testimonios
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Nuevo testimonio
      </h1>
      <TestimonialForm
        action={createTestimonial}
        projects={projects}
        submitLabel="crear testimonio"
      />
    </div>
  );
}
