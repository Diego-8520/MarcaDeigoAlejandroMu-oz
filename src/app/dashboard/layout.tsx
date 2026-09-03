import { DashboardNav } from "@/components/layout/dashboard-nav";

// La protección de esta ruta ya la resuelve src/middleware.ts,
// que redirige a /login si no hay sesión activa.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
