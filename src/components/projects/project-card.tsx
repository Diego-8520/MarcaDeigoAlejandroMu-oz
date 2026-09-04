import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/project";
import { Tag } from "@/components/ui/section";

export function ProjectCard({ project, index }: { project: Project; index?: number }) {
  const thumbnail = project.images?.[0];

  return (
    <Link
      href={`/proyectos/${project.slug}`}
      className="group block border-t border-line py-6 first:border-t-0"
    >
      <div className={`grid gap-4 ${thumbnail ? "sm:grid-cols-[140px_1fr]" : ""}`}>
        {thumbnail && (
          <div className="relative aspect-video overflow-hidden border border-line bg-white/40 sm:aspect-square">
            <Image
              src={thumbnail.publicUrl}
              alt={thumbnail.altText ?? project.title}
              fill
              sizes="(min-width: 640px) 140px, 100vw"
              className="object-cover transition-transform group-hover:scale-[1.03]"
            />
          </div>
        )}
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              {typeof index === "number" && (
                <span className="font-mono text-xs text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-ink transition-colors group-hover:text-signal">
                {project.title}
              </h3>
            </div>
            <ArrowUpRight
              size={18}
              className="flex-none text-ink-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
            />
          </div>
          <p className="mt-2 max-w-xl font-body text-sm leading-relaxed text-ink-muted">
            {project.shortDescription}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <Tag key={tech}>{tech}</Tag>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
