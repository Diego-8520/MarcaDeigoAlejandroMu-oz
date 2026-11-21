import type { JobRequirements, Keyword, MasterCv, ScoreComponent, ScoreComponentId } from "../types";
import { cvEducationRank, cvLanguageLevel } from "./extract";
import { normalize } from "./normalize";

/**
 * Pesos del puntaje (suman 100). Los componentes para los que la vacante no
 * da información se excluyen y el resto se reescala a 100.
 */
export const SCORE_WEIGHTS: Record<ScoreComponentId, number> = {
  habilidadesRequeridas: 45,
  habilidadesDeseables: 15,
  experiencia: 20,
  educacion: 10,
  idioma: 5,
  modalidad: 5,
};

const LABELS: Record<ScoreComponentId, string> = {
  habilidadesRequeridas: "Habilidades requeridas",
  habilidadesDeseables: "Habilidades deseables",
  experiencia: "Años de experiencia",
  educacion: "Educación",
  idioma: "Idiomas",
  modalidad: "Modalidad / ubicación",
};

const SKILL_CATEGORIES = new Set<Keyword["category"]>([
  "tecnica",
  "herramienta",
  "metodologia",
  "blanda",
  "certificacion",
]);

const STATUS_VALUE = { presente: 1, variante: 0.85, falta: 0 } as const;

/** Separa las habilidades de la vacante en requeridas y deseables. */
export function splitSkillKeywords(keywords: Keyword[]) {
  const skills = keywords.filter((k) => SKILL_CATEGORIES.has(k.category));
  const hasRequiredSection = skills.some((k) => k.sections.includes("requerido"));
  const isRequired = (k: Keyword) =>
    k.sections.includes("requerido") || (!hasRequiredSection && k.sections.includes("general"));
  return {
    required: skills.filter(isRequired),
    desirable: skills.filter((k) => !isRequired(k)),
  };
}

function skillsRatio(list: Keyword[]): number | null {
  if (!list.length) return null;
  let total = 0;
  let got = 0;
  for (const k of list) {
    // Las habilidades blandas pesan la mitad: son fáciles de declarar y difíciles de filtrar.
    const w = k.weight * (k.category === "blanda" ? 0.5 : 1);
    total += w;
    got += w * STATUS_VALUE[k.status];
  }
  return total ? got / total : null;
}

function describeSkills(list: Keyword[]): string {
  if (!list.length) return "La vacante no lista habilidades en esta categoría.";
  const have = list.filter((k) => k.status !== "falta").length;
  return `Tienes ${have} de ${list.length}.`;
}

export type ScoreInput = {
  keywords: Keyword[];
  requirements: JobRequirements;
  cv: MasterCv;
  cvText: string;
  cvYears: number;
  jobLocation: string | null;
};

export function computeScore({ keywords, requirements, cv, cvText, cvYears, jobLocation }: ScoreInput) {
  const { required, desirable } = splitSkillKeywords(keywords);
  const raw: { id: ScoreComponentId; ratio: number | null; detail: string }[] = [];

  raw.push({ id: "habilidadesRequeridas", ratio: skillsRatio(required), detail: describeSkills(required) });
  raw.push({ id: "habilidadesDeseables", ratio: skillsRatio(desirable), detail: describeSkills(desirable) });

  if (requirements.minYears) {
    raw.push({
      id: "experiencia",
      ratio: Math.min(1, cvYears / requirements.minYears),
      detail: `Pide ${requirements.minYears} año(s); tu HV suma ~${cvYears}.`,
    });
  } else {
    raw.push({ id: "experiencia", ratio: null, detail: "La vacante no indica años de experiencia." });
  }

  if (requirements.educationLevel) {
    const cvRank = cvEducationRank(cv.education);
    const req = requirements.educationLevel.rank;
    raw.push({
      id: "educacion",
      ratio: cvRank >= req ? 1 : cvRank === req - 1 ? 0.5 : 0,
      detail: `Pide nivel ${requirements.educationLevel.label}.`,
    });
  } else {
    raw.push({ id: "educacion", ratio: null, detail: "La vacante no indica nivel educativo." });
  }

  if (requirements.languages.length) {
    const ratios = requirements.languages.map((lang) => {
      const level = cvLanguageLevel(cvText, lang.language);
      const req = lang.level ?? 1;
      return Math.min(1, level / req);
    });
    raw.push({
      id: "idioma",
      ratio: ratios.reduce((a, b) => a + b, 0) / ratios.length,
      detail: requirements.languages
        .map((l) => `${l.language}${l.levelLabel ? ` ${l.levelLabel}` : ""}${l.required ? "" : " (deseable)"}`)
        .join(", "),
    });
  } else {
    raw.push({ id: "idioma", ratio: null, detail: "La vacante no pide idiomas." });
  }

  if (requirements.modality) {
    let ratio = 1;
    let detail = "Remoto: puedes postularte desde donde estás.";
    if (requirements.modality !== "remoto") {
      const city = normalize((cv.location ?? "").split(",")[0] ?? "").trim();
      const sameCity = Boolean(city) && normalize(jobLocation ?? "").includes(` ${city} `);
      ratio = sameCity ? 1 : 0.5;
      detail = sameCity
        ? `${requirements.modality === "hibrido" ? "Híbrido" : "Presencial"} en tu ciudad.`
        : `${requirements.modality === "hibrido" ? "Híbrido" : "Presencial"}${jobLocation ? ` en ${jobLocation}` : ""}: revisa si puedes desplazarte.`;
    }
    raw.push({ id: "modalidad", ratio, detail });
  } else {
    raw.push({ id: "modalidad", ratio: null, detail: "La vacante no indica modalidad." });
  }

  const applicableWeight = raw.reduce((sum, c) => sum + (c.ratio === null ? 0 : SCORE_WEIGHTS[c.id]), 0);
  const components: ScoreComponent[] = raw.map((c) => {
    const maxPoints = c.ratio === null || !applicableWeight ? 0 : (SCORE_WEIGHTS[c.id] * 100) / applicableWeight;
    const points = c.ratio === null ? 0 : c.ratio * maxPoints;
    return {
      id: c.id,
      label: LABELS[c.id],
      weight: SCORE_WEIGHTS[c.id],
      ratio: c.ratio === null ? null : Math.round(c.ratio * 100) / 100,
      points: Math.round(points * 10) / 10,
      maxPoints: Math.round(maxPoints * 10) / 10,
      detail: c.detail,
    };
  });
  const score = applicableWeight
    ? Math.round(components.reduce((sum, c) => sum + c.points, 0))
    : 0;
  return { score: Math.max(0, Math.min(100, score)), components };
}
