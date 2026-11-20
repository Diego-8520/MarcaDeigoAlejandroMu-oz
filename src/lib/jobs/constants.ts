/** Constantes compartidas entre servidor y cliente (sin dependencias de servidor). */
export const APPLICATION_STATUSES = [
  "guardada",
  "postulada",
  "entrevista",
  "oferta",
  "rechazada",
  "descartada",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return APPLICATION_STATUSES.includes(value as ApplicationStatus);
}
