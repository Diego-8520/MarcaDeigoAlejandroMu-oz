import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.url("Ingresa una URL válida.").optional());

export const projectSchema = z.object({
  title: z.string().trim().min(1, "Ingresa el título del proyecto."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa un slug en kebab-case.")
    .optional()
    .or(z.literal("")),
  short_description: z.string().trim().optional(),
  description: z.string().trim().optional(),
  problem: z.string().trim().optional(),
  solution: z.string().trim().optional(),
  results: z.string().trim().optional(),
  technologies: z.array(z.string().trim().min(1)).default([]),
  categories: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["live", "en-desarrollo", "archivado"], {
    message: "Selecciona un estado válido.",
  }),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  demo_url: optionalUrl,
  repository_url: optionalUrl,
  featured_image_url: optionalUrl,
});

export type ProjectInput = z.infer<typeof projectSchema>;
