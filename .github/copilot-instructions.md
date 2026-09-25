# Instrucciones del proyecto

## Skills disponibles

Carga la skill correspondiente antes de trabajar en estas áreas:

- [Supabase](../.agents/skills/supabase/SKILL.md): Auth, Storage, RLS, clientes, consultas, CLI, migraciones y diagnóstico de Supabase.
- [Supabase Server](../.agents/skills/supabase-server/SKILL.md): código servidor que importe `@supabase/server`, cree clientes administrativos o valide autenticación.
- [Supabase Postgres Best Practices](../.agents/skills/supabase-postgres-best-practices/SKILL.md): SQL, esquema, migraciones, índices, funciones, RLS, rendimiento y concurrencia de PostgreSQL.

## Arquitectura local

- Sitio público: `src/app/(public)/`.
- Login y callback: `src/app/(auth)/`.
- CMS privado: `src/app/dashboard/`.
- Protección y refresco de sesión: `src/proxy.ts`.
- Route Handlers: `src/app/api/`.
- Mutaciones del servidor: `src/actions/`.
- Consultas de datos: `src/lib/data/`.
- Clientes Supabase: `src/lib/supabase/`.
- Migraciones: `supabase/migrations/`.

## Reglas operativas

- Lee las reglas generadas de Next.js en `AGENTS.md` antes de modificar código del framework; esta versión usa Next.js 16.3.4.
- No expongas claves secretas de Supabase ni importes el cliente administrativo en componentes cliente.
- La protección de rutas no sustituye la autorización dentro de cada Server Action o Route Handler.
- Para cambios de base de datos, RLS o Storage, aplica las dos skills de Supabase correspondientes y verifica la operación después del cambio.
- No edites manualmente `AGENTS.md`: Next.js lo regenera.

## Validación

Usa los comandos definidos en [README.md](../README.md):

```bash
npm run lint
npm run build
```

No hay script de tests configurado actualmente. Para cambios de base de datos, revisa además `supabase migration list` antes de `supabase db push`.
