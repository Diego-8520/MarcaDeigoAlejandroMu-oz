import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company ?? null,
    request_type: parsed.data.requestType,
    message: parsed.data.message,
    status: "nuevo",
  });

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el contacto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
