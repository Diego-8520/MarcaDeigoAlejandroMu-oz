"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/track";

export function ProjectViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    trackEvent("project_view", window.location.pathname, { projectId });
  }, [projectId]);

  return null;
}
