/**
 * Normalización de texto para comparar vacantes y HV en español/inglés:
 * minúsculas, sin tildes, sin HTML y con puntuación reducida a espacios
 * (se conservan "#", "+" y "." internos para C#, C++, Node.js, .NET).
 */

const HTML_ENTITIES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

/** Convierte HTML en texto plano conservando saltos de línea de bloques y listas. */
export function htmlToText(input: string): string {
  if (!/[<&]/.test(input)) return input;
  return input
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, " ")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ")
    .replace(/<\s*\/\s*(p|div|li|ul|ol|h[1-6]|tr|section)\s*>/gi, "\n")
    .replace(/<\s*(p|div|ul|ol|h[1-6]|tr|section)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Texto normalizado con espacios al inicio y al final, para buscar términos
 * como " power bi " sin falsos positivos dentro de otras palabras.
 */
export function normalize(value: string): string {
  const base = stripAccents(value.toLowerCase())
    .replace(/ñ/g, "n")
    // Puntos que no unen dos caracteres alfanuméricos (fin de frase) -> espacio.
    .replace(/\.(?![a-z0-9])/g, " ")
    .replace(/(^|[^a-z0-9])\.(?=[a-z])/g, "$1 .")
    .replace(/[^a-z0-9#+.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return ` ${base} `;
}

/** Normaliza un término de búsqueda (alias) del mismo modo que el texto. */
export function normalizeTerm(value: string): string {
  return normalize(value).trim();
}

/** ¿Aparece el término (ya normalizado) como palabra/frase completa? */
export function containsTerm(normalizedText: string, normalizedTerm: string): boolean {
  if (!normalizedTerm) return false;
  return normalizedText.includes(` ${normalizedTerm} `);
}

/** Cuenta apariciones de un término completo. */
export function countTerm(normalizedText: string, normalizedTerm: string): number {
  if (!normalizedTerm) return 0;
  const needle = ` ${normalizedTerm} `;
  let count = 0;
  let index = normalizedText.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = normalizedText.indexOf(needle, index + needle.length - 1);
  }
  return count;
}

export function tokenize(value: string): string[] {
  return normalize(value).trim().split(" ").filter(Boolean);
}

/** Palabras vacías en español e inglés para extraer frases clave. */
export const STOPWORDS = new Set(
  (
    "a al algo algun alguna algunas alguno algunos ante antes aqui asi aun como con contra cual cuales cuando de del desde donde dos durante e el ella ellas ellos en entre era es esa esas ese eso esos esta estan estar este esto estos fue ha han hasta hay la las le les lo los mas me mi mientras muy nos nuestra nuestro nuestros nuestras o os otra otro otros para pero poco por porque que quien se sea ser si sin sobre su sus tambien tanto te tener tiene tienen todo todos tu tus un una uno unos unas y ya yo " +
    "u cada etc sera seran debe deben puede pueden haber hacer contar cuente cuentes contar buscamos busca buscando persona personas candidato candidata candidatos empresa equipo nuestra trabajo trabajar cargo vacante oferta perfil experiencia anos ano minimo minima conocimiento conocimientos manejo nivel areas area tipo forma parte lugar buen buena buenas buenos excelente excelentes alto alta altos altas gran grandes mejor mejores nuevo nueva nuevos nuevas importante principales principal diferentes diversos diversas relacionadas relacionados relacionada relacionado afines afin " +
    "the and or of to in for with on at by from as is are be an this that your you we our will can have has it its their they them who what which"
  )
    .split(/\s+/)
    .filter(Boolean),
);
