import { describe, expect, it } from "vitest";
import { analyzeJob } from "./index";
import {
  cvYearsOfExperience,
  extractEducationLevel,
  extractMinYears,
  extractModality,
  extractSalary,
  splitSections,
} from "./extract";
import { findOriginal } from "./keywords";
import { containsTerm, htmlToText, normalize } from "./normalize";
import { sampleCv } from "./__fixtures__/cv";
import { analistaJob, htmlRemoteJob } from "./__fixtures__/jobs";

const NOW = new Date("2026-11-20T00:00:00Z");

describe("normalize", () => {
  it("quita tildes y respeta términos técnicos", () => {
    const text = normalize("Gestión de C#, Node.js y Power BI.");
    expect(containsTerm(text, "gestion")).toBe(true);
    expect(containsTerm(text, "c#")).toBe(true);
    expect(containsTerm(text, "node.js")).toBe(true);
    expect(containsTerm(text, "power bi")).toBe(true);
    // No hay coincidencias dentro de otras palabras.
    expect(containsTerm(normalize("JavaScript"), "java")).toBe(false);
  });

  it("convierte HTML en texto con saltos de línea", () => {
    expect(htmlToText("<p>Hola&nbsp;mundo</p><ul><li>A</li><li>B</li></ul>")).toBe("Hola mundo\n- A\n- B");
  });

  it("recupera el término original de la vacante", () => {
    expect(findOriginal("Apoyar la gestión de proveedores.", "gestion de proveedores")).toBe("gestión de proveedores");
  });
});

describe("extract", () => {
  it("divide la vacante en secciones", () => {
    const kinds = splitSections(analistaJob.description).map((s) => s.kind);
    expect(kinds).toContain("funciones");
    expect(kinds).toContain("requerido");
    expect(kinds).toContain("deseable");
    expect(kinds).toContain("beneficios");
  });

  it("detecta años de experiencia solo en contexto de experiencia", () => {
    expect(extractMinYears(normalize("Mínimo 2 años de experiencia en ventas"))).toBe(2);
    expect(extractMinYears(normalize("3+ years of experience with React"))).toBe(3);
    expect(extractMinYears(normalize("Experiencia de 1 a 3 años"))).toBe(1);
    expect(extractMinYears(normalize("Edad entre 25 y 35 años"))).toBeNull();
  });

  it("detecta nivel educativo, modalidad y salario", () => {
    expect(extractEducationLevel(normalize("Profesional en Contaduría o afines"))?.label).toBe("Profesional");
    expect(extractEducationLevel(normalize("Formación técnica o tecnóloga en sistemas"))?.label).toBe("Técnico");
    // "soporte técnico" no es nivel educativo.
    expect(extractEducationLevel(normalize("Brindar soporte técnico a usuarios"))).toBeNull();
    expect(extractModality(normalize("Modalidad híbrida"))).toBe("hibrido");
    expect(extractModality(normalize("100% remoto"))).toBe("remoto");
    expect(extractSalary("Salario: $3.500.000 COP + prestaciones")).toBe("$3.500.000 COP");
  });

  it("calcula años de la HV uniendo periodos solapados", () => {
    const years = cvYearsOfExperience(
      [
        { startDate: "2020-01-01", endDate: "2022-01-01" },
        { startDate: "2021-01-01", endDate: "2023-01-01" },
      ],
      NOW,
    );
    expect(years).toBe(3);
  });
});

describe("analyzeJob", () => {
  const analysis = analyzeJob(analistaJob, sampleCv, NOW);
  const byTerm = (term: string) => analysis.keywords.find((k) => k.term === term);

  it("extrae requisitos de la vacante", () => {
    expect(analysis.requirements.minYears).toBe(2);
    expect(analysis.requirements.educationLevel?.label).toBe("Profesional");
    expect(analysis.requirements.modality).toBe("hibrido");
    expect(analysis.requirements.languages[0]).toMatchObject({ language: "Inglés", level: 3, required: true });
    expect(analysis.requirements.seniority).toBeNull();
  });

  it("marca palabras clave presentes, variantes y faltantes", () => {
    expect(byTerm("SQL")?.status).toBe("presente");
    expect(byTerm("Power BI")?.status).toBe("variante"); // en la HV está como "PowerBI"
    expect(byTerm("Excel avanzado")?.status).toBe("variante"); // en la HV solo "Excel"
    expect(byTerm("SAP")?.status).toBe("falta");
    expect(byTerm("Inglés B2")?.status).toBe("variante"); // la HV tiene B1
    expect(byTerm("Gestión de proveedores")?.status).toBe("falta");
  });

  it("ordena por prioridad: requisitos antes que deseables", () => {
    expect(byTerm("SQL")?.priority).toBe("alta");
    expect(byTerm("SAP")?.priority).toBe("baja");
    const weights = analysis.keywords.map((k) => k.weight);
    expect([...weights].sort((a, b) => b - a)).toEqual(weights);
  });

  it("no usa beneficios como palabras clave", () => {
    // "Trabajo en equipo" solo aparece en "Ofrecemos".
    expect(byTerm("Trabajo en equipo")).toBeUndefined();
  });

  it("da un puntaje coherente con desglose que suma el total", () => {
    expect(analysis.score).toBeGreaterThan(50);
    expect(analysis.score).toBeLessThan(90);
    const total = analysis.components.reduce((sum, c) => sum + c.points, 0);
    expect(Math.abs(total - analysis.score)).toBeLessThanOrEqual(1);
  });

  it("genera tips accionables sin inventar experiencia", () => {
    const texts = analysis.tips.map((t) => t.text).join("\n");
    expect(texts).toMatch(/Agrega «SQL» a tu lista de skills/);
    expect(texts).toMatch(/Usa el término exacto «Power BI»/);
    expect(texts).toMatch(/no lo inventes/);
    expect(analysis.tips[0].priority).toBe("alta");
  });

  it("sugiere resumen y orden de skills con datos reales", () => {
    expect(analysis.suggestedSummary).toContain("Analista de Procesos Administrativos");
    expect(analysis.suggestedSummary).not.toContain("SAP");
    // «Excel avanzado» es solo una variante en la HV: no debe afirmarse.
    expect(analysis.suggestedSummary).not.toContain("Excel avanzado");
    expect(analysis.suggestedSkillOrder[0]).toBe("Excel");
  });

  it("analiza vacantes en HTML y no confunde «home office» con Microsoft Office", () => {
    const remote = analyzeJob(htmlRemoteJob, sampleCv, NOW);
    expect(remote.requirements.minYears).toBe(3);
    expect(remote.requirements.modality).toBe("remoto");
    expect(remote.requirements.seniority).toBe("Semi senior");
    const terms = remote.keywords.map((k) => k.term);
    expect(terms).toEqual(expect.arrayContaining(["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"]));
    expect(terms).not.toContain("Microsoft Office");
    expect(remote.score).toBeLessThan(50);
  });

  it("es determinista", () => {
    expect(analyzeJob(analistaJob, sampleCv, NOW)).toEqual(analysis);
  });
});
