import type { JobAnalysis, JobRequirements, MasterCv } from "../types";
import {
  cvYearsOfExperience,
  extractEducationLevel,
  extractLanguages,
  extractMinYears,
  extractModality,
  extractSalary,
  extractSeniority,
  splitSections,
} from "./extract";
import { extractKeywords } from "./keywords";
import { buildCvDocuments, cvFullText } from "./match";
import { normalize } from "./normalize";
import { computeScore } from "./score";
import { buildCatalog } from "./skills-catalog";
import { buildSkillOrder, buildSuggestedSummary, buildTips } from "./tips";

/** Sube este número si cambian las reglas, para recalcular análisis guardados. */
export const ANALYSIS_VERSION = 1;

export type AnalyzeJobInput = {
  title: string;
  company: string | null;
  description: string;
  location: string | null;
  modality?: JobRequirements["modality"];
};

/**
 * Analiza una vacante contra tu HV. Función pura y determinista: mismo
 * input -> mismo resultado. `now` se inyecta para pruebas.
 */
export function analyzeJob(job: AnalyzeJobInput, cv: MasterCv, now: Date = new Date()): JobAnalysis {
  const sections = splitSections(job.description);
  const relevant = sections.filter((s) => s.kind !== "beneficios");
  const relevantText = ` ${relevant.map((s) => s.text.trim()).join(" ")} `;
  const fullText = normalize(`${job.title}\n${job.description}\n${job.location ?? ""}`);

  const requirements: JobRequirements = {
    minYears: extractMinYears(relevantText),
    seniority: extractSeniority(normalize(job.title), relevantText),
    educationLevel: extractEducationLevel(relevantText),
    languages: extractLanguages(sections),
    modality: job.modality ?? extractModality(fullText),
    salary: extractSalary(job.description),
  };

  const docs = buildCvDocuments(cv);
  const cvText = cvFullText(docs);
  const cvYears = cvYearsOfExperience(cv.experiences, now);
  const catalog = buildCatalog(cv.skills);

  const keywords = extractKeywords({
    title: job.title,
    sections,
    catalog,
    docs,
    languages: requirements.languages,
  });

  const { score, components } = computeScore({
    keywords,
    requirements,
    cv,
    cvText,
    cvYears,
    jobLocation: job.location,
  });

  const tipsInput = { title: job.title, company: job.company, cv, keywords, requirements, cvYears };

  return {
    version: ANALYSIS_VERSION,
    score,
    components,
    requirements,
    cvYears,
    keywords,
    tips: buildTips(tipsInput),
    suggestedSummary: buildSuggestedSummary(tipsInput),
    suggestedSkillOrder: buildSkillOrder(cv, keywords),
  };
}

export { buildCatalog } from "./skills-catalog";
