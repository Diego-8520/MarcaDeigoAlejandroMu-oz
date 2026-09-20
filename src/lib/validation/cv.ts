import { z } from "zod";

export const MAX_CV_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const cvUploadSchema = z.object({
  label: z
    .string()
    .trim()
    .max(100, "El nombre no puede superar los 100 caracteres.")
    .optional(),
  isVisible: z.boolean().default(false),
});

export type CvUploadInput = z.infer<typeof cvUploadSchema>;
