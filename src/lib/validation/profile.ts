import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value));

const optionalUrl = optionalText.pipe(
  z.url("Ingresa una URL válida.").optional(),
);

export const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Ingresa el nombre completo."),
  headline: optionalText,
  bio: optionalText,
  email: optionalText.pipe(z.email("Ingresa un email válido.").optional()),
  phone: optionalText,
  location: optionalText,
  website: optionalUrl,
});

export const profileLinkSchema = z.object({
  label: z.string().trim().min(1, "Ingresa una etiqueta."),
  url: z.string().trim().pipe(z.url("Ingresa una URL válida.")),
  icon: optionalText,
  sort_order: z.coerce.number().int().min(0, "El orden no puede ser negativo."),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ProfileLinkInput = z.infer<typeof profileLinkSchema>;
