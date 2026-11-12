import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// Rutas privadas: además del <meta name="robots"> del layout, la cabecera
// X-Robots-Tag cubre respuestas no HTML (redirecciones, JSON) y cachés.
const PRIVATE_ROUTES = ["/dashboard", "/dashboard/:path*", "/login", "/callback", "/api/:path*"];

const nextConfig: NextConfig = {
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
