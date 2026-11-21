import { cn } from "@/lib/utils";

export function scoreTone(score: number | null) {
  if (score === null) return "text-ink-subtle border-line";
  if (score >= 70) return "text-emerald border-emerald/50";
  if (score >= 45) return "text-amber border-amber/50";
  return "text-red-600 border-red-600/40";
}

export function scoreLabel(score: number | null) {
  if (score === null) return "sin análisis";
  if (score >= 70) return "buen encaje";
  if (score >= 45) return "encaje parcial";
  return "encaje bajo";
}

/** Puntaje de compatibilidad 0–100. */
export function ScoreBadge({ score, size = "md" }: { score: number | null; size?: "md" | "lg" }) {
  return (
    <div
      className={cn(
        "flex flex-none flex-col items-center justify-center border font-mono",
        scoreTone(score),
        size === "lg" ? "h-28 w-28" : "h-14 w-14",
      )}
      title={`Compatibilidad: ${scoreLabel(score)}`}
    >
      <span className={cn("font-semibold leading-none", size === "lg" ? "text-4xl" : "text-lg")}>
        {score ?? "–"}
      </span>
      <span className={cn("mt-1 uppercase tracking-[0.06em]", size === "lg" ? "text-[10px]" : "text-[8px]")}>
        {size === "lg" ? scoreLabel(score) : "/100"}
      </span>
    </div>
  );
}
