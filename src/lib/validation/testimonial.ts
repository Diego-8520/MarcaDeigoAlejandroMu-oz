import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value));

export const testimonialSchema = z.object({
  author_name: z.string().trim().min(1, "Ingresa el nombre del cliente."),
  author_role: optionalText,
  author_company: optionalText,
  quote: z
    .string()
    .trim()
    .min(10, "El testimonio debe tener al menos 10 caracteres."),
  project_id: z
    .string()
    .uuid("Selecciona un proyecto válido.")
    .nullable()
    .optional(),
  published: z.boolean(),
  sort_order: z.coerce.number().int().min(0, "El orden no puede ser negativo."),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
