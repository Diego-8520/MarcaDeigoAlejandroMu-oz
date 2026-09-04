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
  createdAt: string;
  updatedAt: string;
  images?: ProjectImage[];
}

export interface ProjectImage {
  id: string;
  projectId: string;
  storagePath: string;
  publicUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface Service {
  slug: string;
  name: string;
  description: string;
  solves: string;
  deliverables: string[];
  technologies: string[];
}
