import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const eventSchema = z.object({
  eventType: z.enum([
    "page_view",
    "project_view",
    "service_view",
    "cv_view",
    "cv_download",
    "github_click",
    "demo_click",
    "contact_open",
    "contact_submit",
    "social_click",
    "ai_open",
    "ai_question",
    "external_link_click",
  ]),
  page: z.string(),
  projectId: z.string().optional(),
  sessionId: z.string(),
  source: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }

  // Usa el cliente admin porque analytics_events se escribe desde visitantes
  // anónimos sin sesión; RLS restringe la LECTURA a usuarios admin.
  const supabase = createAdminClient();
  const { error } = await supabase.from("analytics_events").insert({
    event_type: parsed.data.eventType,
    page: parsed.data.page,
    project_id: parsed.data.projectId ?? null,
    session_id: parsed.data.sessionId,
    source: parsed.data.source ?? null,
    metadata: parsed.data.metadata ?? {},
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo registrar el evento." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
