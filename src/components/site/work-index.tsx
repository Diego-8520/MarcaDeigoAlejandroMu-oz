"use client";

import { useMemo, useRef, useState, ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types/project";
import { loadMotion, motionEnabled, type Motion } from "@/components/motion/gsap";
import { cn } from "@/lib/utils";

function projectThumb(project: Project) {
  return project.featuredImageUrl || project.images?.[0]?.publicUrl || null;
}

const STATUS_LABEL: Record<Project["status"], string> = {
  live: "En vivo",
  "en-desarrollo": "En desarrollo",
  archivado: "Archivado",
};

/**
 * Índice de trabajo: filas tipográficas en lugar de tarjetas.
 * En escritorio, una vista previa flotante sigue al cursor y se transforma
 * en el hero del caso de estudio al navegar (view transition compartida).
 */
export function WorkIndex({ projects, showFilters = false }: { projects: Project[]; showFilters?: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.categories))).sort((a, b) => a.localeCompare(b, "es")),
    [projects],
  );
  const visible = filter ? projects.filter((p) => p.categories.includes(filter)) : projects;
  const hoveredProject = visible.find((p) => p.slug === hovered) ?? null;
  const hoveredThumb = hoveredProject ? projectThumb(hoveredProject) : null;

  // La vista previa sigue al cursor con inercia (quickTo, fuera del render de React).
  // GSAP se pide al primer contacto del ratón; hasta que llega, la vista previa se posiciona sin inercia.
  const quick = useRef<{ x: (v: number) => void; y: (v: number) => void } | null>(null);
  const motion = useRef<Motion | null>(null);

  function onEnter(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || motion.current) return;
    loadMotion().then((m) => {
      motion.current = m;
    });
  }

  function onMove(e: React.PointerEvent) {
    const el = previewRef.current;
    if (!el || e.pointerType !== "mouse") return;
    const bounds = rootRef.current?.getBoundingClientRect();
    if (!bounds) return;
    if (!quick.current && !motion.current) {
      el.style.transform = `translate(${e.clientX - bounds.left}px, ${e.clientY - bounds.top}px)`;
      return;
    }
    if (!quick.current && motion.current) {
      const { gsap } = motion.current;
      const lerp = motionEnabled() ? 0.55 : 0.01;
      quick.current = {
        x: gsap.quickTo(el, "x", { duration: lerp, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: lerp, ease: "power3.out" }),
      };
    }
    quick.current?.x(e.clientX - bounds.left);
    quick.current?.y(e.clientY - bounds.top);
  }

  return (
    <div ref={rootRef} className="relative" onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={() => setHovered(null)}>
      {showFilters && categories.length > 1 && (
        <div role="group" aria-label="Filtrar por categoría" className="mb-10 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.08em]">
          <button
            type="button"
            aria-pressed={filter === null}
            onClick={() => setFilter(null)}
            className={cn("border px-3 py-1.5 transition-colors", filter === null ? "border-signal bg-signal text-signal-ink" : "border-line text-ink-muted hover:border-ink hover:text-ink")}
          >
            Todo <span className="opacity-60">({projects.length})</span>
          </button>
          {categories.map((cat) => {
            const count = projects.filter((p) => p.categories.includes(cat)).length;
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(active ? null : cat)}
                className={cn("border px-3 py-1.5 transition-colors", active ? "border-signal bg-signal text-signal-ink" : "border-line text-ink-muted hover:border-ink hover:text-ink")}
              >
                {cat} <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {visible.length} proyectos{filter ? ` en ${filter}` : ""}
      </p>

      <ol className="border-t border-line">
        {visible.map((project, i) => {
          const thumb = projectThumb(project);
          const dimmed = hovered !== null && hovered !== project.slug;
          const year = new Date(project.createdAt).getFullYear();
          return (
            <li key={project.slug} className="border-b border-line">
              <Link
                href={`/proyectos/${project.slug}`}
                onPointerEnter={() => setHovered(project.slug)}
                onFocus={() => setHovered(project.slug)}
                className={cn(
                  "group grid grid-cols-12 items-baseline gap-x-4 gap-y-3 py-6 transition-opacity duration-500 sm:py-8 lg:gap-x-6",
                  dimmed ? "lg:opacity-30" : "opacity-100",
                )}
              >
                <span className="col-span-2 font-mono text-xs text-ink-subtle sm:col-span-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="col-span-10 sm:col-span-11 lg:col-span-6">
                  <ViewTransition name={`project-title-${project.slug}`} share="project-morph">
                    <span className="display stretch-hover block text-[clamp(1.75rem,4.2vw,4rem)] leading-[0.92] text-ink transition-colors group-hover:text-signal">
                      {project.title}
                    </span>
                  </ViewTransition>
                </span>

                {/* Miniatura en línea para pantallas táctiles y estrechas */}
                {thumb && (
                  <span className="relative col-span-12 col-start-1 aspect-[16/9] overflow-hidden border border-line sm:col-span-11 sm:col-start-2 lg:hidden">
                    <Image src={thumb} alt="" fill sizes="(min-width: 640px) 90vw, 100vw" className="object-cover" />
                  </span>
                )}

                <span className="col-span-12 col-start-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted sm:col-span-6 sm:col-start-2 lg:col-span-3 lg:col-start-auto">
                  {project.categories.join(" · ") || "Web App"}
                </span>
                <span className="col-span-8 col-start-1 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted sm:col-span-3 sm:col-start-auto lg:col-span-1">
                  <span className={project.status === "live" ? "text-emerald" : undefined}>{STATUS_LABEL[project.status]}</span>
                  <span className="block text-ink-subtle">{year}</span>
                </span>
                <span className="col-span-4 flex justify-end sm:col-span-2 lg:col-span-1">
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-6 w-6 text-ink-muted transition-transform duration-500 ease-expo group-hover:rotate-45 group-hover:text-signal"
                    strokeWidth={1.5}
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {visible.length === 0 && (
        <p className="border-b border-line py-10 font-mono text-xs text-ink-muted">
          No hay proyectos publicados en esta categoría todavía.
        </p>
      )}

      {/* Vista previa flotante (escritorio con ratón) */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
        style={{ width: 0, height: 0 }}
      >
        <div
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 transition-[clip-path,opacity] duration-700 ease-expo",
            hoveredThumb ? "opacity-100 [clip-path:inset(0_0_0_0)]" : "opacity-0 [clip-path:inset(50%_0_50%_0)]",
          )}
        >
          {hoveredProject && hoveredThumb && (
            <ViewTransition name={`project-media-${hoveredProject.slug}`} share="project-morph">
              <div className="relative h-[15rem] w-[24rem] overflow-hidden bg-surface">
                <Image key={hoveredThumb} src={hoveredThumb} alt="" fill sizes="384px" className="object-cover" />
              </div>
            </ViewTransition>
          )}
        </div>
      </div>
    </div>
  );
}
