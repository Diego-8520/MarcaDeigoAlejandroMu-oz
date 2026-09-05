import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value));
const optionalUrl = optionalText.pipe(
  z.url("Ingresa una URL válida.").optional(),
);

export const certificationSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre de la certificación."),
  issuer: optionalText,
  issue_date: optionalText.pipe(
    z.string().date("Ingresa una fecha válida.").optional(),
  ),
  credential_url: optionalUrl,
});

export type CertificationInput = z.infer<typeof certificationSchema>;
