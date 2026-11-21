import type { KeywordCategory, KeywordStatus, Modality, SectionKind } from "@/lib/jobs/types";

export const CATEGORY_LABELS: Record<KeywordCategory, string> = {
  cargo: "Cargo",
  tecnica: "Conocimientos técnicos",
  herramienta: "Herramientas",
  metodologia: "Metodologías",
  idioma: "Idiomas",
  certificacion: "Certificaciones",
  blanda: "Habilidades blandas",
  frase: "Frases de la vacante",
};

export const CATEGORY_ORDER: KeywordCategory[] = [
  "cargo",
  "tecnica",
  "herramienta",
  "metodologia",
  "idioma",
  "certificacion",
  "blanda",
  "frase",
];

export const STATUS_META: Record<KeywordStatus, { icon: string; label: string; className: string }> = {
  presente: { icon: "✓", label: "ya está en tu HV", className: "text-emerald" },
  variante: { icon: "≈", label: "está con otra forma", className: "text-amber" },
  falta: { icon: "✗", label: "falta", className: "text-red-600" },
};

export const SECTION_LABELS: Record<SectionKind, string> = {
  requerido: "requisito",
  deseable: "deseable",
  funciones: "funciones",
  general: "descripción",
  beneficios: "beneficios",
};

export const MODALITY_LABELS: Record<Modality, string> = {
  remoto: "Remoto",
  hibrido: "Híbrido",
  presencial: "Presencial",
};
