import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value));

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Ingresa el nombre de la skill."),
  category: optionalText,
  description: optionalText,
});

export type SkillInput = z.infer<typeof skillSchema>;
