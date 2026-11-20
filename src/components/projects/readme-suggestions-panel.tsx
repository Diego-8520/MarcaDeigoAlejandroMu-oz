"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { importImageFromUrl } from "@/actions/project-images";
import type {
  ReadmeSuggestions,
  Suggestion,
} from "@/lib/projects/readme-parser";

export type ReadmeTextField =
  | "shortDescription"
  | "description"
  | "problem"
  | "solution"
  | "results"
  | "demoUrl";

export type ReadmeFieldBinding = {
  label: string;
  value: string;
  setValue: (value: string) => void;
  /** Separador para «Añadir al final»; null oculta el botón (p. ej. URLs). */
  appendSeparator: string | null;
};

type ReadmeSuggestionsPanelProps = {
  suggestions: ReadmeSuggestions;
  fields: Record<ReadmeTextField, ReadmeFieldBinding>;
  technologies: string;
  setTechnologies: (value: string) => void;
  projectId?: string;
  imageAltFallback: string;
  onImageImported: () => void;
  onClose: () => void;
};

const FIELD_ORDER: ReadmeTextField[] = [
  "shortDescription",
  "description",
  "problem",
  "solution",
  "results",
  "demoUrl",
];

const buttonClass =
  "border border-line px-2.5 py-1 font-mono text-[11px] text-ink transition-colors hover:border-ink disabled:opacity-40";

function techKey(value: string) {
  return value.toLowerCase().replace(/[\s._-]+/g, "");
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ReadmeSuggestionsPanel({
  suggestions,
  fields,
  technologies,
  setTechnologies,
  projectId,
  imageAltFallback,
  onImageImported,
  onClose,
}: ReadmeSuggestionsPanelProps) {
  const [handled, setHandled] = useState<Set<ReadmeTextField>>(new Set());
  const [importing, startImport] = useTransition();
  const [importingUrl, setImportingUrl] = useState<string | null>(null);
  const [imageMessages, setImageMessages] = useState<Record<string, string>>(
    {},
  );

  const pending = FIELD_ORDER.filter(
    (key) => suggestions[key] && !handled.has(key),
  );
  const currentTechnologies = new Set(splitList(technologies).map(techKey));
  const technologySuggestions = suggestions.technologies?.value ?? [];
  const missingTechnologies = technologySuggestions.filter(
    (item) => !currentTechnologies.has(techKey(item)),
  );
  const emptyTargets = pending.filter((key) => !fields[key].value.trim());
  const canFillEmpty =
    emptyTargets.length > 0 ||
    (!technologies.trim() && technologySuggestions.length > 0);

  function markHandled(key: ReadmeTextField) {
    setHandled((current) => new Set(current).add(key));
  }

  function use(key: ReadmeTextField, suggestion: Suggestion) {
    fields[key].setValue(suggestion.value);
    markHandled(key);
  }

  function append(key: ReadmeTextField, suggestion: Suggestion) {
    const field = fields[key];
    const current = field.value.trim();
    field.setValue(
      current
        ? `${current}${field.appendSeparator ?? ""}${suggestion.value}`
        : suggestion.value,
    );
    markHandled(key);
  }

  function fillEmpty() {
    const next = new Set(handled);
    for (const key of emptyTargets) {
      const suggestion = suggestions[key];
      if (!suggestion) continue;
      fields[key].setValue(suggestion.value);
      next.add(key);
    }
    setHandled(next);
    if (!technologies.trim() && technologySuggestions.length) {
      setTechnologies(technologySuggestions.join(", "));
    }
  }

  function addTechnology(item: string) {
    const list = splitList(technologies);
    if (list.some((current) => techKey(current) === techKey(item))) return;
    setTechnologies([...list, item].join(", "));
  }

  function importImage(url: string, alt: string) {
    if (!projectId) return;
    setImportingUrl(url);
    startImport(async () => {
      const result = await importImageFromUrl(
        projectId,
        url,
        alt || imageAltFallback,
      );
      setImageMessages((current) => ({
        ...current,
        [url]: result.message ?? "",
      }));
      setImportingUrl(null);
      if (result.status === "success") onImageImported();
    });
  }

  const images = suggestions.images?.value ?? [];
  const nothingLeft =
    pending.length === 0 &&
    missingTechnologies.length === 0 &&
    images.length === 0;

  return (
    <section
      aria-label="Sugerencias desde el README"
      className="border border-line"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-mono text-xs text-ink-muted">
          sugerencias desde readme · nada se aplica sin un clic
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fillEmpty}
            disabled={!canFillEmpty}
            className="bg-signal px-3 py-1.5 font-mono text-xs text-signal-ink transition-colors hover:bg-signal-hover disabled:opacity-40"
          >
            rellenar solo los campos vacíos
          </button>
          <button type="button" onClick={onClose} className={buttonClass}>
            cerrar
          </button>
        </div>
      </header>

      {suggestions.notice && (
        <p className="border-b border-line px-4 py-3 font-mono text-xs text-ink-muted">
          {suggestions.notice}
        </p>
      )}

      {pending.map((key) => {
        const suggestion = suggestions[key]!;
        const field = fields[key];
        return (
          <div key={key} className="border-b border-line px-4 py-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-mono text-xs text-ink">
                {field.label}
                {field.value.trim() && (
                  <span className="text-ink-muted"> · ya tiene texto</span>
                )}
              </p>
              <p className="font-mono text-[11px] text-ink-muted">
                {suggestion.source}
              </p>
            </div>
            <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-line border-l border-line pl-3 font-body text-sm leading-relaxed text-ink-muted">
              {suggestion.value}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => use(key, suggestion)}
                className={buttonClass}
              >
                usar
              </button>
              {field.appendSeparator !== null && field.value.trim() && (
                <button
                  type="button"
                  onClick={() => append(key, suggestion)}
                  className={buttonClass}
                >
                  añadir al final
                </button>
              )}
              <button
                type="button"
                onClick={() => markHandled(key)}
                className={buttonClass}
              >
                descartar
              </button>
            </div>
          </div>
        );
      })}

      {technologySuggestions.length > 0 && (
        <div className="border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-xs text-ink">tecnologías</p>
            <p className="font-mono text-[11px] text-ink-muted">
              {suggestions.technologies?.source}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {technologySuggestions.map((item) => {
              const added = currentTechnologies.has(techKey(item));
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => addTechnology(item)}
                  disabled={added}
                  aria-pressed={added}
                  className="border border-line px-2.5 py-1 font-mono text-[11px] text-ink transition-colors hover:border-ink disabled:cursor-default disabled:text-ink-muted disabled:line-through"
                >
                  {added ? item : `+ ${item}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="border-b border-line px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-mono text-xs text-ink">imágenes del readme</p>
            <p className="font-mono text-[11px] text-ink-muted">
              {suggestions.images?.source}
            </p>
          </div>
          {!projectId && (
            <p className="mt-2 font-mono text-[11px] text-ink-muted">
              guarda el proyecto para importarlas a la galería.
            </p>
          )}
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {images.map((image) => (
              <li key={image.url} className="border border-line">
                <div className="relative aspect-video w-full overflow-hidden bg-surface">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div className="border-t border-line p-2">
                  <p className="truncate font-mono text-[11px] text-ink-muted">
                    {image.alt || image.url.split("/").pop()}
                  </p>
                  {projectId && (
                    <button
                      type="button"
                      onClick={() => importImage(image.url, image.alt)}
                      disabled={importing}
                      className={`${buttonClass} mt-2`}
                    >
                      {importingUrl === image.url
                        ? "importando..."
                        : "importar a la galería"}
                    </button>
                  )}
                  {imageMessages[image.url] && (
                    <p className="mt-2 font-mono text-[11px] text-ink-muted">
                      {imageMessages[image.url]}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nothingLeft && !suggestions.notice && (
        <p className="px-4 py-3 font-mono text-xs text-ink-muted">
          sin más sugerencias.
        </p>
      )}
    </section>
  );
}
