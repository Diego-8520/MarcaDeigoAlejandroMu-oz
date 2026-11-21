import type { Keyword, KeywordCategory, KeywordStatus } from "./types";

export type AggregatedKeyword = {
  key: string;
  term: string;
  category: KeywordCategory;
  /** En cuántas vacantes aparece. */
  jobs: number;
  /** Peso promedio (prioridad) en esas vacantes. */
  avgWeight: number;
  status: KeywordStatus;
  /** % de vacantes en que es requisito. */
  requiredShare: number;
};

/** Une las palabras clave de varias vacantes: las más pedidas primero. */
export function aggregateKeywords(analyses: Keyword[][]): AggregatedKeyword[] {
  const map = new Map<string, { k: Keyword; jobs: number; weight: number; required: number; status: KeywordStatus }>();
  const rank: Record<KeywordStatus, number> = { presente: 2, variante: 1, falta: 0 };
  for (const keywords of analyses) {
    for (const k of keywords) {
      if (k.category === "cargo") continue;
      const prev = map.get(k.key);
      const isRequired = k.sections.includes("requerido") ? 1 : 0;
      if (!prev) {
        map.set(k.key, { k, jobs: 1, weight: k.weight, required: isRequired, status: k.status });
      } else {
        prev.jobs += 1;
        prev.weight += k.weight;
        prev.required += isRequired;
        if (rank[k.status] > rank[prev.status]) prev.status = k.status;
      }
    }
  }
  return [...map.values()]
    .map(({ k, jobs, weight, required, status }) => ({
      key: k.key,
      term: k.term,
      category: k.category,
      jobs,
      avgWeight: Math.round((weight / jobs) * 10) / 10,
      status,
      requiredShare: Math.round((required / jobs) * 100),
    }))
    .sort((a, b) => b.jobs - a.jobs || b.avgWeight - a.avgWeight || a.term.localeCompare(b.term, "es"));
}
