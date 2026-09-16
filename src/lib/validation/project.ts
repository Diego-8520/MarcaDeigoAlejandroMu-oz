import { z } from "zod";

export const githubMetadataSchema = z.object({
  repositoryUrl: z.url(),
  owner: z.string().min(1),
  name: z.string().min(1),
  defaultBranch: z.string().nullable(),
  description: z.string().nullable(),
  primaryLanguage: z.string().nullable(),
  languages: z.record(z.string(), z.number()),
  topics: z.array(z.string()),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  lastUpdated: z.string().nullable(),
  detectedTechnologies: z.array(z.string()),
});

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
  github_metadata: githubMetadataSchema.nullable().optional(),
  github_synced_at: z.string().datetime().nullable().optional(),
  vercel_project_url: optionalUrl,
  vercel_production_url: optionalUrl,
  vercel_custom_domain: z.string().trim().optional(),
  vercel_deployment_status: z.string().trim().max(80).optional(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
