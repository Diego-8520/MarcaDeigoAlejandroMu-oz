import type { Evidence, JobRequirements, Keyword, KeywordStatus, SectionKind } from "../types";
import type { JobSection } from "./extract";
import { cvLanguageLevel } from "./extract";
import { type CvDocument, cvFullText, findEntryEvidence, findPhraseEvidence } from "./match";
import { STOPWORDS, containsTerm, countTerm, normalize, normalizeTerm } from "./normalize";
import type { CatalogEntry } from "./skills-catalog";

/**
 * Lista de palabras clave que deberían estar en tu HV para una vacante,
 * con prioridad y estado: presente (✓), variante (≈) o falta (✗).
 */

const SECTION_WEIGHT: Record<SectionKind, number> = {
  requerido: 4,
  general: 2.5,
  deseable: 2,
  funciones: 2,
  beneficios: 0,
};
const TITLE_BONUS = 3;

function priorityOf(weight: number): Keyword["priority"] {
  if (weight >= 4) return "alta";
  if (weight >= 2.5) return "media";
  return "baja";
}

/** "home office" es modalidad, no la herramienta Office. */
function cleanForMatching(text: string): string {
  return text.replace(/ home office /g, " teletrabajo ");
}

type Accumulator = {
  key: string;
  term: string;
  category: Keyword["category"];
  sections: Set<SectionKind>;
  occurrences: number;
  inTitle: boolean;
};

function weightOf(acc: Accumulator): number {
  let weight = 0;
  for (const section of acc.sections) weight += SECTION_WEIGHT[section];
  if (acc.inTitle) weight += TITLE_BONUS;
  weight += Math.min(Math.max(acc.occurrences - 1, 0), 3) * 0.5;
  return Math.round(weight * 10) / 10;
}

/** Busca el término en el texto original (con tildes y mayúsculas) de la vacante. */
export function findOriginal(rawText: string, alias: string): string | null {
  const size = alias.split(" ").length;
  const words = rawText.split(/\s+/).filter(Boolean);
  for (let i = 0; i + size <= words.length; i += 1) {
    const window = words.slice(i, i + size).join(" ");
    if (normalizeTerm(window) === alias) {
      return window.replace(/^[^\p{L}\p{N}.#]+|[^\p{L}\p{N}#+]+$/gu, "");
    }
  }
  return null;
}

function suggestTerm(entry: CatalogEntry, jobAlias: string, rawJob: string): string {
  if (normalizeTerm(entry.label) === jobAlias) return entry.label;
  const original = findOriginal(rawJob, jobAlias) ?? entry.displayAliases[jobAlias] ?? entry.label;
  if (original !== original.toLowerCase() && original !== original.toUpperCase()) return original;
  if (original === original.toUpperCase() && original.length <= 5) return original;
  const lower = original.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export type KeywordInput = {
  title: string;
  sections: JobSection[];
  catalog: CatalogEntry[];
  docs: CvDocument[];
  languages: JobRequirements["languages"];
};

export function extractKeywords({ title, sections, catalog, docs, languages }: KeywordInput): Keyword[] {
  const titleText = cleanForMatching(normalize(title));
  const usable = sections
    .filter((s) => s.kind !== "beneficios")
    .map((s) => ({ ...s, text: cleanForMatching(s.text) }));
  const cvText = cvFullText(docs);
  const rawJob = [title, ...usable.map((s) => s.raw)].join("\n");
  const keywords: Keyword[] = [];
  const coveredTerms: string[] = [];

  // 1) Habilidades del catálogo.
  for (const entry of catalog) {
    const acc: Accumulator = {
      key: entry.key,
      term: entry.label,
      category: entry.category,
      sections: new Set(),
      occurrences: 0,
      inTitle: false,
    };
    let jobAlias: string | null = null;
    for (const alias of entry.aliases) {
      const inTitle = containsTerm(titleText, alias);
      let found = inTitle;
      for (const section of usable) {
        const count = countTerm(section.text, alias);
        if (count > 0) {
          acc.sections.add(section.kind);
          acc.occurrences += count;
          found = true;
        }
      }
      if (inTitle) acc.inTitle = true;
      if (found && !jobAlias) jobAlias = alias;
    }
    if (!jobAlias) continue;

    // Se sugiere el término tal como lo escribe la vacante.
    acc.term = suggestTerm(entry, jobAlias, rawJob);
    coveredTerms.push(...entry.aliases);

    const evidence = findEntryEvidence(entry, docs);
    const exact = docs.some((doc) => containsTerm(doc.text, jobAlias as string));
    const status: KeywordStatus = evidence.length === 0 ? "falta" : exact ? "presente" : "variante";
    const weight = weightOf(acc);
    keywords.push({
      key: acc.key,
      term: acc.term,
      category: acc.category,
      sections: [...acc.sections],
      occurrences: Math.max(acc.occurrences, acc.inTitle ? 1 : 0),
      weight,
      priority: priorityOf(weight),
      status,
      evidence,
    });
  }

  // 2) Idiomas con nivel.
  for (const lang of languages) {
    const cvLevel = cvLanguageLevel(cvText, lang.language);
    const required = lang.level ?? 1;
    const status: KeywordStatus = cvLevel === 0 ? "falta" : cvLevel >= required ? "presente" : "variante";
    const weight = lang.required ? 4 : 2;
    const evidence: Evidence[] = cvLevel
      ? findPhraseEvidence(normalize(lang.language).trim(), docs)
      : [];
    keywords.push({
      key: `idioma:${lang.language}`,
      term: lang.levelLabel ? `${lang.language} ${lang.levelLabel.split(" / ")[0]}` : lang.language,
      category: "idioma",
      sections: [lang.required ? "requerido" : "deseable"],
      occurrences: 1,
      weight,
      priority: priorityOf(weight),
      status,
      evidence,
    });
  }

  // 3) Cargo: el título de la vacante debería reflejarse en tu titular o cargos.
  const cleanTitle = title.replace(/\(.*?\)|\[.*?\]/g, "").replace(/\s+[-|–].*$/, "").trim();
  if (cleanTitle) {
    const tTokens = normalize(cleanTitle).trim().split(" ").filter((t) => t.length > 2 && !STOPWORDS.has(t));
    const roleDocs = docs.filter((d) => d.kind === "perfil" || d.kind === "experiencia");
    const roleText = ` ${roleDocs.map((d) => d.text.trim()).join(" ")} `;
    const phrase = normalize(cleanTitle).trim();
    const hits = tTokens.filter((t) => containsTerm(roleText, t)).length;
    const status: KeywordStatus = containsTerm(roleText, phrase)
      ? "presente"
      : tTokens.length && hits / tTokens.length >= 0.5
        ? "variante"
        : "falta";
    keywords.push({
      key: `cargo:${phrase}`,
      term: cleanTitle,
      category: "cargo",
      sections: ["requerido"],
      occurrences: 1,
      weight: 4,
      priority: "alta",
      status,
      evidence: status === "presente" ? findPhraseEvidence(phrase, roleDocs) : [],
    });
  }

  // 4) Certificaciones mencionadas explícitamente.
  const certRe = /certificacion(?:es)? (?:en|de|como) ([a-z0-9#+. ]{3,40}?)(?= y | o |$| para | con | en )/g;
  const seenCerts = new Set<string>();
  for (const section of usable) {
    for (const match of section.text.matchAll(certRe)) {
      const name = match[1].trim();
      if (!name || seenCerts.has(name) || coveredTerms.some((t) => name === t)) continue;
      seenCerts.add(name);
      const evidence = findPhraseEvidence(name, docs);
      const weight = SECTION_WEIGHT[section.kind] || 2;
      keywords.push({
        key: `cert:${name}`,
        term: `Certificación en ${name}`,
        category: "certificacion",
        sections: [section.kind],
        occurrences: 1,
        weight,
        priority: priorityOf(weight),
        status: evidence.length ? "presente" : "falta",
        evidence,
      });
      if (seenCerts.size >= 3) break;
    }
  }

  // 5) Frases repetidas (2–3 palabras) que no son habilidades del catálogo.
  keywords.push(...extractPhrases(usable, titleText, coveredTerms, docs, cvText, rawJob));

  return keywords.sort((a, b) => b.weight - a.weight || a.term.localeCompare(b.term, "es"));
}

function extractPhrases(
  sections: JobSection[],
  titleText: string,
  coveredTerms: string[],
  docs: CvDocument[],
  cvText: string,
  rawJob: string,
): Keyword[] {
  const counts = new Map<string, { count: number; sections: Set<SectionKind> }>();
  for (const section of sections) {
    for (const line of section.raw.split(/\n|[.;•·]/)) {
      const tokens = normalize(line).trim().split(" ").filter(Boolean);
      for (let size = 2; size <= 3; size += 1) {
        for (let i = 0; i + size <= tokens.length; i += 1) {
          const gram = tokens.slice(i, i + size);
          const first = gram[0];
          const last = gram[gram.length - 1];
          if (STOPWORDS.has(first) || STOPWORDS.has(last)) continue;
          if (gram.some((t) => t.length < 3 || /^\d+$/.test(t))) continue;
          if (gram.filter((t) => !STOPWORDS.has(t)).length < 2) continue;
          const phrase = gram.join(" ");
          const item = counts.get(phrase) ?? { count: 0, sections: new Set<SectionKind>() };
          item.count += 1;
          item.sections.add(section.kind);
          counts.set(phrase, item);
        }
      }
    }
  }

  const candidates = [...counts.entries()]
    .filter(([phrase, { count }]) => count >= 2 || containsTerm(titleText, phrase))
    .filter(([phrase]) => !coveredTerms.some((t) => phrase.includes(t) || t.includes(phrase)))
    .map(([phrase, { count, sections }]) => {
      const acc: Accumulator = {
        key: `frase:${phrase}`,
        term: phrase,
        category: "frase",
        sections,
        occurrences: count,
        inTitle: containsTerm(titleText, phrase),
      };
      return { phrase, weight: weightOf(acc), acc };
    })
    .sort((a, b) => b.weight - a.weight || b.phrase.length - a.phrase.length);

  // Evita "gestion de" + "gestion de proyectos": se queda la más larga.
  const selected: typeof candidates = [];
  for (const candidate of candidates) {
    if (selected.some((s) => s.phrase.includes(candidate.phrase) || candidate.phrase.includes(s.phrase))) continue;
    selected.push(candidate);
    if (selected.length >= 8) break;
  }

  return selected.map(({ phrase, weight, acc }) => {
    const evidence = findPhraseEvidence(phrase, docs);
    const allTokens = phrase.split(" ").filter((t) => !STOPWORDS.has(t)).every((t) => containsTerm(cvText, t));
    const original = findOriginal(rawJob, phrase) ?? phrase;
    return {
      key: acc.key,
      term: original.toLowerCase(),
      category: "frase" as const,
      sections: [...acc.sections],
      occurrences: acc.occurrences,
      weight,
      priority: priorityOf(weight),
      status: evidence.length ? "presente" : allTokens ? "variante" : "falta",
      evidence,
    };
  });
}
