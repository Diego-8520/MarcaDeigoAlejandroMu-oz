import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function absoluteUrl(value: string | null, base: string) {
  if (!value) return null;

  try {
    return new URL(value, base).toString();
  } catch {
    return value;
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function matchTag(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return match?.[1] ? decodeHtml(match[1].trim()) : null;
}

function getMetaContent(html: string, property: string) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${escaped}["'][^>]*>`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const value = matchTag(html, pattern);
    if (value) return value;
  }

  return null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { demoUrl?: string } | null;
  const demoUrl = body?.demoUrl;

  if (!demoUrl) {
    return NextResponse.json({ message: "Envía la URL del sitio." }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(demoUrl);
  } catch {
    return NextResponse.json({ message: "La URL del sitio no es válida." }, { status: 400 });
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return NextResponse.json(
      { message: "La URL debe usar http o https." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "diegoalejandromunoz.com metadata fetcher",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "No pude leer metadata del sitio en vivo." },
        { status: 502 }
      );
    }

    const html = await response.text();
    const title = matchTag(html, /<title[^>]*>([^<]*)<\/title>/i);
    const ogTitle = getMetaContent(html, "og:title");
    const ogDescription =
      getMetaContent(html, "og:description") ?? getMetaContent(html, "description");
    const ogImage = getMetaContent(html, "og:image");

    return NextResponse.json({
      suggestedTitle: ogTitle ?? title ?? "",
      suggestedDescription: ogDescription ?? "",
      ogImageUrl: absoluteUrl(ogImage, url.toString()),
    });
  } catch {
    return NextResponse.json(
      { message: "No pude leer metadata del sitio en vivo." },
      { status: 502 }
    );
  }
}
