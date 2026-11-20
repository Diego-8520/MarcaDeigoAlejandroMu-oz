import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// Rutas privadas: además del <meta name="robots"> del layout, la cabecera
// X-Robots-Tag cubre respuestas no HTML (redirecciones, JSON) y cachés.
const PRIVATE_ROUTES = ["/dashboard", "/dashboard/:path*", "/login", "/callback", "/api/:path*"];

// Captura de sitios (src/lib/screenshots): Chromium se carga en tiempo de
// ejecución y sus binarios comprimidos (bin/*.br) no los detecta el trazado.
// Globs picomatch: «[id]» sería una clase de caracteres, por eso el comodín.
const SCREENSHOT_ROUTES = ["/dashboard/proyectos/nuevo", "/dashboard/proyectos/*/editar"];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: Object.fromEntries(
    SCREENSHOT_ROUTES.map((route) => [route, ["./node_modules/@sparticuz/chromium/bin/**"]]),
  ),
  async headers() {
    return PRIVATE_ROUTES.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));
  },
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/project-images/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
