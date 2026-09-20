"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Eye, EyeOff, ArrowUp, ArrowDown, Trash2, ExternalLink, Star } from "lucide-react";
import {
  uploadCvAction,
  toggleCvVisibilityAction,
  deleteCvAction,
  reorderCvAction,
  setPrimaryCvAction,
  type CvActionState,
} from "@/actions/cv";
import type { CvDocument } from "@/lib/data/cv-queries";

const initialState: CvActionState = { status: "idle" };

export function CvManager({
  initialDocuments,
}: {
  initialDocuments: CvDocument[];
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState<CvDocument[]>(initialDocuments);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPendingTransition, startTransition] = useTransition();

  // Form action state for upload
  const [uploadState, formAction, isUploading] = useActionState(
    uploadCvAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadState.status === "success") {
      formRef.current?.reset();
      router.refresh();
    }
  }, [uploadState, router]);

  const handleToggleVisibility = (id: string, currentVisible: boolean) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await toggleCvVisibilityAction(id, currentVisible);
      if (res.status === "error") {
        setFeedback({ type: "error", message: res.message || "Error al cambiar visibilidad" });
      } else {
        setFeedback({ type: "success", message: res.message || "Visibilidad actualizada" });
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, isVisible: !currentVisible } : d))
        );
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string, label: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el CV "${label}"? Esta acción borrará el registro y el archivo PDF de Storage.`)) {
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await deleteCvAction(id);
      if (res.status === "error") {
        setFeedback({ type: "error", message: res.message || "Error al eliminar el CV" });
      } else {
        setFeedback({ type: "success", message: res.message || "CV eliminado" });
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        router.refresh();
      }
    });
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= documents.length) return;

    const next = [...documents];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    setDocuments(next);

    setFeedback(null);
    startTransition(async () => {
      const res = await reorderCvAction(next.map((d) => d.id));
      if (res.status === "error") {
        setFeedback({ type: "error", message: res.message || "Error al reordenar" });
      } else {
        router.refresh();
      }
    });
  };

  const handleSetPrimary = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await setPrimaryCvAction(id);
      if (res.status === "error") {
        setFeedback({ type: "error", message: res.message || "Error al asignar principal" });
      } else {
        setFeedback({ type: "success", message: "Asignado como CV principal para /cv" });
        router.refresh();
      }
    });
  };

  const isAnyPending = isPendingTransition || isUploading;

  return (
    <div className="mt-8 space-y-10">
      {/* Mensaje de feedback general */}
      {feedback && (
        <div
          className={`border p-3 font-mono text-xs ${
            feedback.type === "success"
              ? "border-signal/40 bg-signal-dim/30 text-signal"
              : "border-red-300 bg-red-50 text-red-700"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Formulario de subida */}
      <section className="border border-line bg-paper/50 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Subir nuevo CV (PDF)
        </h2>
        <p className="mt-1 font-body text-xs text-ink-muted">
          El archivo se almacenará de forma segura en el bucket de Storage y se procesará mediante el cliente administrativo.
        </p>

        <form ref={formRef} action={formAction} className="mt-6 space-y-4 max-w-xl">
          <div>
            <label htmlFor="cv-file" className="block font-mono text-xs text-ink-muted">
              archivo pdf * (máx. 10mb)
            </label>
            <input
              id="cv-file"
              ref={fileInputRef}
              name="file"
              type="file"
              accept=".pdf,application/pdf"
              required
              disabled={isAnyPending}
              className="mt-1.5 block w-full border border-line bg-transparent px-3 py-2 font-mono text-xs text-ink file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1 file:font-mono file:text-xs file:text-paper hover:file:bg-signal focus:border-signal"
            />
          </div>

          <div>
            <label htmlFor="cv-label" className="block font-mono text-xs text-ink-muted">
              etiqueta o título (opcional)
            </label>
            <input
              id="cv-label"
              name="label"
              type="text"
              placeholder="Ej: CV 2026 — Español (Software Engineer)"
              maxLength={100}
              disabled={isAnyPending}
              className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none placeholder:text-ink-muted/50 focus:border-signal"
            />
            <p className="mt-1 font-mono text-[11px] text-ink-muted">
              Si se omite, se usará el nombre original del archivo.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="cv-visible"
              name="isVisible"
              type="checkbox"
              value="true"
              disabled={isAnyPending}
              className="h-4 w-4 rounded border-line text-signal focus:ring-signal"
            />
            <label htmlFor="cv-visible" className="font-mono text-xs text-ink">
              Hacer visible de inmediato en /cv
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isAnyPending}
              className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
            >
              {isUploading ? "subiendo pdf..." : "subir nuevo cv"}
            </button>
          </div>

          {uploadState.status !== "idle" && (
            <p
              className={`font-mono text-xs ${
                uploadState.status === "success" ? "text-signal" : "text-red-600"
              }`}
            >
              {uploadState.message}
            </p>
          )}
        </form>
      </section>

      {/* Listado de CVs subidos */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Documentos registrados ({documents.length})
            </h2>
            <p className="font-mono text-xs text-ink-muted">
              El primer documento visible determina el enlace por defecto en la página pública /cv.
            </p>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="border border-dashed border-line p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-ink-muted/60" />
            <p className="mt-3 font-mono text-sm text-ink">
              No hay documentos de CV registrados.
            </p>
            <p className="mt-1 font-body text-xs text-ink-muted">
              Sube un archivo PDF en el formulario superior para comenzar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line border border-line bg-paper/30">
            {documents.map((doc, index) => {
              const isFirst = index === 0;
              const isLast = index === documents.length - 1;
              const createdFormatted = new Date(doc.createdAt).toLocaleDateString(
                "es-CO",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              );

              return (
                <div
                  key={doc.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 flex-none items-center justify-center border border-line bg-paper text-ink">
                      <FileText className="h-4 w-4 text-signal" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-body text-sm font-medium text-ink">
                          {doc.label}
                        </span>

                        {isFirst && (
                          <span className="inline-flex items-center gap-1 border border-signal bg-signal-dim px-2 py-0.5 font-mono text-[10px] font-semibold text-signal">
                            <Star className="h-2.5 w-2.5 fill-signal" />
                            principal
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] ${
                            doc.isVisible
                              ? "border-signal/60 text-signal bg-signal-dim/30"
                              : "border-line text-ink-muted bg-transparent"
                          }`}
                        >
                          {doc.isVisible ? (
                            <>
                              <Eye className="h-2.5 w-2.5" />
                              visible en /cv
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-2.5 w-2.5" />
                              oculto
                            </>
                          )}
                        </span>
                      </div>

                      <p className="truncate font-mono text-xs text-ink-muted">
                        {doc.storagePath} · {createdFormatted}
                      </p>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                    {/* Botón Ver PDF */}
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border border-line px-2.5 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal"
                      title="Abrir PDF en pestaña nueva"
                    >
                      <ExternalLink className="h-3 w-3" />
                      ver
                    </a>

                    {/* Botón Toggle Visibilidad */}
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(doc.id, doc.isVisible)}
                      disabled={isAnyPending}
                      className={`inline-flex items-center gap-1 border px-2.5 py-1.5 font-mono text-xs transition-colors disabled:opacity-40 ${
                        doc.isVisible
                          ? "border-line text-ink hover:border-signal hover:text-signal"
                          : "border-signal text-signal bg-signal-dim/30 hover:bg-signal hover:text-paper"
                      }`}
                      title={doc.isVisible ? "Ocultar en /cv" : "Mostrar en /cv"}
                    >
                      {doc.isVisible ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          hacer visible
                        </>
                      )}
                    </button>

                    {/* Botón Principal (si no es el primero) */}
                    {!isFirst && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(doc.id)}
                        disabled={isAnyPending}
                        className="border border-line px-2 py-1.5 font-mono text-xs text-ink hover:border-signal hover:text-signal disabled:opacity-40"
                        title="Definir como principal (#1)"
                      >
                        hacer principal
                      </button>
                    )}

                    {/* Controles de orden */}
                    <div className="inline-flex border border-line">
                      <button
                        type="button"
                        onClick={() => handleMove(index, -1)}
                        disabled={isFirst || isAnyPending}
                        className="px-2 py-1.5 text-ink hover:bg-line/40 disabled:opacity-30"
                        title="Subir posición"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 1)}
                        disabled={isLast || isAnyPending}
                        className="border-l border-line px-2 py-1.5 text-ink hover:bg-line/40 disabled:opacity-30"
                        title="Bajar posición"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleDelete(doc.id, doc.label)}
                      disabled={isAnyPending}
                      className="inline-flex items-center gap-1 border border-red-300 px-2.5 py-1.5 font-mono text-xs text-red-600 hover:border-red-600 hover:bg-red-50 disabled:opacity-40"
                      title="Eliminar registro y archivo de Storage"
                    >
                      <Trash2 className="h-3 w-3" />
                      eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
