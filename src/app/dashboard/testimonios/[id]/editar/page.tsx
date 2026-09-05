import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTestimonial } from "@/actions/testimonials";
import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import { getAllProjectsAdmin } from "@/lib/data/projects-queries";
import { getTestimonialAdmin } from "@/lib/data/testimonials-queries";

export const dynamic = "force-dynamic";

export default async function EditarTestimonioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [testimonial, projects] = await Promise.all([
    getTestimonialAdmin(id),
    getAllProjectsAdmin(),
  ]);

  if (!testimonial) notFound();

  const updateWithId = updateTestimonial.bind(null, testimonial.id);

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
        Editar testimonio
      </h1>
      <TestimonialForm
        action={updateWithId}
        projects={projects}
        testimonial={testimonial}
        submitLabel="guardar cambios"
      />
    </div>
  );
}
