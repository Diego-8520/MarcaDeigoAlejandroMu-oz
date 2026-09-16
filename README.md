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

| Variable                        | Descripcion                                    |
| ------------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anonima (uso en cliente)                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clave de servicio (solo servidor, bypassa RLS) |
| `OPENAI_API_KEY`                | Fase 3 - AI Profile Assistant                  |
| `N8N_WEBHOOK_URL`               | Fase 3 - notificaciones de leads               |

## Login con Google

Google OAuth es una alternativa exclusiva para el login privado del dashboard.
No aparece en páginas públicas ni se usa para acciones de visitantes.

Para configurarlo:

1. En Supabase, abrir **Authentication → Providers → Google** y habilitar el
   proveedor.
2. En Google Cloud Console, crear credenciales OAuth de tipo aplicación web y
   configurar como **Authorized redirect URI** la callback que muestra Supabase:
   `https://{project-ref}.supabase.co/auth/v1/callback`.
3. Copiar el Client ID y Client Secret en la configuración del proveedor Google
   dentro de Supabase. No se necesitan variables nuevas en Next.js.
4. En **Authentication → URL Configuration**, permitir también la URL de la
   aplicación que usa el login, por ejemplo `https://tu-dominio.com/callback`
   y su equivalente local durante desarrollo.
5. Revisar **Authentication → Settings → User Signups**. Como este proyecto
   tiene un único usuario administrador, desactivar el registro de nuevos
   usuarios si la instancia no necesita altas adicionales y confirmar que la
   cuenta de Diego ya existe antes de probar el botón.

El flujo vuelve a `/callback`, intercambia el código por una sesión de Supabase
y redirige al dashboard. El middleware existente protege esa ruta de forma
independiente del proveedor utilizado.

## Base de datos

Las migraciones versionadas viven en `supabase/migrations/`. El despliegue
normal a producción se hace con la CLI de Supabase; el SQL Editor queda
reservado para emergencias documentadas.

```bash
npm install -g supabase
supabase login
supabase link --project-ref hhmzkxbsdeddwplxwhmd
supabase migration list
supabase db push
```

Antes de cada despliegue, comprobar que `supabase migration list` no muestra
migraciones locales pendientes inesperadas. Después de un despliegue, verificar
que todas las versiones de `supabase/migrations/` aparecen en
`supabase_migrations.schema_migrations`:

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

No aplicar archivos de migración manualmente desde el SQL Editor salvo una
emergencia. Si se usa ese procedimiento, registrar después la causa, el SQL
ejecutado y la reconciliación necesaria antes del siguiente `supabase db push`.

## Storage

Crear manualmente en Supabase Storage el bucket `project-images` con lectura
publica. La escritura administrativa la hace el servidor con
`SUPABASE_SERVICE_ROLE_KEY`; no se suben imagenes directamente desde el cliente.

Estructura de paths registrada en `project_images.storage_path`:

```text
project-images/{project_id}/{uuid}.{ext}
```

Los archivos fisicos dentro del bucket usan `{project_id}/{uuid}.{ext}`.

Para el avatar del perfil, el bucket `profile-media` debe existir en Supabase
Storage con lectura publica. El bucket `project-images` usa la misma política
de lectura pública para la galería. La escritura de ambos queda restringida al
servidor mediante `SUPABASE_SERVICE_ROLE_KEY`; no se suben archivos
directamente desde el cliente.

Estructura de paths del avatar:

```text
profile-media/profile/{uuid}.{ext}
```

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

## Estado actual

Fase 1 (MVP) y Fase 2 completas — plataforma en producción con contenido y
gestión real, sin datos de ejemplo pendientes.

- [x] Sitio publico con Home, Proyectos, Servicios, Sobre mi, Experiencia,
      Educacion, CV, Contacto.
- [x] Login con email/password y Google OAuth, proteccion de /dashboard
      via middleware + Supabase Auth.
- [x] Esquema SQL versionado con RLS, migraciones 0001-0008 versionadas
      para local y produccion.
- [x] Formulario de contacto con validacion (Zod), server action y bandeja
      de gestion de leads en el dashboard.
- [x] CRUD completo de proyectos con auto-fetch de metadata desde GitHub y
      sitio en vivo, galeria de imagenes por proyecto.
- [x] CRUD de perfil (bio, avatar, enlaces de redes dinamicos), experiencia
      laboral, educacion/certificaciones y skills vinculadas a proyectos.
- [x] Testimonios de clientes vinculados opcionalmente a proyectos.
- [x] Analitica propia y anonima sobre analytics_events, complementada
      con Vercel Web Analytics para Web Vitals.
- [x] Pagina publica /arquitectura con stack derivado dinamicamente de
      package.json.
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
