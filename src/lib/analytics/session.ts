const SESSION_KEY = "dam_session_id";

export function generateSessionId() {
  return crypto.randomUUID();
}

export function getOrCreateSessionId() {
  if (typeof window === "undefined") return generateSessionId();

  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId = generateSessionId();
  window.sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}
