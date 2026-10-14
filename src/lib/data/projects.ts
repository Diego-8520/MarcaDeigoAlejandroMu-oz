import type { Service } from "@/types/project";

export const services: Service[] = [
  {
    slug: "desarrollo-full-stack",
    name: "Desarrollo web y paneles administrativos",
    description: "Aplicaciones web funcionales con gestión de contenido, autenticación y persistencia de datos.",
    solves: "Necesitas un producto digital o panel interno que se ajuste a tus procesos reales.",
    deliverables: ["Aplicación en producción", "Repositorio documentado", "Panel administrable"],
    technologies: ["Next.js", "TypeScript", "Supabase"],
  },
  {
    slug: "automatizacion",
    name: "Integración de APIs y automatización de procesos",
    description: "Flujos que conectan formularios, bases de datos, correo, WhatsApp y APIs.",
    solves: "Tareas repetitivas de tu negocio consumen tiempo y generan datos inconsistentes.",
    deliverables: ["Integración funcional", "Documentación del proceso", "Monitoreo básico"],
    technologies: ["Webhooks", "APIs REST", "Node.js"],
  },
];
