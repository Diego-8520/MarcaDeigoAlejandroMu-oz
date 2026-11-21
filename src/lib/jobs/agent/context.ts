import { htmlToText } from "../analysis/normalize";
import type { JobAnalysis, MasterCv, NormalizedJob } from "../types";

/**
 * Contexto que recibe el agente de Claude Code: HV con referencias de
 * fuente, vacante en texto plano y el análisis por reglas como punto de
 * partida.
 */
export function buildAgentContext(job: NormalizedJob & { id: string }, cv: MasterCv, analysis: JobAnalysis) {
  return {
    vacante: {
      id: job.id,
      titulo: job.title,
      empresa: job.company,
      ubicacion: job.location,
      modalidad: job.modality,
      salario: job.salary,
      url: job.url,
      descripcion: htmlToText(job.description),
    },
    hv: {
      nombre: cv.fullName,
      titular: cv.headline,
      resumen: cv.bio,
      ubicacion: cv.location,
      skills: cv.skills.map((s) => ({ id: s.id, nombre: s.name, categoria: s.category })),
      experiencias: cv.experiences.map((e) => ({
        id: e.id,
        cargo: e.position,
        empresa: e.company,
        inicio: e.startDate,
        fin: e.endDate,
        descripcion: e.description ? { ref: `exp:${e.id}:desc`, texto: e.description } : null,
        logros: e.achievements.map((a, i) => ({ ref: `exp:${e.id}:ach:${i}`, texto: a })),
      })),
      proyectos: cv.projects.map((p) => ({
        id: p.id,
        ref: `proj:${p.id}`,
        titulo: p.title,
        descripcion: p.description,
        tecnologias: p.technologies,
      })),
      educacion: cv.education.map((e) => ({ id: e.id, programa: e.program, institucion: e.institution, estado: e.status })),
      certificaciones: cv.certifications.map((c) => ({ id: c.id, nombre: c.name, emisor: c.issuer })),
    },
    analisisPorReglas: {
      puntaje: analysis.score,
      aniosExperienciaHv: analysis.cvYears,
      componentes: analysis.components.map((c) => ({
        componente: c.label,
        puntos: c.ratio === null ? "no aplica" : `${Math.round(c.points)}/${Math.round(c.maxPoints)}`,
        detalle: c.detail,
      })),
      requisitos: analysis.requirements,
      palabrasClave: analysis.keywords.map((k) => ({
        termino: k.term,
        categoria: k.category,
        prioridad: k.priority,
        estado: k.status,
        enTuHv: k.evidence.map((e) => `${e.kind}: ${e.label} (como «${e.term}»)`),
      })),
      tips: analysis.tips.map((t) => t.text),
    },
  };
}
