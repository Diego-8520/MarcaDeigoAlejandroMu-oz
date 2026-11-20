import { z } from "zod";

/**
 * Formatos que produce el agente de Claude Code (ver .claude/skills/).
 * Empresa, cargo y fechas NO vienen del agente: se toman de la HV maestra
 * al mostrar la HV adaptada, para que no puedan alterarse.
 */

const text = (max: number) => z.string().trim().min(1).max(max);

export const bulletSchema = z.object({
  text: text(400),
  /** Fuente en la HV maestra: exp:<id>:desc | exp:<id>:ach:<n> | proj:<id> */
  sourceRef: text(120),
});

export const tailoredCvSchema = z.object({
  headline: text(160),
  summary: text(900),
  skills: z.array(text(80)).max(40),
  experiences: z
    .array(z.object({ id: text(64), bullets: z.array(bulletSchema).max(8) }))
    .max(15),
  projects: z
    .array(z.object({ id: text(64), bullets: z.array(bulletSchema).max(4) }))
    .max(8)
    .default([]),
  educationIds: z.array(text(64)).max(10).default([]),
  certificationIds: z.array(text(64)).max(15).default([]),
  changes: z.array(text(300)).max(20).default([]),
  keywordsCovered: z.array(text(80)).max(60).default([]),
  keywordsNotAdded: z
    .array(z.object({ term: text(80), reason: text(300) }))
    .max(40)
    .default([]),
});

export type TailoredCv = z.infer<typeof tailoredCvSchema>;

export const offerEvaluationSchema = z.object({
  verdict: z.enum(["postular", "postular_con_ajustes", "no_recomendado"]),
  fitSummary: text(1200),
  strengths: z.array(text(300)).max(10),
  gaps: z
    .array(
      z.object({
        item: text(200),
        severity: z.enum(["alta", "media", "baja"]),
        mitigation: text(400),
      }),
    )
    .max(12),
  risks: z.array(text(300)).max(10).default([]),
  questionsToAsk: z.array(text(300)).max(10).default([]),
  recommendedActions: z.array(text(300)).max(10).default([]),
});

export type OfferEvaluation = z.infer<typeof offerEvaluationSchema>;

export const AGENT_OUTPUT_KINDS = ["hv", "evaluacion"] as const;
export type AgentOutputKind = (typeof AGENT_OUTPUT_KINDS)[number];

export const VERDICT_LABELS: Record<OfferEvaluation["verdict"], string> = {
  postular: "Postular",
  postular_con_ajustes: "Postular con ajustes",
  no_recomendado: "No recomendado",
};
