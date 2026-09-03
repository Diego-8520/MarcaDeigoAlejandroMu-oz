import { NextResponse } from "next/server";

/**
 * Stub del "AI Profile Assistant" (sección 15 del documento maestro).
 *
 * Fase 3 — pendiente de implementar:
 * - Integración con Vercel AI SDK + OpenAI.
 * - RAG sobre perfil, CV, experiencia, proyectos y servicios (pgvector).
 * - Tool calling: search_projects, get_project, search_skills,
 *   get_experience, get_services, get_cv_info, create_contact_lead.
 * - El agente debe responder solo con información real, sin inventar experiencia.
 */
export async function POST() {
  return NextResponse.json(
    { error: "AI Profile Assistant aún no está disponible." },
    { status: 501 }
  );
}
