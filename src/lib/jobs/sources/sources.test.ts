import { afterEach, describe, expect, it, vi } from "vitest";
import { mapAdzunaJob } from "./adzuna";
import { mapGetOnBoardJob } from "./getonboard";
import { dedupeJobs, searchAllSources } from "./index";
import { mapJoobleJob } from "./jooble";
import { buildManualJob, parseJobPage } from "./manual";
import { mapRemotiveJob } from "./remotive";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("adaptadores", () => {
  it("Get on Board", () => {
    const job = mapGetOnBoardJob({
      id: "analista-datos-acme",
      attributes: {
        title: "Analista de Datos",
        description: "<p>Buscamos analista</p>",
        functions: "<ul><li>Reportes en Power BI</li></ul>",
        desirable: "<p>Python</p>",
        remote: true,
        remote_modality: "fully_remote",
        countries: ["Colombia"],
        min_salary: 1500,
        max_salary: 2000,
        published_at: 1763600000,
        company: { data: { attributes: { name: "Acme" } } },
      },
      links: { public_url: "https://www.getonbrd.com/jobs/analista-datos-acme" },
    });
    expect(job).toMatchObject({
      source: "getonboard",
      title: "Analista de Datos",
      company: "Acme",
      modality: "remoto",
      location: "Colombia",
      url: "https://www.getonbrd.com/jobs/analista-datos-acme",
    });
    expect(job?.description).toContain("Funciones:");
    expect(job?.salary).toMatch(/1\.500 - 2\.000 USD/);
  });

  it("Remotive, Adzuna y Jooble", () => {
    expect(mapRemotiveJob({ id: 1, title: "Dev", company_name: "X", candidate_required_location: "LATAM" })).toMatchObject({
      modality: "remoto",
      location: "LATAM",
    });
    expect(
      mapAdzunaJob({ id: 9, title: "<strong>Contador</strong>", company: { display_name: "Y" }, salary_min: 10000 }, "mx"),
    ).toMatchObject({ title: "Contador", company: "Y", salary: "10.000 MXN" });
    expect(mapJoobleJob({ id: 3, title: "Asistente", location: "Bogotá", type: "Remoto" })).toMatchObject({
      modality: "remoto",
    });
    expect(mapRemotiveJob({ title: "Sin id" })).toBeNull();
  });

  it("deduplica la misma vacante de varias fuentes", () => {
    const base = { externalId: "1", location: null, modality: null, salary: null, url: null, publishedAt: null };
    const jobs = dedupeJobs([
      { ...base, source: "jooble", title: "Analista Contable", company: "ACME", description: "corta" },
      { ...base, source: "getonboard", title: "Analista contable", company: "Acme", description: "descripción más larga" },
    ]);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].source).toBe("getonboard");
  });
});

describe("searchAllSources", () => {
  it("una fuente caída no rompe la búsqueda y las que no tienen key se desactivan", async () => {
    vi.stubEnv("ADZUNA_APP_ID", "");
    vi.stubEnv("JOOBLE_API_KEY", "");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("getonbrd")) return new Response("boom", { status: 500 });
        return Response.json({ jobs: [{ id: 7, title: "Analista remoto", candidate_required_location: "Worldwide" }] });
      }),
    );
    const { jobs, statuses } = await searchAllSources({ query: "analista", country: "co", remote: true });
    expect(jobs.map((j) => j.title)).toEqual(["Analista remoto"]);
    const byId = Object.fromEntries(statuses.map((s) => [s.id, s.state]));
    expect(byId).toEqual({ getonboard: "error", remotive: "ok", adzuna: "desactivada", jooble: "desactivada" });
  });
});

describe("vacante manual", () => {
  it("lee JSON-LD JobPosting", () => {
    const html = `<html><head><script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "JobPosting",
          title: "Auxiliar Contable",
          description: "<p>Requisitos:</p><ul><li>Siigo</li></ul>",
          hiringOrganization: { "@type": "Organization", name: "Contadores SAS" },
          jobLocation: { "@type": "Place", address: { addressLocality: "Cali", addressCountry: "CO" } },
        },
      ],
    })}</script></head><body>…</body></html>`;
    expect(parseJobPage(html)).toEqual({
      title: "Auxiliar Contable",
      company: "Contadores SAS",
      location: "Cali, CO",
      description: "Requisitos:\n- Siigo",
    });
  });

  it("acepta texto pegado y exige suficiente contenido", async () => {
    const job = await buildManualJob({
      text: "Asistente administrativo\nRequisitos: experiencia en facturación electrónica, manejo de Excel, atención al cliente y gestión documental. Modalidad presencial en Cali.",
    });
    expect(job).toMatchObject({ source: "manual", title: "Asistente administrativo", modality: "presencial" });
    await expect(buildManualJob({ text: "muy corto" })).rejects.toThrow(/suficiente texto/);
  });
});
