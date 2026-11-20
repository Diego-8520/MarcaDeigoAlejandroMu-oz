import { revalidatePath } from "next/cache";

/** Rutas que muestran proyectos o su galería (sitio público y panel). */
export function revalidateProjectPaths() {
  revalidatePath("/");
  revalidatePath("/proyectos");
  revalidatePath("/proyectos/[slug]", "page");
  revalidatePath("/dashboard/proyectos");
  revalidatePath("/dashboard/proyectos/[id]/editar", "page");
}
