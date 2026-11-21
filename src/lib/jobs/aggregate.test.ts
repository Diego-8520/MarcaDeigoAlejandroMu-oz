import { describe, expect, it } from "vitest";
import { aggregateKeywords } from "./aggregate";
import { analyzeJob } from "./analysis";
import { sampleCv } from "./analysis/__fixtures__/cv";
import { analistaJob, htmlRemoteJob } from "./analysis/__fixtures__/jobs";

describe("aggregateKeywords", () => {
  it("ordena por número de vacantes y omite el cargo", () => {
    const now = new Date("2026-11-20");
    const a = analyzeJob(analistaJob, sampleCv, now).keywords;
    const b = analyzeJob({ ...analistaJob, title: "Analista contable" }, sampleCv, now).keywords;
    const c = analyzeJob(htmlRemoteJob, sampleCv, now).keywords;
    const result = aggregateKeywords([a, b, c]);
    expect(result.some((k) => k.category === "cargo")).toBe(false);
    expect(result[0].jobs).toBe(2);
    const sql = result.find((k) => k.term === "SQL");
    expect(sql).toMatchObject({ jobs: 2, status: "presente", requiredShare: 100 });
    expect(result.find((k) => k.term === "React")?.jobs).toBe(1);
  });
});
