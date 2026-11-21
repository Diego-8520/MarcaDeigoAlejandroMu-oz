import { describe, expect, it } from "vitest";
import { analyzeJob } from "../analysis";
import { sampleCv } from "../analysis/__fixtures__/cv";
import { analistaJob } from "../analysis/__fixtures__/jobs";
import { resolveSourceRef, validateOfferEvaluation, validateTailoredCv } from "./validate";

const analysis = analyzeJob(analistaJob, sampleCv, new Date("2026-11-20"));

const validCv = {
  headline: "Analista de Procesos Administrativos | Excel · SQL · Automatización",
  summary: "Profesional con 5 años de experiencia en procesos administrativos y automatización de reportes.",
  skills: ["Excel", "SQL", "Python", "Power BI"],
  experiences: [
    {
      id: "e1",
      bullets: [
        { text: "Reduje en 30% los errores de facturación electrónica.", sourceRef: "exp:e1:ach:1" },
        { text: "Automaticé reportes semanales con Python.", sourceRef: "exp:e1:ach:0" },
        { text: "Gestión documental y conciliaciones bancarias.", sourceRef: "exp:e1:desc" },
      ],
    },
  ],
  projects: [{ id: "p1", bullets: [{ text: "Bot de conciliación con SQL y Docker.", sourceRef: "proj:p1" }] }],
  educationIds: ["ed1"],
  certificationIds: ["c1"],
  changes: ["Titular alineado al cargo"],
  keywordsCovered: ["SQL", "Excel"],
  keywordsNotAdded: [
    { term: "SAP", reason: "No tengo experiencia con SAP." },
    { term: "Macros", reason: "No aparece en mi HV." },
    { term: "Tablas dinámicas", reason: "No aparece en mi HV." },
  ],
};

describe("resolveSourceRef", () => {
  it("resuelve referencias válidas y rechaza las inexistentes", () => {
    expect(resolveSourceRef(sampleCv, "exp:e1:ach:1")?.text).toContain("30%");
    expect(resolveSourceRef(sampleCv, "exp:e2:desc")?.ownerId).toBe("e2");
    expect(resolveSourceRef(sampleCv, "exp:e1:ach:9")).toBeNull();
    expect(resolveSourceRef(sampleCv, "exp:nope:desc")).toBeNull();
    expect(resolveSourceRef(sampleCv, "inventado")).toBeNull();
  });
});

describe("validateTailoredCv", () => {
  it("acepta una HV adaptada fiel a la HV maestra", () => {
    const result = validateTailoredCv(validCv, sampleCv, analysis);
    expect(result.ok).toBe(true);
  });

  it("rechaza experiencias, fuentes y cifras inventadas", () => {
    const result = validateTailoredCv(
      {
        ...validCv,
        experiences: [
          { id: "e9", bullets: [] },
          {
            id: "e1",
            bullets: [
              { text: "Reduje errores en 80%.", sourceRef: "exp:e1:ach:1" },
              { text: "Lideré un equipo.", sourceRef: "exp:e2:desc" },
              { text: "Algo.", sourceRef: "exp:e1:ach:7" },
            ],
          },
        ],
      },
      sampleCv,
      analysis,
    );
    expect(result.ok).toBe(false);
    const errors = result.ok ? [] : result.errors.join("\n");
    expect(errors).toMatch(/"e9" no existe/);
    expect(errors).toMatch(/cifra "80"/);
    expect(errors).toMatch(/pertenece a otra experiencia/);
    expect(errors).toMatch(/"exp:e1:ach:7" no existe/);
  });

  it("rechaza skills sin evidencia y cifras inventadas en el resumen", () => {
    const result = validateTailoredCv(
      { ...validCv, skills: ["Excel", "SAP"], summary: "Profesional con 12 años de experiencia." },
      sampleCv,
      analysis,
    );
    expect(result.ok).toBe(false);
    const errors = result.ok ? "" : result.errors.join("\n");
    expect(errors).toMatch(/skill "SAP"/);
    expect(errors).toMatch(/cifra "12"/);
  });

  it("acepta términos de la vacante con evidencia (SQL está en un proyecto)", () => {
    expect(validateTailoredCv({ ...validCv, skills: ["SQL"] }, sampleCv, analysis).ok).toBe(true);
  });

  it("advierte si faltan requisitos sin explicar", () => {
    const result = validateTailoredCv({ ...validCv, keywordsNotAdded: [] }, sampleCv, analysis);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.warnings.join(" ")).toMatch(/Macros/);
  });

  it("rechaza formato inválido con mensajes claros", () => {
    const result = validateTailoredCv({ headline: "" }, sampleCv, analysis);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]).toMatch(/^Formato:/);
  });
});

describe("validateOfferEvaluation", () => {
  it("valida el veredicto y la estructura", () => {
    expect(
      validateOfferEvaluation({
        verdict: "postular_con_ajustes",
        fitSummary: "Buen encaje en procesos; falta Excel avanzado.",
        strengths: ["Experiencia en conciliaciones"],
        gaps: [{ item: "Excel avanzado", severity: "media", mitigation: "Curso corto y mencionar macros si las usaste." }],
      }).ok,
    ).toBe(true);
    expect(validateOfferEvaluation({ verdict: "quizas", fitSummary: "x", strengths: [], gaps: [] }).ok).toBe(false);
  });
});
