import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth/admin";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isPrivateApi =
    pathname.startsWith("/api/dashboard") || pathname.startsWith("/api/integrations");

  // Sesión válida pero email fuera de ADMIN_EMAILS (p. ej. cualquier cuenta de
  // Google): se cierra la sesión y no se deja pasar.
  if (user && !isAdminEmail(user.email) && (isDashboardRoute || isPrivateApi)) {
    await supabase.auth.signOut();
    if (isPrivateApi) {
      const denied = NextResponse.json({ message: "No autorizado." }, { status: 403 });
      response.cookies.getAll().forEach((cookie) => denied.cookies.set(cookie));
      return denied;
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }

  if (isDashboardRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

// Solo rutas que necesitan sesión. Las páginas públicas no pasan por aquí:
// así no esperan una llamada a Supabase Auth y pueden servirse desde caché.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/callback",
    "/api/dashboard/:path*",
    "/api/integrations/:path*",
  ],
};
