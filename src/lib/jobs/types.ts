/** Tipos compartidos del buscador de empleo (sin IA, todo determinista). */

export type JobSourceId = "getonboard" | "remotive" | "adzuna" | "jooble" | "manual";

export type Modality = "remoto" | "hibrido" | "presencial";

/** Vacante normalizada, venga de una API o pegada a mano. */
export type NormalizedJob = {
  source: JobSourceId;
  externalId: string;
  title: string;
  company: string | null;
  location: string | null;
  modality: Modality | null;
  salary: string | null;
  description: string;
  url: string | null;
  publishedAt: string | null;
};

/** HV maestra armada desde las tablas del sitio. */
export type MasterCv = {
  fullName: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  skills: { id: string; name: string; category: string | null }[];
  experiences: {
    id: string;
    company: string;
    position: string;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
    achievements: string[];
  }[];
  education: {
    id: string;
    institution: string;
    program: string;
    status: string | null;
    description: string | null;
  }[];
  certifications: { id: string; name: string; issuer: string | null }[];
  projects: {
    id: string;
    title: string;
    description: string | null;
    technologies: string[];
  }[];
};

export type KeywordCategory =
  | "tecnica"
  | "herramienta"
  | "metodologia"
  | "blanda"
  | "idioma"
  | "certificacion"
  | "cargo"
  | "frase";

export type SectionKind = "requerido" | "deseable" | "funciones" | "general" | "beneficios";

export type EvidenceKind =
  | "skill"
  | "experiencia"
  | "proyecto"
  | "certificacion"
  | "educacion"
  | "perfil";

export type Evidence = {
  kind: EvidenceKind;
  id: string | null;
  label: string;
  /** Término tal como aparece en tu HV. */
  term: string;
};

export type KeywordStatus = "presente" | "variante" | "falta";

export type Keyword = {
  key: string;
  /** Término a usar en tu HV (tal como lo escribe la vacante). */
  term: string;
  category: KeywordCategory;
  sections: SectionKind[];
  occurrences: number;
  weight: number;
  priority: "alta" | "media" | "baja";
  status: KeywordStatus;
  evidence: Evidence[];
};

export type ScoreComponentId =
  | "habilidadesRequeridas"
  | "habilidadesDeseables"
  | "experiencia"
  | "educacion"
  | "idioma"
  | "modalidad";

export type ScoreComponent = {
  id: ScoreComponentId;
  label: string;
  /** Peso nominal (sobre 100). */
  weight: number;
  /** 0..1, o null si la vacante no da información para este componente. */
  ratio: number | null;
  points: number;
  maxPoints: number;
  detail: string;
};

export type Tip = {
  kind: "agregar" | "reformular" | "ordenar" | "faltante" | "formato" | "resumen";
  priority: "alta" | "media" | "baja";
  text: string;
  /** Ruta del panel donde aplicar el cambio. */
  href?: string;
};

export type JobRequirements = {
  minYears: number | null;
  seniority: string | null;
  educationLevel: { rank: number; label: string } | null;
  languages: { language: string; level: number | null; levelLabel: string | null; required: boolean }[];
  modality: Modality | null;
  salary: string | null;
};

export type JobAnalysis = {
  version: number;
  score: number;
  components: ScoreComponent[];
  requirements: JobRequirements;
  cvYears: number;
  keywords: Keyword[];
  tips: Tip[];
  suggestedSummary: string;
  suggestedSkillOrder: string[];
};
