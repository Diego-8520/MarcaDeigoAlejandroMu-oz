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
  slug: string;
  title: string;
  shortDescription: string;
  problem?: string;
  solution?: string;
  technologies: string[];
  categories: ProjectCategory[];
  status: ProjectStatus;
  featured: boolean;
  demoUrl?: string;
  repositoryUrl?: string;
}

export interface Service {
  slug: string;
  name: string;
  description: string;
  solves: string;
  deliverables: string[];
  technologies: string[];
}
