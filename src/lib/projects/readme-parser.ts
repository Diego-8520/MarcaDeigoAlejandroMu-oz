/**
 * Parser puro de README → sugerencias para la ficha de un proyecto.
 *
 * Sin IA: divide el Markdown por encabezados (#–###), normaliza cada título
 * y lo mapea con un diccionario ES/EN a los campos de la ficha. El texto se
 * propone tal cual, solo limpiado de sintaxis Markdown/HTML.
 */

export type Suggestion<T = string> = {
  value: T;
  /** Origen legible, p. ej. «README › Features». */
  source: string;
};

export type ReadmeImage = {
  url: string;
  alt: string;
};

export type ReadmeSuggestions = {
  description: Suggestion | null;
  shortDescription: Suggestion | null;
  problem: Suggestion | null;
  solution: Suggestion | null;
  results: Suggestion | null;
  technologies: Suggestion<string[]> | null;
  demoUrl: Suggestion | null;
  images: Suggestion<ReadmeImage[]> | null;
  /** Aviso para el panel, p. ej. README de plantilla sin textos propios. */
  notice: string | null;
};

export type ReadmeRepositoryContext = {
  owner: string;
  name: string;
  defaultBranch: string;
  homepage?: string | null;
  topics?: string[];
  languages?: Record<string, number>;
  /** Tecnologías ya usadas en otros proyectos: fijan la grafía canónica. */
  knownTechnologies?: string[];
};

type Section = {
  level: number;
  title: string;
  normalized: string;
  /** Markdown de la sección y de sus subsecciones (niveles inferiores). */
  content: string;
  /** Markdown propio, hasta el siguiente encabezado de cualquier nivel. */
  ownContent: string;
};

type FieldKey = "problem" | "solution" | "results" | "technologies" | "demo" | "description";

const SHORT_DESCRIPTION_MAX = 200;

/* -------------------------------------------------------------------------- */
/* Diccionario de encabezados                                                 */
/* -------------------------------------------------------------------------- */

// El orden importa: un encabezado se asigna al primer campo que coincida.
const HEADING_DICTIONARY: Array<[FieldKey, string[]]> = [
  [
    "technologies",
    [
      "tech stack",
      "stack",
      "tecnologias",
      "technologies",
      "built with",
      "construido con",
      "hecho con",
      "made with",
      "herramientas",
      "tools",
    ],
  ],
  [
    "demo",
    ["demo", "live", "en vivo", "despliegue", "deploy", "deployment", "website", "sitio web"],
  ],
  ["results", ["results", "resultados", "impact", "impacto", "logros", "achievements"]],
  [
    "problem",
    [
      "problem",
      "problema",
      "motivacion",
      "motivation",
      "why",
      "por que",
      "contexto",
      "context",
      "reto",
      "challenge",
    ],
  ],
  [
    "solution",
    [
      "features",
      "feature",
      "key features",
      "caracteristicas",
      "funcionalidades",
      "funciones",
      "solution",
      "solucion",
      "how it works",
      "como funciona",
    ],
  ],
  [
    "description",
    [
      "about",
      "acerca",
      "descripcion",
      "description",
      "overview",
      "introduccion",
      "introduction",
      "sobre el proyecto",
      "que es",
      "what is",
      "resumen",
    ],
  ],
];

/** Minúsculas, sin tildes, sin emojis ni signos; espacios colapsados. */
export function normalizeHeading(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchField(normalized: string): FieldKey | null {
  if (!normalized) return null;
  const padded = ` ${normalized} `;
  for (const [field, keywords] of HEADING_DICTIONARY) {
    if (keywords.some((keyword) => padded.includes(` ${keyword} `))) {
      return field;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Tecnologías: alias → nombre canónico                                       */
/* -------------------------------------------------------------------------- */

const CANONICAL_TECHNOLOGIES: Record<string, string[]> = {
  "Next.js": ["next", "nextjs", "next js"],
  React: ["react", "reactjs", "react js"],
  "React Native": ["react native", "reactnative"],
  TypeScript: ["typescript", "ts"],
  JavaScript: ["javascript", "js", "ecmascript"],
  "Tailwind CSS": ["tailwind", "tailwindcss", "tailwind css"],
  Supabase: ["supabase", "supabase js"],
  PostgreSQL: ["postgres", "postgresql", "postgre sql"],
  "Node.js": ["node", "nodejs", "node js"],
  Python: ["python", "python3"],
  OpenAI: ["openai", "open ai", "openai api", "chatgpt"],
  Anthropic: ["anthropic", "claude"],
  Vercel: ["vercel"],
  Prisma: ["prisma"],
  Zod: ["zod"],
  "Framer Motion": ["framer motion"],
  Vite: ["vite", "vitejs"],
  Express: ["express", "expressjs", "express js"],
  MongoDB: ["mongodb", "mongo"],
  Firebase: ["firebase"],
  Docker: ["docker"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3"],
  SCSS: ["scss", "sass"],
  "shadcn/ui": ["shadcn", "shadcn ui", "shadcnui"],
  "Radix UI": ["radix", "radix ui"],
  Stripe: ["stripe"],
  "GitHub Actions": ["github actions"],
  Vue: ["vue", "vuejs", "vue js"],
  Nuxt: ["nuxt", "nuxtjs"],
  Svelte: ["svelte", "sveltekit"],
  Astro: ["astro"],
  Django: ["django"],
  Flask: ["flask"],
  FastAPI: ["fastapi"],
  PHP: ["php"],
  Laravel: ["laravel"],
  Java: ["java"],
  Kotlin: ["kotlin"],
  Swift: ["swift"],
  Go: ["golang"],
  Rust: ["rust"],
  "C#": ["c#", "csharp", "c sharp"],
  ".NET": [".net", "dotnet"],
  "ASP.NET Core": ["asp.net core", "aspnet core", "asp net core", "asp.net"],
  "Entity Framework": ["entity framework", "entity framework core", "ef core"],
  JWT: ["jwt", "json web token", "json web tokens"],
  MapLibre: ["maplibre", "maplibre gl", "maplibre gl js"],
  pgvector: ["pgvector"],
  PostGIS: ["postgis"],
  "Vercel AI SDK": ["vercel ai sdk", "ai sdk"],
  Leaflet: ["leaflet"],
  Mapbox: ["mapbox"],
  GraphQL: ["graphql"],
  Redis: ["redis"],
  MySQL: ["mysql"],
  SQLite: ["sqlite"],
  AWS: ["aws", "amazon web services"],
  "Google Cloud": ["gcp", "google cloud"],
  n8n: ["n8n"],
  LangChain: ["langchain"],
  "Three.js": ["three", "threejs", "three js"],
  GSAP: ["gsap"],
  Remotion: ["remotion"],
  Figma: ["figma"],
  Jest: ["jest"],
  Vitest: ["vitest"],
  Playwright: ["playwright"],
  Cypress: ["cypress"],
  Zustand: ["zustand"],
  Redux: ["redux", "redux toolkit"],
  "TanStack Query": ["tanstack query", "react query"],
  Webhooks: ["webhooks", "webhook"],
  "APIs REST": ["rest", "rest api", "api rest", "apis rest", "rest apis", "api restful", "restful api"],
  Bootstrap: ["bootstrap"],
  jQuery: ["jquery"],
  Angular: ["angular"],
  Electron: ["electron"],
  Expo: ["expo"],
  Resend: ["resend"],
  Clerk: ["clerk"],
  "Auth.js": ["next auth", "nextauth", "authjs", "auth js"],
  Drizzle: ["drizzle", "drizzle orm"],
  Shell: ["shell", "bash"],
  Dockerfile: ["dockerfile"],
  "Google Sheets": ["google sheets"],
  "Google Apps Script": ["apps script", "google apps script"],
  Netlify: ["netlify"],
  Cloudflare: ["cloudflare", "cloudflare workers"],
};

/** Clave de comparación: minúsculas, sin tildes, sin «.», «-», «_». */
function techKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\.(?=js\b)/g, " ")
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTechIndex(known: string[] = []) {
  const index = new Map<string, string>();
  for (const [canonical, aliases] of Object.entries(CANONICAL_TECHNOLOGIES)) {
    index.set(techKey(canonical), canonical);
    index.set(techKey(canonical).replace(/\s/g, ""), canonical);
    for (const alias of aliases) {
      index.set(techKey(alias), canonical);
      index.set(techKey(alias).replace(/\s/g, ""), canonical);
    }
  }
  // Lo que ya existe en el portafolio manda sobre la grafía del diccionario.
  for (const item of known) {
    const name = item.trim();
    if (!name) continue;
    const key = techKey(name);
    const canonical = index.get(key) ?? index.get(key.replace(/\s/g, ""));
    if (canonical) {
      for (const [k, v] of index) if (v === canonical) index.set(k, name);
    }
    index.set(key, name);
    index.set(key.replace(/\s/g, ""), name);
  }
  return index;
}

function lookupTech(index: Map<string, string>, raw: string) {
  const key = techKey(raw);
  if (!key) return null;
  const withoutVersion = key.replace(/\s*v?\d+(\s\d+)*\s*$/, "").trim();
  for (const candidate of [key, key.replace(/\s/g, ""), withoutVersion, withoutVersion.replace(/\s/g, "")]) {
    if (candidate && index.has(candidate)) return index.get(candidate)!;
  }
  // Tramo de palabras, el más largo primero:
  // «Route Handlers de Next.js» → Next.js, «Supabase como base de datos» → Supabase.
  const words = withoutVersion.split(" ");
  for (let size = Math.min(words.length - 1, 4); size >= 1; size -= 1) {
    for (let start = 0; start + size <= words.length; start += 1) {
      const gram = words.slice(start, start + size).join(" ");
      if (size === 1 && AMBIGUOUS_PREFIXES.has(gram)) continue;
      const match = index.get(gram) ?? index.get(gram.replace(/\s/g, ""));
      if (match) return match;
    }
  }
  return null;
}

// Palabras comunes que solo cuentan como tecnología si van solas.
const AMBIGUOUS_PREFIXES = new Set(["next", "node", "rest", "three", "express", "expo", "swift", "rust", "go", "java", "shell", "clerk", "resend", "astro", "electron", "redis", "angular"]);

const GENERIC_TECH_LABELS = new Set(
  [
    "frontend",
    "front end",
    "backend",
    "back end",
    "database",
    "base de datos",
    "bases de datos",
    "hosting",
    "deploy",
    "deployment",
    "despliegue",
    "estilos",
    "styling",
    "ui",
    "auth",
    "autenticacion",
    "lenguaje",
    "lenguajes",
    "language",
    "languages",
    "framework",
    "frameworks",
    "otros",
    "others",
    "herramientas",
    "tools",
    "infraestructura",
    "infra",
    "testing",
    "tecnologia",
    "categoria",
    "category",
    "technology",
    "tecnologias",
  ].map(techKey),
);

/* -------------------------------------------------------------------------- */
/* Utilidades de Markdown                                                     */
/* -------------------------------------------------------------------------- */

const BADGE_HOSTS = [
  "img.shields.io",
  "shields.io",
  "badgen.net",
  "badge.fury.io",
  "forthebadge.com",
  "skillicons.dev",
  "github-readme-stats",
  "komarev.com",
  "visitor-badge",
  "codecov.io",
  "app.netlify.com",
  "api.netlify.com",
  "deploy-badge",
  "vercel.com/button",
  "vercel.com/new/clone",
];

function isBadgeUrl(url: string) {
  const lower = url.toLowerCase();
  return (
    BADGE_HOSTS.some((host) => lower.includes(host)) ||
    /\/actions\/workflows\/.+\/badge\.svg/.test(lower) ||
    /\/badge\.svg(\?|$)/.test(lower)
  );
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–");
}

function stripComments(markdown: string) {
  return markdown.replace(/<!--[\s\S]*?-->/g, "");
}

function stripCodeBlocks(markdown: string) {
  const out: string[] = [];
  let fence: string | null = null;
  for (const line of markdown.split("\n")) {
    const match = line.match(/^\s*(`{3,}|~{3,})/);
    if (match) {
      if (!fence) fence = match[1][0];
      else if (match[1][0] === fence) fence = null;
      continue;
    }
    if (!fence) out.push(line);
  }
  return out.join("\n");
}

function referenceDefinitions(markdown: string) {
  const refs = new Map<string, string>();
  for (const match of markdown.matchAll(/^\s{0,3}\[([^\]]+)\]:\s*<?(\S+?)>?(?:\s+["'(].*["')])?\s*$/gm)) {
    refs.set(match[1].toLowerCase(), match[2]);
  }
  return refs;
}

/** Quita imágenes (incluidas las enlazadas y los badges). */
function stripImages(text: string) {
  return text
    .replace(/\[\s*!\[[^\]]*\]\([^)]*\)\s*\]\([^)]*\)/g, "")
    .replace(/\[\s*!\[[^\]]*\]\[[^\]]*\]\s*\]\([^)]*\)/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<picture\b[\s\S]*?<\/picture>/gi, "")
    .replace(/<(video|svg)\b[\s\S]*?<\/\1>/gi, "");
}

function cleanInline(text: string) {
  return decodeEntities(
    stripImages(text)
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/?[a-z][^>]*>/gi, "")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
      .replace(/<(https?:\/\/[^>]+)>/g, "$1")
      .replace(/`([^`]*)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/__([^_]+)__/g, "$1")
      .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?!\w)/g, "$1$2")
      .replace(/(^|[^\w])_([^_\s][^_]*?)_(?!\w)/g, "$1$2")
      .replace(/~~([^~]+)~~/g, "$1")
      .replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/gi, ""),
  )
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Markdown → texto plano: sin imágenes, badges, HTML, bloques de código ni
 * sintaxis de enlaces. Listas como líneas «• », párrafos separados por línea
 * en blanco.
 */
export function markdownToText(markdown: string) {
  const source = stripCodeBlocks(stripComments(markdown.replace(/\r\n?/g, "\n")))
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|details|summary)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n- ");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    const text = cleanInline(paragraph.join(" "));
    if (text) blocks.push(text);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push(list.join("\n"));
    list = [];
  };

  for (const rawLine of source.split("\n")) {
    const line = rawLine.replace(/^\s{0,3}>\s?/, "").trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line) || /^\s*=+\s*$/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }
    if (/^\s*\[[^\]]+\]:\s*\S+/.test(line)) continue; // definición de referencia
    if (/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line)) continue; // separador de tabla

    const heading = line.match(/^\s*#{1,6}\s+(.+?)\s*#*\s*$/);
    if (heading) {
      flushParagraph();
      flushList();
      const text = cleanInline(heading[1]);
      if (text) blocks.push(text);
      continue;
    }

    const item = line.match(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?(.*)$/);
    if (item) {
      flushParagraph();
      const text = cleanInline(item[1]);
      if (text) list.push(`• ${text}`);
      continue;
    }

    if (line.includes("|") && /^\s*\|/.test(line)) {
      flushParagraph();
      const cells = line
        .split("|")
        .map((cell) => cleanInline(cell))
        .filter(Boolean);
      if (cells.length) list.push(`• ${cells.join(" · ")}`);
      continue;
    }

    if (list.length && /^\s{2,}\S/.test(rawLine)) {
      // Continuación de un ítem de lista.
      const text = cleanInline(line);
      if (text) list[list.length - 1] += ` ${text}`;
      continue;
    }

    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();

  return blocks.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* -------------------------------------------------------------------------- */
/* Secciones                                                                  */
/* -------------------------------------------------------------------------- */

function splitSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const marks: Array<{ index: number; level: number; title: string }> = [];
  let fence: string | null = null;

  lines.forEach((line, index) => {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (fenceMatch[1][0] === fence) fence = null;
      return;
    }
    if (fence) return;
    const atx = line.match(/^\s{0,3}(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (atx) {
      marks.push({ index, level: atx[1].length, title: atx[2] });
      return;
    }
    const html = line.match(/^\s*<h([1-3])\b[^>]*>(.*?)<\/h\1>\s*$/i);
    if (html) marks.push({ index, level: Number(html[1]), title: html[2] });
  });

  const sections: Section[] = [];
  const preambleEnd = marks[0]?.index ?? lines.length;
  sections.push({
    level: 0,
    title: "",
    normalized: "",
    content: lines.slice(0, preambleEnd).join("\n"),
    ownContent: lines.slice(0, preambleEnd).join("\n"),
  });

  marks.forEach((mark, position) => {
    const nextAny = marks[position + 1]?.index ?? lines.length;
    const nextSameOrHigher =
      marks.slice(position + 1).find((other) => other.level <= mark.level)?.index ??
      lines.length;
    const title = cleanInline(mark.title);
    sections.push({
      level: mark.level,
      title,
      normalized: normalizeHeading(title),
      content: lines.slice(mark.index + 1, nextSameOrHigher).join("\n"),
      ownContent: lines.slice(mark.index + 1, nextAny).join("\n"),
    });
  });

  return sections;
}

function sourceLabel(section: Section | null, fallback: string) {
  if (!section || !section.title) return `README › ${fallback}`;
  const title = section.title
    .replace(/[^\p{L}\p{N}\s&/+.,:¿?¡!()'-]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  return `README › ${title || fallback}`;
}

/** Bloques de párrafo (no listas ni encabezados) ya limpios. */
function paragraphs(markdown: string) {
  const blocks: string[] = [];
  const source = stripCodeBlocks(stripComments(markdown))
    .replace(/<\/(p|div|h[1-6])>/gi, "$&\n\n")
    .replace(/<br\s*\/?>/gi, "\n");
  for (const block of source.split(/\n\s*\n/)) {
    const lines = block.split("\n").filter((line) => line.trim());
    if (!lines.length) continue;
    if (lines.every((line) => /^\s*(?:[-*+]|\d+[.)])\s+/.test(line))) continue;
    if (lines.every((line) => /^\s*\|/.test(line))) continue;
    if (lines.every((line) => /^\s*(#{1,6}\s|<h[1-6])/i.test(line))) continue;
    const text = cleanInline(
      lines
        .filter((line) => !/^\s*(#{1,6}\s|<h[1-6])/i.test(line))
        .map((line) => line.replace(/^\s{0,3}>\s?/, ""))
        .join(" "),
    );
    if (text.length >= 20 && /\p{L}{3,}/u.test(text)) blocks.push(text);
  }
  return blocks;
}

function truncateAtSentence(text: string, max: number) {
  if (text.length <= max) return text;
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [];
  let result = "";
  for (const sentence of sentences) {
    if ((result + sentence).trim().length > max) break;
    result += sentence;
  }
  result = result.trim();
  if (result) return result;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : cut.length).replace(/[,;:\s]+$/, "")}…`;
}

/* -------------------------------------------------------------------------- */
/* Imágenes y enlaces                                                         */
/* -------------------------------------------------------------------------- */

function resolveRepositoryUrl(raw: string, repo: ReadmeRepositoryContext) {
  const value = decodeEntities(raw.trim()).replace(/^<|>$/g, "");
  if (!value || value.startsWith("data:") || value.startsWith("#")) return null;

  const blob = value.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^/]+)\/(.+?)(?:\?.*)?$/i);
  if (blob) {
    return `https://raw.githubusercontent.com/${blob[1]}/${blob[2]}/${blob[3]}/${blob[4]}`;
  }
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  if (/^[a-z]+:/i.test(value)) return null;

  const path = value.replace(/^\.?\//, "").replace(/^(\.\.\/)+/, "");
  const encoded = path
    .split("/")
    .map((part) => encodeURIComponent(decodeURIComponentSafe(part)))
    .join("/");
  return `https://raw.githubusercontent.com/${repo.owner}/${repo.name}/${repo.defaultBranch}/${encoded}`;
}

function decodeURIComponentSafe(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

type FoundImage = { src: string; alt: string };

function findImages(markdown: string, refs: Map<string, string>): FoundImage[] {
  const found: Array<FoundImage & { index: number }> = [];
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g)) {
    found.push({ alt: match[1], src: match[2], index: match.index ?? 0 });
  }
  for (const match of markdown.matchAll(/!\[([^\]]*)\]\[([^\]]*)\]/g)) {
    const src = refs.get((match[2] || match[1]).toLowerCase());
    if (src) found.push({ alt: match[1], src, index: match.index ?? 0 });
  }
  for (const match of markdown.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1];
    const alt = tag.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    if (src) found.push({ alt, src, index: match.index ?? 0 });
  }
  return found.sort((a, b) => a.index - b.index).map(({ src, alt }) => ({ src, alt }));
}

function shieldsLabel(url: string) {
  const badge = url.match(/shields\.io\/badge\/([^?#]+)/i);
  if (!badge) return null;
  const [label] = decodeURIComponentSafe(badge[1])
    .replace(/--/g, "\u0000")
    .replace(/__/g, "\u0001")
    .split("-");
  return label.replace(/\u0000/g, "-").replace(/\u0001/g, "_").replace(/_/g, " ").trim() || null;
}

function shieldsLogo(url: string) {
  const logo = url.match(/[?&]logo=([^&#]+)/i);
  return logo ? decodeURIComponentSafe(logo[1]).replace(/[-_]/g, " ") : null;
}

function findLinks(markdown: string) {
  const links: Array<{ text: string; url: string }> = [];
  const withoutImages = stripImages(markdown);
  for (const match of withoutImages.matchAll(/\[([^\]]*)\]\(\s*<?(https?:\/\/[^)\s>]+)>?[^)]*\)/g)) {
    links.push({ text: cleanInline(match[1]), url: match[2] });
  }
  for (const match of withoutImages.matchAll(/<a\b[^>]*href\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    links.push({ text: cleanInline(match[2]), url: match[1] });
  }
  for (const match of withoutImages.matchAll(/(?:^|[\s(<])(https?:\/\/[^\s)<>\]]+)/g)) {
    links.push({ text: "", url: match[1] });
  }
  return links.filter(
    (link) =>
      !isBadgeUrl(link.url) &&
      !/^https?:\/\/(www\.)?(github\.com|nextjs\.org|vercel\.com\/(new|docs|templates))/i.test(
        link.url,
      ),
  );
}

/* -------------------------------------------------------------------------- */
/* Parser                                                                     */
/* -------------------------------------------------------------------------- */

function sectionText(section: Section | undefined): Suggestion | null {
  if (!section) return null;
  const value = markdownToText(section.content);
  return value ? { value, source: sourceLabel(section, "sección") } : null;
}

const TECH_COLUMN_HEADER =
  /\b(tecnologia|tecnologias|technology|technologies|herramienta|herramientas|tool|tools|libreria|library|stack|nombre|name)\b/;

/**
 * «Next.js (App Router), React y Supabase — UI» →
 * main: ["Next.js", "React", "Supabase"], extra: ["App Router"].
 * Lo que va entre paréntesis solo se acepta si es una tecnología conocida.
 */
function splitTechList(text: string) {
  const split = (value: string) =>
    value
      .split(/,|;|\/(?!ui\b)|·|\s\+\s|\s(?:y|and|con|with|&)\s/i)
      .map((part) => part.split(/\s[-–—]\s/)[0].replace(/[.:]+$/, "").trim())
      .filter(Boolean);
  const extra = [...text.matchAll(/\(([^)]*)\)/g)].flatMap((match) => split(match[1]));
  return { main: split(text.replace(/\([^)]*\)?/g, " ")), extra };
}

function stripVersion(value: string) {
  return value.replace(/\s+v?\d+(\.\d+)*\+?$/i, "").trim();
}

function isPlausibleTechName(value: string) {
  const name = stripVersion(value);
  return (
    name.length >= 2 &&
    name.length <= 30 &&
    name.split(/\s+/).length <= 4 &&
    /\p{L}/u.test(name) &&
    !/[.!?]$/.test(name) &&
    !GENERIC_TECH_LABELS.has(techKey(name))
  );
}

// README generados por plantillas: su texto no describe el proyecto.
const BOILERPLATE_SIGNATURES: Array<[RegExp, string]> = [
  [/bootstrapped with \[?`?create-next-app/i, "create-next-app"],
  [/bootstrapped with \[?create react app/i, "Create React App"],
  [/generated (?:using|with) \[?angular cli/i, "Angular CLI"],
  [/astro starter kit|seasoned astronaut\? delete this file/i, "Astro"],
  [/minimal setup to get react working in vite/i, "Vite"],
  [/this is an \[?expo\]? project created with/i, "Expo"],
  [/look at the \[?nuxt (?:3 )?documentation/i, "Nuxt"],
  [/everything you need to build a svelte project/i, "SvelteKit"],
];

export function parseReadme(
  markdown: string,
  repo: ReadmeRepositoryContext,
): ReadmeSuggestions {
  const normalizedMarkdown = stripComments(markdown.replace(/\r\n?/g, "\n"));
  const refs = referenceDefinitions(normalizedMarkdown);
  const sections = splitSections(normalizedMarkdown);
  const techIndex = buildTechIndex(repo.knownTechnologies);
  const boilerplate = BOILERPLATE_SIGNATURES.find(([pattern]) =>
    pattern.test(normalizedMarkdown),
  )?.[1];

  const byField = new Map<FieldKey, Section>();
  for (const section of sections) {
    if (!section.level) continue;
    const field = matchField(section.normalized);
    if (field && !byField.has(field)) byField.set(field, section);
  }

  // Intro: cuerpo del H1 (o el preámbulo si no hay H1).
  const h1 = sections.find((section) => section.level === 1);
  const introCandidates = [h1 ? h1.ownContent : "", sections[0].content];
  let introParagraphs: string[] = [];
  for (const candidate of introCandidates) {
    introParagraphs = paragraphs(candidate);
    if (introParagraphs.length) break;
  }
  let introSource = "intro";
  if (!introParagraphs.length) {
    const firstWithText = sections.find(
      (section) => section.level > 0 && paragraphs(section.ownContent).length,
    );
    if (firstWithText) {
      introParagraphs = paragraphs(firstWithText.ownContent);
      introSource = firstWithText.title;
    }
  }

  const shortDescription: Suggestion | null = introParagraphs[0]
    ? {
        value: truncateAtSentence(introParagraphs[0], SHORT_DESCRIPTION_MAX),
        source: `README › ${introSource === "intro" ? "primer párrafo" : introSource}`,
      }
    : null;

  const description =
    sectionText(byField.get("description")) ??
    (introParagraphs.length
      ? {
          value: introParagraphs.slice(0, 2).join("\n\n"),
          source: `README › ${introSource === "intro" ? "primeros párrafos" : introSource}`,
        }
      : null);

  /* --- Tecnologías ------------------------------------------------------- */
  const technologies: string[] = [];
  const techOrigins = new Set<string>();
  const seen = new Set<string>();
  const addTech = (name: string | null, origin: string) => {
    if (!name) return;
    const value = name.trim();
    const key = techKey(value).replace(/\s/g, "");
    if (!key || seen.has(key)) return;
    seen.add(key);
    technologies.push(value);
    techOrigins.add(origin);
  };
  const techSection = byField.get("technologies");
  if (techSection) {
    const origin = sourceLabel(techSection, "stack");
    const addKnownOrName = (piece: string, keepUnknown: boolean) => {
      const known = lookupTech(techIndex, piece);
      if (known) return addTech(known, origin);
      if (keepUnknown && isPlausibleTechName(piece)) addTech(stripVersion(piece), origin);
    };
    let techColumn: number | null = null;

    for (const rawLine of stripCodeBlocks(techSection.content).split("\n")) {
      if (!rawLine.trim() || /^\s*(#{1,6}\s|<h[1-6])/i.test(rawLine)) continue;
      if (/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(rawLine)) continue;

      // Tablas: «| Capa | Tecnología |» → columna de tecnología por cabecera.
      if (/^\s*\|/.test(rawLine)) {
        const cells = rawLine
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((cell) => cleanInline(cell));
        if (techColumn === null) {
          const header = cells.findIndex((cell) => TECH_COLUMN_HEADER.test(normalizeHeading(cell)));
          techColumn = header >= 0 ? header : 0;
          if (header >= 0) continue;
        }
        cells.forEach((cell, column) => {
          const { main, extra } = splitTechList(cell);
          main.forEach((piece) => addKnownOrName(piece, column === techColumn));
          extra.forEach((piece) => addKnownOrName(piece, false));
        });
        continue;
      }

      const isListItem = /^\s*(?:[-*+]|\d+[.)])\s+/.test(rawLine);
      const text = cleanInline(rawLine.replace(/^\s*(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?/, ""));
      if (!text) continue;

      // «Frontend: HTML5, CSS3» → lista tras los dos puntos.
      // «Next.js: framework» → la tecnología es lo que va antes.
      const colon = text.indexOf(":");
      if (colon > 0) {
        const label = text.slice(0, colon);
        const { main, extra } = splitTechList(text.slice(colon + 1));
        if (main.length > 1 || main.some((piece) => lookupTech(techIndex, piece))) {
          main.forEach((piece) => addKnownOrName(piece, true));
          extra.forEach((piece) => addKnownOrName(piece, false));
        } else {
          addKnownOrName(label, isListItem);
        }
        continue;
      }

      const { main, extra } = splitTechList(text);
      if (isListItem) {
        addKnownOrName(main[0] ?? "", true);
        main.slice(1).forEach((piece) => addKnownOrName(piece, false));
      } else {
        // Prosa («Construido con Next.js y Supabase»): solo nombres conocidos.
        main.forEach((piece) => addKnownOrName(piece, false));
      }
      extra.forEach((piece) => addKnownOrName(piece, false));
    }
  }

  // Badges de shields.io y skillicons en todo el README.
  for (const image of findImages(normalizedMarkdown, refs)) {
    if (/shields\.io/i.test(image.src)) {
      const inTechSection = techSection?.content.includes(image.src) ?? false;
      const candidates = [image.alt, shieldsLogo(image.src), shieldsLabel(image.src)].filter(
        Boolean,
      ) as string[];
      const known = candidates.map((candidate) => lookupTech(techIndex, candidate)).find(Boolean);
      if (known) addTech(known, "README › badges");
      else if (inTechSection && image.alt.trim() && image.alt.length <= 30) {
        addTech(cleanInline(image.alt), "README › badges");
      }
    } else if (/skillicons\.dev/i.test(image.src)) {
      const list = image.src.match(/[?&]i=([^&#]+)/)?.[1];
      for (const icon of decodeURIComponentSafe(list ?? "").split(",")) {
        addTech(lookupTech(techIndex, icon), "README › badges");
      }
    }
  }

  const languages = Object.entries(repo.languages ?? {}).sort((a, b) => b[1] - a[1]);
  const totalBytes = languages.reduce((sum, [, bytes]) => sum + bytes, 0) || 1;
  for (const [language, bytes] of languages) {
    if (bytes / totalBytes < 0.01) continue;
    addTech(lookupTech(techIndex, language) ?? language, "GitHub › languages");
  }
  for (const topic of repo.topics ?? []) {
    addTech(lookupTech(techIndex, topic.replace(/-/g, " ")), "GitHub › topics");
  }

  /* --- Demo ---------------------------------------------------------------- */
  let demoUrl: Suggestion | null = repo.homepage
    ? { value: repo.homepage, source: "GitHub › homepage" }
    : null;
  if (!demoUrl) {
    const demoSection = byField.get("demo");
    const link = demoSection ? findLinks(demoSection.content)[0] : undefined;
    if (demoSection && link) {
      demoUrl = { value: link.url, source: sourceLabel(demoSection, "demo") };
    }
  }
  if (!demoUrl) {
    const labelled = findLinks(normalizedMarkdown).find((link) =>
      /\b(demo|live|en vivo|ver sitio|sitio web|website|deploy(?:ed)?|production|producci[oó]n)\b/i.test(
        link.text,
      ),
    );
    if (labelled) demoUrl = { value: labelled.url, source: `README › enlace «${labelled.text}»` };
  }

  /* --- Imágenes ------------------------------------------------------------ */
  const images: ReadmeImage[] = [];
  const imageUrls = new Set<string>();
  for (const image of findImages(stripCodeBlocks(normalizedMarkdown), refs)) {
    if (isBadgeUrl(image.src)) continue;
    const url = resolveRepositoryUrl(image.src, repo);
    if (!url || imageUrls.has(url)) continue;
    if (/\.svg(\?|$)/i.test(url)) continue;
    imageUrls.add(url);
    images.push({ url, alt: cleanInline(image.alt) });
  }

  if (boilerplate) {
    return {
      description: null,
      shortDescription: null,
      problem: null,
      solution: null,
      results: null,
      technologies: technologiesSuggestion(),
      demoUrl,
      images: images.length ? { value: images, source: "README › imágenes" } : null,
      notice: `El README es la plantilla de ${boilerplate}: no propongo textos.`,
    };
  }

  return {
    description,
    shortDescription,
    problem: sectionText(byField.get("problem")),
    solution: sectionText(byField.get("solution")),
    results: sectionText(byField.get("results")),
    technologies: technologiesSuggestion(),
    demoUrl,
    images: images.length ? { value: images, source: "README › imágenes" } : null,
    notice: null,
  };

  function technologiesSuggestion(): Suggestion<string[]> | null {
    return technologies.length
      ? { value: technologies, source: [...techOrigins].join(" + ") }
      : null;
  }
}
