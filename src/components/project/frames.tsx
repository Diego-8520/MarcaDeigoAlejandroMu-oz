import Image from "next/image";
import { cn } from "@/lib/utils";

/** Imagen de proyecto con dimensiones reales cuando se conocen (capturas). */
export type FrameImage = {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
};

function ratio(image: FrameImage, fallback: string) {
  return image.width && image.height ? `${image.width} / ${image.height}` : fallback;
}

/**
 * Marco de navegador editorial: barra mono con tres cuadrados (radio 0) y el
 * dominio del proyecto. Respeta la proporción real de la captura: no recorta.
 */
export function BrowserFrame({
  image,
  domain,
  sizes,
  priority,
  className,
}: {
  image: FrameImage;
  domain?: string | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden border border-line bg-surface", className)}>
      <div className="flex h-8 items-center gap-3 border-b border-line px-3 sm:h-9 sm:px-4" aria-hidden="true">
        <span className="flex gap-1.5">
          <span className="h-2 w-2 bg-line-focus" />
          <span className="h-2 w-2 bg-line-focus" />
          <span className="h-2 w-2 bg-line-focus" />
        </span>
        {domain && (
          <span className="mx-auto truncate border border-line px-3 py-0.5 font-mono text-[10px] tracking-[0.06em] text-ink-subtle">
            {domain}
          </span>
        )}
        <span className="w-[42px]" />
      </div>
      <div className="relative w-full" style={{ aspectRatio: ratio(image, "16 / 10") }}>
        <Image src={image.src} alt={image.alt} fill priority={priority} sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}

/** Marco de móvil rectangular (radio 0) para las capturas `mobile`. */
export function PhoneFrame({ image, sizes, className }: { image: FrameImage; sizes: string; className?: string }) {
  return (
    <div className={cn("overflow-hidden border border-line-focus bg-paper p-1.5", className)}>
      <div className="flex h-5 items-center justify-center" aria-hidden="true">
        <span className="h-1 w-10 bg-line-focus" />
      </div>
      <div className="relative w-full border border-line" style={{ aspectRatio: ratio(image, "9 / 19.5") }}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover object-top" />
      </div>
    </div>
  );
}

/** Dominio legible de una URL (sin www). */
export function domainOf(url?: string | null) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
