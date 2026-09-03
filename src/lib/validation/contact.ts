import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Ingresa tu nombre completo."),
  email: z.string().email("Ingresa un correo válido."),
  company: z.string().optional(),
  requestType: z.enum(["empleo", "servicio", "otro"], {
    message: "Selecciona una opción.",
  }),
  message: z.string().min(10, "Cuéntame un poco más (mínimo 10 caracteres)."),
});

export type ContactInput = z.infer<typeof contactSchema>;
