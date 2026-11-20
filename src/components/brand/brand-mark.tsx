import { cn } from "@/lib/utils";

/**
 * Símbolo de marca «D·Cursor»: una D construida a 45° (trazo 40 en una
 * grilla de 256) y el cuadrado lima encajado en su esquina cortada.
 * La D usa `currentColor`; el cursor siempre es lima.
 *
 * Dentro de un `.group`, el cursor gira 45° (rombo) en hover/focus, igual que
 * el cuadrado del logotipo anterior. Fuente: carpeta `logo/` de la marca.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      // Recortado al dibujo (sin el margen 24 de la grilla): el borde inferior
      // del SVG es la base de la D y del cursor, para alinear con `items-baseline`.
      viewBox="24 24 208 208"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0 overflow-visible", className)}
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M24 24H144L192 72V184L144 232H24Z M64 64V192H128L152 168V88L128 64Z"
      />
      <rect
        x="200"
        y="200"
        width="32"
        height="32"
        className="origin-center fill-signal transition-transform duration-500 ease-expo [transform-box:fill-box] group-hover:rotate-45 group-focus-visible:rotate-45"
      />
    </svg>
  );
}
