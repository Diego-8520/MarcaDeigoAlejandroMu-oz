# Rediseño "Ingeniería en tinta" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la UI pública, el dashboard y el login por el sistema editorial-brutalista definido en el spec, sin cambiar datos, rutas ni funcionalidades.

**Architecture:** Los valores de los tokens cambian, pero sus nombres se conservan, de modo que el dashboard hereda la identidad. El layout público obtiene un shell nuevo (header + menú + footer + MotionProvider con Lenis/GSAP) y `ViewTransition`. Cada página pública se recompone con primitivos editoriales nuevos (`PageHeader`, `SplitReveal`, `WorkIndex`…). Server Components por defecto; GSAP solo en islas cliente.

**Tech Stack:** Next 16.3 App Router, React 19.2 (`ViewTransition`), Tailwind v4, gsap + @gsap/react + lenis, next/font (Archivo, Instrument Serif, JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-11-11-editorial-redesign-design.md`

## Global Constraints

- Nombres de token intactos: `paper, surface, surface-elevated, surface-highlight, ink, ink-muted, ink-subtle, line, line-focus, signal, signal-hover, signal-light, signal-dim, emerald(-dim), amber(-dim)`. Token nuevo: `signal-ink`.
- Acento: `#D4FF3A` (all/recruiter), `#FF5B1F` (client), vía `html[data-audience]`.
- Nunca `bg-signal text-white`: usar `text-signal-ink`.
- Nunca `<Link><Button/></Link>`: usar `buttonVariants()`.
- Todo movimiento debe estar condicionado a `html.js-motion` y a que no haya `prefers-reduced-motion: reduce`. El contenido es visible sin JS.
- Sin GSAP ni Lenis en `/dashboard` ni en `/login`.
- Sin cambios de copy de contenido ni de esquema de base de datos.
- Leer `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` antes de la Task 3.

## Verificación estándar (al final de cada tarea)

```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: 0 errores. La revisión visual en navegador (390px / 1440px) se hace en las Tasks 3, 5, 7 y 9.

---

### Task 1: Fundaciones (dependencias, fuentes, tokens, primitivos)

**Files:**
- Modify: `package.json` (gsap, @gsap/react, lenis)
- Modify: `src/app/layout.tsx` (fuentes nuevas y script inline que añade `js-motion` si no hay reduced-motion)
- Modify: `src/app/globals.css` (tokens, `@theme`, utilidades `.display`, `.font-serif`, `.grain`, `.rule`, reglas de reveal y de view-transition)
- Modify: `src/components/ui/button.tsx` (exporta `buttonVariants({variant,size,className})`, radio 0, variante `signal` con `text-signal-ink`)
- Modify: `src/components/ui/badge.tsx`, `src/components/ui/card.tsx`, `src/components/ui/section.tsx` (estética nueva; `Section` con contenedor de 1600px)
- Create: `src/lib/site.ts`

**Interfaces (Produces):**
- `buttonVariants(opts?: { variant?: "primary"|"secondary"|"outline"|"ghost"|"signal"; size?: "sm"|"md"|"lg"|"icon"; className?: string }): string`
- `src/lib/site.ts`: `NAV_ITEMS: {href,label,index,blurb}[]`, `CONTACT = {email, whatsappNumber, whatsappUrl(text), linkedin, github, location, timezone}`
- Clases CSS: `.display`, `.display-xl`, `.font-serif`, `.eyebrow`, `.rule`, `.container-x`, `[data-reveal]`, `[data-split]`

- [ ] Instalar dependencias y fijar versiones.
- [ ] Fuentes + tokens + utilidades.
- [ ] Primitivos y `buttonVariants`.
- [ ] Verificación estándar y commit `feat(ui): fundaciones del sistema editorial`.

### Task 2: Motion core

**Files:**
- Create: `src/components/motion/motion-provider.tsx`: `MotionProvider({children})` registra los plugins, crea Lenis y lo sincroniza con `gsap.ticker`. Expone `useLenis(): Lenis | null` y hace scroll al inicio y `ScrollTrigger.refresh()` en cada cambio de `usePathname()`.
- Create: `src/components/motion/reveal.tsx`: `SplitReveal({as, children, className, delay})` divide por líneas con SplitText y máscara; `Reveal({children, className, delay, y})` hace fade + translate.
- Create: `src/components/motion/marquee.tsx`: `Marquee({items: string[], speed?: number})` con velocidad ligada al scroll.
- Create: `src/components/motion/cursor.tsx`: `Cursor()` solo con `pointer: fine`; lee `data-cursor` del elemento más cercano.
- Create: `src/components/motion/counter.tsx`: `Counter({value: number, suffix?: string})`.
- Create: `src/components/motion/use-reduced-motion.ts`: `useReducedMotion(): boolean`.

- [ ] Implementar. Todos los efectos deben saltarse si `useReducedMotion()` devuelve true o si falta `js-motion`.
- [ ] Verificación estándar y commit `feat(motion): provider Lenis+GSAP y primitivos de revelado`.

### Task 3: Shell público (header, menú, footer, audiencia, transiciones)

**Files:**
- Create: `src/components/site/site-header.tsx`, `site-menu.tsx`, `site-footer.tsx`, `cali-clock.tsx`, `audience-switch.tsx`, `grid-overlay.tsx`
- Modify: `src/components/layout/audience-context.tsx` (efecto que sincroniza `document.documentElement.dataset.audience`)
- Modify: `src/app/(public)/layout.tsx` (quitar `lg:pl-64`; añadir `MotionProvider`, `SiteHeader`, `<ViewTransition>` alrededor de `main`, `SiteFooter`, `Cursor`, `GridOverlay` y grano)
- Delete: `src/components/layout/site-rail.tsx`

**Aceptación:**
- El menú se abre con un clic y con `/`, se cierra con `Esc`, atrapa el foco y lo devuelve al botón.
- `G` alterna la rejilla.
- El switch de audiencia cambia el acento del sitio entero.
- La navegación entre rutas muestra la view-transition en Chromium.

- [ ] Implementar.
- [ ] Verificación estándar + navegador (menú, atajos, audiencia, 390px).
- [ ] Commit `feat(site): shell editorial con menú pantalla completa y view transitions`.

### Task 4: Componentes editoriales compartidos

**Files:**
- Create: `src/components/site/page-header.tsx`: `PageHeader({index: string, eyebrow: string, title: ReactNode, lede?: ReactNode, notes?: {label: string, value: ReactNode}[], actions?: ReactNode})`
- Create: `src/components/site/work-index.tsx` (cliente): `WorkIndex({projects: Project[], showFilters?: boolean})`. Filas con morph `ViewTransition name="project-media-{slug}"` y `"project-title-{slug}"`, imagen flotante en hover desde `lg` y miniatura en línea en móvil. Con filtros activos muestra chips de categoría con `aria-pressed`.
- Create: `src/components/site/dot-field.tsx` (cliente): canvas con puntos reactivos al cursor.
- Create: `src/components/site/capabilities-pin.tsx` (cliente): `CapabilitiesPin({items: Capability[]})`, scroll horizontal anclado desde `lg`.
- Create: `src/components/site/testimonial-carousel.tsx` (cliente): `TestimonialCarousel({items: Testimonial[]})`.
- Create: `src/components/site/hero-ctas.tsx` (cliente): CTAs según `useAudience()`.
- Delete: `src/components/projects/project-card.tsx` si no queda ningún uso.

- [ ] Implementar y verificación estándar.
- [ ] Commit `feat(site): componentes editoriales (page header, work index, dot field)`.

### Task 5: Home

**Files:** Modify `src/app/(public)/page.tsx`, con las secciones 1–8 del spec (§3). Se conservan las mismas queries.

- [ ] Implementar.
- [ ] Verificación estándar + navegador (hero, índice con hover, pin, móvil y reduced-motion).
- [ ] Commit `feat(home): home editorial`.

### Task 6: Proyectos y caso de estudio

**Files:** Modify `src/app/(public)/proyectos/page.tsx` y `src/app/(public)/proyectos/[slug]/page.tsx` (hero con morph, ficha técnica pegada, capítulos, galería, siguiente proyecto mediante `getPublishedProjects()`).

- [ ] Implementar, verificación estándar y commit `feat(proyectos): catálogo filtrable y caso de estudio editorial`.

### Task 7: Servicios, experiencia, sobre mí, CV, contacto, arquitectura

**Files:** Modify las páginas de `servicios`, `experiencia`, `sobre-mi`, `cv` y `contacto`, además de `components/contact-form.tsx`, `components/analytics/cv-download-link.tsx` y la página de `arquitectura`.

**Aceptación:** el formulario conserva sus nombres de campo, los campos ocultos y `useActionState`; `CvDownloadLink` conserva su tracking; el FAQ usa `<details>`.

- [ ] Implementar, verificación estándar + navegador y commit `feat(pages): páginas internas editoriales`.

### Task 8: Dashboard y login

**Files:** Modify `src/components/layout/dashboard-nav.tsx`, `src/app/dashboard/layout.tsx` y `src/app/(auth)/login/*`. Barrido con `grep` de `text-white` sobre `bg-signal` y de `rounded-sm` decorativo.

- [ ] Implementar, verificación estándar y commit `feat(dashboard): identidad editorial en panel y login`.

### Task 9: QA final

- [ ] Recorrido en navegador por las 9 rutas públicas a 390px y 1440px, con el menú, el cambio de audiencia, el formulario (solo validación) y reduced-motion emulado.
- [ ] `graphify update .`
- [ ] Commit final.
