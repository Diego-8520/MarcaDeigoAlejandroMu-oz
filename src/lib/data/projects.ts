import type { Project, Service } from "@/types/project";

/**
 * Contenido de ejemplo (placeholder).
 * Reemplazar por consultas reales a Supabase (tabla `projects`) en la Fase 2.
 * Ver sección 9 y 13 del documento maestro.
 */
export const projects: Project[] = [
  {
    slug: "metaahorro-project",
    title: "MetaAhorroProject",
    shortDescription: "TODO: describir el problema real que resuelve este proyecto en una frase.",
    technologies: ["TypeScript", "Next.js"],
    categories: ["Web Apps"],
    status: "live",
    featured: true,
  },
  {
    slug: "safemaps",
    title: "SafeMaps",
    shortDescription: "TODO: describir el problema real que resuelve este proyecto en una frase.",
    technologies: ["TypeScript"],
    categories: ["Web Apps", "Data"],
    status: "live",
    featured: true,
  },
  {
    slug: "nexflow-connect",
    title: "NexFlow Connect LP",
    shortDescription: "TODO: describir el problema real que resuelve este proyecto en una frase.",
    technologies: ["Next.js"],
    categories: ["Web Apps"],
    status: "live",
    featured: false,
  },
  {
    slug: "pura-pasion-v2",
    title: "PuraPasión V2",
    shortDescription: "TODO: describir el problema real que resuelve este proyecto en una frase.",
    technologies: ["E-commerce"],
    categories: ["E-commerce"],
    status: "live",
    featured: false,
  },
  {
    slug: "budix-inc",
    title: "BudixIncLP",
    shortDescription: "TODO: describir el problema real que resuelve este proyecto en una frase.",
    technologies: ["Next.js"],
    categories: ["Web Apps"],
    status: "live",
    featured: false,
  },
  {
    slug: "diegoalejandromunoz-com",
    title: "diegoalejandromunoz.com",
    shortDescription:
      "Esta misma plataforma: marca personal, catálogo de proyectos y laboratorio de IA/automatización, construida con Next.js, Supabase y agentes de IA.",
    technologies: ["Next.js", "Supabase", "OpenAI", "n8n"],
    categories: ["Web Apps", "AI", "Automation"],
    status: "en-desarrollo",
    featured: true,
    repositoryUrl: "https://github.com/",
  },
];

export const services: Service[] = [
  {
    slug: "desarrollo-full-stack",
    name: "Desarrollo full-stack",
    description: "Aplicaciones web modernas de extremo a extremo, desde el modelo de datos hasta la interfaz.",
    solves: "Necesitas un producto digital nuevo o rehacer uno existente sobre bases sólidas.",
    deliverables: ["Aplicación en producción", "Repositorio documentado", "Despliegue con CI/CD"],
    technologies: ["Next.js", "TypeScript", "PostgreSQL"],
  },
  {
    slug: "agentes-ia",
    name: "Agentes de IA",
    description: "Asistentes con IA que consultan tu información real y ejecutan acciones mediante herramientas.",
    solves: "Quieres automatizar respuestas o procesos usando IA sin que invente información.",
    deliverables: ["Agente con RAG", "Integración con tus datos", "Panel de control"],
    technologies: ["OpenAI", "Vercel AI SDK", "pgvector"],
  },
  {
    slug: "automatizacion",
    name: "Automatización de procesos",
    description: "Flujos que conectan formularios, correo, WhatsApp y APIs sin intervención manual.",
    solves: "Tareas repetitivas de tu negocio consumen tiempo que podría invertirse en otra cosa.",
    deliverables: ["Flujo automatizado en n8n", "Documentación del proceso", "Monitoreo básico"],
    technologies: ["n8n", "Webhooks", "APIs REST"],
  },
];
