import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /login no se bloquea: debe poder rastrearse para que Google lea su
        // `noindex`. Bloquearlo dejaría la URL indexable sin contenido.
        disallow: ["/dashboard/", "/api/", "/callback"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
