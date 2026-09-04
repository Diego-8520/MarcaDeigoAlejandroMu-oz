# diegoalejandromunoz.com

Plataforma profesional de Diego Alejandro Muñoz: marca personal, catálogo de
proyectos, vitrina de servicios y laboratorio de IA/automatización.

## Qué es

No es un CV en línea. Es un producto digital que sirve al mismo tiempo como
marca personal, portafolio, catálogo de proyectos, generador de oportunidades
laborales/comerciales y demostración técnica en vivo (ver documento maestro,
sección 33).

## Por qué existe

- Conseguir oportunidades laborales y clientes.
- Demostrar capacidades técnicas construyendo, no solo enunciando.
- Centralizar la administración de contenido en un dashboard privado.
- Medir qué contenido genera interés real.

## Stack

- **Frontend/app:** Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Backend:** Server Actions / Route Handlers de Next.js; Python + FastAPI
  para servicios de IA especializados (Fase 3).
- **Datos:** Supabase (PostgreSQL, Auth, Storage, RLS, pgvector).
- **IA:** OpenAI + Vercel AI SDK, RAG con `pgvector` (Fase 3).
- **Automatización:** n8n, webhooks (Fase 3-4).
- **Infraestructura:** Vercel, GitHub Actions (CI/CD).
- **Testing:** Vitest (unit/integration), Playwright (E2E) - pendiente de configurar.

## Arquitectura

```
Internet -> Vercel (Next.js)
             |- Sitio publico      (route group (public))
             |- Dashboard privado  (route group /dashboard, protegido por middleware)
             `- API routes         (/api/contact, /api/analytics, /api/ai)
                     |
                     v
                Supabase (PostgreSQL - Auth - Storage - RLS)
                     |
                     v
            AI Services (OpenAI / Vercel AI SDK) -> FastAPI -> n8n
```

## Instalacion

```bash
npm install
cp .env.example .env.local   # completar credenciales de Supabase / OpenAI
npm run dev
```

## Variables de entorno

Ver `.env.example`. Nunca subir `.env.local` al repositorio.

| Variable | Descripcion |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anonima (uso en cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor, bypassa RLS) |
| `OPENAI_API_KEY` | Fase 3 - AI Profile Assistant |
| `N8N_WEBHOOK_URL` | Fase 3 - notificaciones de leads |

## Base de datos

El esquema inicial esta en `supabase/migrations/0001_init.sql`. Aplicarlo con
la CLI de Supabase:

```bash
supabase link --project-ref <tu-project-ref>
supabase db push
```

## Storage

Crear manualmente en Supabase Storage el bucket `project-images` con lectura
publica. La escritura administrativa la hace el servidor con
`SUPABASE_SERVICE_ROLE_KEY`; no se suben imagenes directamente desde el cliente.

Estructura de paths registrada en `project_images.storage_path`:

```text
project-images/{project_id}/{uuid}.{ext}
```

Los archivos fisicos dentro del bucket usan `{project_id}/{uuid}.{ext}`.

## Analitica propia

El sitio registra eventos anonimos en `analytics_events` para entender uso real:
vistas de pagina, vistas de proyecto, descargas de CV y envios de contacto. No
usa Google Analytics ni servicios de terceros, no guarda IP completa y no usa
cookies persistentes. El identificador de sesion se guarda en `sessionStorage`,
por lo que dura solo la pestana/sesion activa del navegador.

## Estructura del proyecto

```
src/
  app/
    (public)/     rutas publicas: inicio, proyectos, servicios, sobre-mi, etc.
    (auth)/login/ inicio de sesion (Supabase Auth)
    dashboard/    CMS privado, protegido por middleware
    api/          route handlers: contact, analytics, ai
  components/     ui, layout, projects, contact-form
  lib/            supabase (client/server/admin), data, validation, utils
  actions/        server actions (contact)
  types/          tipos compartidos (Project, Service)
  middleware.ts   proteccion de /dashboard + refresco de sesion
supabase/
  migrations/     esquema SQL
```

## Estado actual - Fase 1 (MVP)

- [x] Sitio publico con Home, Proyectos, Servicios, Sobre mi, Experiencia,
      Educacion, CV, Contacto.
- [x] Login y proteccion de `/dashboard` via middleware + Supabase Auth.
- [x] Esquema SQL inicial con RLS.
- [x] Formulario de contacto con validacion (Zod) y server action.
- [ ] CRUD real de proyectos/servicios en el dashboard (Fase 2 - hoy son
      paginas placeholder).
- [ ] Contenido real (biografia, experiencia, educacion) - hoy son datos de
      ejemplo marcados con `TODO`.
- [ ] Analytics propio conectado a `analytics_events` (Fase 2).
- [ ] AI Profile Assistant con RAG (Fase 3).
- [ ] Automatizaciones con n8n (Fase 3-4).

Ver el documento maestro para el detalle completo de cada fase.

## Despliegue

Vercel, con el dominio `diegoalejandromunoz.com` apuntado de forma
independiente del proveedor de hosting.

## Decisiones tecnicas relevantes

- **Route groups** `(public)` / `(auth)` / `dashboard` separan capas de
  acceso sin afectar las URLs.
- **Contenido de ejemplo en `lib/data/`** permite construir y revisar el
  diseno de las paginas publicas antes de que exista contenido real en
  Supabase - se reemplaza por consultas reales en la Fase 2.
- **RLS por defecto restrictivo**: solo se permite `select` publico en
  contenido `published = true`, e `insert` publico unicamente en `contacts`
  y `analytics_events`. Toda escritura administrativa pasa por el cliente
  con `service_role` desde el servidor.
