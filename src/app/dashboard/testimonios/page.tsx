import Link from "next/link";
import { getAllTestimonialsAdmin } from "@/lib/data/testimonials-queries";
import { TestimonialsList } from "@/components/testimonials/testimonials-list";

export const dynamic = "force-dynamic";

export default async function TestimoniosPage() {
  const testimonials = await getAllTestimonialsAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-ink-muted">
            dashboard / testimonios
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Testimonios
          </h1>
        </div>
        <Link
          href="/dashboard/testimonios/nuevo"
          className="inline-flex items-center bg-ink px-4 py-2 font-mono text-sm text-paper transition-colors hover:bg-signal"
        >
          nuevo testimonio
        </Link>
      </div>
      <TestimonialsList
        key={testimonials
          .map((item) => `${item.id}:${item.sortOrder}`)
          .join(":")}
        initialTestimonials={testimonials}
      />
    </div>
  );
}
