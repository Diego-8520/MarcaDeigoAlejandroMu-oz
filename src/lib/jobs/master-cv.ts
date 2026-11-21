import { createHash } from "node:crypto";
import { getCertificationsAdmin, getEducationAdmin } from "@/lib/data/education-queries";
import { getExperiencesAdmin } from "@/lib/data/experiences-queries";
import { getProfileAdmin } from "@/lib/data/profile-queries";
import { getAllProjectsAdmin } from "@/lib/data/projects-queries";
import { getSkillsAdmin } from "@/lib/data/skills-queries";
import type { MasterCv } from "./types";

/** Arma tu HV desde las tablas del sitio (perfil, skills, experiencia, etc.). */
export async function getMasterCv(): Promise<MasterCv> {
  const [profile, skills, experiences, education, certifications, projects] = await Promise.all([
    getProfileAdmin(),
    getSkillsAdmin(),
    getExperiencesAdmin(),
    getEducationAdmin(),
    getCertificationsAdmin(),
    getAllProjectsAdmin(),
  ]);

  return {
    fullName: profile?.fullName ?? null,
    headline: profile?.headline ?? null,
    bio: profile?.bio ?? null,
    location: profile?.location ?? null,
    email: profile?.email ?? null,
    phone: profile?.phone ?? null,
    linkedinUrl: profile?.linkedinUrl ?? null,
    skills: skills.map((s) => ({ id: s.id, name: s.name, category: s.category })),
    experiences: experiences.map((e) => ({
      id: e.id,
      company: e.company,
      position: e.position,
      startDate: e.startDate,
      endDate: e.endDate,
      description: e.description,
      achievements: e.achievements,
    })),
    education: education.map((e) => ({
      id: e.id,
      institution: e.institution,
      program: e.program,
      status: e.status,
      description: e.description,
    })),
    certifications: certifications.map((c) => ({ id: c.id, name: c.name, issuer: c.issuer })),
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: [p.shortDescription, p.description, p.results].filter(Boolean).join("\n"),
      technologies: p.technologies,
    })),
  };
}

/** Huella de la HV: si cambia, los análisis guardados se recalculan. */
export function cvFingerprint(cv: MasterCv): string {
  return createHash("sha1").update(JSON.stringify(cv)).digest("hex");
}
