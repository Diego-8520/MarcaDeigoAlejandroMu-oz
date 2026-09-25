import { DashboardNav } from "@/components/layout/dashboard-nav";

// La protección de esta ruta la resuelve src/proxy.ts (convención Next.js 16),
// que redirige a /login con redirectTo si no hay sesión activa.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      <DashboardNav />
      <main className="flex-1 px-5 py-6 lg:px-10 lg:py-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
