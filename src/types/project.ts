export type ProjectCategory =
  | "Web Apps"
  | "SaaS"
  | "AI"
  | "Automation"
  | "E-commerce"
  | "Chatbots"
  | "APIs"
  | "Data"
  | "Cloud";

export type ProjectStatus = "live" | "en-desarrollo" | "archivado";

export interface GithubMetadata {
  repositoryUrl: string;
  owner: string;
  name: string;
  defaultBranch: string | null;
  description: string | null;
  primaryLanguage: string | null;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;
  lastUpdated: string | null;
  detectedTechnologies: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  problem?: string;
  solution?: string;
  results: string | null;
  technologies: string[];
  categories: string[];
  status: ProjectStatus;
  featured: boolean;
  published: boolean;
  demoUrl: string | null;
  repositoryUrl: string | null;
  featuredImageUrl: string | null;
  githubMetadata: GithubMetadata | null;
  githubSyncedAt: string | null;
  vercelProjectUrl: string | null;
  vercelProductionUrl: string | null;
  vercelCustomDomain: string | null;
  vercelDeploymentStatus: string | null;
  screenshotsStatus: ScreenshotsStatus | null;
  screenshotsError: string | null;
  screenshotsCapturedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images?: ProjectImage[];
}

/** Estado de la captura automática del sitio del proyecto. */
export type ScreenshotsStatus = "pending" | "ready" | "failed";

/** upload = subida o importada a mano; desktop/mobile/section = captura automática. */
export type ProjectImageKind = "upload" | "desktop" | "mobile" | "section";

export interface ProjectImage {
  id: string;
  projectId: string;
  storagePath: string;
  publicUrl: string;
  altText: string | null;
  sortOrder: number;
  kind: ProjectImageKind;
  source: "manual" | "auto";
  width: number | null;
  height: number | null;
  caption: string | null;
}

export interface Service {
  slug: string;
  name: string;
  description: string;
  solves: string;
  deliverables: string[];
  technologies: string[];
}
