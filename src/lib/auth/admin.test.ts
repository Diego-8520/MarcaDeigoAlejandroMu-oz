import { describe, expect, it } from "vitest";
import { isAdminEmail, parseAdminEmails } from "./admin";

describe("isAdminEmail", () => {
  it("compara sin distinguir mayúsculas ni espacios", () => {
    expect(parseAdminEmails(" A@x.com, b@y.com ,")).toEqual(["a@x.com", "b@y.com"]);
    expect(isAdminEmail("A@X.com", "a@x.com,b@y.com")).toBe(true);
    expect(isAdminEmail("otro@gmail.com", "a@x.com")).toBe(false);
  });

  it("falla cerrado si no hay allowlist o email", () => {
    expect(isAdminEmail("a@x.com", undefined)).toBe(false);
    expect(isAdminEmail("a@x.com", "")).toBe(false);
    expect(isAdminEmail(null, "a@x.com")).toBe(false);
  });
});
