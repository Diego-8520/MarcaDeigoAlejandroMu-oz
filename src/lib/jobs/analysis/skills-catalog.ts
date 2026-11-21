import type { KeywordCategory } from "../types";
import { normalizeTerm } from "./normalize";

/**
 * Catálogo de habilidades con sinónimos. El primer alias es la forma
 * "canónica" sugerida si la vacante no usa otra. Se amplía en tiempo de
 * ejecución con las skills de tu tabla `skills` (ver buildCatalog).
 *
 * Para agregar habilidades: añade una línea [label, categoría, ...alias].
 */
type RawEntry = [label: string, category: KeywordCategory, ...aliases: string[]];

const RAW: RawEntry[] = [
  // --- Lenguajes y desarrollo ---
  ["JavaScript", "tecnica", "javascript", "js", "ecmascript"],
  ["TypeScript", "tecnica", "typescript", "ts"],
  ["Python", "tecnica", "python"],
  ["Java", "tecnica", "java"],
  ["C#", "tecnica", "c#", "csharp", "c sharp"],
  [".NET", "tecnica", ".net", "dotnet", "asp.net", ".net core"],
  ["C++", "tecnica", "c++", "cpp"],
  ["PHP", "tecnica", "php"],
  ["Laravel", "tecnica", "laravel"],
  ["Ruby", "tecnica", "ruby", "ruby on rails", "rails"],
  ["Go", "tecnica", "golang"],
  ["Kotlin", "tecnica", "kotlin"],
  ["Swift", "tecnica", "swift"],
  ["Dart", "tecnica", "dart"],
  ["Flutter", "tecnica", "flutter"],
  ["HTML", "tecnica", "html", "html5"],
  ["CSS", "tecnica", "css", "css3", "sass", "scss"],
  ["Tailwind CSS", "tecnica", "tailwind", "tailwind css", "tailwindcss"],
  ["React", "tecnica", "react", "react.js", "reactjs"],
  ["React Native", "tecnica", "react native"],
  ["Next.js", "tecnica", "next.js", "nextjs"],
  ["Vue.js", "tecnica", "vue", "vue.js", "vuejs", "nuxt"],
  ["Angular", "tecnica", "angular", "angularjs"],
  ["Node.js", "tecnica", "node.js", "nodejs", "node"],
  ["Express", "tecnica", "express", "express.js", "expressjs"],
  ["NestJS", "tecnica", "nestjs", "nest.js"],
  ["Django", "tecnica", "django"],
  ["Flask", "tecnica", "flask"],
  ["FastAPI", "tecnica", "fastapi"],
  ["Spring Boot", "tecnica", "spring boot"],
  ["APIs REST", "tecnica", "api rest", "apis rest", "rest api", "rest apis", "restful", "api restful", "apis"],
  ["GraphQL", "tecnica", "graphql"],
  ["Webhooks", "tecnica", "webhooks", "webhook"],
  ["Microservicios", "tecnica", "microservicios", "microservices"],
  ["Testing", "tecnica", "pruebas unitarias", "unit testing", "testing", "jest", "vitest", "pytest", "tdd"],
  ["Playwright", "tecnica", "playwright", "cypress", "selenium"],
  // --- Datos ---
  ["SQL", "tecnica", "sql", "t-sql", "pl sql", "plsql"],
  ["PostgreSQL", "tecnica", "postgresql", "postgres"],
  ["MySQL", "tecnica", "mysql", "mariadb"],
  ["SQL Server", "tecnica", "sql server", "mssql"],
  ["Oracle", "tecnica", "oracle"],
  ["MongoDB", "tecnica", "mongodb", "mongo"],
  ["Redis", "tecnica", "redis"],
  ["Supabase", "tecnica", "supabase"],
  ["Firebase", "tecnica", "firebase"],
  ["Pandas", "tecnica", "pandas", "numpy"],
  ["ETL", "tecnica", "etl", "elt", "pipelines de datos", "data pipelines"],
  ["Análisis de datos", "tecnica", "analisis de datos", "data analysis", "analitica de datos", "analitica"],
  ["Machine Learning", "tecnica", "machine learning", "aprendizaje automatico", "ml", "scikit-learn"],
  ["Inteligencia artificial", "tecnica", "inteligencia artificial", "ia", "ai", "llm", "llms", "ia generativa", "generative ai"],
  ["Estadística", "tecnica", "estadistica", "statistics"],
  ["Data Warehouse", "tecnica", "data warehouse", "bodega de datos", "snowflake", "bigquery", "redshift"],
  // --- Cloud / DevOps ---
  ["AWS", "herramienta", "aws", "amazon web services"],
  ["Azure", "herramienta", "azure", "microsoft azure"],
  ["Google Cloud", "herramienta", "google cloud", "gcp", "google cloud platform"],
  ["Vercel", "herramienta", "vercel"],
  ["Docker", "herramienta", "docker", "contenedores", "containers"],
  ["Kubernetes", "herramienta", "kubernetes", "k8s"],
  ["Terraform", "herramienta", "terraform"],
  ["CI/CD", "herramienta", "ci/cd", "ci cd", "integracion continua", "github actions", "gitlab ci", "jenkins"],
  ["Linux", "herramienta", "linux", "bash", "shell"],
  ["Git", "herramienta", "git", "github", "gitlab", "bitbucket"],
  // --- Automatización / no-code ---
  ["Automatización de procesos", "tecnica", "automatizacion de procesos", "automatizacion", "automation", "process automation"],
  ["RPA", "herramienta", "rpa", "uipath", "automation anywhere", "blue prism"],
  ["n8n", "herramienta", "n8n"],
  ["Zapier", "herramienta", "zapier"],
  ["Make", "herramienta", "make.com", "integromat"],
  ["Power Automate", "herramienta", "power automate", "microsoft flow"],
  ["Power Apps", "herramienta", "power apps", "powerapps"],
  ["Google Apps Script", "herramienta", "apps script", "google apps script"],
  ["Macros VBA", "herramienta", "vba", "macros", "macros vba"],
  // --- Ofimática / BI / ERP ---
  ["Excel", "herramienta", "excel", "microsoft excel", "excel avanzado", "hojas de calculo", "spreadsheets"],
  ["Tablas dinámicas", "herramienta", "tablas dinamicas", "pivot tables"],
  ["Power BI", "herramienta", "power bi", "powerbi"],
  ["Tableau", "herramienta", "tableau"],
  ["Looker Studio", "herramienta", "looker studio", "google data studio", "data studio", "looker"],
  ["Microsoft Office", "herramienta", "microsoft office", "office", "paquete office", "office 365", "microsoft 365", "powerpoint", "outlook"],
  ["Google Workspace", "herramienta", "google workspace", "g suite", "google sheets", "google drive"],
  ["SAP", "herramienta", "sap", "sap b1", "sap business one", "sap fico", "sap mm", "sap sd"],
  ["Siigo", "herramienta", "siigo"],
  ["World Office", "herramienta", "world office"],
  ["Helisa", "herramienta", "helisa"],
  ["Odoo", "herramienta", "odoo"],
  ["ERP", "herramienta", "erp"],
  ["CRM", "herramienta", "crm"],
  ["Salesforce", "herramienta", "salesforce"],
  ["HubSpot", "herramienta", "hubspot"],
  ["Jira", "herramienta", "jira", "confluence"],
  ["Trello", "herramienta", "trello", "asana", "clickup", "notion"],
  ["Figma", "herramienta", "figma"],
  ["WordPress", "herramienta", "wordpress", "woocommerce"],
  ["Shopify", "herramienta", "shopify"],
  ["Google Analytics", "herramienta", "google analytics", "ga4"],
  ["Google Ads", "herramienta", "google ads"],
  ["SEO", "tecnica", "seo", "posicionamiento web"],
  // --- Administrativo / finanzas / gestión ---
  ["Gestión administrativa", "tecnica", "gestion administrativa", "procesos administrativos", "apoyo administrativo", "asistente administrativo", "auxiliar administrativo"],
  ["Gestión documental", "tecnica", "gestion documental", "manejo de archivo", "document management"],
  ["Contabilidad", "tecnica", "contabilidad", "contable", "accounting"],
  ["Facturación", "tecnica", "facturacion", "facturacion electronica", "invoicing", "billing"],
  ["Cartera", "tecnica", "cartera", "cobranza", "recaudo", "cuentas por cobrar"],
  ["Cuentas por pagar", "tecnica", "cuentas por pagar", "tesoreria", "pagos a proveedores"],
  ["Conciliaciones bancarias", "tecnica", "conciliaciones bancarias", "conciliacion bancaria", "conciliaciones"],
  ["Nómina", "tecnica", "nomina", "liquidacion de nomina", "payroll", "seguridad social"],
  ["Impuestos", "tecnica", "impuestos", "tributaria", "retencion en la fuente", "iva", "declaraciones tributarias"],
  ["NIIF", "tecnica", "niif", "ifrs"],
  ["Presupuestos", "tecnica", "presupuesto", "presupuestos", "budgeting", "control presupuestal"],
  ["Análisis financiero", "tecnica", "analisis financiero", "financial analysis", "modelos financieros", "estados financieros"],
  ["Inventarios", "tecnica", "inventarios", "inventario", "control de inventarios", "inventory"],
  ["Compras", "tecnica", "compras", "procurement", "gestion de proveedores", "negociacion con proveedores"],
  ["Logística", "tecnica", "logistica", "cadena de suministro", "supply chain", "despachos"],
  ["Gestión de proyectos", "tecnica", "gestion de proyectos", "project management", "administracion de proyectos", "manejo de proyectos"],
  ["Indicadores (KPI)", "tecnica", "kpi", "kpis", "indicadores de gestion"],
  ["Mejora de procesos", "tecnica", "mejora continua", "mejora de procesos", "optimizacion de procesos", "lean", "six sigma", "kaizen"],
  ["Levantamiento de procesos", "tecnica", "levantamiento de procesos", "mapeo de procesos", "bpmn", "diagramas de flujo"],
  ["Levantamiento de requerimientos", "tecnica", "levantamiento de requerimientos", "analisis de requerimientos", "requirements"],
  ["Recursos humanos", "tecnica", "recursos humanos", "talento humano", "gestion humana", "human resources", "rrhh"],
  ["Selección de personal", "tecnica", "seleccion de personal", "reclutamiento", "recruiting", "headhunting"],
  ["Servicio al cliente", "tecnica", "servicio al cliente", "atencion al cliente", "customer service", "customer success", "soporte al cliente"],
  ["Ventas", "tecnica", "ventas", "comercial", "sales", "prospeccion"],
  ["Marketing digital", "tecnica", "marketing digital", "digital marketing", "redes sociales", "social media"],
  ["Soporte técnico", "tecnica", "soporte tecnico", "mesa de ayuda", "help desk", "service desk", "soporte ti"],
  ["ITIL", "metodologia", "itil"],
  ["SST", "tecnica", "seguridad y salud en el trabajo", "sst", "sg sst"],
  ["ISO 9001", "certificacion", "iso 9001", "sistema de gestion de calidad", "gestion de calidad"],
  // --- Metodologías ---
  ["Scrum", "metodologia", "scrum"],
  ["Metodologías ágiles", "metodologia", "metodologias agiles", "agile", "agil", "agiles"],
  ["Kanban", "metodologia", "kanban"],
  ["PMI / PMBOK", "metodologia", "pmi", "pmbok", "pmp"],
  ["Design Thinking", "metodologia", "design thinking"],
  ["UX/UI", "tecnica", "ux", "ui", "ux/ui", "ui/ux", "experiencia de usuario"],
  // --- Habilidades blandas ---
  ["Trabajo en equipo", "blanda", "trabajo en equipo", "teamwork", "trabajo colaborativo"],
  ["Comunicación", "blanda", "comunicacion asertiva", "comunicacion efectiva", "habilidades de comunicacion", "comunicacion", "communication skills"],
  ["Liderazgo", "blanda", "liderazgo", "leadership", "liderar equipos"],
  ["Resolución de problemas", "blanda", "resolucion de problemas", "solucion de problemas", "problem solving"],
  ["Orientación al logro", "blanda", "orientacion al logro", "orientacion a resultados", "results oriented"],
  ["Pensamiento analítico", "blanda", "pensamiento analitico", "capacidad analitica", "analytical skills", "pensamiento critico"],
  ["Organización", "blanda", "planificacion", "planeacion", "gestion del tiempo", "time management"],
  ["Atención al detalle", "blanda", "atencion al detalle", "detallista", "attention to detail"],
  ["Proactividad", "blanda", "proactividad", "proactivo", "proactiva", "iniciativa"],
  ["Adaptabilidad", "blanda", "adaptabilidad", "adaptacion al cambio"],
  ["Autonomía", "blanda", "autonomia", "autogestion", "trabajo autonomo"],
  ["Negociación", "blanda", "negociacion", "negotiation"],
  ["Orientación al cliente", "blanda", "orientacion al cliente", "customer focus"],
  ["Aprendizaje continuo", "blanda", "aprendizaje continuo", "autodidacta"],
];

export type CatalogEntry = {
  key: string;
  label: string;
  category: KeywordCategory;
  /** Alias normalizados, ordenados del más largo al más corto. */
  aliases: string[];
  /** Alias originales (para mostrar). */
  displayAliases: Record<string, string>;
  fromCv?: boolean;
};

function toEntry(raw: RawEntry): CatalogEntry {
  const [label, category, ...aliases] = raw;
  const displayAliases: Record<string, string> = {};
  const normalized = aliases.map((alias) => {
    const n = normalizeTerm(alias);
    displayAliases[n] = alias;
    return n;
  });
  return {
    key: normalizeTerm(label),
    label,
    category,
    aliases: [...new Set(normalized)].sort((a, b) => b.length - a.length),
    displayAliases,
  };
}

export const BASE_CATALOG: CatalogEntry[] = RAW.map(toEntry);

/**
 * Catálogo final: base + skills propias que no estén ya cubiertas.
 * Así tus skills personalizadas (p. ej. "Siesa", "Kommo") también se buscan
 * en las vacantes.
 */
export function buildCatalog(cvSkills: { name: string; category: string | null }[]): CatalogEntry[] {
  const known = new Set(BASE_CATALOG.flatMap((entry) => entry.aliases));
  const extra: CatalogEntry[] = [];
  for (const skill of cvSkills) {
    const alias = normalizeTerm(skill.name);
    if (!alias || alias.length < 2 || known.has(alias)) continue;
    known.add(alias);
    extra.push({
      key: alias,
      label: skill.name.trim(),
      category: /blanda|soft/i.test(skill.category ?? "") ? "blanda" : "tecnica",
      aliases: [alias],
      displayAliases: { [alias]: skill.name.trim() },
      fromCv: true,
    });
  }
  return [...BASE_CATALOG, ...extra];
}
