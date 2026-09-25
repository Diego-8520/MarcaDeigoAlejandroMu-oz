import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Globe, Star, GitFork, ArrowRight } from "lucide-react";
import type { Project } from "@/types/project";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/components/ui/section";
import { GithubIcon } from "@/components/ui/icons";

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index?: number;
}) {
  const thumbnail = project.featuredImageUrl || project.images?.[0]?.publicUrl;
  const altText = project.images?.[0]?.altText ?? project.title;
  const isLive = project.status === "live" || Boolean(project.demoUrl);
  const repoUrl = project.repositoryUrl ?? project.githubMetadata?.repositoryUrl;

  return (
    <article className="group border border-line bg-surface/70 hover:bg-surface-elevated/70 hover:border-line-focus transition-all rounded-sm overflow-hidden">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[240px_1fr]">
        {/* Thumbnail con aspect ratio cuidado */}
        {thumbnail ? (
          <div className="relative aspect-video lg:aspect-auto lg:h-full min-h-[150px] w-full overflow-hidden border border-line/60 bg-paper/60 rounded-sm">
            <Image
              src={thumbnail}
              alt={altText}
              fill
              sizes="(min-width: 1024px) 240px, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {isLive && (
              <div className="absolute top-2 left-2">
                <Badge variant="live" dot>Live Demo</Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center border border-line/50 bg-paper/30 p-6 text-center rounded-sm">
            <span className="font-mono text-2xl text-signal-light/60">0{typeof index === "number" ? index + 1 : 1}</span>
            <span className="font-mono text-[10px] text-ink-subtle uppercase mt-1">Caso de Estudio</span>
          </div>
        )}

        {/* Información y contenido de decisión */}
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {typeof index === "number" && (
                  <span className="font-mono text-xs text-signal-light font-semibold">
                    0{index + 1}
                  </span>
                )}
                <span className="font-mono text-[11px] text-ink-muted uppercase tracking-wider">
                  {project.categories.join(" · ") || "Web App"}
                </span>
              </div>

              {/* Badges de estado y GitHub */}
              <div className="flex items-center gap-2">
                {project.githubMetadata && project.githubMetadata.stars > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-subtle">
                    <Star size={10} className="text-amber" />
                    <span>{project.githubMetadata.stars}</span>
                  </span>
                )}
                {project.githubMetadata && project.githubMetadata.forks > 0 && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-ink-subtle">
                    <GitFork size={10} />
                    <span>{project.githubMetadata.forks}</span>
                  </span>
                )}
              </div>
            </div>

            <Link href={`/proyectos/${project.slug}`} className="block mt-2 group/title">
              <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink group-hover/title:text-signal transition-colors flex items-center justify-between gap-2">
                <span>{project.title}</span>
                <ArrowRight
                  size={16}
                  className="text-ink-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-none"
                />
              </h3>
            </Link>

            <p className="mt-2.5 font-body text-xs sm:text-sm text-ink-muted leading-relaxed">
              {project.shortDescription ?? project.description}
            </p>

            {project.problem && (
              <div className="mt-3.5 border-l-2 border-line-accent/40 pl-3">
                <p className="font-mono text-[10px] text-ink-subtle uppercase tracking-wider">
                  Problema resuelto:
                </p>
                <p className="font-body text-xs text-ink/80 mt-0.5 line-clamp-2">
                  {project.problem}
                </p>
              </div>
            )}
          </div>

          {/* Tecnologías y enlaces de acción directa */}
          <div className="mt-5 pt-4 border-t border-line/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 5).map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
              {project.technologies.length > 5 && (
                <Tag>+{project.technologies.length - 5}</Tag>
              )}
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald hover:underline font-medium"
                  title="Abrir demo en vivo"
                >
                  <Globe size={12} />
                  <span>Demo</span>
                  <ArrowUpRight size={11} />
                </a>
              )}
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-ink-muted hover:text-ink transition-colors"
                  title="Ver código fuente en GitHub"
                >
                  <GithubIcon className="w-3 h-3" />
                  <span>Repo</span>
                  <ArrowUpRight size={11} />
                </a>
              )}
              <Link
                href={`/proyectos/${project.slug}`}
                className="inline-flex items-center gap-1 text-signal hover:underline font-medium"
              >
                <span>Caso de estudio</span>
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
