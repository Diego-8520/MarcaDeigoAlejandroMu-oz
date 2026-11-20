import type { Evidence, EvidenceKind, MasterCv } from "../types";
import type { CatalogEntry } from "./skills-catalog";
import { containsTerm, normalize } from "./normalize";

/** Fragmento de la HV donde se buscan términos. */
export type CvDocument = {
  kind: EvidenceKind;
  id: string | null;
  label: string;
  text: string;
};

/** Convierte la HV en documentos normalizados (uno por skill, experiencia, proyecto…). */
export function buildCvDocuments(cv: MasterCv): CvDocument[] {
  const docs: CvDocument[] = [];
  docs.push({
    kind: "perfil",
    id: null,
    label: "Titular y resumen del perfil",
    text: normalize(`${cv.headline ?? ""} ${cv.bio ?? ""}`),
  });
  for (const skill of cv.skills) {
    docs.push({ kind: "skill", id: skill.id, label: skill.name, text: normalize(skill.name) });
  }
  for (const exp of cv.experiences) {
    docs.push({
      kind: "experiencia",
      id: exp.id,
      label: `${exp.position} · ${exp.company}`,
      text: normalize([exp.position, exp.description ?? "", ...exp.achievements].join(" \n ")),
    });
  }
  for (const project of cv.projects) {
    docs.push({
      kind: "proyecto",
      id: project.id,
      label: project.title,
      text: normalize([project.title, project.description ?? "", ...project.technologies].join(" \n ")),
    });
  }
  for (const cert of cv.certifications) {
    docs.push({
      kind: "certificacion",
      id: cert.id,
      label: cert.name,
      text: normalize(`${cert.name} ${cert.issuer ?? ""}`),
    });
  }
  for (const edu of cv.education) {
    docs.push({
      kind: "educacion",
      id: edu.id,
      label: `${edu.program} · ${edu.institution}`,
      text: normalize(`${edu.program} ${edu.description ?? ""}`),
    });
  }
  return docs;
}

/** Todo el texto de la HV en un solo string normalizado. */
export function cvFullText(docs: CvDocument[]): string {
  return ` ${docs.map((d) => d.text.trim()).join(" ")} `;
}

/** Dónde aparece una entrada del catálogo en la HV (cualquier alias). */
export function findEntryEvidence(entry: CatalogEntry, docs: CvDocument[]): Evidence[] {
  const evidence: Evidence[] = [];
  for (const doc of docs) {
    const alias = entry.aliases.find((a) => containsTerm(doc.text, a));
    if (alias) {
      evidence.push({
        kind: doc.kind,
        id: doc.id,
        label: doc.label,
        term: entry.displayAliases[alias] ?? alias,
      });
    }
  }
  return evidence;
}

/** Dónde aparece una frase literal en la HV. */
export function findPhraseEvidence(phrase: string, docs: CvDocument[]): Evidence[] {
  return docs
    .filter((doc) => containsTerm(doc.text, phrase))
    .map((doc) => ({ kind: doc.kind, id: doc.id, label: doc.label, term: phrase }));
}

/** Etiqueta legible del tipo de evidencia. */
export const EVIDENCE_LABELS: Record<EvidenceKind, string> = {
  skill: "Skills",
  experiencia: "Experiencia",
  proyecto: "Proyecto",
  certificacion: "Certificación",
  educacion: "Educación",
  perfil: "Perfil",
};
