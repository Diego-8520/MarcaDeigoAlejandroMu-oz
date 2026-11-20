import type { JobRequirements, Modality, SectionKind } from "../types";
import { htmlToText, normalize } from "./normalize";

/**
 * Extracción por reglas de la estructura y los requisitos de una vacante.
 */

export type JobSection = {
  kind: SectionKind;
  heading: string | null;
  /** Texto normalizado (ver normalize()). */
  text: string;
  raw: string;
};

const HEADINGS: { kind: SectionKind; patterns: RegExp }[] = [
  {
    kind: "deseable",
    patterns:
      /\b(deseable|deseables|plus|valoramos|se valorara|sera un plus|seria un plus|nice to have|bonus|preferible|preferiblemente|suma puntos|valorable)\b/,
  },
  {
    kind: "requerido",
    patterns:
      /\b(requisitos|requerimientos|requerido|requeridos|indispensable|excluyente|buscamos|perfil|que necesitas|lo que necesitas|debes tener|debes contar|necesitamos|requirements|must have|qualifications|what you need|what we look for|que buscamos|conocimientos)\b/,
  },
  {
    kind: "funciones",
    patterns:
      /\b(funciones|responsabilidades|que haras|lo que haras|tus retos|tu reto|actividades|tareas|desafios|responsibilities|what you ll do|what you will do|tu dia a dia|rol)\b/,
  },
  {
    kind: "beneficios",
    patterns:
      /\b(beneficios|ofrecemos|que ofrecemos|te ofrecemos|benefits|perks|we offer|condiciones|salario|compensacion)\b/,
  },
];

function detectHeading(line: string): SectionKind | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  // Un encabezado es una línea corta, o un rótulo corto seguido de ":".
  const label = /^[^:]{1,40}:/.test(trimmed) ? trimmed.slice(0, trimmed.indexOf(":")) : trimmed;
  const n = normalize(label);
  if (label === trimmed && n.trim().split(" ").length > 6) return null;
  for (const { kind, patterns } of HEADINGS) {
    if (patterns.test(n)) return kind;
  }
  return null;
}

/** Divide la vacante en secciones según sus encabezados. */
export function splitSections(description: string): JobSection[] {
  const text = htmlToText(description);
  const lines = text.split(/\r?\n/);
  const sections: { kind: SectionKind; heading: string | null; lines: string[] }[] = [];
  let current: { kind: SectionKind; heading: string | null; lines: string[] } = {
    kind: "general",
    heading: null,
    lines: [],
  };

  for (const line of lines) {
    const kind = detectHeading(line);
    if (kind) {
      if (current.lines.length || current.heading) sections.push(current);
      current = { kind, heading: line.trim().replace(/:$/, ""), lines: [] };
      if (line.includes(":")) {
        // "Requisitos: Excel avanzado y SQL" -> el contenido tras ":" pertenece a la sección.
        const after = line.split(":").slice(1).join(":").trim();
        if (after) current.lines.push(after);
      } else {
        // Viñeta corta tipo "Conocimientos en SQL": se conserva como contenido.
        current.lines.push(line);
      }
      continue;
    }
    // Línea suelta que dice "deseable" dentro de otra sección.
    const n = normalize(line);
    if (current.kind !== "deseable" && /\b(deseable|plus|valorable|preferible)\b/.test(n)) {
      sections.push({ kind: "deseable", heading: null, lines: [line] });
      continue;
    }
    current.lines.push(line);
  }
  if (current.lines.length || current.heading) sections.push(current);

  return sections
    .map((section) => {
      const raw = section.lines.join("\n").trim();
      return { kind: section.kind, heading: section.heading, raw, text: normalize(raw) };
    })
    .filter((section) => section.raw.length > 0);
}

// ---------------------------------------------------------------------------
// Años de experiencia
// ---------------------------------------------------------------------------

const YEARS_RE =
  /(?:minimo|al menos|mas de|desde|mayor a|superior a|at least|minimum)?\s*(\d{1,2})\s*(?:\+|(?:a|-|y|o|to)\s*(\d{1,2}))?\s*(?:anos|ano|years|year|yrs)\b/g;

/** Mayor mínimo de años de experiencia pedido (solo cuando el contexto habla de experiencia). */
export function extractMinYears(normalizedText: string): number | null {
  let best: number | null = null;
  for (const match of normalizedText.matchAll(YEARS_RE)) {
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value <= 0 || value > 25) continue;
    const start = Math.max(0, (match.index ?? 0) - 50);
    const end = (match.index ?? 0) + match[0].length + 60;
    const context = normalizedText.slice(start, end);
    if (!/experiencia|experience|trayectoria|laborando|trabajando/.test(context)) continue;
    // "entre 25 y 35 anos" = edad, no experiencia.
    if (/\bedad\b|\bage\b/.test(context)) continue;
    best = best === null ? value : Math.max(best, value);
  }
  return best;
}

// ---------------------------------------------------------------------------
// Seniority
// ---------------------------------------------------------------------------

const SENIORITY: { label: string; re: RegExp }[] = [
  { label: "Practicante", re: /\b(practicante|pasante|aprendiz|pasantia|practica profesional|intern|internship|trainee|sena)\b/ },
  { label: "Junior", re: /\b(junior|jr|entry level|sin experiencia|recien egresado)\b/ },
  { label: "Semi senior", re: /\b(semi senior|semisenior|semi sr|ssr|mid level|mid senior)\b/ },
  { label: "Senior", re: /\b(senior|sr)\b/ },
  { label: "Líder / Jefatura", re: /\b(lider|lead|jefe|jefatura|coordinador|coordinadora|gerente|manager|head of|director|directora)\b/ },
];

export function extractSeniority(normalizedTitle: string, normalizedText: string): string | null {
  for (const source of [normalizedTitle, normalizedText]) {
    // Del más alto al más bajo: "senior" gana a "semi senior" solo si no hay "semi".
    const found = SENIORITY.filter(({ re }) => re.test(source)).map(({ label }) => label);
    if (found.includes("Semi senior")) return "Semi senior";
    if (found.length) return found[found.length - 1];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Educación
// ---------------------------------------------------------------------------

export const EDUCATION_LEVELS: { rank: number; label: string; re: RegExp }[] = [
  { rank: 1, label: "Bachiller", re: /\b(bachiller|bachillerato|secundaria|high school)\b/ },
  { rank: 2, label: "Técnico", re: /\b(tecnico|tecnica|technical degree)\b/ },
  { rank: 3, label: "Tecnólogo", re: /\b(tecnologo|tecnologa|tecnologia en|tecnologico)\b/ },
  {
    rank: 4,
    label: "Profesional",
    re: /\b(profesional en|profesional universitario|universitario|universitaria|pregrado|licenciatura|licenciado|ingenieria|ingeniero|ingeniera|carrera profesional|titulo profesional|bachelor|degree in|grado en|administracion de empresas|contaduria)\b/,
  },
  { rank: 5, label: "Posgrado", re: /\b(especializacion|especialista|maestria|magister|master|mba|posgrado|postgrado|doctorado|phd)\b/ },
];

/** Nivel educativo mínimo pedido (el más bajo mencionado en secciones de requisitos). */
export function extractEducationLevel(normalizedText: string): { rank: number; label: string } | null {
  // "Técnico" también aparece como "soporte técnico", "perfil técnico": se exige
  // un contexto educativo cercano.
  const educationContext = /(formacion|titulo|estudios|egresado|graduado|estudiante|nivel academico|profesional|carrera|education|degree)/;
  const found: { rank: number; label: string }[] = [];
  for (const level of EDUCATION_LEVELS) {
    const re = new RegExp(level.re.source, "g");
    for (const match of normalizedText.matchAll(re)) {
      const idx = match.index ?? 0;
      const context = normalizedText.slice(Math.max(0, idx - 60), idx + match[0].length + 60);
      if (level.rank >= 4 || educationContext.test(context)) {
        found.push({ rank: level.rank, label: level.label });
        break;
      }
    }
  }
  if (!found.length) return null;
  return found.reduce((min, item) => (item.rank < min.rank ? item : min));
}

/** Nivel educativo más alto en la HV. */
export function cvEducationRank(
  education: { program: string; status: string | null; description: string | null }[],
): number {
  let best = 0;
  for (const item of education) {
    const text = normalize(`${item.program} ${item.description ?? ""}`);
    for (const level of EDUCATION_LEVELS) {
      if (level.re.test(text)) best = Math.max(best, level.rank);
    }
    // Un título que no encaja en ninguna palabra clave cuenta como técnico.
    if (best === 0 && item.program.trim()) best = 2;
  }
  return best;
}

// ---------------------------------------------------------------------------
// Idiomas
// ---------------------------------------------------------------------------

const LANGUAGES: { language: string; re: RegExp }[] = [
  { language: "Inglés", re: /\b(ingles|english)\b/ },
  { language: "Portugués", re: /\b(portugues|portuguese)\b/ },
  { language: "Francés", re: /\b(frances|french)\b/ },
  { language: "Alemán", re: /\b(aleman|german)\b/ },
  { language: "Italiano", re: /\b(italiano|italian)\b/ },
];

const LEVELS: { level: number; label: string; re: RegExp }[] = [
  { level: 5, label: "C2 / nativo", re: /\b(c2|nativo|nativa|native|bilingue|bilingual)\b/ },
  { level: 4, label: "C1 / avanzado", re: /\b(c1|avanzado|avanzada|advanced|fluido|fluida|fluent|fluency)\b/ },
  { level: 3, label: "B2 / intermedio-alto", re: /\b(b2|intermedio alto|upper intermediate|conversacional|conversational)\b/ },
  { level: 2, label: "B1 / intermedio", re: /\b(b1|intermedio|intermedia|intermediate)\b/ },
  { level: 1, label: "A2 / básico", re: /\b(a1|a2|basico|basica|basic|elementary)\b/ },
];

export function detectLevel(context: string): { level: number; label: string } | null {
  for (const level of LEVELS) if (level.re.test(context)) return { level: level.level, label: level.label };
  return null;
}

export function extractLanguages(
  sections: JobSection[],
): JobRequirements["languages"] {
  const result = new Map<string, JobRequirements["languages"][number]>();
  for (const section of sections) {
    if (section.kind === "beneficios") continue;
    for (const { language, re } of LANGUAGES) {
      const match = section.text.match(re);
      if (!match) continue;
      const idx = match.index ?? 0;
      const context = section.text.slice(Math.max(0, idx - 40), idx + 60);
      const level = detectLevel(context);
      const required = section.kind !== "deseable" && !/\b(deseable|plus|preferible)\b/.test(context);
      const prev = result.get(language);
      if (!prev || (level?.level ?? 0) > (prev.level ?? 0) || (required && !prev.required)) {
        result.set(language, {
          language,
          level: level?.level ?? prev?.level ?? null,
          levelLabel: level?.label ?? prev?.levelLabel ?? null,
          required: required || Boolean(prev?.required),
        });
      }
    }
  }
  return [...result.values()];
}

// ---------------------------------------------------------------------------
// Modalidad y salario
// ---------------------------------------------------------------------------

export function extractModality(normalizedText: string): Modality | null {
  if (/\b(hibrido|hibrida|hybrid|semipresencial)\b/.test(normalizedText)) return "hibrido";
  if (/\b(remoto|remota|remote|teletrabajo|home office|trabajo en casa|100 virtual|desde casa)\b/.test(normalizedText)) return "remoto";
  if (/\b(presencial|on site|onsite|en sitio|en oficina)\b/.test(normalizedText)) return "presencial";
  return null;
}

const SALARY_RE =
  /((?:usd|cop|mxn|clp|pen|ars|brl|us\$|\$)\s?\d[\d.,]*(?:\s?(?:k|mil|millones))?(?:\s?(?:-|a|hasta)\s?(?:usd|cop|mxn|\$)?\s?\d[\d.,]*(?:\s?(?:k|mil|millones))?)?(?:\s?(?:usd|cop|mxn|clp|pen|ars|brl))?)/i;

export function extractSalary(rawText: string): string | null {
  const match = htmlToText(rawText).match(SALARY_RE);
  return match ? match[1].trim() : null;
}

// ---------------------------------------------------------------------------
// HV: años de experiencia e idiomas
// ---------------------------------------------------------------------------

/** Años de experiencia de la HV, uniendo periodos solapados. */
export function cvYearsOfExperience(
  experiences: { startDate: string | null; endDate: string | null }[],
  now: Date = new Date(),
): number {
  const ranges = experiences
    .filter((e) => e.startDate)
    .map((e) => {
      const start = new Date(e.startDate as string).getTime();
      const end = e.endDate ? new Date(e.endDate).getTime() : now.getTime();
      return [start, Math.max(start, end)] as [number, number];
    })
    .filter(([start]) => Number.isFinite(start))
    .sort((a, b) => a[0] - b[0]);

  let total = 0;
  let current: [number, number] | null = null;
  for (const range of ranges) {
    if (!current || range[0] > current[1]) {
      if (current) total += current[1] - current[0];
      current = [...range];
    } else {
      current[1] = Math.max(current[1], range[1]);
    }
  }
  if (current) total += current[1] - current[0];
  return Math.round((total / (365.25 * 24 * 3600 * 1000)) * 10) / 10;
}

/** Nivel de un idioma en la HV (0 si no aparece). */
export function cvLanguageLevel(cvText: string, language: string): number {
  const entry = LANGUAGES.find((l) => l.language === language);
  if (!entry) return 0;
  const re = new RegExp(entry.re.source, "g");
  let best = 0;
  for (const match of cvText.matchAll(re)) {
    const idx = match.index ?? 0;
    const level = detectLevel(cvText.slice(Math.max(0, idx - 30), idx + 50));
    best = Math.max(best, level?.level ?? 1);
  }
  return best;
}
