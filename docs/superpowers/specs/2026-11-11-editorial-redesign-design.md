# Rediseño "Ingeniería en tinta" — diegoalejandromunoz.com

Fecha: 2026-11-11 · Estado: aprobado · Alcance: sitio público + dashboard + login

## Objetivo

Transformar la interfaz de un portafolio de tarjetas "dark engineering" a una
experiencia editorial-brutalista de nivel premiado, conservando contenido,
funcionalidades (selector de audiencia, analítica, formulario, CV, dashboard),
rutas y arquitectura de datos. Prioridades no negociables: responsive,
accesibilidad (WCAG AA), rendimiento y `prefers-reduced-motion`.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Alcance | Público + dashboard + login |
| Dirección de arte | Editorial brutalista ("revista de diseño impresa por un ingeniero") |
| Motion | GSAP (+ ScrollTrigger, SplitText, Flip) + Lenis; `ViewTransition` nativo de React para rutas |
| Navegación | Se elimina el riel lateral; barra superior mínima + menú pantalla completa |

## 1. Sistema visual

### Tokens (se conservan los nombres actuales, se cambian valores)

El dashboard y los formularios usan `paper/surface/ink/line/signal/emerald/amber`.
Mantener los nombres hace que todo el panel adopte la identidad nueva sin reescribirlo.

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#0B0B0A` | fondo tinta |
| `--surface` | `#121210` | superficie 1 |
| `--surface-elevated` | `#1A1A17` | superficie 2 |
| `--surface-highlight` | `#24231F` | hover |
| `--ink` | `#EDEBE6` | texto principal (bone) |
| `--ink-muted` | `#A3A09A` | texto secundario (AA sobre paper) |
| `--ink-subtle` | `#6E6B65` | metadatos no esenciales |
| `--line` | `#2A2926` | reglas |
| `--line-focus` | `#45433E` | reglas activas |
| `--signal` | acento por audiencia | ver abajo |
| `--signal-ink` | `#0B0B0A` | **nuevo**: texto sobre `bg-signal` |
| `--emerald` / `--amber` | `#4ADE80` / `#FBBF24` | estados |

Acento según audiencia (atributo `data-audience` en `<html>`, transición de 600ms):
- `all` y `recruiter`: lima ácido `#D4FF3A`
- `client`: naranja señal `#FF5B1F`

Ambos tienen contraste ≥ 7:1 con `--signal-ink`, por eso todo `bg-signal text-white` pasa a `text-signal-ink`.

### Tipografía (`next/font/google`, en el layout raíz)

- **Archivo** variable (pesos 100–900, eje `wdth` 62–125) → `--font-display` y `--font-body`.
  Display: `font-stretch: 125%`, peso 800, `clamp(3.25rem, 12vw, 13rem)`, interlineado 0.86 y tracking −0.04em.
- **Instrument Serif** itálica → `--font-serif` (clase `.font-serif`), para palabras de contraste.
- **JetBrains Mono** → `--font-mono`, para índices, metadatos y etiquetas.

### Rejilla y textura

- Contenedor `max-w-[1600px]` con gutter `clamp(1rem, 3vw, 3rem)` y 12 columnas. Las notas al margen van en las columnas 1–3 y el contenido en las 4–12 (a partir de `lg`).
- Radio 0 en todo el sitio público. En el dashboard se mantiene radio 0 por consistencia.
- Grano de película SVG fijo al 4% de opacidad (`pointer-events: none`).
- Overlay de rejilla que se activa con la tecla `G`.

### Principios de movimiento

- Easing `expo.out` / `power4.out`, duraciones de 0.6–1.2s y stagger de 0.04–0.08s.
- Todo efecto respeta `prefers-reduced-motion`: Lenis apagado, GSAP sin ejecutarse y contenido visible desde el SSR (sin flash invisible). El estado oculto inicial solo se aplica desde JS, con la clase `html.js-motion`.

## 2. Estructura global y navegación

- **SiteHeader** (fijo, 56px, `mix-blend-mode: difference`): monograma `DAM·` a la izquierda; reloj de Cali en vivo + "● Disponible" al centro (desde `md`); `AudienceSwitch` + botón `Menú` a la derecha.
- **SiteMenu**, a pantalla completa:
  - Abre con una cortina de color acento (clip-path) y muestra las 8 rutas en Archivo expandido de unos 8vw, numeradas, con stagger.
  - Hover: las demás rutas bajan al 20% y la activa se ensancha. A la derecha, una vista previa con la descripción de la ruta.
  - Pie: canales de contacto y el enlace discreto a `/login`.
  - Accesibilidad: `role="dialog"`, `aria-modal`, foco atrapado, `Esc` para cerrar, foco devuelto al botón y scroll bloqueado (Lenis `stop()`).
- **Atajos**: `/` abre o cierra el menú y `G` muestra la rejilla. Se ignoran cuando el foco está en un input.
- **SiteFooter** (en todas las páginas públicas): CTA gigante "¿Construimos algo?" con relleno de acento en hover, y 4 columnas mono (contacto, redes, mapa del sitio, colofón con enlace a `/arquitectura`).
- **Transiciones de ruta**: `<ViewTransition>` envuelve el `main` público. CSS `::view-transition-old/new(root)`: la página saliente sube 4% y se oscurece, la entrante entra con clip-path. Morph compartido `project-media-{slug}` y `project-title-{slug}` entre la lista y el caso de estudio.
- **MotionProvider** (solo en el layout público): Lenis sincronizado con `gsap.ticker`, `ScrollTrigger.refresh()` al cambiar de ruta y `lenis.scrollTo(0)` en cada navegación.
- **Cursor** personalizado (solo con `pointer: fine`): punto + anillo con lerp. Se transforma vía `data-cursor="view|external|drag"`.

## 3. Home

1. **Hero**
   - Notas al margen en mono (nombre, rol, ubicación, disponibilidad).
   - Titular "Software que *opera*." en display gigante con revelado por línea (máscara), y la palabra en Instrument Serif itálica en acento.
   - Lede de posicionamiento (el copy actual).
   - CTAs que dependen de la audiencia: Empresa → "Ver CV" + "Código real"; Cliente → "Cotizar proyecto" + "Ver trabajo"; por defecto → "Ver proyectos" + "Hablemos".
   - Fondo `DotField`: canvas 2D con una matriz de puntos que se desplazan alrededor del cursor. Se pausa fuera de pantalla y es estático con reduced-motion.
2. **Ticker**: marquee infinito con el stack; la velocidad y la dirección siguen al scroll.
3. **Índice de trabajo** (`WorkIndex`)
   - Filas `01 — Título — categorías — año — ↗` con regla fina.
   - Hover en escritorio: imagen flotante que sigue al cursor, revelada con clip.
   - En móvil, la miniatura va en línea.
   - Muestra los proyectos destacados o, si no hay, los 4 primeros. Al final, "Ver catálogo (n)".
4. **Cifras**: 4 números grandes que cuentan al entrar en vista (número de proyectos, 100% tipado, stars u "Open", UNIAJC).
5. **Capacidades**: los 3 servicios como paneles horizontales anclados con ScrollTrigger pin (desde `lg`). Debajo de `lg` se apilan en vertical. Cada panel tiene número gigante, descripción, entregables, stack y el enlace "Cotizar".
6. **Stack con evidencia**: tabla tipográfica tecnología → proyectos. Al pasar el cursor por una tecnología, se resaltan sus proyectos.
7. **Trayectoria**: dos columnas editoriales (experiencia actual y formación) con una línea que se dibuja con el scroll.
8. **Testimonios** (si existen): una cita grande en serif itálica con navegación anterior/siguiente.
9. El CTA final pasa al `SiteFooter` global.

## 4. Páginas internas, dashboard y arquitectura técnica

### Componente compartido `PageHeader`

Índice de sección (`03 / Servicios`), título display con revelado, lede, notas al margen opcionales y acciones.

- **/proyectos**: `PageHeader` + filtros por categoría (chips, estado en cliente, `aria-pressed`) + `WorkIndex` completo + CTA.
- **/proyectos/[slug]**: hero a sangre con la imagen destacada (morph). La ficha técnica va pegada al margen (estado, stack, repositorio, stars, enlaces) y el contenido en capítulos numerados: 01 Problema, 02 Solución, 03 Resultados. Después, la galería con parallax suave, los testimonios y "Siguiente proyecto" a pantalla completa (requiere `getPublishedProjects` para calcular el siguiente).
- **/servicios**: filas numeradas gigantes; dentro de cada una, problema / solución / entregables / stack / cotizar. FAQ con `<details>` nativo y animación de altura.
- **/experiencia**: línea de tiempo con columna de fechas, la línea se dibuja con el scroll; luego educación y certificaciones.
- **/sobre-mi**: retrato revelado con clip y escala de grises que pasa a color en hover. La historia va en columnas editoriales con capitular, los pilares como lista numerada y las skills como nube tipográfica por categoría.
- **/cv**: página tipo "documento": resumen ejecutivo, botón de descarga gigante (se conserva el tracking de `CvDownloadLink`) y otras versiones.
- **/contacto**: formulario con inputs subrayados y labels mono. El selector de intención usa radios grandes con el foco visible. Se conservan los canales directos y los campos ocultos de analítica.
- **/arquitectura**: diagrama SVG del flujo visitante → Next → Supabase, con trazo animado. Las secciones existentes se mantienen y se actualiza el texto de "decisiones de diseño" para el nuevo sistema.
- **/login**: tarjeta editorial mínima con los tokens nuevos.

### Dashboard

- Toma la identidad automáticamente por el cambio de valores de los tokens. Se rediseñan `DashboardNav` (monograma, mono e indicador de acento) y los primitivos `Button`, `Badge` y `Card`, que comparte con el sitio público.
- Sin GSAP ni Lenis en el dashboard; solo transiciones CSS.

### Arquitectura técnica

- **Dependencias nuevas**: `gsap`, `@gsap/react`, `lenis`.
- **Archivos nuevos**:
  - `src/components/motion/`: `motion-provider.tsx`, `reveal.tsx` (`SplitReveal` + `FadeReveal`), `marquee.tsx`, `cursor.tsx`, `counter.tsx`.
  - `src/components/site/`: `site-header.tsx`, `site-menu.tsx`, `site-footer.tsx`, `cali-clock.tsx`, `audience-switch.tsx`, `grid-overlay.tsx`, `page-header.tsx`, `work-index.tsx`, `dot-field.tsx`, `capabilities-pin.tsx`, `testimonial-carousel.tsx`, `project-filter.tsx`.
  - `src/lib/site.ts`: constantes de navegación, contacto y redes (hoy duplicadas en varias páginas).
- **Eliminado**: `src/components/layout/site-rail.tsx`.
- **Modificado**: `AudienceProvider` sincroniza `data-audience` en `<html>`.
- **Button**: se exporta `buttonVariants()` para estilar `<Link>` sin anidar `<a><button>` (corrige un fallo de accesibilidad actual).
- Server Components por defecto. Solo son cliente las piezas interactivas, y GSAP se importa solo en ellas.

### Rendimiento

Máximo 3 familias tipográficas con `display: swap`. El canvas usa DPR ≤ 2 y se pausa con IntersectionObserver. Sin imágenes nuevas pesadas; `next/image` en todo.

### Verificación

`npm run lint`, `npm run build` y una revisión en navegador a 390px y 1440px con capturas de cada ruta, el menú, el cambio de audiencia, reduced-motion y el envío del formulario (sin enviar datos reales).

## Fuera de alcance

Cambios de contenido o copy (salvo los microcopys nuevos de navegación y pie), cambios de esquema en la base de datos, modo claro e internacionalización.
