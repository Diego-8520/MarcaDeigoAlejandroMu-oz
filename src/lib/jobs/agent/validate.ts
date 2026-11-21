import { normalizeTerm } from "../analysis/normalize";
import type { JobAnalysis, MasterCv } from "../types";
import {
  type AgentOutputKind,
  type OfferEvaluation,
  type TailoredCv,
  offerEvaluationSchema,
  tailoredCvSchema,
} from "./schemas";

/**
 * Regla de oro: el agente puede reformular y priorizar, nunca inventar.
 * Esta validación corre antes de guardar y devuelve errores claros para que
 * el agente corrija.
 */

export type ValidationResult<T> = { ok: true; data: T; warnings: string[] } | { ok: false; errors: string[] };

const NUMBER_RE = /\d+(?:[.,]\d+)*/g;

function numbersIn(value: string): string[] {
  return [...value.matchAll(NUMBER_RE)].map((m) => m[0].replace(/[.,]/g, ""));
}

/** Texto fuente de una referencia, o null si no existe. */
export function resolveSourceRef(cv: MasterCv, ref: string): { text: string; ownerId: string } | null {
  const exp = ref.match(/^exp:([^:]+):(desc|pos|ach:(\d+))$/);
  if (exp) {
    const item = cv.experiences.find((e) => e.id === exp[1]);
    if (!item) return null;
    if (exp[2] === "desc") return item.description ? { text: item.description, ownerId: item.id } : null;
    if (exp[2] === "pos") return { text: item.position, ownerId: item.id };
    const achievement = item.achievements[Number(exp[3])];
    return achievement ? { text: achievement, ownerId: item.id } : null;
  }
  const proj = ref.match(/^proj:(.+)$/);
  if (proj) {
    const item = cv.projects.find((p) => p.id === proj[1]);
    return item
      ? { text: [item.title, item.description ?? "", ...item.technologies].join(" "), ownerId: item.id }
      : null;
  }
  return null;
}

function cvAllText(cv: MasterCv): string {
  return [
    cv.headline,
    cv.bio,
    ...cv.skills.map((s) => s.name),
    ...cv.experiences.flatMap((e) => [e.position, e.company, e.description ?? "", ...e.achievements]),
    ...cv.projects.flatMap((p) => [p.title, p.description ?? "", ...p.technologies]),
    ...cv.education.flatMap((e) => [e.program, e.institution, e.description ?? ""]),
    ...cv.certifications.map((c) => c.name),
  ]
    .filter(Boolean)
    .join(" \n ");
}

export function validateTailoredCv(
  input: unknown,
  cv: MasterCv,
  analysis: JobAnalysis,
): ValidationResult<TailoredCv> {
  const parsed = tailoredCvSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `Formato: ${i.path.join(".") || "(raíz)"}: ${i.message}`),
    };
  }
  const data = parsed.data;
  const errors: string[] = [];
  const warnings: string[] = [];

  // Experiencias y viñetas.
  const seenExp = new Set<string>();
  for (const exp of data.experiences) {
    if (!cv.experiences.some((e) => e.id === exp.id)) {
      errors.push(`La experiencia "${exp.id}" no existe en tu HV.`);
      continue;
    }
    if (seenExp.has(exp.id)) errors.push(`La experiencia "${exp.id}" está repetida.`);
    seenExp.add(exp.id);
    for (const bullet of exp.bullets) {
      const source = resolveSourceRef(cv, bullet.sourceRef);
      if (!source) {
        errors.push(`Viñeta "${bullet.text.slice(0, 60)}…": la fuente "${bullet.sourceRef}" no existe.`);
        continue;
      }
      if (source.ownerId !== exp.id) {
        errors.push(`Viñeta "${bullet.text.slice(0, 60)}…": su fuente pertenece a otra experiencia.`);
      }
      checkNumbers(bullet.text, source.text, errors);
    }
  }

  // Proyectos.
  for (const project of data.projects) {
    if (!cv.projects.some((p) => p.id === project.id)) {
      errors.push(`El proyecto "${project.id}" no existe en tu HV.`);
      continue;
    }
    for (const bullet of project.bullets) {
      const source = resolveSourceRef(cv, bullet.sourceRef);
      if (!source || source.ownerId !== project.id) {
        errors.push(`Viñeta de proyecto "${bullet.text.slice(0, 60)}…": fuente "${bullet.sourceRef}" inválida.`);
        continue;
      }
      checkNumbers(bullet.text, source.text, errors);
    }
  }

  for (const id of data.educationIds) {
    if (!cv.education.some((e) => e.id === id)) errors.push(`La educación "${id}" no existe en tu HV.`);
  }
  for (const id of data.certificationIds) {
    if (!cv.certifications.some((c) => c.id === id)) errors.push(`La certificación "${id}" no existe en tu HV.`);
  }

  // Skills: deben existir en tu HV o tener evidencia según el análisis.
  const allowed = new Set<string>([
    ...cv.skills.map((s) => normalizeTerm(s.name)),
    ...analysis.keywords.filter((k) => k.evidence.length > 0).map((k) => normalizeTerm(k.term)),
  ]);
  for (const skill of data.skills) {
    if (!allowed.has(normalizeTerm(skill))) {
      errors.push(
        `La skill "${skill}" no está en tu HV ni tiene evidencia. Quítala o ponla en keywordsNotAdded con la razón.`,
      );
    }
  }

  // Resumen y titular: las cifras deben existir en la HV (o ser tus años de experiencia).
  const allText = cvAllText(cv);
  const years = new Set([Math.floor(analysis.cvYears), Math.round(analysis.cvYears)].map(String));
  for (const [field, value] of [
    ["summary", data.summary],
    ["headline", data.headline],
  ] as const) {
    for (const n of numbersIn(value)) {
      if (!years.has(n) && !numbersIn(allText).includes(n)) {
        errors.push(`El ${field === "summary" ? "resumen" : "titular"} menciona la cifra "${n}", que no está en tu HV.`);
      }
    }
  }

  // Advertencias (no bloquean).
  const missingRequired = analysis.keywords.filter((k) => k.status === "falta" && k.priority === "alta");
  const declared = new Set(data.keywordsNotAdded.map((k) => normalizeTerm(k.term)));
  const undeclared = missingRequired.filter((k) => !declared.has(normalizeTerm(k.term)));
  if (undeclared.length) {
    warnings.push(
      `Requisitos que faltan y no se explicaron en keywordsNotAdded: ${undeclared.map((k) => k.term).join(", ")}.`,
    );
  }
  if (!data.experiences.length) warnings.push("La HV adaptada no incluye experiencias.");

  return errors.length ? { ok: false, errors } : { ok: true, data, warnings };
}

function checkNumbers(textValue: string, source: string, errors: string[]) {
  const available = new Set(numbersIn(source));
  for (const n of numbersIn(textValue)) {
    if (!available.has(n)) {
      errors.push(`La cifra "${n}" en "${textValue.slice(0, 60)}…" no aparece en su fuente. No inventes resultados.`);
    }
  }
}

export function validateOfferEvaluation(input: unknown): ValidationResult<OfferEvaluation> {
  const parsed = offerEvaluationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `Formato: ${i.path.join(".") || "(raíz)"}: ${i.message}`),
    };
  }
  return { ok: true, data: parsed.data, warnings: [] };
}

export function validateAgentOutput(
  kind: AgentOutputKind,
  input: unknown,
  cv: MasterCv,
  analysis: JobAnalysis,
): ValidationResult<TailoredCv | OfferEvaluation> {
  return kind === "hv" ? validateTailoredCv(input, cv, analysis) : validateOfferEvaluation(input);
}

