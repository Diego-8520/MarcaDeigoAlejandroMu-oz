export type DeviceType = "mobile" | "desktop" | "tablet";

export function getDeviceType(userAgent: string | null | undefined): DeviceType {
  const ua = userAgent?.toLowerCase() ?? "";

  if (/ipad|tablet|kindle|silk|playbook/.test(ua)) return "tablet";
  if (/mobi|iphone|android.*mobile|windows phone/.test(ua)) return "mobile";
  if (/android/.test(ua)) return "tablet";

  return "desktop";
}

export function normalizeSource(source: string | null | undefined) {
  if (!source) return "directo";

  try {
    const hostname = new URL(source).hostname.replace(/^www\./, "").toLowerCase();

    if (hostname.includes("linkedin.com")) return "linkedin";
    if (hostname.includes("github.com")) return "github";
    if (hostname.includes("google.")) return "google";

    return hostname;
  } catch {
    const value = source.trim().toLowerCase();
    return value || "directo";
  }
}
