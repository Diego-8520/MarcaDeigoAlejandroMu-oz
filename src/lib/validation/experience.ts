import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value));

const dateValue = z.string().trim().date("Ingresa una fecha válida.");

export const experienceSchema = z
  .object({
    company: z.string().trim().min(1, "Ingresa la empresa."),
    position: z.string().trim().min(1, "Ingresa el cargo."),
    start_date: dateValue,
    end_date: optionalText.pipe(dateValue.optional()),
    description: optionalText,
    achievements: z.array(z.string().trim().min(1)).default([]),
  })
  .refine((value) => !value.end_date || value.end_date > value.start_date, {
    message: "La fecha de finalización debe ser posterior al inicio.",
    path: ["end_date"],
  });

export type ExperienceInput = z.infer<typeof experienceSchema>;
