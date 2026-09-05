import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value));
const dateValue = z.string().trim().date("Ingresa una fecha válida.");

export const educationSchema = z.object({
  institution: z.string().trim().min(1, "Ingresa la institución."),
  program: z.string().trim().min(1, "Ingresa el programa."),
  start_date: dateValue,
  end_date: optionalText.pipe(dateValue.optional()),
  status: optionalText,
  description: optionalText,
});

export type EducationInput = z.infer<typeof educationSchema>;
