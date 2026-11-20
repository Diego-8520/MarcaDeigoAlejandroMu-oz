import type { JobRequirements, Keyword, MasterCv, Tip } from "../types";
import { cvEducationRank } from "./extract";
import { EVIDENCE_LABELS } from "./match";
import { splitSkillKeywords } from "./score";

/**
 * Tips generados por reglas para organizar la HV frente a una vacante.
 * Nunca sugieren inventar experiencia: lo que falta se marca como faltante.
 */

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 } as const;

function list(items: string[], max = 5): string {
  const shown = items.slice(0, max).map((i) => `«${i}»`);
  if (shown.length <= 1) return shown.join("");
  const rest = items.length > max ? ` y ${items.length - max} más` : "";
  return `${shown.slice(0, -1).join(", ")} y ${shown[shown.length - 1]}${rest}`;
}

function formatYears(years: number): string {
  return Number.isInteger(years) ? String(years) : years.toFixed(1).replace(".", ",");
}

export type TipsInput = {
  title: string;
  company: string | null;
  cv: MasterCv;
  keywords: Keyword[];
  requirements: JobRequirements;
  cvYears: number;
};

export function buildTips({ title, cv, keywords, requirements, cvYears }: TipsInput): Tip[] {
  const tips: Tip[] = [];
  const { required, desirable } = splitSkillKeywords(keywords);
  const skillKeywords = [...required, ...desirable];

  // 1) Lo que pide la vacante y no aparece en tu HV.
  const missingRequired = required.filter((k) => k.status === "falta" && k.category !== "blanda");
  if (missingRequired.length) {
    tips.push({
      kind: "faltante",
      priority: "alta",
      text: `La vacante pide ${list(missingRequired.map((k) => k.term))} y no aparece(n) en tu HV. Si tienes experiencia real con ello, agrégalo en skills y en los logros donde lo usaste. Si no, no lo inventes: destaca experiencia relacionada o considera un curso corto.`,
      href: "/dashboard/skills",
    });
  }
  const missingDesirable = desirable.filter((k) => k.status === "falta" && k.category !== "blanda");
  if (missingDesirable.length) {
    tips.push({
      kind: "faltante",
      priority: "baja",
      text: `Suman puntos (deseables) y no están en tu HV: ${list(missingDesirable.map((k) => k.term))}.`,
    });
  }

  // 2) Está en proyectos/experiencia pero no en la lista de skills.
  const notInSkills = skillKeywords.filter(
    (k) => k.category !== "blanda" && k.evidence.length > 0 && !k.evidence.some((e) => e.kind === "skill"),
  );
  for (const k of notInSkills.slice(0, 4)) {
    const where = k.evidence[0];
    tips.push({
      kind: "agregar",
      priority: k.priority === "alta" ? "alta" : "media",
      text: `Agrega «${k.term}» a tu lista de skills: ya aparece en ${EVIDENCE_LABELS[where.kind].toLowerCase()} «${where.label}».`,
      href: "/dashboard/skills",
    });
  }

  // 3) Requisito que solo está en skills/proyectos, no en la experiencia.
  const notInExperience = required.filter(
    (k) => k.category !== "blanda" && k.evidence.length > 0 && !k.evidence.some((e) => e.kind === "experiencia"),
  );
  if (notInExperience.length) {
    tips.push({
      kind: "reformular",
      priority: "media",
      text: `Menciona ${list(notInExperience.map((k) => k.term))} en la descripción o los logros de la experiencia donde lo(s) usaste. Hoy solo aparece(n) en skills o proyectos, y los reclutadores buscan evidencia en la experiencia.`,
      href: "/dashboard/experiencia",
    });
  }

  // 4) Términos con otra forma: usar el de la vacante (filtros ATS).
  const variants = keywords.filter(
    (k) => k.status === "variante" && k.evidence.length > 0 && k.category !== "frase" && k.category !== "idioma",
  );
  for (const k of variants.slice(0, 4)) {
    const yours = k.evidence[0].term;
    const stronger = k.term.toLowerCase().includes(yours.toLowerCase()) && k.term.length > yours.length;
    tips.push({
      kind: "reformular",
      priority: k.priority === "baja" ? "baja" : "media",
      text: `Usa el término exacto «${k.term}» (en tu HV aparece como «${yours}»). Los filtros automáticos (ATS) buscan coincidencias literales.${stronger ? " Hazlo solo si tu nivel lo respalda." : ""}`,
    });
  }

  // 5) Titular alineado con el cargo.
  const role = keywords.find((k) => k.category === "cargo");
  if (role && role.status !== "presente") {
    const top = required
      .filter((k) => k.status !== "falta" && k.category !== "blanda")
      .slice(0, 3)
      .map((k) => k.term);
    tips.push({
      kind: "reformular",
      priority: "alta",
      text: `Ajusta tu titular para reflejar el cargo, por ejemplo: «${role.term}${top.length ? ` | ${top.join(" · ")}` : ""}».`,
      href: "/dashboard/perfil",
    });
  }

  // 6) Experiencia más relevante primero.
  const relevance = new Map<string, number>();
  for (const k of keywords) {
    if (k.status === "falta") continue;
    for (const e of k.evidence) {
      if (e.kind === "experiencia" && e.id) relevance.set(e.id, (relevance.get(e.id) ?? 0) + k.weight);
    }
  }
  const ranked = [...relevance.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length) {
    const best = cv.experiences.find((e) => e.id === ranked[0][0]);
    const isFirst = cv.experiences[0]?.id === best?.id;
    const matches = keywords.filter((k) => k.status !== "falta" && k.evidence.some((e) => e.id === best?.id));
    if (best) {
      tips.push({
        kind: "ordenar",
        priority: isFirst ? "baja" : "media",
        text: isFirst
          ? `Tu experiencia más reciente («${best.position} · ${best.company}») también es la más relevante (${matches.length} coincidencias). Amplía sus logros con resultados medibles.`
          : `Tu experiencia más relevante para esta vacante es «${best.position} · ${best.company}» (${matches.length} coincidencias, p. ej. ${list(matches.map((k) => k.term), 3)}). Si usas una sección de «Experiencia relevante», ponla primero y desarrolla más sus logros.`,
        href: "/dashboard/experiencia",
      });
    }
  }

  // 7) Logros sin cifras o experiencias sin logros.
  const allAchievements = cv.experiences.flatMap((e) => e.achievements);
  const withoutNumbers = allAchievements.filter((a) => !/\d/.test(a));
  if (withoutNumbers.length) {
    tips.push({
      kind: "formato",
      priority: "media",
      text: `${withoutNumbers.length} de tus ${allAchievements.length} logros no tienen cifras. Cuantifícalos (porcentaje, tiempo ahorrado, dinero, volumen), por ejemplo: «Automaticé la conciliación diaria y reduje el tiempo del proceso en un 40 %».`,
      href: "/dashboard/experiencia",
    });
  }
  const noAchievements = cv.experiences.filter((e) => e.achievements.length === 0);
  if (noAchievements.length) {
    tips.push({
      kind: "formato",
      priority: "media",
      text: `Agrega de 2 a 4 logros en: ${list(noAchievements.map((e) => `${e.position} · ${e.company}`), 3)}.`,
      href: "/dashboard/experiencia",
    });
  }

  // 8) Años de experiencia.
  if (requirements.minYears && cvYears < requirements.minYears) {
    tips.push({
      kind: "faltante",
      priority: "media",
      text: `La vacante pide ${requirements.minYears} año(s) de experiencia y tu HV suma ~${formatYears(cvYears)}. Revisa que estén todas tus experiencias con fechas (prácticas, freelance, proyectos propios relevantes).`,
      href: "/dashboard/experiencia",
    });
  }

  // 9) Idiomas.
  for (const k of keywords.filter((k) => k.category === "idioma" && k.status !== "presente")) {
    tips.push({
      kind: k.status === "falta" ? "faltante" : "reformular",
      priority: k.priority === "alta" ? "alta" : "media",
      text:
        k.status === "falta"
          ? `La vacante pide «${k.term}». Si lo manejas, indícalo de forma explícita con nivel (p. ej. «Inglés B2»).`
          : `Tu HV menciona el idioma pero con un nivel menor o sin nivel: la vacante pide «${k.term}». Escribe tu nivel real de forma explícita.`,
      href: "/dashboard/perfil",
    });
  }

  // 10) Educación.
  if (requirements.educationLevel && cvEducationRank(cv.education) < requirements.educationLevel.rank) {
    tips.push({
      kind: "faltante",
      priority: "media",
      text: `La vacante pide nivel ${requirements.educationLevel.label}. Si lo estás cursando, indícalo con el estado y la fecha estimada de grado.`,
      href: "/dashboard/educacion",
    });
  }

  // 11) Frases importantes de la vacante.
  const missingPhrases = keywords.filter((k) => k.category === "frase" && k.status !== "presente" && k.priority !== "baja");
  if (missingPhrases.length) {
    tips.push({
      kind: "reformular",
      priority: "baja",
      text: `Donde aplique a tu experiencia real, usa frases de la vacante como ${list(missingPhrases.map((k) => k.term), 4)}.`,
    });
  }

  // 12) Perfil y datos de contacto.
  if (!cv.bio?.trim()) {
    tips.push({
      kind: "resumen",
      priority: "alta",
      text: "Tu perfil no tiene resumen profesional. Usa el resumen sugerido como punto de partida.",
      href: "/dashboard/perfil",
    });
  }
  const missingContact = [
    !cv.email && "email",
    !cv.phone && "teléfono",
    !cv.linkedinUrl && "LinkedIn",
  ].filter(Boolean) as string[];
  if (missingContact.length) {
    tips.push({
      kind: "formato",
      priority: "baja",
      text: `Completa en tu perfil: ${missingContact.join(", ")}.`,
      href: "/dashboard/perfil",
    });
  }

  if (!tips.length) {
    tips.push({
      kind: "formato",
      priority: "baja",
      text: `Tu HV cubre bien lo que pide «${title}». Revisa que el resumen y los logros mencionen los términos de la lista de palabras clave.`,
    });
  }

  return tips.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

/** Resumen profesional sugerido, armado solo con datos reales de tu HV. */
export function buildSuggestedSummary({ title, company, cv, keywords, cvYears }: TipsInput): string {
  // Solo términos que ya están literalmente en tu HV: una variante («Excel» vs
  // «Excel avanzado») podría exagerar tu nivel.
  const matched = keywords
    .filter((k) => k.status === "presente" && ["tecnica", "herramienta", "metodologia"].includes(k.category))
    .slice(0, 5)
    .map((k) => k.term);
  const soft = keywords
    .filter((k) => k.status === "presente" && k.category === "blanda")
    .slice(0, 2)
    .map((k) => k.term.toLowerCase());
  const base = cv.headline?.split("|")[0]?.trim() || "Profesional";
  const years = cvYears >= 1 ? ` con ${formatYears(Math.floor(cvYears))} año(s) de experiencia` : "";
  const skills = matched.length
    ? ` en ${matched.length > 1 ? `${matched.slice(0, -1).join(", ")} y ${matched[matched.length - 1]}` : matched[0]}`
    : "";
  const latest = cv.experiences[0];
  const exp = latest ? ` Experiencia reciente como ${latest.position} en ${latest.company}.` : "";
  const softText = soft.length ? ` Destaco por ${soft.join(" y ")}.` : "";
  return `${base}${years}${skills}.${exp}${softText} Me interesa aportar como ${title}${company ? ` en ${company}` : ""}.`
    .replace(/\s+/g, " ")
    .trim();
}

/** Orden sugerido de tus skills: primero las que pide la vacante. */
export function buildSkillOrder(cv: MasterCv, keywords: Keyword[]): string[] {
  const score = new Map<string, number>();
  for (const k of keywords) {
    if (k.status === "falta") continue;
    for (const e of k.evidence) {
      if (e.kind === "skill" && e.id) score.set(e.id, Math.max(score.get(e.id) ?? 0, k.weight));
    }
  }
  return [...cv.skills]
    .map((s, index) => ({ s, index, w: score.get(s.id) ?? 0 }))
    .sort((a, b) => b.w - a.w || a.index - b.index)
    .map(({ s }) => s.name);
}
