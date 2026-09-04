import type { Service } from "@/types/project";

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
