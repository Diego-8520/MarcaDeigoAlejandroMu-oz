"use client";

import Image from "next/image";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteProjectImage,
  importImageFromUrl,
  reorderProjectImages,
  updateProjectImageAltText,
  uploadProjectImage,
  type ProjectImageActionState,
} from "@/actions/project-images";
import type { ProjectImage } from "@/types/project";

const initialState: ProjectImageActionState = { status: "idle" };

export function ProjectImagesManager({
  projectId,
  initialImages,
  suggestedImageUrl,
}: {
  projectId: string;
  initialImages: ProjectImage[];
  suggestedImageUrl?: string | null;
}) {
  const router = useRouter();
  const uploadAction = uploadProjectImage.bind(null, projectId);
  const [uploadState, formAction, isUploading] = useActionState(
    uploadAction,
    initialState
  );
  const [images, setImages] = useState(initialImages);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (uploadState.status === "success") {
      router.refresh();
    }
  }, [router, uploadState.status]);

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const nextImages = [...images];
    [nextImages[index], nextImages[targetIndex]] = [
      nextImages[targetIndex],
      nextImages[index],
    ];
    setImages(nextImages);

    startTransition(async () => {
      const result = await reorderProjectImages(
        projectId,
        nextImages.map((image) => image.id)
      );
      setMessage(result.message ?? null);
      router.refresh();
    });
  }

  function removeImage(imageId: string) {
    if (!window.confirm("¿Eliminar esta imagen?")) return;

    startTransition(async () => {
      const result = await deleteProjectImage(imageId);
      setMessage(result.message ?? null);
      if (result.status === "success") {
        setImages((current) => current.filter((image) => image.id !== imageId));
      }
      router.refresh();
    });
  }

  function saveAltText(imageId: string, altText: string) {
    startTransition(async () => {
      const result = await updateProjectImageAltText(imageId, altText);
      setMessage(result.message ?? null);
      router.refresh();
    });
  }

  function importSuggestedImage() {
    if (!suggestedImageUrl) return;

    startTransition(async () => {
      const result = await importImageFromUrl(projectId, suggestedImageUrl);
      setMessage(result.message ?? null);
      router.refresh();
    });
  }

  return (
    <section className="mt-12 border-t border-line pt-8">
      <div>
        <p className="font-mono text-xs text-ink-muted">imágenes del proyecto</p>
        <h2 className="mt-2 font-display text-xl font-semibold text-ink">
          Galería
        </h2>
      </div>

      {suggestedImageUrl && images.length === 0 && (
        <div className="mt-6 border border-line p-4">
          <p className="font-mono text-xs text-ink-muted">imagen sugerida</p>
          <div className="relative mt-3 aspect-video w-full max-w-lg overflow-hidden border border-line bg-white/40">
            <Image
              src={suggestedImageUrl}
              alt=""
              fill
              unoptimized
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={importSuggestedImage}
            disabled={isPending}
            className="mt-4 border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-50"
          >
            {isPending ? "importando..." : "usar esta imagen"}
          </button>
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="images" className="font-mono text-xs text-ink-muted">
            subir imágenes
          </label>
          <input
            id="images"
            name="images"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none file:mr-4 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:font-mono file:text-xs file:text-paper focus:border-signal"
          />
        </div>
        <div>
          <label htmlFor="alt_text" className="font-mono text-xs text-ink-muted">
            texto alternativo para esta subida
          </label>
          <input
            id="alt_text"
            name="alt_text"
            className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
          />
        </div>
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex items-center bg-ink px-4 py-2 font-mono text-sm text-paper transition-colors hover:bg-signal disabled:opacity-50"
        >
          {isUploading ? "subiendo..." : "subir imágenes"}
        </button>
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

      <div className="mt-8 space-y-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="grid gap-4 border border-line p-4 sm:grid-cols-[160px_1fr]"
          >
            <div className="relative aspect-video overflow-hidden border border-line bg-white/40">
              <Image
                src={image.publicUrl}
                alt={image.altText ?? ""}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label
                  htmlFor={`alt-${image.id}`}
                  className="font-mono text-xs text-ink-muted"
                >
                  alt_text
                </label>
                <input
                  id={`alt-${image.id}`}
                  defaultValue={image.altText ?? ""}
                  onBlur={(event) => saveAltText(image.id, event.target.value)}
                  className="mt-1.5 w-full border border-line bg-transparent px-3 py-2 font-body text-sm text-ink outline-none focus:border-signal"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0 || isPending}
                  className="border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-40"
                >
                  subir
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1 || isPending}
                  className="border border-line px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal disabled:opacity-40"
                >
                  bajar
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  disabled={isPending}
                  className="border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 transition-colors hover:border-red-600 disabled:opacity-40"
                >
                  eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="mt-6 font-body text-sm text-ink-muted">
          Todavía no hay imágenes para este proyecto.
        </p>
      )}
      {message && <p className="mt-4 font-mono text-xs text-ink-muted">{message}</p>}
    </section>
  );
}
