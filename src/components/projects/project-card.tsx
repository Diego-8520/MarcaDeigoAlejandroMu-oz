import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/project";
import { Tag } from "@/components/ui/section";

export function ProjectCard({ project, index }: { project: Project; index?: number }) {
  return (
    <Link
      href={`/proyectos/${project.slug}`}
      className="group block border-t border-line py-6 first:border-t-0"
    >
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
    </Link>
  );
}
