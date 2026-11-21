import type { MasterCv } from "../../types";

export const sampleCv: MasterCv = {
  fullName: "Persona de Prueba",
  headline: "Analista de automatización | Procesos administrativos e IA",
  bio: "Profesional en administración con experiencia automatizando procesos administrativos.",
  location: "Cali, Colombia",
  email: "persona@example.com",
  phone: null,
  linkedinUrl: null,
  skills: [
    { id: "s1", name: "Excel", category: "Herramientas" },
    { id: "s2", name: "Python", category: "Lenguajes" },
    { id: "s3", name: "n8n", category: "Automatización" },
    { id: "s4", name: "Trabajo en equipo", category: "Blandas" },
    { id: "s5", name: "PowerBI", category: "BI" },
  ],
  experiences: [
    {
      id: "e1",
      company: "Empresa Uno",
      position: "Auxiliar administrativo",
      startDate: "2023-01-01",
      endDate: null,
      description: "Gestión documental, facturación electrónica y conciliaciones bancarias.",
      achievements: ["Automaticé reportes semanales con Python", "Reduje errores de facturación en 30%"],
    },
    {
      id: "e2",
      company: "Empresa Dos",
      position: "Asistente contable",
      startDate: "2021-06-01",
      endDate: "2022-12-31",
      description: "Apoyo en cartera y cuentas por pagar usando Siigo.",
      achievements: [],
    },
  ],
  education: [
    {
      id: "ed1",
      institution: "Universidad X",
      program: "Administración de Empresas",
      status: "Finalizado",
      description: null,
    },
  ],
  certifications: [{ id: "c1", name: "Inglés B1", issuer: "Instituto Y" }],
  projects: [
    {
      id: "p1",
      title: "Bot de conciliación",
      description: "Automatización con SQL y Docker para conciliar pagos.",
      technologies: ["SQL", "Docker"],
    },
  ],
};
