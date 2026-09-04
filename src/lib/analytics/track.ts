import { getOrCreateSessionId } from "@/lib/analytics/session";

export type AnalyticsEventType =
  | "page_view"
  | "project_view"
  | "service_view"
  | "cv_view"
  | "cv_download"
  | "github_click"
  | "demo_click"
  | "contact_open"
  | "contact_submit"
  | "social_click"
  | "ai_open"
  | "ai_question"
  | "external_link_click";

export function trackEvent(
  eventType: AnalyticsEventType,
  page = typeof window !== "undefined" ? window.location.pathname : "",
  metadata?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;

  try {
    void fetch("/api/analytics", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        page,
        projectId:
          typeof metadata?.projectId === "string" ? metadata.projectId : undefined,
        sessionId: getOrCreateSessionId(),
        source: document.referrer,
        userAgent: navigator.userAgent,
        metadata,
      }),
    }).catch(() => undefined);
  } catch {
    // La analítica propia es mejor esfuerzo y nunca debe afectar navegación.
  }
}
